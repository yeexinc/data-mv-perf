import DB from './DB';
import _ from 'lodash';
import AceidBranchGuidGenerator from './AceidBranchGuidGenerator';
import TemplateGenerator from './TemplateGenerator';
import AssetGenerator from './AssetGenerator';
import Logger from './Logger';
const logger = Logger.getLogger('main');

async function run(assetGenerator: AssetGenerator, id: number, total: number, batchSize: number) {
  logger.info(`Generator ${id} starts`);

  const columns = ['aceid', 'branch_guid', 'guid', 'name', 'template'];
  let count = 0;
  while (count < total) {
    const size = count + batchSize <= total ? batchSize : total - count;
    const payload = assetGenerator.batchGet(size);
    await DB.insert('assets', payload, columns);
    count = count + batchSize;
  }

  logger.info(`Generator ${id} finished`);
}

function runall(assetGenerator: AssetGenerator, clients: number, total: number, batchSize: number) {
  const totalPerRun = total / clients;
  return _.range(clients).map((id) => run(assetGenerator, id, totalPerRun, batchSize));
}

async function main() {
  const runnerCount = Number.parseInt(process.env.runnerCount as string, 10);
  const assetCount = Number.parseInt(process.env.assetCount as string, 10);
  const aceidCount = Number.parseInt(process.env.aceidCount as string, 10);
  const branchGuidCount = Number.parseInt(process.env.branchGuidCount as string, 10);
  const templateCount = Number.parseInt(process.env.templateCount as string, 10);
  const batchSize = Number.parseInt(process.env.batchSize as string, 10);

  const idGenerator = new AceidBranchGuidGenerator(aceidCount, branchGuidCount);
  const templateGenerator = new TemplateGenerator(templateCount);
  const assetGenerator = new AssetGenerator(idGenerator, templateGenerator);

  logger.info({ aceidCount, branchGuidCount, templateCount, runnerCount, batchSize, assetCount});

  await DB.init();
  await Promise.all(runall(assetGenerator, runnerCount, assetCount, batchSize));
  await DB.closeConnection();
}

main();
