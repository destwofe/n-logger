export enum LogLevel {
  ERROR,
  INFO,
  DEBUG
}

export interface LogData {
  className: string
  message: string
  level: LogLevel
  timestamp: moment.Moment
  meta: string
}
