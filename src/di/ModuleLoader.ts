import * as path from 'path';
import * as fs from 'fs';
import { container, singleton, injectable } from 'tsyringe';
import { ModuleContainer } from './ModuleContainer';
import { GetInjectInfo, ServiceLifetime } from './Dependency';

export interface IModuleLoader {
  LoadModule(modulePath: string): void;
  RegisterModule(module: Function): void;
  RegisterModuleByContainer(): void;
}

@singleton()
@injectable()
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
    const lifetime = injectInfo.lifetime;
    if (!container.isRegistered(injectInfo.token)) {
      if (lifetime == ServiceLifetime.Singleton) {
        container.registerSingleton(injectInfo.token, module as any);
      } else if (lifetime == ServiceLifetime.Scoped) {
        // TODO:暂时不支持此种注册方式
      } else if (lifetime == ServiceLifetime.Transient) {
        container.register(injectInfo.token, {
          useClass: module as any,
        });
      }
    }
  }

  public RegisterModuleByContainer() {
    const modules = this._moduleContainer.GetAllModule();
    modules.forEach((module) => {
      this.RegisterModule(module);
    });
  }
}
