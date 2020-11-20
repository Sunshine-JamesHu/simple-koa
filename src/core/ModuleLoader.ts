import * as path from 'path';
import * as fs from 'fs';
import * as Router from 'koa-router';
import * as Koa from 'koa';
// @ts-ignore
import * as koaConnect from 'koa2-connect';
import * as httpProxy from 'http-proxy-middleware';

import { Context, Next } from 'koa';
import { IMiddleware } from './middleware/Middleware';
import { REQUEST_BODY, REQUEST_CONTEXT, REQUEST_QUERY } from './decorator/RequestData';
import SettingManager from './setting/SettingManager';
import { Inject, CreateServiceAndInjectContext } from './di/Injector';

declare function require(moduleName: string): any;

export default class ModuleLoader {
  private readonly _app: Koa;
  constructor(app: Koa) {
    this._app = app;
  }

  @Inject()
  private readonly _settingManager: SettingManager;

  public LoadModule(filePath: string): void {
    let files: any[] = [];
    try {
      files = fs.readdirSync(filePath);
    } catch (error) {
      console.error('Controller文件夹配置错误,请检查配置后重试.');
      files = [];
    }

    files.forEach((file) => {
      const fullFilePath = path.join(filePath, file);
      if (fs.statSync(fullFilePath).isDirectory()) {
        this.LoadModule(fullFilePath);
      } else {
        const extname = path.extname(fullFilePath);
        if (extname === '.ts' || extname === '.js') {
          const routerModules = require(fullFilePath);
          if (!routerModules) return;
          for (const key in routerModules) {
            if (routerModules.hasOwnProperty(key)) {
              const Controller = routerModules[key];
              this.RegisterRouters(Controller);
            }
          }
        }
      }
    });
  }

  private RegisterRouters(Controller: any): void {
    const controllerProp = Controller.prototype; // new Controller();

    if (!controllerProp.isController) return; // 不是一个Controller直接返回
    const props = Object.getOwnPropertyNames(Controller.prototype);

    const prefix = controllerProp.path;
    const interceptors: IMiddleware[] = controllerProp.interceptors;
    const router = new Router(); // 定义路由容器
    const apiPrefix = this._settingManager.GetApiPrefix() || 'api';
    props.forEach((propKey) => {
      const property = controllerProp[propKey];
      if (property && property.subPath && typeof property === 'function') {
        const fullPath = `/${apiPrefix}/${prefix}${property.subPath}`.replace(/\/{2,}/g, '/');
        // 生成代理
        if (property.proxy) {
          let proxyOptions: any = {
            target: this._settingManager.GetApiAddress(),
            changeOrigin: true,
            pathRewrite: {
              [fullPath]: property.proxy,
            },
          };

          if (property.proxyOptions) {
            proxyOptions = {
              ...proxyOptions,
              ...property.proxyOptions,
            };
          }
          const proxy = httpProxy.createProxyMiddleware(fullPath, proxyOptions);
          this._app.use(koaConnect(proxy)); // 直接代理本次请求
        }
        // 生成路由
        else {
          const method: string = property.requestMethod;
          let allInterceptors: IMiddleware[] = [];

          // Controller拦截器
          if (interceptors) allInterceptors = allInterceptors.concat(interceptors);

          // Method拦截器
          if (property.interceptors) allInterceptors = allInterceptors.concat(property.interceptors);

          // console.log(`Add Request Url : ${fullPath}`);

          // 拿到中间件的执行函数
          const allMiddleware: Array<(ctx: Context, next: Next) => Promise<void>> = [];
          if (allInterceptors.length) {
            allInterceptors.forEach((element) => {
              allMiddleware.push(async (ctx: Context, next: Next) => {
                await element.Execute(ctx, next);
              });
            });
          }

          // 添加主执行函数
          allMiddleware.push(async (ctx: Context, next: Next) => {
            const paramList = property.paramList;
            const args: any = [];
            if (paramList) {
              const paramKeys = Object.getOwnPropertyNames(paramList);
              paramKeys.forEach((paramName) => {
                const index = paramList[paramName];
                // 给予Context
                if (paramName === REQUEST_CONTEXT) args[index] = ctx;
                // 给予请求上来的Body
                else if (paramName === REQUEST_BODY) args[index] = ctx.request.body;
                // JSON.parse(JSON.stringify());
                // 从Query获取参数
                else {
                  // 一次性取多个值
                  if (paramName === REQUEST_QUERY) args[index] = { ...ctx.params, ...ctx.query };
                  // 只取单个值
                  else args[index] = { ...ctx.params, ...ctx.query }[paramName];
                }
              });
            }
            const controller = CreateServiceAndInjectContext(Controller, ctx); // new Controller(...controllerArgs);
            // 绑定Class本身,而不是函数本身
            ctx.body = await property.apply(controller, args);
          });

          // 注册路由
          router.register(fullPath, [method], [...allMiddleware]);
        }
      }
    });

    // 路由挂载到App中
    this._app.use(router.routes());
    this._app.use(router.allowedMethods());
  }
}
