import { Singleton, Container } from '../di/Dependency';
import { GetDatabaseProviderToken, IDatabaseProvider } from './DatabaseProvider';

export const INJECT_TOKEN = 'Sys:IDatabaseProviderFactory';

export interface IDatabaseProviderFactory {
  GetProvider(key?: string): IDatabaseProvider;
}

@Singleton(INJECT_TOKEN)
export class DatabaseProviderFactory implements IDatabaseProviderFactory {
  GetProvider(key?: string): IDatabaseProvider {
    const queue = Container.resolve<IDatabaseProvider>(GetDatabaseProviderToken(key || 'default'));
    if (!queue) throw new Error(`Can not fount database provider,key is [${key}]`);
    return queue;
  }
}
