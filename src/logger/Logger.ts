import log4js from 'log4js';
import { container } from 'tsyringe';
import { Singleton } from '../..';

export const INJECT_TOKEN = 'ILogger';

declare type LoggerLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface ILogger {
  LogDebug(message: string, ...args: any[]): void;
  LogInfo(message: string, ...args: any[]): void;
  LogWarn(message: string, ...args: any[]): void;
  LogError(message: string, ...args: any[]): void;
  LogFatal(message: string, ...args: any[]): void;
}

@Singleton(INJECT_TOKEN)
export class Logger implements ILogger {
  private readonly _loggers: { [key: string]: log4js.Logger } = {};
  constructor() {
    this._loggers = {
      debug: this.GetLogger('debug'),
      info: this.GetLogger('info'),
      warn: this.GetLogger('warn'),
      error: this.GetLogger('error'),
      fatal: this.GetLogger('fatal'),
    };
  }

  public LogDebug(message: string, ...args: any[]): void {
    this._loggers['debug'].debug(message, ...args);
  }
  public LogInfo(message: string, ...args: any[]): void {
    this._loggers['info'].info(message, ...args);
  }
  public LogWarn(message: string, ...args: any[]): void {
    this._loggers['warn'].warn(message, ...args);
  }
  public LogError(message: string, ...args: any[]): void {
    this._loggers['error'].error(message, ...args);
  }
  public LogFatal(message: string, ...args: any[]): void {
    this._loggers['fatal'].fatal(message, ...args);
  }

  protected GetLogger(level?: LoggerLevel) {
    return log4js.getLogger(level);
  }
}

export function InitLogger(options?: log4js.Configuration) {
  if (!options) {
    options = GetLogOptions();
  }
  log4js.configure(options);
  container.registerSingleton<ILogger>(INJECT_TOKEN, Logger); // 直接注入到容器中
}

function GetLogOptions(): log4js.Configuration {
  const options: log4js.Configuration = {
    appenders: {
      console: { type: 'console' },
    },
    categories: {
      default: { appenders: ['console'], level: 'debug' },
    },
  };

  AddLogger('debug', options);
  AddLogger('warn', options);
  AddLogger('info', options);
  AddLogger('error', options);
  AddLogger('fatal', options);

  return options;
}

function AddLogger(level: LoggerLevel, options: log4js.Configuration) {
  const category = { appenders: ['console', level], level: level };
  const appender = { type: 'dateFile', filename: `logs/${level}.log`, pattern: '.yyyy-MM-dd', compress: true };

  options.categories[level] = category;
  options.appenders[level] = appender;
}
