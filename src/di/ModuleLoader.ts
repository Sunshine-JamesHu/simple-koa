import * as path from "path";
import * as fs from "fs";
import { container, singleton } from "tsyringe";
import { ModuleContainer } from "./ModuleContainer";
import { ServiceLifetime } from "./Dependency";

export interface IModuleLoader {
  LoadModule(modulePath: string): void;
}

@singleton()
export class ModuleLoader implements IModuleLoader {
  public LoadModule(modulePath: string) {
    let files: any[] = [];
    try {
      files = fs.readdirSync(modulePath);
    } catch (error) {
      console.error("Module路径配置错误,请检查配置后重试.");
      files = [];
    }

    const moduleContainer = container.resolve(ModuleContainer);
    files.forEach((filePath) => {
      const fullFilePath = path.join(modulePath, filePath);
      if (fs.statSync(fullFilePath).isDirectory()) {
        this.LoadModule(fullFilePath);
      } else {
        const extName = path.extname(fullFilePath);
        if (extName === ".ts" || extName === ".js") {
          const modules: any[] = require(fullFilePath);
          if (!modules) return;

          for (const key in modules) {
            if (Object.prototype.hasOwnProperty.call(modules, key)) {
              const module = modules[key];
              if (module.prototype) {
                moduleContainer.Add(module);
              }
            }
          }
        }
      }
    });
  }
}

export function RegisterModule(module: Function) {
  const modulePrototype = module.prototype;
  if (modulePrototype) {
    // 注册模块
    if (
      modulePrototype.lifetime != undefined &&
      modulePrototype.lifetime != null
    ) {
      console.log(`注册Module: ${modulePrototype.token} -> ${module.name}`);
      
      const lifetime = modulePrototype.lifetime as ServiceLifetime;
      if (!container.isRegistered(modulePrototype.token)) {
        if (lifetime == ServiceLifetime.Singleton) {
          container.registerSingleton(modulePrototype.token, module as any);
        } else if (lifetime == ServiceLifetime.Scoped) {
          // TODO:暂时不支持此种注册方式
        } else if (lifetime == ServiceLifetime.Transient) {
          container.register(modulePrototype.token, {
            useClass: module as any,
          });
        }
      }
    }
  }
}

export function RegisterModuleByContainer() {
  const moduleContainer = container.resolve(ModuleContainer);
  const modules = moduleContainer.GetAllModule();

  modules.forEach((module) => {
    RegisterModule(module);
  });
}
