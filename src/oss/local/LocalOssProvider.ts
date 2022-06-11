import fs from 'fs';
import path from 'path';
import { Singleton } from '../../di/Dependency';
import { GetProviderInjectToken, OssProvider } from '../OssProvider';

@Singleton(GetProviderInjectToken('local'))
export class LocalOssProvider extends OssProvider {
  GetAsync(path: string): Promise<Buffer> {
    console.log(path);
    throw new Error('Method not implemented.');
  }
  SaveAsync(data: Buffer, group?: string | undefined): Promise<string> {
    console.log(group);
    throw new Error('Method not implemented.');
  }
  RemoveAsync(path: string): Promise<void> {
    console.log(path);
    throw new Error('Method not implemented.');
  }

  private MkdirSync(dir: string): boolean {
    if (!fs.existsSync(dir)) {
      return true;
    } else {
      if (this.MkdirSync(path.dirname(dir))) {
        fs.mkdirSync(dir);
        return true;
      }
    }
    return false;
  }
}
