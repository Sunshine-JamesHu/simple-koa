import { Controller } from '../../src/controller/Controller';
import { Inject, Injectable, Transient } from '../../src/di/Dependency';
import { HttpGet, HttpPost } from '../../src/router/Request';
import { RequestBody, RequestQuery } from '../../src/router/RequestData';
import { Router } from '../../src/router/Router';
import { IOssService, OSS_SVC_INJECT_TOKEN } from '../../src/oss/OssService';
import { UserFriendlyError } from '../../src/error/UserFriendlyError';

@Transient()
@Injectable()
@Router({ desc: 'Oss存储测试' })
export default class OssController extends Controller {
  constructor(@Inject(OSS_SVC_INJECT_TOKEN) private readonly _ossService: IOssService) {
    super();
  }

  @HttpGet()
  async GetFile(@RequestQuery('path') path: string): Promise<Buffer> {
    return await this._ossService.GetAsync(path);
  }

  @HttpPost()
  async UploadFile(@RequestBody() data: { name: string; data?: File }): Promise<string> {
    if (data && data.data) {
      const buffer = await data.data.arrayBuffer();
      return await this._ossService.SaveAsync(Buffer.from(buffer));
    }
    throw new UserFriendlyError('请选择一个文件进行上传');
  }
}
