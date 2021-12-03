import { Controller } from '../../src/controller/Controller';
import { Inject, Injectable, Transient } from '../../src/di/Dependency';
import { GetQueueToken, IQueueManager } from '../../src/queue/QueueManager';
import { HttpDelete, HttpGet, HttpPut, HttpPost } from '../../src/router/Request';
import { RequestBody, RequestQuery } from '../../src/router/RequestData';
import { Router } from '../../src/router/Router';
import { ITestService } from '../service/TestService';

export interface ITestController {
  GetTest(data: { name: string }): string;
  PostTest(id: string, data: Object): any;
  PutTest(file: ArrayBuffer): string;
  DeleteTest(id: number): string;

  LoggerTest(): void;
  GlobalErrorTest(): void;
  QueuePubTest(data: any): Promise<void>;
}

@Transient()
@Injectable()
@Router()
export default class TestController extends Controller implements ITestController {
  constructor(@Inject('ITestService') private testService: ITestService, @Inject(GetQueueToken('pub')) private pubQueueManager: IQueueManager) {
    super();
  }

  @HttpPost()
  async QueuePubTest(@RequestBody() data: any): Promise<void> {
    await this.pubQueueManager.PublishAsync('simple_koa_test', data);
  }

  @HttpPost()
  GlobalErrorTest(): void {
    throw new Error('主动抛出错误');
  }

  @HttpGet()
  LoggerTest(): void {
    this.Logger.LogDebug('这是一条Debug测试');
    this.Logger.LogInfo('这是一条Info测试');
    this.Logger.LogWarn('这是一条Warn测试');
    this.Logger.LogError('这是一条Error测试');
    this.Logger.LogFatal('这是一条Fatal测试');
  }

  @HttpGet()
  public GetTest(@RequestQuery() data: { name: string }): string {
    if (data.name) return data.name;
    return this.testService.TestService();
  }

  @HttpPost()
  public PostTest(@RequestQuery('id') id: string, @RequestBody() data: Object): any {
    return {
      id: id,
      ...data,
    };
  }

  @HttpPut()
  public PutTest(@RequestBody() file: ArrayBuffer): string {
    return 'PutTest';
  }

  @HttpDelete()
  public DeleteTest(@RequestQuery('id') id: number): string {
    console.log(id);
    return '删除成功';
  }
}
