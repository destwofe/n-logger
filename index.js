const FS = require('fs');
const Chalk = require('chalk');
const Moment = require('moment');
const { objectify } = require('@destwofe/n-utils');

const logDir = `logs`;

if (!FS.existsSync(logDir)) FS.mkdirSync(logDir);

/**
 * Create logger instance
 * @param {String} className class name or file name for log
 * @param {Number} showLevel set minimum show level { error: 0, info: 1, debug: 2 }
 */
const loggerBuilder = (className, showLevel = 2) => {
  const levels = { debug: 'debug', info: 'info', error: 'error' };

  const logMessageFactory = logData => {
    const level =
      levels[logData.level] === levels.debug
        ? Chalk.green('debug')
        : levels[logData.level] === levels.error
          ? Chalk.red('error')
          : Chalk.blue('info ');
    // add level
    let logMessage = `${level}`;
    // add time stamp
    if (showLevel >= 2)
      logMessage = `${logMessage} | ${logData.timestamp.format('YY-MM-DD hh:mm:ss')}`;
    // add message
    logMessage = `${logMessage} | ${logData.message}`;
    // add meta
    if (showLevel >= 2 && Object.keys(logData.meta).length > 0)
      logMessage = `${logMessage} | ${JSON.stringify(logData.meta)}`;
    return logMessage;
  };

  const logDataFactory = (level, message, meta) => {
    // preProcessData
    const timestamp = Moment();
    const _message = message.replace(/\r?\n|\r/g, '');
    const _meta = !Array.isArray(meta) ? meta : meta.map(objectify);
    const logData = { level, timestamp, className, message: _message, meta: _meta };
    const logMessage = logMessageFactory(logData);
    return { logData, logMessage };
  };

  const getLogFilePath = () => `${logDir}/${Moment().format('YYYY-MM-DD')}.log`;
  const getErrorLogFilePath = () => `${logDir}/${Moment().format('YYYY-MM-DD')}-Error.log`;

  const writeToFile = (logData, logFilePath = getLogFilePath()) =>
    FS.appendFileSync(logFilePath, `${JSON.stringify(logData)}\n`);

  const debug = (message = '', ...meta) => {
    const { logMessage, logData } = logDataFactory(levels.debug, message, meta);
    console.log(logMessage);
    writeToFile(logData);
  };

  const info = (message = '', ...meta) => {
    const { logMessage, logData } = logDataFactory(levels.info, message, meta);
    console.log(logMessage);
    writeToFile(logData);
  };

  const error = (message = '', ...meta) => {
    const { logMessage, logData } = logDataFactory(levels.error, message, meta);
    console.log(logMessage);
    writeToFile(logData);
    writeToFile(logData, getErrorLogFilePath());
  };

  return {
    levels,
    debug,
    info,
    error,
    stream: {
      write: message => debug(message),
    },
  };
};

module.exports = loggerBuilder;
