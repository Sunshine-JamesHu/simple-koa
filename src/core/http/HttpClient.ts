export interface RequestConfig {
    headers?: { [key: string]: string };
    params?: any;
    data?: any;
    timeout?: number;
    timeoutErrorMessage?: string;
    responseType?: ResponseType;
}



export interface Response<TResult = any> {
    message: string;
    success: boolean;
    code: number;
    data: TResult;
}

export type HttpMethod =
    | 'get' | 'GET'
    | 'delete' | 'DELETE'
    | 'head' | 'HEAD'
    | 'options' | 'OPTIONS'
    | 'post' | 'POST'
    | 'put' | 'PUT'
    | 'patch' | 'PATCH'
    | 'link' | 'LINK'
    | 'unlink' | 'UNLINK';

export type ResponseType =
    | 'arraybuffer'
    | 'blob'
    | 'document'
    | 'json'
    | 'text'
    | 'stream';


export interface IHttpClient {
    /**
     * 发起Get请求
     * @param url 请求地址
     * @param config 配置
     */
    Get<TOutput>(url: string, config?: RequestConfig): Promise<TOutput>;

    /**
     * 发起Post请求
     * @param url 请求地址
     * @param data 请求数据
     * @param config 配置
     */
    Post<TOutput>(url: string, data: any, config?: RequestConfig): Promise<TOutput>;

    /**
     * 发起Put请求
     * @param url 请求地址
     * @param data 数据
     * @param config 配置
     */
    Put<TOutput>(url: string, data: any, config?: RequestConfig): Promise<TOutput>;

    /**
     * 发起Delete请求
     * @param url 请求地址
     * @param config 配置
     */
    Delete<TOutput>(url: string, config?: RequestConfig): Promise<TOutput>;

    /**
     * 发起Http请求
     * @param url 请求路径
     * @param method 请求方式
     * @param config 配置
     */
    Send(url: string, method: HttpMethod, config?: RequestConfig, needAll?: boolean): Promise<any>;
}



