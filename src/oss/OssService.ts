import { Singleton, Injectable, Inject } from '../di/Dependency';
import { IOssProvider, OSS_PROVIDER_INJECT_TOKEN } from './OssProvider';

export const OSS_SVC_INJECT_TOKEN = 'Sys:IOssService';

export interface IOssService {
  GetAsync(path: string): Promise<Buffer>;
  SaveAsync(data: Buffer, group?: string): Promise<string>;
  RemoveAsync(path: string): Promise<void>;
}

@Injectable()
@Singleton(OSS_SVC_INJECT_TOKEN)
export class OssService implements IOssService {
  private readonly _ossProvider: IOssProvider;
  constructor(@Inject(OSS_PROVIDER_INJECT_TOKEN) ossProvider: IOssProvider) {
    this._ossProvider = ossProvider;
  }

  GetAsync(path: string): Promise<Buffer> {
    return this._ossProvider.GetAsync(path);
  }

  SaveAsync(data: Buffer, group?: string | undefined): Promise<string> {
    return this._ossProvider.SaveAsync(data, group);
  }

  RemoveAsync(path: string): Promise<void> {
    return this._ossProvider.RemoveAsync(path);
  }
}
