import { SimpleKoaError } from '../../error/SimpleKoaError';
import { Inject, Injectable, Singleton } from '../../di/Dependency';
import { IRedisClient, RedisSetOptions, REDIS_INJECT_TOKEN } from '../../redis/RedisClient';
import { CacheBase, IDistributedCache, DISTRIBUTED_CACHE_INJECT_TOKEN } from '../Cache';
import { ICacheEntryOptions } from '../CacheEntryOptions';

@Singleton(DISTRIBUTED_CACHE_INJECT_TOKEN)
@Injectable()
export class RedisCache extends CacheBase implements IDistributedCache {
  private readonly _redisClient: IRedisClient;
  constructor(@Inject(REDIS_INJECT_TOKEN) redisClient: IRedisClient) {
    super();
    this._redisClient = redisClient;
  }

  Get<TCache = any>(key: string): TCache {
    throw new SimpleKoaError('Please Use GetAsync');
  }

  async GetAsync<TCache = any>(key: string): Promise<TCache> {
    const json = await this._redisClient.GetAsync(key);
    if (json) {
      if (this.IsSlidingCache(key)) {
        const ttl = this.GetSlidingTTL(key);
        if (ttl) await this._redisClient.PExpireAsync(key, ttl);
      }
      return JSON.parse(json) as TCache;
    }
    return null as any;
  }

  Set<TCache = any>(key: string, data: TCache, options?: ICacheEntryOptions): void {
    throw new SimpleKoaError('Please Use SetAsync');
  }

  async SetAsync<TCache = any>(key: string, data: TCache, options?: ICacheEntryOptions): Promise<void> {
    if (data === null || data === undefined) return;
    let redisData: string | Buffer | null = null;
    if (Buffer.isBuffer(data)) redisData = data;
    else if (typeof data === 'string') redisData = data;
    else redisData = JSON.stringify(data);

    if (redisData) {
      let opt: RedisSetOptions | undefined = undefined;
      if (options) {
        if (options.ttl) opt = { ttl: options.ttl };
        if (options.sliding && options.ttl > 0) this.AddSlidingCache(key, options.ttl);
      }
      await this._redisClient.SetAsync(key, redisData, opt);
    }
  }

  Remove(key: string): void {
    throw new SimpleKoaError('Please Use RemoveAsync');
  }

  async RemoveAsync(key: string): Promise<void> {
    await this._redisClient.RemoveAsync(key);
  }
}
