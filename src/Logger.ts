import os from 'os';
import LoggerUtil from './LoggerUtil';

/**
 * A util class for the logger.
 */
export default class Logger {
  public static getLogger(moduleName?: string): any {
    return LoggerUtil.getLogger(moduleName);
  }

  /**
   * Log out an Error, including stack trace.
   */
  public static logError(logger: any, error: Error, details?: string): void {
    let logMsg: string = 'ERROR: ';
    if (details !== undefined) {
      logMsg += details + os.EOL;
    }
    logMsg += error.message + os.EOL;
    if (error.stack !== undefined) {
      logMsg += error.stack;
    }

    logger.error(logMsg);

  }
}
