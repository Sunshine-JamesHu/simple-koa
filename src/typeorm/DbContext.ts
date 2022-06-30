import { DataSourceOptions } from 'typeorm';
import { ISettingManager, SETTING_INJECT_TOKEN } from '../setting/SettingManager';
import { AllowMultiple, Container } from '../di/Dependency';

export const DB_CONTEXT_INJECT_TOKEN = 'Sys:IDbContext';

export interface IDbContext {
  GetEntities(): any[];
  GetDbSource(): string;
  GetDbOptions(): DataSourceOptions | undefined;
}

@AllowMultiple()
export abstract class DbContext implements IDbContext {
  protected readonly SettingManager: ISettingManager;
  
  constructor() {
    this.SettingManager = Container.resolve<ISettingManager>(SETTING_INJECT_TOKEN);
  }

  GetDbSource(): string {
    return 'default';
  }

  GetDbOptions(): DataSourceOptions | undefined {
    const source = this.GetDbSource();
    const config = this.SettingManager.GetConfig<DataSourceOptions>(`database:${source}`);
    if (config) {
      if (config.type === 'postgres' && !config.applicationName) {
        (config as any).applicationName = 'simple-koa';
      }
    }
    return config;
  }

  abstract GetEntities(): any[];
}

export function GetAllDbContext(): IDbContext[] {
  const isRegistered = Container.isRegistered(DB_CONTEXT_INJECT_TOKEN);
  if (isRegistered) {
    const contexts = Container.resolveAll<IDbContext>(DB_CONTEXT_INJECT_TOKEN);
    return contexts;
  }
  return [];
}
