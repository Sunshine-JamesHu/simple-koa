import { Context } from "koa";
import { Logger } from "../logger/Logger";
import { IHttpClient } from "../http/HttpClient";
import HttpClient from "../http/axios/AxiosHttpClient";
import { Inject } from "../di/Injector";


export default abstract class Service {
    private _context: Context;
    protected get Context(): Context {
        return this._context;
    }
    protected set Context(ctx: Context) {
        this._context = ctx;
        (this.HttpClient as HttpClient).SetDefaultHeaders(ctx.headers);
    }

    protected HttpClient: IHttpClient;

    @Inject()
    protected Logger: Logger;

    constructor() {
        this.HttpClient = new HttpClient();
    }

    protected IsService() {
        return true;
    }

    protected SetHttpClientDefaultHeaders(headers: { [key: string]: string }) {
        const httpClient = this.HttpClient as HttpClient;
        Object.assign(httpClient.defaultHeaders, httpClient.defaultHeaders, headers);
    }
}