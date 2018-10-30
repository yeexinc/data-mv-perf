import Random from './Random';
import _ from 'lodash';

export default class TemplateGenerator {
  private static template(): string {
    return 'autodesk.mvperf:' + Random.str(2) + '.' + Random.str(2) + '-1.0.0';
  }

  private templates: string[];

  /**
   * Specify the number of templates
   * @param count The number of templates
   */
  constructor(private count: number) {
    this.templates = _.times(count, (n) => TemplateGenerator.template());
  }

  public get(): string {
      const index = Math.floor(Math.random() * this.count);
      return this.templates[index];
  }
}
