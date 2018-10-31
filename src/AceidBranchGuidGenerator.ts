import Random from './Random';
import IAceidBranchGuidGenerator from './IAceidBranchGuidGenerator';
import  AceidBranchGuid from './IAceidBranchGuid';
import _ from 'lodash';

export default class AceidBranchGuidGenerator implements IAceidBranchGuidGenerator {
  private aceidBranchGuids: AceidBranchGuid[];

  constructor(private aceidCount: number, private branchGuidCount: number) {
    const aceids = _.times(this.aceidCount, () => Random.guid());
    this.aceidBranchGuids = _.times(this.branchGuidCount, () => {
      const index = Math.floor(Math.random() * this.aceidCount);
      return {
        aceid: aceids[index],
        branchGuid: Random.guid()
      };
    });
  }

  public get(): AceidBranchGuid {
      const index = Math.floor(Math.random() * this.branchGuidCount);
      return this.aceidBranchGuids[index];
  }
}





