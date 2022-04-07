import { DatabaseProvider } from '../DatabaseProvider';
import { Database } from '../Database';

import { Pool } from 'pg';
import { PostgresOptions } from './PostgresOptions';
import { PostgresClient } from './PostgresClient';
import { UsingAsync } from '../../core/Disposable';
import { ExecuteResult, IDatabaseClient } from '../DatabaseClient';

@Database('postgres')
export class PostgresDbProvider extends DatabaseProvider {
  protected ConnPool: Pool;
  protected Options: PostgresOptions;

  constructor(options: PostgresOptions) {
    super();
    this.Options = options;
    this.ConnPool = this.GetConnPool(options);
  }

  async UseTransaction<TResult = void>(fn: (client: IDatabaseClient) => Promise<TResult>): Promise<TResult> {
    const client = await this.GetClientAsync();
    return await UsingAsync(client, async () => {
      await client.ExecuteAsync('BEGIN');
      let result: any = undefined;
      try {
        result = await fn(client);
        await client.ExecuteAsync('COMMIT');
      } catch (error) {
        await client.ExecuteAsync('ROLLBACK');
        throw error;
      }
      return result;
    });
  }

  async ExecuteAsync<TResult = any>(sql: string, ...args: Array<string | number | boolean>): Promise<ExecuteResult<TResult>> {
    const client = await this.GetClientAsync();
    const result = await UsingAsync(client, async () => {
      const execRes = await client.ExecuteAsync(sql, ...args);
      return execRes;
    });
    return result;
  }

  protected GetConnPool(options: PostgresOptions) {
    return new Pool({
      host: options.address,
      port: options.port ?? 5432,
      database: options.database,
      user: options.userName,
      password: options.password,
      max: options.maxConn ?? 20, // 最大连接数
      // log: (...msgs: any[]) => {
      //   this.Logger.LogDebug('Postgres', ...msgs);
      // },
    });
  }

  protected async GetClientAsync(): Promise<PostgresClient> {
    const client = await this.ConnPool.connect();
    return new PostgresClient(client);
  }
}
