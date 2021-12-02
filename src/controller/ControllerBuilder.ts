import * as path from 'path';
import * as fs from 'fs';
import Router from 'koa-router';
import Koa from 'koa';
import { container } from 'tsyringe';
import { ModuleContainer } from '../di/ModuleContainer';
import { IController, IsController } from './Controller';
import { ISettingManager, INJECT_TOKEN as SETTING_INJECT_TOKEN } from '../setting/SettingManager';
import { Inject, Injectable, Singleton } from '../di/Dependency';
import { Context, Next } from 'koa';
import { GetActionParamsMetadata } from '../router/RequestData';
import { GetRouterPath } from '../router/Router';
import { GetActionInfo, GetHttpMethodStr } from '../router/Request';

export const INJECT_TOKEN = 'IControllerBuilder';

interface ActionDescriptor {
  fullPath: string;
  httpMethod: 'get' | 'post' | 'put' | 'delete' | 'options';
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
    this._apiPrefix = settingManager.GetConfig<string>('apiPrefix') || 'api';
  }

  public CreateController(module: Function): ActionDescriptor[] | undefined {
    const routerPath = GetRouterPath(module);
    if (!IsController(module) || !routerPath) {
      return;
    }
    const actions: ActionDescriptor[] = [];
    console.log('注册Controller', module.name, routerPath);
    const propKeys = Object.getOwnPropertyNames(module.prototype);
    propKeys.forEach((propKey) => {
      if (propKey === 'constructor') return; // 跳过构造函数

      const property = module.prototype[propKey];
      if (!property || typeof property !== 'function') return;

      const actionInfo = GetActionInfo(property);
      if (!actionInfo) return;

      const actionName = actionInfo.name;
      const fullPath = `/${this._apiPrefix}/${routerPath}/${actionName}`.replace(/\/{2,}/g, '/');

      const mainFunc = async (ctx: Context, next: Next) => {
        const actionParams = GetActionParamsMetadata(property);
        const args: any = [];
        if (actionParams && actionParams.length) {
          actionParams.forEach((element) => {
            let data: any = null;
            if (element.in === 'body') {
              data = (ctx.request as any).body;
            } else if (element.in === 'query') {
              const queryData = { ...ctx.params, ...ctx.query };
              data = queryData;
              if (element.key) {
                data = queryData[element.key];
              }
            }

            if (data != null) args[element.index] = data;
          });
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

      const action: ActionDescriptor = {
        fullPath,
        httpMethod: GetHttpMethodStr(actionInfo.httpMethod) as any,
        func: mainFunc,
      };

      actions.push(action);
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
      console.error('Module路径配置错误,请检查配置后重试.');
      files = [];
    }

    files.forEach((filePath) => {
      const fullFilePath = path.join(modulePath, filePath);
      if (fs.statSync(fullFilePath).isDirectory()) {
        this.CreateControllerByModule(app, fullFilePath);
      } else {
        const extName = path.extname(fullFilePath);
        if (extName === '.ts' || extName === '.js') {
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
