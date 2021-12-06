import * as path from 'path';
import * as fs from 'fs';
import { singleton } from 'tsyringe';
import { ModuleContainer } from './ModuleContainer';
import { GetInjectInfo, IsMultipleRegister, ServiceLifetime, Container, Injectable, NeedReplaceService, InjectInfo } from './Dependency';
import { ArrayHelper } from '../tools/ArrayHelper';

export interface IModuleLoader {
  LoadModule(modulePath: string): void;
  RegisterModule(module: Function): void;
  RegisterModuleByContainer(): void;
}

@singleton()
@Injectable()
export class ModuleLoader implements IModuleLoader {
  private readonly _moduleContainer: ModuleContainer;
  constructor(moduleContainer: ModuleContainer) {
    this._moduleContainer = moduleContainer;
  }

  public LoadModule(modulePath: string) {
    let files: any[] = [];
    try {
      files = fs.readdirSync(modulePath);
    } catch (error) {
      console.error('Module路径配置错误,请检查配置后重试.');
      files = [];
    }

    files.forEach((filePath) => {
      const fullFilePath = path.join(modulePath, filePath);
      if (fs.statSync(fullFilePath).isDirectory()) {
        this.LoadModule(fullFilePath);
      } else {
        const extName = path.extname(fullFilePath);
        if (extName === '.ts' || extName === '.js') {
          const modules: any[] = require(fullFilePath);
          if (!modules) return;

          for (const key in modules) {
            if (Object.prototype.hasOwnProperty.call(modules, key)) {
              const module = modules[key];
              if (module.prototype) {
                this._moduleContainer.Add(module);
              }
            }
          }
        }
      }
    });
  }

  public RegisterModule(module: Function) {
    const injectInfo = GetInjectInfo(module);
    if (!injectInfo) return;

    const isRegistered = Container.isRegistered(injectInfo.token);
    const isMultipleRegister = IsMultipleRegister(module);

    if (isRegistered && !isMultipleRegister) return;

    const lifetime = injectInfo.lifetime;
    if (lifetime == ServiceLifetime.Singleton) {
      Container.registerSingleton(injectInfo.token, module as any);
    } else if (lifetime == ServiceLifetime.Scoped) {
      // TODO:暂时不支持此种注册方式
    } else if (lifetime == ServiceLifetime.Transient) {
      Container.register(injectInfo.token, {
        useClass: module as any,
      });
    }
  }

  public RegisterModuleByContainer() {
    const modules = this._moduleContainer.GetNeedRegisterModule();
    const needRegisterModules = this.GetNeedRegisterModules(modules);
    console.log(needRegisterModules);
    needRegisterModules.forEach((module) => {
      this.RegisterModule(module);
    });
  }

  private GetNeedRegisterModules(allModule: Function[]): Function[] {
    const groupModules = ArrayHelper.GroupBy<{ module: Function; injectInfo: InjectInfo }>(
      allModule.map((module) => {
        const injectInfo = GetInjectInfo(module);
        return {
          module,
          injectInfo,
        };
      }),
      'injectInfo:token'
    );
    let result: Function[] = [];
    for (const key in groupModules) {
      if (Object.prototype.hasOwnProperty.call(groupModules, key)) {
        const data = groupModules[key];
        let needRegisterModules: any[] = [];

        for (let index = 0; index < data.length; index++) {
          const element = data[index];

          const needReplaceService = NeedReplaceService(element.module);
          const isMultipleRegister = IsMultipleRegister(element.module);

          if (needReplaceService && !isMultipleRegister) {
            needRegisterModules = [element.module];
            break;
          }

          needRegisterModules.push(element.module);
        }
        result = result.concat(needRegisterModules);
      }
    }
    return result;
  }
}
