import { Controller } from '../../src/controller/Controller';
import { Inject, Injectable, Transient } from '../../src/di/Dependency';
import { HttpDelete, HttpGet, HttpPost } from '../../src/router/Request';
import { RequestBody, RequestQuery } from '../../src/router/RequestData';
import { Router } from '../../src/router/Router';
import { IMemoryCache, MEMORY_INJECT_TOKEN } from '../../src/cache/Cache';

@Transient()
@Injectable()
@Router({ desc: '缓存测试' })
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
