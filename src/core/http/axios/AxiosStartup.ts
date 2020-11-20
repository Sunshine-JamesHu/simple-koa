import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { Logger } from '../../logger/Logger';
import { Inject } from '../../di/Injector';
import { HttpResponseError } from '../../error/Error';
import ResultHandlerFactory from '../resultHandler/ResultHandlerFactory';
import SettingManager from '../../setting/SettingManager';

class AxiosStartup {
  @Inject()
  private readonly _logger: Logger;

  @Inject()
  private readonly _settingManager: SettingManager;

  public UseAxios(baseUrl?: string) {
    this.InitDefaultHeaders();
    if (baseUrl) this.InitBaseAddress(baseUrl);

    this.InitTimeout();
    this.UseRequestInterceptor();
    this.UseResponseInterceptor();
  }

  // 如果配置了调试服务器
  private InitDevConfig(cfg: AxiosRequestConfig) {
    try {
      if (this._settingManager && this._settingManager.GetConfig('devServer')) {
        const devServer = this._settingManager.GetConfig('devServer');
        Object.keys(devServer).forEach(key => {
          if (devServer[key]) {
            if (cfg.url?.indexOf(key) === 0) {
              cfg.url = cfg.url.replace(key, '');
            }
            if (cfg.url?.indexOf(`/${key}`) === 0) {
              cfg.url = cfg.url.replace(`/${key}`, '');
              cfg.baseURL = devServer[key];
            }
          }
        });
      }
    } catch (ex) {
      console.error('InitDevConfig', ex);
    }
  }

  private InitTransformResponse(cfg: AxiosRequestConfig) {
    const accept: string = (cfg.headers['accept'] || cfg.headers['Accept'])?.toLowerCase();
    if (accept && (accept.indexOf('msgpack') > -1 || accept.indexOf('potobuf') > -1)) {
      cfg.transformResponse = (data, headers) => {
        const contextType = headers['content-type'] || headers['Content-Type'];
        if (contextType) {
          const handler = ResultHandlerFactory.GetResultHandler(contextType);
          if (handler) {
            return handler.Decode(data);
          }
        }
        return data;
      };
    }
  }

  private InitDefaultHeaders() {
    axios.defaults.headers = {
      'x-requested-with': 'XMLHttpRequest',
      'content-type': 'application/json',
      'accept-encoding': 'gzip, deflate', // 不处理br的相关压缩
    };
  }

  private InitBaseAddress(baseUrl: string) {
    axios.defaults.baseURL = baseUrl;
  }

  private InitTimeout() {
    const timeout = this._settingManager.GetHttpClientTimeout() || 30 * 1000; // 后台默认30S超时
    axios.defaults.timeout = timeout;
    axios.interceptors.request.use(
      (config: AxiosRequestConfig) => {
        // @ts-ignore
        const source = new axios.CancelToken.source(); // 默认的超时设置是响应超时,不包含连接时间,有时候连接,会很耗时
        config.cancelToken = source.token;
        setTimeout(() => {
          source.cancel();
        }, config.timeout || timeout);
        return config;
      },
      (error: Error) => {
        return error;
      },
    );
  }

  private UseRequestInterceptor() {
    axios.interceptors.request.use(
      (cfg: AxiosRequestConfig) => {
        this.InitTransformResponse(cfg);
        this.InitDevConfig(cfg);
        return cfg;
      },
      (error: any) => {
        return Promise.reject(error);
      },
    );
  }

  private UseResponseInterceptor() {
    axios.interceptors.response.use(
      (res: AxiosResponse) => {
        // console.log("res", res);
        // console.groupEnd();
        return res;
      },
      (error: AxiosError) => {
        if (error.config) {
          const logInfo = {
            message: error.message,
            url: {
              baseURL: error.config.baseURL,
              url: error.config.url,
            },
            method: error.config.method,
            headers: error.config.headers,
            data: error.config.data,
            params: error.config.params,

            responseStatus: 0,
            responseHeaders: {},
          };

          let errInfo = {};
          let status;
          if (error.response) {
            errInfo = error.response.data;
            logInfo.responseStatus = error.response.status;
            logInfo.responseHeaders = error.response.headers;

            if (error.response.status === 401 || error.response.status === 403) status = error.response.status;
          } else errInfo = { error: '网络异常' };

          this._logger.Error(error.message, logInfo);
          return Promise.reject(new HttpResponseError(error, errInfo, status));
        } else {
          return Promise.reject(error);
        }
      },
    );
  }
}

export default new AxiosStartup();
