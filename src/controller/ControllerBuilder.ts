import * as path from "path";
import * as fs from "fs";
import Router from "koa-router";
import Koa from "koa";
import { container } from "tsyringe";
import { ModuleContainer } from "../di/ModuleContainer";
import { IController } from "./Controller";
import {
  ISettingManager,
  INJECT_TOKEN as SETTING_INJECT_TOKEN,
} from "../setting/SettingManager";
import { Inject, Injectable, Singleton } from "../di/Dependency";
import { Context, Next } from "koa";
import { REQUEST_BODY, REQUEST_QUERY } from "../router/RequestData";

export const INJECT_TOKEN = "IControllerBuilder";

interface ActionDescriptor {
  fullPath: string;
  httpMethod: "get" | "post" | "put" | "delete" | "options";
  func: (context: Context, next: Next) => Promise<any>;
}

export interface IControllerBuilder {
  CreateController(module: Function): void;
  CreateControllerByContainer(app: Koa): void;
  CreateControllerByModule(app: Koa, modulePath: string): void;
}

@Injectable()
@Singleton(INJECT_TOKEN)
export class ControllerBuilder implements IControllerBuilder {
  private readonly _settingManager: ISettingManager;
  private readonly _apiPrefix: string;

  constructor(@Inject(SETTING_INJECT_TOKEN) settingManager: ISettingManager) {
    this._settingManager = settingManager;
    this._apiPrefix = settingManager.GetConfig<string>("apiPrefix") || "api";
  }

  public CreateController(module: Function): ActionDescriptor[] | undefined {
    const modulePrototype = module.prototype;
    if (
      !modulePrototype ||
      !modulePrototype.IsController ||
      !modulePrototype.path
    ) {
      return;
    }
    const actions: ActionDescriptor[] = [];
    console.log("注册Controller", module.name, modulePrototype);
    const propKeys = Object.getOwnPropertyNames(modulePrototype);
    const controllerPath = modulePrototype.path;
    propKeys.forEach((propKey) => {
      if (propKey === "constructor") return; // 跳过构造函数

      const property = modulePrototype[propKey];
      if (property && typeof property === "function") {
        const actionName = property.action;
        const fullPath =
          `/${this._apiPrefix}/${controllerPath}/${actionName}`.replace(
            /\/{2,}/g,
            "/"
          );

        const mainFunc = async (ctx: Context, next: Next) => {
          const paramList = property.paramList;
          const args: any = [];
          if (paramList) {
            const paramKeys = Object.getOwnPropertyNames(paramList);
            paramKeys.forEach((paramName) => {
              const index = paramList[paramName];
              if (paramName === REQUEST_BODY) {
                args[index] = (ctx.request as any).body;
              } else {
                if (paramName === REQUEST_QUERY) {
                  args[index] = { ...ctx.params, ...ctx.query };
                } else {
                  args[index] = { ...ctx.params, ...ctx.query }[paramName];
                }
              }
            });
          } else {
            args[0] = {
              body: (ctx.request as any).body,
              params: ctx.params,
              query: ctx.query,
              files: (ctx.request as any).files,
            };
          }
          const controller: any = container.resolve<IController>(module as any);
          controller.SetContext(ctx); // 将Ctx丢进去
          const result = property.apply(controller, args); // 执行函数

          if (result instanceof Promise) {
            ctx.response.body = await result; // 处理异步
          } else {
            ctx.response.body = result; // 处理同步
          }
        };

        actions.push({
          fullPath,
          httpMethod: property.httpMethod,
          func: mainFunc,
        } as ActionDescriptor);
      }
    });
    return actions;
  }

  public CreateControllerByContainer(app: Koa): void {
    const moduleContainer = container.resolve(ModuleContainer);
    var controllers = moduleContainer.GetAllController();

    const router = new Router(); // 定义路由容器
    controllers.forEach((element) => {
      const actions = this.CreateController(element);
      if (actions && actions.length) {
        actions.forEach((action) => {
          console.log(action.fullPath);
          router.register(action.fullPath, [action.httpMethod], action.func);
        });
      }
    });

    app.use(router.routes());
    app.use(router.allowedMethods());
  }

  public CreateControllerByModule(app: Koa, modulePath: string): void {
    let files: any[] = [];
    try {
      files = fs.readdirSync(modulePath);
    } catch (error) {
      console.error("Module路径配置错误,请检查配置后重试.");
      files = [];
    }

    files.forEach((filePath) => {
      const fullFilePath = path.join(modulePath, filePath);
      if (fs.statSync(fullFilePath).isDirectory()) {
        this.CreateControllerByModule(app, fullFilePath);
      } else {
        const extName = path.extname(fullFilePath);
        if (extName === ".ts" || extName === ".js") {
          const modules: any[] = require(fullFilePath);
          if (!modules) return;

          for (const key in modules) {
            if (Object.prototype.hasOwnProperty.call(modules, key)) {
              const module = modules[key];
              if (module.prototype) {
                this.CreateController(module);
              }
            }
          }
        }
      }
    });
  }
}
