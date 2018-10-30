import _ from 'lodash';
const uuidv4 = require('uuid/v4');

export default class Random {
  public static guid(): Buffer {
    return Buffer.from(uuidv4().replace(/-/g, ''), 'hex');
  }

  public static str(length: number): string {
    return _.times(length, (n) => Math.random().toString(36).replace('0.', ''))
            .join('');
  }
}
