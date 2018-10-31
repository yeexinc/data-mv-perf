import DB from './DB';
import _ from 'lodash';
import AceidBranchGuidGenerator from './AceidBranchGuidGenerator';
import TemplateGenerator from './TemplateGenerator';
import AssetGenerator from './AssetGenerator';
import Logger from './Logger';
import Random from './Random';
const logger = Logger.getLogger('main');

async function batchInsertionRun(assetGenerator: AssetGenerator, id: number, total: number, batchSize: number) {
  logger.info(`Runner ${id} starts`);

  const columns = ['aceid', 'branch_guid', 'guid', 'name', 'template'];
  let count = 0;
  while (count < total) {
    const size = count + batchSize <= total ? batchSize : total - count;
    const payload = assetGenerator.batchGet(size);
    await DB.insert('assets', payload, columns);
    count = count + batchSize;
  }

  logger.info(`Runner ${id} finished`);
}

async function singleInsertionRun(
  idGenerator: AceidBranchGuidGenerator,
  templateGenerator: TemplateGenerator,
  id: number,
  total: number) {

  logger.info(`Runner ${id} starts`);

  let count = 0;
  while (count < total) {
    const idGuid = idGenerator.get();
    const params = [idGuid.aceid, idGuid.branchGuid, Random.guid(), Random.str(4), templateGenerator.get()];

    await DB.executeSQL(
      'INSERT INTO assets (aceid, branch_guid, guid, name, template) VALUES(?, ?, ?, ?, ?)',
      params
    );
    count = count + 1;
  }

  logger.info(`Runner ${id} finished`);
}

function runall(
  idGenerator: AceidBranchGuidGenerator,
  templateGenerator: TemplateGenerator,
  runnerCount: number,
  total: number,
  batchSize: number) {

  const totalPerRun = total / runnerCount;
  if (batchSize === 1) {
    return _.range(runnerCount).map((id) => singleInsertionRun(idGenerator, templateGenerator, id, totalPerRun));
  } else {
    const assetGenerator = new AssetGenerator(idGenerator, templateGenerator);
    return _.range(runnerCount).map((id) => batchInsertionRun(assetGenerator, id, totalPerRun, batchSize));
  }
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

  logger.info({ aceidCount, branchGuidCount, templateCount, runnerCount, batchSize, assetCount});

  await DB.init();
  await Promise.all(runall(idGenerator, templateGenerator, runnerCount, assetCount, batchSize));
  await DB.closeConnection();

  logger.info('done');
}

main();
