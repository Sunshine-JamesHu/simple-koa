import { IHttpClient, RequestConfig, Response, HttpMethod } from '../HttpClient';
import axios, { AxiosResponse, AxiosRequestConfig, Method } from 'axios';

const arrayBufferReg = /protobuf|msgpack/i;

export default class HttpClient implements IHttpClient {
  public defaultHeaders: { [key: string]: string } = {};
  private needProxyHeaders: string[] = [
    'Authorization',
    'authorization', // 验证
    'Accept-Language',
    'accept-language', // 语言
    'Cookie',
    'cookie',
    // "Accept-Encoding", "accept-encoding",
  ];

  public Get<TOutput>(url: string, config?: RequestConfig): Promise<TOutput> {
    const resTask = axios.get<Response<TOutput>>(url, this.GetAxiosConfig(config));
    return this.GenResponse<TOutput>(resTask);
  }

  public Post<TOutput>(url: string, data: any, config?: RequestConfig): Promise<TOutput> {
    const resTask = axios.post<Response<TOutput>>(url, data, this.GetAxiosConfig(config));
    return this.GenResponse<TOutput>(resTask);
  }

  public Put<TOutput>(url: string, data: any, config?: RequestConfig): Promise<TOutput> {
    const resTask = axios.put<Response<TOutput>>(url, data, this.GetAxiosConfig(config));
    return this.GenResponse<TOutput>(resTask);
  }

  public Delete<TOutput>(url: string, config?: RequestConfig): Promise<TOutput> {
    const resTask = axios.delete<Response<TOutput>>(url, this.GetAxiosConfig(config));
    return this.GenResponse<TOutput>(resTask);
  }

  public async Send(url: string, method: HttpMethod, config?: RequestConfig, needAll?: boolean): Promise<any> {
    let reqConfig = this.GetAxiosConfig(config);
    if (!reqConfig) reqConfig = {};

    reqConfig.url = url;
    reqConfig.method = method;

    const result = await axios.request(reqConfig);
    if (needAll) return result;

    return result.data;
  }

  protected GenResponse<TOutput>(task: Promise<AxiosResponse<any>>): Promise<TOutput> {
    return task.then(
      (res): TOutput => {
        if (res.data !== undefined) {
          if (res.data.data !== undefined) return res.data.data as TOutput;
          return <TOutput>(res.data as any);
        }
        return null as any;
      },
    );
  }

  private GetAxiosConfig(config?: RequestConfig): AxiosRequestConfig {
    const headers: { [key: string]: string } = {};

    // 从ctx中继承header
    const ctxHeaders = this.defaultHeaders;
    for (const key in ctxHeaders) {
      if (ctxHeaders.hasOwnProperty(key)) {
        if (this.needProxyHeaders.indexOf(key) > -1) {
          headers[key] = ctxHeaders[key];
        }
      }
    }

    if (!config) return { headers: headers };

    for (const key in config.headers) {
      if (config.headers.hasOwnProperty(key)) {
        headers[key.toLowerCase()] = config.headers[key]; // 全部使用小写
      }
    }

    // 返回值类型选择
    const accept = headers['accept'];
    if (accept && arrayBufferReg.test(accept)) config.responseType = 'arraybuffer';

    return {
      withCredentials: true,
      params: config.params,
      data: config.data,
      headers: headers,
      timeout: config.timeout,
      timeoutErrorMessage: config.timeoutErrorMessage,
      responseType: config.responseType,
    };
  }

  public SetDefaultHeaders(headers: { [key: string]: string }) {
    this.defaultHeaders = headers; // 代理ctx中的headers
  }
}
