import qs from 'qs';
import axios, { AxiosRequestConfig, AxiosRequestHeaders, AxiosError } from 'axios';
import { HttpClientBase, HttpClientResult, RequestOptions } from '../HttpClient';

const arrayBufferReg = /protobuf|msgpack/i;

export class AxiosHttpClient extends HttpClientBase {
  constructor() {
    super();
  }

  async Send<TResult = any>(config: RequestOptions): Promise<HttpClientResult<TResult>> {
    const result: HttpClientResult<TResult> = { status: 204 };
    try {
      const httpRes = await axios.request(this.GetOptions(config));
      if (httpRes) {
        httpRes.data = httpRes.data;
      }
    } catch (error: any) {
      result.error = error;
    }
    return result;
  }

  private GetOptions(config: RequestOptions): AxiosRequestConfig {
    const headers: AxiosRequestHeaders = {
      Connection: 'keep-alive',
    };

    // 处理是空的情况
    if (!config) return { headers };

    // 处理header
    if (config.headers) {
      for (const key in config.headers) {
        if (Object.prototype.hasOwnProperty.call(config.headers, key)) {
          const element = config.headers[key];
          headers[key.toLowerCase()] = element;
        }
      }
    }

    if (config.responseType && (config.responseType === 'arraybuffer' || config.responseType === 'blob')) {
      headers['accept'] = 'arraybuffer';
    }

    // 处理返回值
    const accept = headers['accept'];
    if (accept && !Array.isArray(accept) && arrayBufferReg.test(accept.toString())) {
      config.responseType = 'arraybuffer';
    }

    return {
      headers,
      params: config.params,
      data: config.data,
      timeout: config.timeout,
      timeoutErrorMessage: config.timeoutErrorMessage,
      responseType: config.responseType,
      withCredentials: true,
      paramsSerializer: (params) => {
        return qs.stringify(params, { arrayFormat: 'repeat' });
      },
    };
  }
}
