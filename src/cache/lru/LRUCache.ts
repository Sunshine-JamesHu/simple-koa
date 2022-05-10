import LRUCacheDrive from 'lru-cache';

import { Injectable, Singleton } from '../../di/Dependency';
import { CacheBase, IMemoryCache, MEMORY_INJECT_TOKEN } from '../Cache';
import { ICacheEntryOptions } from '../CacheEntryOptions';
import { LRUOptions } from './LRUOptions';

@Singleton(MEMORY_INJECT_TOKEN)
@Injectable()
export class LRUCache extends CacheBase implements IMemoryCache {
  private readonly _cacheIns: LRUCacheDrive<string, any>;
  public get CacheIns(): LRUCacheDrive<string, any> {
    return this._cacheIns;
  }

  constructor() {
    super();
    this._cacheIns = this.GenCacheIns();
  }

  Get<TCache = any>(key: string): TCache {
    let opt: LRUCacheDrive.GetOptions | undefined = undefined;
    if (this.IsSlidingCache(key)) opt = { updateAgeOnGet: true };
    return this.CacheIns.get(key, opt) as TCache;
  }

  GetAsync<TCache = any>(key: string): Promise<TCache> {
    return new Promise((resolve, reject) => {
      try {
        const data = this.Get(key);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    });
  }

  Set<TCache = any>(key: string, data: TCache, options?: ICacheEntryOptions): void {
    let opt: LRUCacheDrive.SetOptions<string, any> | undefined = undefined;
    this.RemoveSlidingCache(key);
    if (options && options.ttl) {
      opt = { ttl: options.ttl, noUpdateTTL: false };
      if (options.sliding) {
        // 定义这是一个滑动过期的缓存
        this.AddSlidingCache(key, options.ttl);
      }
    }
    this.CacheIns.set(key, data, opt);
  }

  SetAsync<TCache = any>(key: string, data: TCache, options?: ICacheEntryOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.Set(key, data, options);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  Remove(key: string): void {
    this.CacheIns.delete(key);
  }

  RemoveAsync(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.Remove(key);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  private GetOptions(): LRUOptions {
    let setting = this.SettingManager.GetConfig<LRUOptions>('lru');
    if (!setting) {
      setting = {
        max: 5000,
        maxSize: 5000 * 1024,
        ttl: 20 * 60 * 1000,
      };
    }
    return setting as LRUOptions;
  }

  private GenCacheIns(): LRUCacheDrive<string, any> {
    const cacheOpt = this.GetOptions();
    return new LRUCacheDrive<string, any>({
      ...cacheOpt,
      noUpdateTTL: false,
      sizeCalculation: (val: any, key: string) => this.SizeCalculation(val, key),
      dispose: (val: any, key: string) => this.DisposeCacheItem(val, key),
    } as LRUCacheDrive.Options<string, any>);
  }

  private SizeCalculation(value: any, key: string): number {
    if (Buffer.isBuffer(value)) {
      return (value as Buffer).byteLength;
    }
    return Buffer.from(JSON.stringify(value), 'utf-8').byteLength;
  }

  private DisposeCacheItem(value: any, key: string) {
    this.RemoveSlidingCache(key);
  }
}
