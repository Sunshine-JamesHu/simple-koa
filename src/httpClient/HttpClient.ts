export const INJECT_TOKEN = 'Sys:IHttpClient';

export interface HttpClientResult<TResult = any> {
  status: number;
  data?: TResult;
  error?: Error;
}

export type ResponseType = 'arraybuffer' | 'blob' | 'document' | 'json' | 'text' | 'stream';

export type HttpMethod =
  | 'get'
  | 'GET'
  | 'delete'
  | 'DELETE'
  | 'head'
  | 'HEAD'
  | 'options'
  | 'OPTIONS'
  | 'post'
  | 'POST'
  | 'put'
  | 'PUT'
  | 'patch'
  | 'PATCH'
  | 'link'
  | 'LINK'
  | 'unlink'
  | 'UNLINK';

export interface RequestOptions {
  url: string;
  method?: HttpMethod;
  headers?: { [key: string]: string };
  params?: any;
  data?: any;
  timeout?: number;
  timeoutErrorMessage?: string;
  responseType?: ResponseType;
}

export interface IHttpClient {
  Get<TResult = any>(config: RequestOptions): Promise<HttpClientResult<TResult>>;
  Post<TResult = any>(config: RequestOptions): Promise<HttpClientResult<TResult>>;
  Put<TResult = any>(config: RequestOptions): Promise<HttpClientResult<TResult>>;
  Delete<TResult = any>(config: RequestOptions): Promise<HttpClientResult<TResult>>;
  Send<TResult = any>(config: RequestOptions): Promise<HttpClientResult<TResult>>;
}

export abstract class HttpClientBase implements IHttpClient {
  Get<TResult = any>(config: RequestOptions): Promise<HttpClientResult<TResult>> {
    return this.Send<TResult>({ ...config, method: 'get' });
  }

  Post<TResult = any>(config: RequestOptions): Promise<HttpClientResult<TResult>> {
    return this.Send<TResult>({ ...config, method: 'post' });
  }

  Put<TResult = any>(config: RequestOptions): Promise<HttpClientResult<TResult>> {
    return this.Send<TResult>({ ...config, method: 'put' });
  }

  Delete<TResult = any>(config: RequestOptions): Promise<HttpClientResult<TResult>> {
    return this.Send<TResult>({ ...config, method: 'delete' });
  }

  abstract Send<TResult = any>(config: RequestOptions): Promise<HttpClientResult<TResult>>;
}
