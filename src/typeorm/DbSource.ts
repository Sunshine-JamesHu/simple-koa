import { Inject, Injectable, Singleton } from '../di/Dependency';
import { SimpleKoaError } from '../error/SimpleKoaError';
import { DataSource, EntityTarget, Repository } from 'typeorm';
import { GetAllDbContext, IDbContext } from './DbContext';
import { ILogger, LOGGER_INJECT_TOKEN } from '../logger/Logger';

export const DATA_SOURCE_PRIVIDER_INJECT_TOKEN = 'Sys:IDataSourceProvider';

export interface IDataSourceProvider {
  GetRepository<Entity>(target: EntityTarget<Entity>): Repository<Entity>;
  GetDataSourceByKey(source: string): DataSource | undefined;
  GetDataSourceByEntity<Entity>(source: EntityTarget<Entity>): DataSource | undefined;
}

@Singleton(DATA_SOURCE_PRIVIDER_INJECT_TOKEN)
@Injectable()
export class DataSourceProvider implements IDataSourceProvider {
  protected readonly Logger: ILogger;

  private readonly _dbContexts: { [key: string]: IDbContext };
  private readonly _dataSources: { [key: string]: DataSource };
  private readonly _entityMap: Map<any, string>;
  constructor(@Inject(LOGGER_INJECT_TOKEN) logger: ILogger) {
    this.Logger = logger;

    this._dbContexts = this.GetDbContexts();
    this._dataSources = this.GenDataSource();
    this._entityMap = this.GetEntityMap();
  }

  GetRepository<Entity>(target: EntityTarget<Entity>): Repository<Entity> {
    const dataSource = this.GetDataSourceByEntity(target);
    if (!dataSource) {
      throw new SimpleKoaError(`Entity找不到对应的DataSource,请确定该实体在DBContext中已经注册`);
    }
    return dataSource.getRepository(target);
  }

  GetDataSourceByKey(source: string): DataSource | undefined {
    const dataSource = this._dataSources[source];
    return dataSource;
  }

  GetDataSourceByEntity<Entity>(source: EntityTarget<Entity>): DataSource | undefined {
    const sourceKey = this._entityMap.get(source);
    if (!sourceKey) return;
    return this.GetDataSourceByKey(sourceKey);
  }

  protected GetDbContexts(): { [key: string]: IDbContext } {
    const map: { [key: string]: IDbContext } = {};
    const allDbContext = GetAllDbContext();
    for (let index = 0; index < allDbContext.length; index++) {
      const dbContext = allDbContext[index];
      const sourceKey = dbContext.GetDbSource();
      map[sourceKey] = dbContext;
    }
    return map;
  }

  protected GenDataSource(): { [key: string]: DataSource } {
    const map: { [key: string]: DataSource } = {};
    for (const key in this._dbContexts) {
      if (Object.prototype.hasOwnProperty.call(this._dbContexts, key)) {
        const dbContext = this._dbContexts[key];
        const dataSourceOptions = dbContext.GetDbOptions();
        const entities = dbContext.GetEntities();
        if (!dataSourceOptions) throw new SimpleKoaError(`DataSource配置为空,Source->${key}`);
        const dataSource = new DataSource({
          ...dataSourceOptions,
          entities: entities,
        });
        if (dataSource && !dataSource.isInitialized) {
          dataSource
            .initialize()
            .then(() => {
              this.Logger.LogDebug(`Orm->[${key}]初始化成功.`);
            })
            .catch((e) => {
              this.Logger.LogError(`Orm->[${key}]初始化失败.`, e);
            });
        }
        map[key] = dataSource;
      }
    }
    return map;
  }

  protected GetEntityMap(): Map<any, string> {
    const map = new Map<any, string>();
    for (const key in this._dbContexts) {
      if (Object.prototype.hasOwnProperty.call(this._dbContexts, key)) {
        const dbContext = this._dbContexts[key];
        const entities = dbContext.GetEntities();
        entities.forEach((entity) => {
          map.set(entity, key);
        });
      }
    }
    return map;
  }
}
