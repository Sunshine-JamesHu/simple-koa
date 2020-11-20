import { IMiddleware } from '../middleware/Middleware';
import { Options } from 'http-proxy-middleware';

export interface IRequestConfig {
  /**
   * 请求路径
   */
  path: string;
  /**
   * 请求方式
   */
  method: 'get' | 'post' | 'put' | 'delete' | 'options';
  /**
   * 拦截器
   */
  interceptors?: IMiddleware[];
}

export interface IProxyConfig {
  /**
   * 请求路径
   */
  path: string;
  /**
   * 代理路径
   */
  proxyPath: string;
  /**
   * 配置
   */
  options?:Options;
}

export function HttpRequest(config: IRequestConfig) {
  return (target: any, name: string, descriptor: PropertyDescriptor) => {
    target[name].subPath = config.path;
    target[name].requestMethod = config.method;
    target[name].interceptors = config.interceptors;
  };
}

export function HttpProxy(config: IProxyConfig) {
  return (target: any, name: string, descriptor: PropertyDescriptor) => {
    target[name].proxy = config.proxyPath;
    target[name].proxyOptions = config.options;
    target[name].subPath = config.path;
  };
}
