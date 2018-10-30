import AceidBranchGuidGenerator from './AceidBranchGuidGenerator';
import TemplateGenerator from './TemplateGenerator';
import Random from './Random';
import _ from 'lodash';

export default class AssetGenerator {
  constructor(private idGenerator: AceidBranchGuidGenerator, private templateGenerator: TemplateGenerator) {
  }

  public batchGet(size: number) {
    const params: any[] = [];

    _.times(size, () => {
      const idGuid = this.idGenerator.get();
      const thisParam = [idGuid.aceid, idGuid.branchGuid, Random.guid(), Random.str(4), this.templateGenerator.get()];
      params.push(thisParam);
    });

    return params;
  }
}
