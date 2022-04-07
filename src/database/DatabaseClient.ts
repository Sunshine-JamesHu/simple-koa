import { Container } from '../di/Dependency';
import { ILogger, INJECT_TOKEN as Logger_INJECT_TOKEN } from '../logger/Logger';
import { IDisposable } from '../core/Disposable';

export interface ExecuteResult<T> {
  rowCount: number;
  rows: T[];
}

export interface IDatabaseClient extends IDisposable {
  ExecuteAsync<TResult = any>(sql: string, ...args: Array<string | number | boolean>): Promise<ExecuteResult<TResult>>;
}

export abstract class DatabaseClient implements IDatabaseClient {
  protected Logger: ILogger;
  constructor() {
    this.Logger = Container.resolve<ILogger>(Logger_INJECT_TOKEN);
  }

  abstract ExecuteAsync<TResult = any>(sql: string, ...args: Array<string | number | boolean>): Promise<ExecuteResult<TResult>>;
  abstract Dispose(): void;
}
