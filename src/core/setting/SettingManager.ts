import * as fs from 'fs';
import * as path from 'path';
import { Injectable } from '../di/Injector';

export const APP_CONFIG: { [key: string]: any } = {};

const SetConfig = (cfg: any) => {
  for (const key in cfg) {
    if (cfg.hasOwnProperty(key)) {
      APP_CONFIG[key] = cfg[key];
    }
  }
};

export function LoadAppConfig() {
  try {
    let appConfig = '';
    // 如果是调试模式 并且存在调试配置文件取调试配置文件
    if (process.env.NODE_ENV === 'development' && fs.existsSync('./app.config.dev.json')) {
      appConfig = fs.readFileSync('./app.config.dev.json', 'utf-8');
    } else {
      appConfig = fs.readFileSync('./app.config.json', 'utf-8');
    }
    if (!appConfig) throw new Error('App配置为空,采用默认配置');

    const cfg = JSON.parse(appConfig);
    SetConfig(cfg);
  } catch (error) {
    console.warn('App配置为空,采用默认配置');
    const cfg = {
      port: 8000,
      controllerProp: path.join(__dirname, './src/controllerProp'),
    };
    SetConfig(cfg);
  }
}

@Injectable('Singleton')
export default class SettingManager {
  /**
   * 设置配置
   * @param cfg 配置
   * @param key 配置Key
   */
  public SetConfig(key: string, cfg: any) {
    APP_CONFIG[key] = cfg;
  }

  /**
   * 读取配置
   * @param key 配置Key EX: port,user:name
   */
  public GetConfig(key: string): any {
    const keyPath = key.split(':');
    let cfg: any = APP_CONFIG[keyPath[0]];
    for (let index = 1; index < keyPath.length; index++) {
      const element = keyPath[index];
      cfg = cfg[element];
    }
    return cfg;
  }

  /**
   * 获取Api地址
   */
  public GetApiAddress(): string {
    return this.GetConfig('apiAddress');
  }

  /**
   * 获取Api前缀
   */
  public GetApiPrefix(): string {
    return this.GetConfig('apiPrefix');
  }

  /**
   * 获取Cors配置
   */
  public GetCors():
    | {
        origin?: string;
        exposeHeaders?: Array<string>;
        maxAge?: number;
        credentials?: boolean;
        allowMethods?: Array<string>;
        allowHeaders?: Array<string>;
      }
    | undefined {
    return this.GetConfig('cors');
  }

  /**
   * 获取请求日志记录
   */
  public GetRequestLog(): boolean {
    return this.GetConfig('requestLog');
  }

  /**
   * 获取http请求超时时间
   */
  public GetHttpClientTimeout(): number {
    return this.GetConfig('httpTimeout');
  }
}
