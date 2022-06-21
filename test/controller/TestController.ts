import { Controller } from '../../src/controller/Controller';
import { Inject, Injectable, Transient } from '../../src/di/Dependency';
import { HttpDelete, HttpGet, HttpPut, HttpPost } from '../../src/router/Request';
import { RequestBody, RequestQuery } from '../../src/router/RequestData';
import { Router } from '../../src/router/Router';
import { ITestService } from '../service/TestService';
import { IQueueTestService } from '../service/QueueTestService';
import { AsyncDisposableTest, DisposableTest } from '../disposableTest/DisposableTest';
import { UsingAsync } from '../../src/core/Disposable';
import { UserFriendlyError } from '../../src/error/UserFriendlyError';
import { SimpleKoaError } from '../../src/error/SimpleKoaError';

@Transient()
@Injectable()
@Router({ desc: '测试路由' })
export default class TestController extends Controller {
  constructor(@Inject('ITestService') private testService: ITestService, @Inject('IQueueTestService') private queueTestService: IQueueTestService) {
    super();
  }

  @HttpGet({ desc: '数组请求测试' })
  ArrReqTest(@RequestQuery('id') id: number[]): void {
    console.log(id);
  }

  @HttpPost({ desc: '管道发布测试' })
  async QueuePubTest(@RequestBody() data: any): Promise<void> {
    this.queueTestService.PublishAsync(data);
  }

  @HttpPost({ desc: '主动抛出前端可捕获错误' })
  GlobalErrorTest(): void {
    throw new UserFriendlyError('主动抛出错误', { code: '1132', detail: { name: 'pay', age: 18, sex: 0 } });
  }

  @HttpPost({ desc: '主动抛出错误' })
  GlobalErrorTest2(): void {
    throw new Error('主动抛出错误');
  }

  @HttpPost()
  GlobalErrorTest3(): void {
    throw new UserFriendlyError('主动抛出501错误', undefined, 501);
  }

  @HttpPost()
  GlobalErrorTest4(): void {
    throw new UserFriendlyError('错误，错误，错误');
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
  public GetTest(): string {
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

  @HttpGet()
  async DisposableTest(): Promise<void> {
    // const a = new DisposableTest();
    // a.Dispose();
    // const b = new AsyncDisposableTest();
    // b.DisposeAsync();

    const a1 = new DisposableTest();
    UsingAsync(a1, () => {
      console.log('shifangqian');
    });
    console.log('11111');

    const a2 = new AsyncDisposableTest();
    await UsingAsync(a2, () => {
      console.log('shifangqian2');
      return Promise.resolve();
    });
    console.log('22222');
  }
}
