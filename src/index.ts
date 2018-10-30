import DB from './DB';
import _ from 'lodash';
import AceidBranchGuidGenerator from './AceidBranchGuidGenerator';
import TemplateGenerator from './TemplateGenerator';
import AssetGenerator from './AssetGenerator';
import ConfigManager from './ConfigManager';
import Logger from './Logger';
const logger = Logger.getLogger('main');

const idGenerator = new AceidBranchGuidGenerator(10, 10);
const templateGenerator = new TemplateGenerator(100);
const assetGenerator = new AssetGenerator(idGenerator, templateGenerator);
const columns = ['aceid', 'branch_guid', 'guid', 'name', 'template'];

async function run(id: number, total: number, batchSize: number) {
  logger.info(`Generator ${id} starts`);

  let count = 0;
  while (count < total) {
    const size = count + batchSize <= total ? batchSize : total - count;
    const payload = assetGenerator.batchGet(size);
    await DB.insert('assets', payload, columns);
    count = count + batchSize;
  }

  logger.info(`Generator ${id} finished`);
}

function runall(clients: number, total: number, batchSize: number) {
  const totalPerRun = total / clients;
  return _.range(clients).map((id) => run(id, totalPerRun, batchSize));
}

async function main() {
  await DB.init();
  const clients: number = ConfigManager.getInstance().getValue('clients');
  const assetCount: number = ConfigManager.getInstance().getValue('assetCount');
  await Promise.all(runall(clients, assetCount, 5));
  await DB.closeConnection();
}

main();
