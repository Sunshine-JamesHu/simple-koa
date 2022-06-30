import { Controller } from '../../src/controller/Controller';
import { Inject, Injectable, Transient } from '../../src/di/Dependency';
import { HttpDelete, HttpGet, HttpPut, HttpPost } from '../../src/router/Request';
import { RequestBody, RequestQuery } from '../../src/router/RequestData';
import { Router } from '../../src/router/Router';
import { DATA_SOURCE_PRIVIDER_INJECT_TOKEN, IDataSourceProvider } from '../../src/typeorm/DbSource';
import { Photo } from '../domain/entities/Photo';

@Transient()
@Injectable()
@Router({ desc: '测试路由' })
export default class OrmController extends Controller {
  private readonly _dataSourceProvider: IDataSourceProvider;
  constructor(@Inject(DATA_SOURCE_PRIVIDER_INJECT_TOKEN) dataSourceProvider: IDataSourceProvider) {
    super();
    this._dataSourceProvider = dataSourceProvider;
  }

  @HttpGet({ desc: '查询' })
  async Query(@RequestQuery('id') id: number) {
    const repos = await this._dataSourceProvider.GetRepository(Photo);
    const photo = await repos.findOneBy({
      id: id,
    });
    return photo;
  }

  @HttpGet({ desc: '查询2' })
  async Query2(@RequestQuery('name') name: string) {
    const repos = await this._dataSourceProvider.GetRepository(Photo);
    const a = await repos
      .createQueryBuilder('photo')
      .where('photo.name LIKE :name')
      .setParameters({ name: `%${name}%` })
      .getMany();
    return a;
  }

  @HttpPost({ desc: '创建' })
  async Create(@RequestBody() data: any): Promise<void> {
    const repos = await this._dataSourceProvider.GetRepository(Photo);

    const photo = new Photo();

    photo.id = data.id;
    photo.name = data.name;
    photo.desc = data.desc;

    await repos.save(photo);
  }
}
