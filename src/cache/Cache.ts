import { SimpleKoaError } from '../error/SimpleKoaError';
import { Common } from '../core/Common';
import { ICacheEntryOptions } from './CacheEntryOptions';
import { ILogger, LOGGER_INJECT_TOKEN as Logger_INJECT_TOKEN } from '../logger/Logger';
import { Container } from '../di/Dependency';
import { ISettingManager, SETTING_INJECT_TOKEN as Setting_INJECT_TOKEN } from '../setting/SettingManager';

export interface ICache {
  Get<TCache = any>(key: string): TCache;
  GetAsync<TCache = any>(key: string): Promise<TCache>;

  Set<TCache = any>(key: string, data: TCache, options?: ICacheEntryOptions): void;
  SetAsync<TCache = any>(key: string, data: TCache, options?: ICacheEntryOptions): Promise<void>;

  Remove(key: string): void;
  RemoveAsync(key: string): Promise<void>;

  GetOrAdd<TCache = any>(key: string, func: () => TCache, options?: ICacheEntryOptions): TCache;
  GetOrAddAsync<TCache = any>(key: string, func: () => Promise<TCache> | TCache, options?: ICacheEntryOptions): Promise<TCache>;
}

export abstract class CacheBase implements ICache {
  private readonly _logger: ILogger;
  private readonly _settingManager: ISettingManager;
  private readonly _slidingMap: Map<string, number>;
  constructor() {
    this._logger = Container.resolve<ILogger>(Logger_INJECT_TOKEN);
    this._settingManager = Container.resolve<ISettingManager>(Setting_INJECT_TOKEN);
    this._slidingMap = new Map<string, number>();
  }

  protected get Logger() {
    return this._logger;
  }

  protected get SettingManager() {
    return this._settingManager;
  }

  protected get SlidingMap() {
    return this._slidingMap;
  }

  abstract Get<TCache = any>(key: string): TCache;
  abstract GetAsync<TCache = any>(key: string): Promise<TCache>;

  abstract Set<TCache = any>(key: string, data: TCache, options?: ICacheEntryOptions): void;
  abstract SetAsync<TCache = any>(key: string, data: TCache, options?: ICacheEntryOptions): Promise<void>;

  abstract Remove(key: string): void;
  abstract RemoveAsync(key: string): Promise<void>;

  GetOrAdd<TCache = any>(key: string, func: () => TCache, options?: ICacheEntryOptions): TCache {
    const nullResult: any = null;
    if (!func) return nullResult;

    let cacheData: any = this.Get<TCache>(key);
    if (!Common.IsNullOrUndefined(cacheData)) return cacheData;

    cacheData = func();
    if (cacheData instanceof Promise) {
      throw new SimpleKoaError('Callback function cannot be asynchronous');
    }

    if (!Common.IsNullOrUndefined(cacheData)) {
      this.Set(key, cacheData, options);
    }

    return cacheData;
  }

  async GetOrAddAsync<TCache = any>(key: string, func: () => Promise<TCache> | TCache, options?: ICacheEntryOptions): Promise<TCache> {
    const nullResult: any = null;
    if (!func) return nullResult;

    let cacheData: any = await this.GetAsync<TCache>(key);
    if (!Common.IsNullOrUndefined(cacheData)) return cacheData;

    const cacheDataResult = func();

    if (cacheDataResult instanceof Promise) {
      cacheData = await cacheDataResult;
    } else {
      cacheData = cacheDataResult;
    }

    if (!Common.IsNullOrUndefined(cacheData)) {
      await this.SetAsync(key, cacheData, options);
    }

    return cacheData;
  }

  protected IsSlidingCache(key: string) {
    return !!this._slidingMap[key];
  }

  protected AddSlidingCache(key: string, ttl: number) {
    this.SlidingMap[key] = ttl;
  }

  protected RemoveSlidingCache(key: string) {
    this.SlidingMap.delete(key);
  }

  protected GetSlidingTTL(key: string): number | undefined {
    return this.SlidingMap[key];
  }
}

export const MEMORY_CACHE_INJECT_TOKEN = 'Sys:IMemoryCache';
export interface IMemoryCache extends ICache {}

export const DISTRIBUTED_CACHE_INJECT_TOKEN = 'Sys:IDistributedCache';
export interface IDistributedCache extends ICache {}
