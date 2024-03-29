import { ISettingManager, SETTING_INJECT_TOKEN } from '../setting/SettingManager';
import { Container } from '../di/Dependency';

export const OSS_OPTIONS_INJECT_TOKEN = 'Sys:OssOptions';

export interface OssOptions {}

export function GetInjectToken(key: string) {
  if (!key) return OSS_OPTIONS_INJECT_TOKEN;
  return `${OSS_OPTIONS_INJECT_TOKEN}:${key}`;
}

export function ConfigureOssOptions(type: string, options?: OssOptions) {
  if (!options) {
    const settingManager = Container.resolve<ISettingManager>(SETTING_INJECT_TOKEN);
    options = settingManager.GetConfig(`oss:${type}`);
  }

  Container.register(GetInjectToken(type), { useValue: options });
}
