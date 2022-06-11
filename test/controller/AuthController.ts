import { Controller } from '../../src/controller/Controller';
import { Inject, Injectable, Transient } from '../../src/di/Dependency';
import { HttpDelete, HttpGet, HttpPut, HttpPost } from '../../src/router/Request';
import { RequestBody, RequestQuery } from '../../src/router/RequestData';
import { Router } from '../../src/router/Router';
import { ITestService } from '../service/TestService';
import { IQueueTestService } from '../service/QueueTestService';

@Transient()
@Injectable()
@Router({ desc: '权限验证路由' })
export default class AuthController extends Controller {
  constructor(@Inject('ITestService') private testService: ITestService, @Inject('IQueueTestService') private queueTestService: IQueueTestService) {
    super();
  }

  @HttpGet()
  public AuthTest(): string {
    return '验证通过';
  }
}
