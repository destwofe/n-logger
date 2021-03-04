import FS from 'fs';
import { LogLevel } from './types';

export const config = {
  logPath: `logs`,
  archivePath: `logs/archive`,
  showLevel: LogLevel.DEBUG
}

export const LoggerConfigure = (logDir: string, archiveDir: string, showLevel: LogLevel): void => {
  config.logPath = logDir
  config.archivePath = archiveDir
  config.showLevel = showLevel
  configure()
}

const configure = () => {
  if (!FS.existsSync(config.logPath)) FS.mkdirSync(config.logPath);
  if (!FS.existsSync(config.archivePath)) FS.mkdirSync(config.archivePath);
}

configure()
