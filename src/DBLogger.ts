import {Logger, QueryRunner} from 'typeorm';
import LoggerUtil from './LoggerUtil';
import _ from 'lodash';
const logger = LoggerUtil.getLogger('DBLogger');

export default class DbLogger implements Logger {
    private enabledQueryLogging: boolean = false;

    public constructor(enabledQueryLogging: boolean) {
        this.enabledQueryLogging = enabledQueryLogging;
      }

    public logQuery(query: string, parameters?: any[] | undefined, queryRunner?: QueryRunner | undefined) {
        if (this.enabledQueryLogging === true) {
            LoggerUtil.logInfo(logger, undefined, {query, parameters});
            this.logQueryRunner(queryRunner);
        }
    }

    public logQueryError(error: string, query: string, parameters?: any[] | undefined,
                         queryRunner?: QueryRunner | undefined) {
        const err = new Error(error);
        LoggerUtil.logError(logger, err, undefined, JSON.stringify({query, parameters, error}));
        this.logQueryRunner(queryRunner);
    }

    public logQuerySlow(time: number, query: string, parameters?: any[] | undefined,
                        queryRunner?: QueryRunner | undefined) {
        LoggerUtil.logInfo(logger, undefined, {query, parameters, 'execution time': time});
        this.logQueryRunner(queryRunner);
    }

    public logSchemaBuild(message: string, queryRunner?: QueryRunner | undefined) {
        LoggerUtil.logInfo(logger, undefined, message);
        this.logQueryRunner(queryRunner);
    }

    public logMigration(message: string, queryRunner?: QueryRunner | undefined) {
        LoggerUtil.logInfo(logger, undefined, message);
        this.logQueryRunner(queryRunner);
    }

    public log(level: 'log' | 'info' | 'warn', message: any, queryRunner?: QueryRunner | undefined) {
        LoggerUtil.logInfo(logger, undefined, {message});
        this.logQueryRunner(queryRunner);
    }

    private logQueryRunner(queryRunner?: QueryRunner | undefined) {
        if (!_.isNil(queryRunner) && !_.isNil(queryRunner.data.request) ) {
            logger.info(queryRunner.data.request.url);
        }
    }

}
