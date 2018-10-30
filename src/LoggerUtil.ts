import { configure, getLogger, Logger } from 'log4js';
import log4js from 'log4js';

import _ from 'lodash';
/**
 * A util class for the logger.
 */
export default class LoggerUtil {

  public static getLogger(moduleName?: string): Logger {
    return getLogger(moduleName);
  }

  public static logInfo(logger: Logger, context: any, details: any): void {
    logger.info(LoggerUtil.createLog(context, details));
  }

  public static logWarning(logger: Logger, context: any, details: any): void {
    logger.warn(LoggerUtil.createLog(context, details));
  }

  /**
   * Create an error entry in the log. Use this for times when you don't have an actual Error object.
   * If you do have an Error object, call logError instead.
   */
  public static logErrorEntry(logger: Logger, context: any, details: any): void {
    logger.error(LoggerUtil.createLog(context, details));
  }

  /**
   * Log out an Error object, including stack trace.
   */
  public static logError(logger: Logger, error: Error, context: any, details?: string): void {

    const logObj: any = {};

    if (!_.isNil(details)) {
      logObj.details = details;
    }
    logObj.errorMessage = error.message;

    LoggerUtil.appendContext(logObj, context);

    if (!_.isNil(error.stack)) {
      logObj.stackTrace = error.stack;
    }

    logger.error(logObj);
  }

  public static initLoggingConfig(): void {
    // the json layout will print out all log entries in a JSON format and on a single line.
    log4js.addLayout('json', function(): any {
      return function(logEvent: any): string {

        // copy over some of the fields from logEvent
        const logObj: any = {
          timestamp: logEvent.startTime,
          categoryName: logEvent.categoryName,
          pid: logEvent.pid
        };

        // handle data property, which may be a complex object.
        const dataObj: any = logEvent.data;

        // dataObj should be an array.  We only care about the first entry.
        if (!_.isEmpty(dataObj) && !_.isNull(dataObj[0])) {
          if (typeof dataObj[0] === 'string') {
            logObj.message = dataObj[0];
          } else {
            // if the data is a complex object, write the values at the first level of the JSON log entry
            Object.keys(dataObj[0]).forEach((key) => {
              logObj[key] = dataObj[0][key];
            });
          }
        }
        return JSON.stringify(logObj);
      };
    });

    const loggingConfig: any = {
      appenders: {
        console: {
          type: 'console',
          layout: { type: 'json' }
        }
      },
      categories: {
        default: {
          appenders: ['console'],
          level: 'DEBUG'
        }
      }
    };
    configure(loggingConfig);
  }

  private static createLog(context: any, details: any): any {
    let logObj: any = {};

    if (typeof details === 'string') {
      logObj.message = details;
    } else {
      logObj = details;
    }

    LoggerUtil.appendContext(logObj, context);
    return logObj;
  }

  private static appendContext(logObj: any, context?: any): void {
    if (!_.isNil(context)) {
      if (!_.isNil(context.serviceId)) {
        logObj.consumerKey = context.serviceId;
      }

      Object.keys(context.trackingHeaders).forEach((key) => {
        logObj[key] = context.trackingHeaders[key];
      });
    }
  }
}
LoggerUtil.initLoggingConfig();
