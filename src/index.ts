import DB from './DB';
import Logger from './Logger';
import _ from 'lodash';
import AceidBranchGuidGenerator from './AceidBranchGuidGenerator';
import TemplateGenerator from './TemplateGenerator';
import AssetGenerator from './AssetGenerator';
const logger = Logger.getLogger('main');

const idGenerator = new AceidBranchGuidGenerator(10, 10);
const templateGenerator = new TemplateGenerator(100);
const assetGenerator = new AssetGenerator(idGenerator, templateGenerator);

const paylod = assetGenerator.batchGet(10);

async function test() {
    const columns = ['aceid', 'branch_guid', 'guid', 'name', 'template'];
    await DB.insert('assets', paylod, columns);
    await DB.closeConnection();
}

test();
