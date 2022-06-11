import { Container } from '../di/Dependency';

export const OSS_PROVIDER_INJECT_TOKEN = 'Sys:IOssProvider';

export interface IOssProvider {
  GetAsync(path: string): Promise<Buffer>;
  SaveAsync(data: Buffer, group?: string): Promise<string>;
  RemoveAsync(path: string): Promise<void>;
}

export abstract class OssProvider implements IOssProvider {
  protected readonly _defaultGroup: string = 'default';

  abstract GetAsync(path: string): Promise<Buffer>;
  abstract SaveAsync(data: Buffer, group?: string): Promise<string>;
  abstract RemoveAsync(path: string): Promise<void>;
}

export function GetProviderInjectToken(providerKey: string) {
  if (!providerKey) return OSS_PROVIDER_INJECT_TOKEN;
  return `${OSS_PROVIDER_INJECT_TOKEN}:${providerKey}`;
}

export type OssProviderType = 'local' | 'minio' | string;

export function UseOssProvider(type: OssProviderType, options?: any) {
  // TODO:将配置写入程序中
  Container.register(OSS_PROVIDER_INJECT_TOKEN, {
    useFactory: () => {
      return Container.resolve(GetProviderInjectToken(type));
    },
  });
}
