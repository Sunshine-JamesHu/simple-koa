import { IDbTestService } from '../service/DbTestService';
import { Controller } from '../../src/controller/Controller';
import { Inject, Injectable, Transient } from '../../src/di/Dependency';
import { HttpGet, HttpPost } from '../../src/router/Request';
import { RequestBody, RequestQuery } from '../../src/router/RequestData';
import { Router } from '../../src/router/Router';

export interface IDbController {
  GetUserName(id: number): Promise<string>;
  GetList(): Promise<Array<{ id: number; name: string }>>;
  Create(data: { id: number; name: string }): Promise<void>;
  BatchCreate(data: { id: number; name: string }[]): Promise<void>;
}

@Transient()
@Injectable()
@Router()
export default class DbController extends Controller implements IDbController {
  constructor(@Inject('IDbTestService') private pgService: IDbTestService) {
    super();
  }

  @HttpGet()
  async GetUserName(@RequestQuery('id') id: number): Promise<string> {
    const name = await this.pgService.GetUserName(id);
    return name;
  }

  @HttpGet()
  GetList(): Promise<{ id: number; name: string }[]> {
    return this.pgService.GetList();
  }

  @HttpPost()
  async Create(@RequestBody() data: { id: number; name: string }): Promise<void> {
    await this.pgService.Create(data.id, data.name);
  }

  @HttpPost()
  async BatchCreate(@RequestBody() data: { id: number; name: string }[]): Promise<void> {
    await this.pgService.BatchCreate(data);
  }
}
