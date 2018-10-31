import _ from 'lodash';
import IAceidBranchGuidGenerator from './IAceidBranchGuidGenerator';
import AceidBranchGuid from './IAceidBranchGuid';

export default class AceidBranchIdNumericGenerator implements IAceidBranchGuidGenerator{
    private aceidBranchIds: AceidBranchGuid[];
  
    constructor(private aceidCount: number, private branchGuidCount: number) {
      let aceIdx = 0;
      let branchIdx = 0;
      const aceids = _.times(this.aceidCount, () => aceIdx++);
      this.aceidBranchIds = _.times(this.branchGuidCount, () => {
        const index = Math.floor(Math.random() * this.aceidCount);
        return {
          aceid: aceids[index],
          branchGuid: branchIdx++
        };
      });
    }
  
    public get(): any {
        const index = Math.floor(Math.random() * this.branchGuidCount);
        return this.aceidBranchIds[index];
    }  
}