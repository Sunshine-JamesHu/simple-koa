import { Container } from '../di/Dependency';
import { ModuleContainer } from '../di/ModuleContainer';

import { ILogger, LOGGER_INJECT_TOKEN as Logger_INJECT_TOKEN } from '../logger/Logger';
import { ISettingManager, SETTING_INJECT_TOKEN as Setting_INJECT_TOKEN } from '../setting/SettingManager';

import { GetDatabaseType, IsDatabase } from './Database';
import { ExecuteResult, IDatabaseClient } from './DatabaseClient';
import { DatabaseOptions, DatabaseSetting } from './DatabaseOptions';

export const INJECT_TOKEN = 'Sys:IDatabaseProvider';

export function GetDatabaseProviderToken(key: string) {
  if (key === 'default') return INJECT_TOKEN;
  return `${INJECT_TOKEN}_${key}`;
}

export interface IDatabaseProvider {
  /**
   * 执行数据库指令
   * @param sql sql
   * @param args 参数
   */
  ExecuteAsync<TResult = any>(sql: string, ...args: any): Promise<ExecuteResult<TResult>>;

  /**
   * 使用事务
   * @param fn
   */
  UseTransaction<TResult = void>(fn: (client: IDatabaseClient) => Promise<TResult>): Promise<TResult>;
}

export abstract class DatabaseProvider implements IDatabaseProvider {
  protected Logger: ILogger;
  constructor() {
    this.Logger = Container.resolve<ILogger>(Logger_INJECT_TOKEN);
  }

  abstract ExecuteAsync<TResult = any>(sql: string, ...args: any): Promise<ExecuteResult<TResult>>;

  abstract UseTransaction<TResult = void>(fn: (client: IDatabaseClient) => Promise<TResult>): Promise<TResult>;
}

function GetDatabseSettings() {
  const settingManager = Container.resolve<ISettingManager>(Setting_INJECT_TOKEN);
  const settings = settingManager.GetConfig<DatabaseSetting>('databases');
  return settings;
}

export function RegisterDbProviders() {
  const dbSettings = GetDatabseSettings();

  if (!dbSettings) return;
  const dbKeys = Object.getOwnPropertyNames(dbSettings);
  if (!dbKeys || !dbKeys.length) return;

  const moduleContainer = Container.resolve(ModuleContainer);
  const dbs = moduleContainer.GetAllModule().filter((p) => IsDatabase(p));

  dbKeys.forEach((key) => {
    const dbSetting: DatabaseOptions = dbSettings[key];
    const db = dbs.find((p) => GetDatabaseType(p) === dbSetting.type);
    const dbToken = GetDatabaseProviderToken(key);
    if (db && !Container.isRegistered(dbToken)) {
      const DbProvider: any = db;
      const dbProviderIns = new DbProvider(dbSettings[key].options);
      Container.registerInstance<IDatabaseProvider>(dbToken, dbProviderIns);
    }
  });
}
