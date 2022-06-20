import {
  createClient,
  createCluster,
  RedisClientOptions,
  RedisClientType,
  RedisClusterOptions,
  RedisFunctions,
  RedisModules,
  RedisScripts,
} from '@redis/client';

import { SimpleKoaError } from '../error/SimpleKoaError';
import { Injectable, Singleton, Inject } from '../di/Dependency';
import { ISettingManager, SETTING_INJECT_TOKEN as Setting_INJECT_TOKEN } from '../setting/SettingManager';
import { ILogger, LOGGER_INJECT_TOKEN as Logger_INJECT_TOKEN } from '../logger/Logger';
import { RedisOptions } from './RedisOptions';
import AsyncLock from 'async-lock';

export const REDIS_INJECT_TOKEN = 'Sys:IRedisClient';

export interface RedisSetOptions {
  ttl: number;
  sliding?: boolean;
}

export interface IRedisClient {
  ConnectAsync(): Promise<void>;
  GetAsync(key: string | Buffer): Promise<string | null>;
  SetAsync(key: string | Buffer, data: string | Buffer, options?: RedisSetOptions): Promise<void>;
  RemoveAsync(key: string | Buffer): Promise<void>;
  PExpireAsync(key: string | Buffer, ttl: number): Promise<void>;
}

@Singleton(REDIS_INJECT_TOKEN)
@Injectable()
export class RedisClient implements IRedisClient {
  private readonly _settingManager: ISettingManager;
  private readonly _logger: ILogger;
  private readonly _client: RedisClientType<RedisModules, RedisFunctions, RedisScripts>;

  private clientReady: boolean = false;
  private readonly _lock: AsyncLock;

  constructor(@Inject(Setting_INJECT_TOKEN) settingManager: ISettingManager, @Inject(Logger_INJECT_TOKEN) logger: ILogger) {
    this._settingManager = settingManager;
    this._logger = logger;
    this._client = this.CreateClient();
    this._lock = new AsyncLock({ timeout: 3000, maxPending: 2000 });
  }

  async GetAsync(key: string | Buffer): Promise<string | null> {
    await this.ConnectAsync();
    return await this._client.get(key);
  }

  async SetAsync(key: string | Buffer, data: string | Buffer, options?: RedisSetOptions): Promise<void> {
    if (data === null || data === undefined) return;

    await this.ConnectAsync();
    await this._client.set(key, data);
    if (!options) options = this.GetDefaultSetOptions();

    // 如果设置-1就不设置过期时间
    if (options.ttl !== -1) {
      await this.PExpireAsync(key, options.ttl);
    }
  }

  async PExpireAsync(key: string | Buffer, ttl: number) {
    await this.ConnectAsync();
    await this._client.pExpire(key, ttl);
  }

  async RemoveAsync(key: string | Buffer): Promise<void> {
    await this.ConnectAsync();
    await this._client.del(key);
  }

  async ConnectAsync(): Promise<void> {
    if (!this.clientReady) {
      return await new Promise((resolve, reject) => {
        this._lock.acquire<null>(
          'redis_connect',
          async (done) => {
            if (this.clientReady) {
              done(undefined, null);
            } else {
              try {
                await this._client.connect();
                done(undefined, null);
              } catch (error: any) {
                done(error);
              }
            }
          },
          (err, ret) => {
            if (err) {
              this._logger.LogError('Redis connect error', err);
              reject(err);
            } else {
              resolve(ret as any);
            }
          }
        );
      });
    }
  }

  protected GetOptions(): RedisOptions<any> {
    const setting = this._settingManager.GetConfig<RedisOptions<any>>('redis');
    if (!setting) {
      throw new SimpleKoaError('Redis options is not null or empry');
    }
    return setting;
  }

  protected CreateClient() {
    const redisOpt = this.GetOptions();

    let client: any = undefined;
    if (redisOpt.cluster) {
      const options: RedisClusterOptions = redisOpt.options;
      client = createCluster(options);
      // const client2 = createCluster({
      //   rootNodes: [
      //     {
      //       url: '172.16.0.112:7000',
      //     },
      //     {
      //       url: '172.16.0.112:7001',
      //       readonly: true,
      //     },
      //     {
      //       url: '172.16.0.112:7002',
      //       readonly: true,
      //     },
      //   ],
      //   defaults: {
      //     password: 'redis123',
      //   },
      // });
    } else {
      const options: RedisClientOptions = redisOpt.options;
      client = createClient(options);
    }

    client.on('error', (error: any) => {
      throw new SimpleKoaError('Redis Client Error', error);
    });

    client.on('connect', () => {
      this._logger.LogDebug('Redis Client Connect');
    });

    client.on('ready', () => {
      this._logger.LogDebug('Redis Client Ready');
      this.clientReady = true;
    });

    client.on('reconnecting', () => {
      this._logger.LogDebug('Redis Client ReConnecting');
    });

    client.on('end', () => {
      this._logger.LogDebug('Redis Client Disconnect');
    });

    return client;
  }

  protected GetDefaultSetOptions(): RedisSetOptions {
    return { ttl: 1000 * 60 * 20 };
  }
}
