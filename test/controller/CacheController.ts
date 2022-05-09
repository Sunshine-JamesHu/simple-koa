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
import { IMemoryCache, MEMORY_INJECT_TOKEN } from '../../src/cache/Cache';

@Transient()
@Injectable()
@Router({ desc: '测试路由' })
export default class CacheController extends Controller {
  constructor(@Inject(MEMORY_INJECT_TOKEN) private memoryCache: IMemoryCache) {
    super();
  }

  @HttpGet()
  MGet(@RequestQuery('key') key: string) {
    return this.memoryCache.GetAsync(key);
  }

  @HttpPost()
  async MPost(@RequestBody() data: { key: string; val: any; ttl: number; sliding: boolean }[]) {
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      await this.memoryCache.SetAsync(element.key, element.val, { ttl: element.ttl ?? 5000, sliding: element.sliding });
    }
  }

  @HttpDelete()
  MDel(@RequestQuery('key') key: string) {
    return this.memoryCache.Remove(key);
  }
}
