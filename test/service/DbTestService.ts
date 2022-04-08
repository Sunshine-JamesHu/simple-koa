import { Inject, Injectable, Singleton } from '../../src/di/Dependency';
import { Service } from '../../src/service/Service';
import { IDatabaseProviderFactory, INJECT_TOKEN as DPF_INJECT_TOKEN } from '../../src/database/DatabaseProviderFactory';
import { IDatabaseProvider, INJECT_TOKEN as DBP_INJECT_TOKEN } from '../../src/database/DatabaseProvider';

export interface IDbTestService {
  GetUserName(id: number): Promise<string>;
  GetList(): Promise<Array<{ id: number; name: string }>>;
  Create(id: number, name: string): Promise<void>;
  BatchCreate(data: { id: number; name: string }[]): Promise<void>;
}

@Injectable()
@Singleton('IDbTestService')
export class DbTestService extends Service implements IDbTestService {
  constructor(
    @Inject(DPF_INJECT_TOKEN) private dbProviderFactory: IDatabaseProviderFactory,
    @Inject(DBP_INJECT_TOKEN) private dbProvider: IDatabaseProvider
  ) {
    super();
  }

  async GetUserName(id: number): Promise<string> {
    // const result = await this.dbProvider.ExecuteAsync<{ name: string }>(`SELECT "name" FROM test1 WHERE id = $1`, id);
    // return result.rows[0]?.name;

    const dbProvider = this.dbProviderFactory.GetProvider('mysql');
    const result = await dbProvider.ExecuteAsync<{ name: string }>(`SELECT name FROM test1 WHERE id = ?`, id);
    return result.rows[0]?.name;
  }

  public async GetList(): Promise<Array<{ id: number; name: string }>> {
    // const dbProvider = this.dbProviderFactory.GetProvider();
    // const a = await dbProvider.ExecuteAsync('SELECT id, "name" FROM public.test1');
    // return a.rows;

    const dbProvider = this.dbProviderFactory.GetProvider('mysql');
    const a = await dbProvider.ExecuteAsync('SELECT id, name FROM test1');
    return a.rows;
  }

  public async Create(id: number, name: string): Promise<void> {
    // await this.dbProvider.UseTransaction(async (client) => {
    //   await client.ExecuteAsync(`INSERT INTO public.test1 (id, "name") VALUES($1, $2)`, id, name);
    // });

    const dbProvider = this.dbProviderFactory.GetProvider('mysql');
    await dbProvider.UseTransaction(async (client) => {
      await client.ExecuteAsync(`INSERT INTO test1 (id, name) VALUES(?, ?)`, id, name);
    });
  }

  public async BatchCreate(data: { id: number; name: string }[]): Promise<void> {
    // await this.dbProvider.UseTransaction(async (client) => {
    //   for (let index = 0; index < data.length; index++) {
    //     const element = data[index];
    //     await client.ExecuteAsync(`INSERT INTO public.test1 (id, "name") VALUES($1, $2)`, element.id, element.name);
    //   }
    // });

    const dbProvider = this.dbProviderFactory.GetProvider('mysql');
    await dbProvider.UseTransaction(async (client) => {
      for (let index = 0; index < data.length; index++) {
        const element = data[index];
        await client.ExecuteAsync(`INSERT INTO test1 (id, name) VALUES(?, ?)`, element.id, element.name);
      }
    });
  }
}
