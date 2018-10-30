// runtime settings

import ConfigValue from './ConfigValue';
import path from 'path';
import _ from 'lodash';

const appRootDir: string = require('app-root-dir').get();
const Settings = require('@adsk/lynx-settings').Settings;

/**
 * The ConfigManager class
 */
export class ConfigManager {

  public static getInstance(): ConfigManager {
    // This function must be called after all the initialization environment variables done
    // e.g.setBlackBoxEnvIfRequired
    // otherwise the ConfigManager doesn't have the environment variables
    if (_.isNil(ConfigManager.instance)) {
      ConfigManager.instance = new ConfigManager(path.join(appRootDir, 'config', 'settings.json'));
    }
    return ConfigManager.instance;
  }
  private static instance: ConfigManager;
  private settings: any;
  constructor(configFile: string) {
    this.settings = new Settings([configFile]);
  }

  /**
   * Gets the value of a config parameter.
   * @param {String} paramName The name of the parameter.
   */
  public getValue(paramName: string): any {

    const rawValue = ConfigManager.instance.settings.get(paramName);

    // return value from settings
    const configValue = rawValue as ConfigValue;
    if (_.isNil(configValue.value)) {
      return rawValue; // if does not contain '.value' in settings, use it directly
    } else {
      return configValue.value;
    }
  }

}

export default ConfigManager;
