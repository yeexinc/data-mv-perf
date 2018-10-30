import DB from './DB';
import _ from 'lodash';
import AceidBranchGuidGenerator from './AceidBranchGuidGenerator';
import TemplateGenerator from './TemplateGenerator';
import AssetGenerator from './AssetGenerator';
import Logger from './Logger';
const logger = Logger.getLogger('main');

const idGenerator = new AceidBranchGuidGenerator(10, 10);
const templateGenerator = new TemplateGenerator(100);
const assetGenerator = new AssetGenerator(idGenerator, templateGenerator);
const columns = ['aceid', 'branch_guid', 'guid', 'name', 'template'];

async function generate(seq: number) {
  logger.info(`Generator ${seq} starts`);
  const paylod = assetGenerator.batchGet(5);
  await DB.insert('assets', paylod, columns);
}

function runall() {
  return _.range(5).map((n) => generate(n));
}

async function main() {
  await Promise.all(runall());
  await DB.closeConnection();
}

main();
