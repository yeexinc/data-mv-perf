import ConfigManager from './ConfigManager';
import Logger from './Logger';
import DbLogger from './DBLogger';
import { createConnection, getConnection, EntityManager } from 'typeorm';
import _ from 'lodash';
const logger = Logger.getLogger('DB');

export default class DB {
  public static async init() {
    const host: string = ConfigManager.getInstance().getValue('mv:sql:host');
    const port: number = ConfigManager.getInstance().getValue('mv:sql:port');
    const credentials: [any] = ConfigManager.getInstance().getValue('mv:sql:credentials');
    const type = 'mysql';
    const database: string = ConfigManager.getInstance().getValue('mv:sql:db');
    const logging = ConfigManager.getInstance().getValue('mv:enableDbLogging');
    const maxQueryExecutionTime = ConfigManager.getInstance().getValue('mv:maxQueryExecutionTime');

    if (_.isEmpty(credentials)) {
      const sqlUser: string = ConfigManager.getInstance().getValue('mv:sql:user');
      const sqlPassword: string = ConfigManager.getInstance().getValue('mv:sql:password');

      if (sqlUser && sqlPassword) {
        logger.warn('Not using sql credentials from the array');
        credentials.push({user: sqlUser, password: sqlPassword});
      } else {
        logger.error('Empty sql credentials array setting');
        return;
      }
    }

    let connection;
    let username;
    const numPwdsToTry = Math.min(credentials.length, 2);

    for (let index = 0; index < numPwdsToTry; ++index) {
      const cred: any = credentials[index];
      username = cred.user;
      const password = cred.password;
      try {
        connection = await createConnection ({
          type,
          host,
          port,
          username,
          password,
          database,
          synchronize: false,
          logger: new DbLogger(logging),
          maxQueryExecutionTime,
          supportBigNumbers: true
        });
        break;
      } catch (err) {
        logger.error(`Sql creationConnection failed with err = ${err.message}`);
      }
    }

    if (_.isNil(connection) || connection.isConnected === false) {
      logger.error('DB.init failed to connect to sql');
      return;
    }

    DB.initialized = true;
    logger.info(`DB: Connected to database '${username}@${host}:${port}'`);
    logger.info(DB.initialized);
  }

  public static async selectRawOne(table: any, where?: any, params?: any, select?: any) {
    if (!DB.initialized) {
      await DB.init();
    }

    const selectQueryBuilder = getConnection().createQueryBuilder().select(select).from(table, '');
    if (_.isNil(params)) {
      return await selectQueryBuilder.where(where).getRawOne();
    }
    return await selectQueryBuilder.where(where, params).getRawOne();
  }

  public static async selectOne(table: any, where?: any, params?: any, select?: any) {
    if (!DB.initialized) {
      await DB.init();
    }

    const selectQueryBuilder = getConnection().getRepository(table).createQueryBuilder().select(select);
    if (_.isNil(params)) {
      return await selectQueryBuilder.where(where).getOne();
    }
    return await selectQueryBuilder.where(where, params).getOne();
  }

  public static async selectRawMany(table: any, where?: string, params?: any, select?: any) {
    if (!DB.initialized) {
      await DB.init();
    }

    const selectQueryBuilder = getConnection().createQueryBuilder().select(select).from(table, '');
    if (_.isNil(where)) {
      return await selectQueryBuilder.getRawMany();
    }
    return await selectQueryBuilder.where(where, params).getRawMany();
  }

  public static async selectMany(table: any, where?: string, params?: any, select?: any) {
    if (!DB.initialized) {
      await DB.init();
    }

    const selectQueryBuilder = getConnection().getRepository(table).createQueryBuilder().select(select);
    if (_.isNil(where)) {
      return await selectQueryBuilder.getMany();
    }

    return await selectQueryBuilder.where(where, params).getMany();
  }

  public static async insert(table: any, values: any, columns?: string[], en?: EntityManager) {
    if (!DB.initialized) {
      await DB.init();
    }
    if (_.isNil(en)) {
      await getConnection().manager.createQueryBuilder().insert().into(table, columns).values(values).execute();
    } else {
      await en.createQueryBuilder().insert().into(table, columns).values(values).execute();
    }

  }

  public static async update(table: any, set: any, where: any, params?: any, en?: EntityManager ) {
    if (!DB.initialized) {
      await DB.init();
    }
    if (_.isNil(en)) {
      await getConnection().manager.createQueryBuilder().update(table).set(set).where(where, params).execute();
    } else {
      await en.createQueryBuilder().update(table).set(set).where(where, params).execute();
    }
  }

  public static async delete(table: any, condition: any, en?: EntityManager) {
    if (!DB.initialized) {
      await DB.init();
    }
    if (_.isNil(en)) {
      await getConnection().manager.delete(table, condition);
    } else {
      await en.delete(table, condition);
    }

  }

  public static async executeSQL(query: string, params?: any): Promise<void> {
    if (!DB.initialized) {
      await DB.init();
    }
    const results = await getConnection().manager.query(query, params);
    return results;

  }

  public static async executeSQLWithTransaction(ctx: any,  callback: (values: any, en: EntityManager) => any) {
    if (!DB.initialized) {
      await DB.init();
    }
    await getConnection().transaction(async (entityManager: EntityManager) => {
      await callback(ctx, entityManager);
    });
  }

  public static async ping() {
    if (!DB.initialized) {
      await DB.init();
    }

    try {
      getConnection();
    } catch (err) {
      logger.error('Connection Error');
    }
  }

  public static async closeConnection() {
    if (!DB.initialized) {
      logger.error('DB is not initialized');
      return;
    }
    const conn = getConnection();
    if (conn) {
      await conn.close();
      DB.initialized = false;
      logger.info('DB connection closed');
    }
  }

  private static initialized: boolean = false;
}
