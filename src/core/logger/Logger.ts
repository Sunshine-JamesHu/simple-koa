import * as log4js from 'log4js';
import * as fs from 'fs';

try {
  const logConfig = fs.readFileSync('./log.config.json', 'utf-8');
  if (!logConfig) throw new Error('日志配置为空,采用默认配置');
  // console.log("找到配置文件,采用日志配置文件");
  log4js.configure(JSON.parse(logConfig));
} catch (error) {
  // console.log("没有找到日志配置文件,采用默认配置");
  log4js.configure({
    appenders: {
      out: { type: 'console' },
      // 所有日志记录，文件类型file   文件最大值maxLogSize 单位byte (B->KB->M) backups:备份的文件个数最大值,最新数据覆盖旧数据
      allLog: { type: 'file', filename: './logs/all/all.log', keepFileExt: true, maxLogSize: 10485760, backups: 3 },
      // http请求日志  http请求日志需要app.use引用一下， 这样才会自动记录每次的请求信息
      requestLog: { type: 'dateFile', filename: './logs/request/request.log', pattern: '.yyyy-MM-dd', keepFileExt: true },
      // 错误日志 type:过滤类型logLevelFilter,将过滤error日志写进指定文件
      errorLog: { type: 'file', filename: './logs/error/error.log', keepFileExt: true, maxLogSize: 10485760, backups: 3 },
      error: { type: 'logLevelFilter', level: 'error', appender: 'errorLog', keepFileExt: true, maxLogSize: 10485760, backups: 3 },
    },
    // 不同等级的日志追加到不同的输出位置：appenders: ['out', 'allLog']  categories 作为getLogger方法的键名对应
    categories: {
      // appenders:采用的appender,取上面appenders项,level:设置级别
      request: { appenders: ['out', 'requestLog'], level: 'debug' },
      default: { appenders: ['out', 'allLog', 'error'], level: 'debug' }, // error写入时是经过筛选后留下的
    },
  });
}

export const RequestLogger = log4js.connectLogger(log4js.getLogger('request'), { level: 'WARN' });

export interface ILogger {
  Debug(message: string, ...infos: any[]): void;
  Info(message: string, ...infos: any[]): void;
  Warn(message: string, ...infos: any[]): void;
  Error(message: string, ...infos: any[]): void;
  Fatal(message: string, ...infos: any[]): void;
  Log(type: 'debug' | 'info' | 'warn' | 'error' | 'fatal', message: string, info?: any): void;
}

export class Logger implements ILogger {
  private readonly _logger: log4js.Logger;
  constructor() {
    this._logger = log4js.getLogger();
  }

  public Debug(message: string, ...infos: any[]): void {
    this.Log('debug', message, infos);
  }
  public Info(message: string, ...infos: any[]): void {
    this.Log('info', message, infos);
  }
  public Warn(message: string, ...infos: any[]): void {
    this.Log('warn', message, infos);
  }
  public Error(message: string, ...infos: any[]): void {
    this.Log('error', message, infos);
  }
  public Fatal(message: string, ...infos: any[]): void {
    this.Log('fatal', message, infos);
  }

  public Log(type: 'debug' | 'info' | 'warn' | 'error' | 'fatal', message: string, ...infos: any[]): void {
    if (message && infos) this._logger[type](message, ...infos);
    else {
      this._logger[type](message);
    }
  }
}
