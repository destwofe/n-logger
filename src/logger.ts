import fs from 'fs';
import chalk from 'chalk';
import moment from 'moment';

import { config } from './config'
import { LogData, LogLevel } from './types';

const logLevelStringColored = (level: LogLevel): string => {
  switch (level) {
    case LogLevel.ERROR:
      return chalk.red('error')
    case LogLevel.DEBUG:
      return chalk.yellow('debug')
    default:
      return chalk.green('info')
  }
}

const metaArrToStirng = (meta: any[]): string => {
  if (meta.length === 0) return ''
  if (meta.length === 1) return stringify(meta[0])
  return stringify(meta.map(stringify))
}

const stringify = (o: any): string => {
  try {
    if (o instanceof Error) o = { message: o.message, name: o.name }
    return JSON.stringify(o)
  } catch (error) {
    return ''
  }
}


/**
 * Create logger instance
 * @param className class name or file name for log
 */
export const LoggerFactory = (className: string) => {
  const levels = { debug: LogLevel.DEBUG, info: LogLevel.INFO, error: LogLevel.ERROR };

  const logMessageFactory = (logData: LogData) => {
    const level = logLevelStringColored(logData.level)
    // add level
    let logMessage = `${level}`;
    // add time stamp
    logMessage = `${logMessage} | ${logData.timestamp.format('YY-MM-DD hh:mm:ss')}`;
    // add message
    logMessage = `${logMessage} | ${logData.message}`;
    // add meta
    if (logData.message.length > 0) logMessage = `${logMessage} |`;
    return logMessage;
  };

  const logDataFactory = (level: LogLevel, message: string, meta: any[]) => {
    // preProcessData
    const timestamp = moment();
    const _message = message.replace(/\r?\n|\r/g, '');
    const _meta = metaArrToStirng(meta)
    const logData: LogData = { level, timestamp, className, message: _message, meta: _meta };
    const logMessage = logMessageFactory(logData);
    return { logData, logMessage };
  };

  const getLogFilePath = () => `${config.logPath}/${moment().format('YYYY-MM-DD')}.log`;
  const getErrorLogFilePath = () => `${config.logPath}/${moment().format('YYYY-MM-DD')}-Error.log`;

  const writeToFile = (logData: LogData, logFilePath = getLogFilePath()) =>
    fs.appendFileSync(logFilePath, `${JSON.stringify(logData)}\n`);

  const debug = (message = '', ...meta: any[]) => {
    const { logMessage, logData } = logDataFactory(levels.debug, message, meta);
    if (config.showLevel >= LogLevel.DEBUG) console.log(logMessage, meta);
    writeToFile(logData);
  };

  const info = (message = '', ...meta: any[]) => {
    const { logMessage, logData } = logDataFactory(levels.info, message, meta);
    if (config.showLevel >= LogLevel.INFO) console.log(logMessage, meta);
    writeToFile(logData);
  };

  const error = (message = '', ...meta: any[]) => {
    const { logMessage, logData } = logDataFactory(levels.error, message, meta);
    if (config.showLevel >= LogLevel.ERROR) console.log(logMessage, meta);
    writeToFile(logData);
    writeToFile(logData, getErrorLogFilePath());
  };

  return {
    levels,
    debug,
    info,
    error,
    stream: {
      write: (message: string) => debug(message),
    },
  };
};
