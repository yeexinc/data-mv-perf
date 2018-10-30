import DB from './DB';
import Logger from './Logger';
const logger = Logger.getLogger('main');

async function test() {
    const result = await DB.executeSQL('SELECT * FROM aceids LIMIT 1');
    logger.info(result);
    await DB.closeConnection();
}

test();
