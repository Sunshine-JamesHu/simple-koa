import { IDbTestService } from '../service/DbTestService';
import { Controller } from '../../src/controller/Controller';
import { Inject, Injectable, Transient } from '../../src/di/Dependency';
import { HttpGet, HttpPost } from '../../src/router/Request';
import { RequestBody, RequestQuery } from '../../src/router/RequestData';
import { Router } from '../../src/router/Router';
import { IHttpClient, INJECT_TOKEN as HTTP_INJECT_TOKEN } from '../../src/httpClient/HttpClient';

export interface IHttpTestController {
  GetUserName(id: number): Promise<string>;
}

@Transient()
@Injectable()
@Router()
export default class HttpTestController extends Controller implements IHttpTestController {
  constructor(@Inject(HTTP_INJECT_TOKEN) private httpClient: IHttpClient) {
    super();
  }

  @HttpGet()
  async GetUserName(@RequestQuery('id') id: number): Promise<string> {
    const res = await this.httpClient.Get<string>({ url: 'http://127.0.0.1:20000/api/db/getUserName', params: { id } });
    return res.data || '';
  }
}
