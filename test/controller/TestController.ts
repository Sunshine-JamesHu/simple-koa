import { Controller } from '../../src/controller/Controller';
import { Inject, Injectable, Singleton, Transient } from '../../src/di/Dependency';
import { HttpDelete, HttpGet, HttpPut, HttpPost } from '../../src/router/Request';
import { RequestQuery } from '../../src/router/RequestData';
import { Router } from '../../src/router/Router';
import { ITestService } from '../service/TestService';

export interface ITestController {
  GetTest(data: string): string;
  PostTest(): string;
  PutTest(): string;
  DeleteTest(): string;
}

@Transient()
@Injectable()
@Router()
export default class TestController extends Controller implements ITestController {
  constructor(@Inject('ITestService') private testService: ITestService) {
    super();
  }

  @HttpGet()
  public GetTest(@RequestQuery() data: any): string {
    if (data.a) return data.a;
    return this.testService.TestService();
  }
  @HttpPost()
  public PostTest(): string {
    return 'PostTest';
  }
  @HttpPut()
  public PutTest(): string {
    return 'PutTest';
  }

  @HttpDelete()
  public DeleteTest(): string {
    return 'DeleteTest';
  }
}
