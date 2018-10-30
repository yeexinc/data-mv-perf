/**
 * Defines a single configuration value.
 */
export default class ConfigValue {

  // If true, the value is encyrpted.
  public isEncrypted: boolean;

  // The resolved value
  public value?: string;

  public constructor(value: string | undefined, isEncrypted: boolean) {
    this.value = value;
    this.isEncrypted = isEncrypted;
  }
}
