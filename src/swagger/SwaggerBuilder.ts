import Koa from 'koa';
import Router from 'koa-router';
import koaStatic from 'koa-static';
import { join } from 'path';
import { koaSwagger } from './koa2-swagger-ui/index';
import { container } from 'tsyringe';
import { GetControllerName, IsController } from '../controller/Controller';
import { Inject, Injectable, Singleton } from '../di/Dependency';
import { ModuleContainer } from '../di/ModuleContainer';
import { GetActionInfo, GetHttpMethodStr } from '../router/Request';
import { GetActionParamsMetadata } from '../router/RequestData';
import { GetRouterInfo, GetRouterPath } from '../router/Router';
import { ISettingManager, SETTING_INJECT_TOKEN as SETTING_INJECT_TOKEN } from '../setting/SettingManager';

export const INJECT_TOKEN = 'ISwaggerBuilder';

interface SwaggerTag {
  name: string;
  description?: string;
}

interface SwaggerParameter {
  name: string;
  in: 'query' | 'body';
  required?: boolean;
  type: 'array' | 'string' | 'number' | 'object';
  collectionFormat?: 'multi' | string;
}

interface SwaggerResponse {
  description: string;
  schema: any;
}

interface ISwaggerPath {
  tags: string[];
  summary?: string;
  description?: string;
  produces: string[];
  parameters: Array<SwaggerParameter>;
  responses: { [key: number]: SwaggerResponse };
}

class SwaggerPath implements ISwaggerPath {
  tags: string[];
  summary?: string | undefined;
  description?: string | undefined;
  produces: string[];
  parameters: SwaggerParameter[];
  responses: { [key: number]: SwaggerResponse };

  constructor(tag: string, parameters?: Array<SwaggerParameter>, responses?: { [key: number]: SwaggerResponse }) {
    this.tags = [tag];
    this.produces = ['application/json'];

    if (parameters && parameters.length > 0) this.parameters = parameters;
    else this.parameters = [];

    if (responses) {
      this.responses = responses;
    } else {
      this.responses = {
        200: {
          description: '返回值',
          schema: {},
        },
      };
    }
  }
}

export interface ISwaggerBuilder {
  CreateSwaggerApi(app: Koa): void;
  GenSwaggerJson(): void;
}

@Injectable()
@Singleton(INJECT_TOKEN)
export class SwaggerBuilder implements ISwaggerBuilder {
  private readonly _settingManager: ISettingManager;
  private readonly _apiPrefix: string;
  constructor(@Inject(SETTING_INJECT_TOKEN) settingManager: ISettingManager) {
    this._settingManager = settingManager;
    this._apiPrefix = settingManager.GetConfig<string>('apiPrefix') || 'api';
  }

  public CreateSwaggerApi(app: Koa): void {
    const router = new Router();
    const swagger = this.GenSwaggerJson();

    app.use(koaStatic(join(__dirname, 'koa2-swagger-ui')));

    router.register('/swagger.json', ['get'], (ctx) => {
      ctx.set('Content-Type', 'application/json');
      ctx.body = swagger;
    });

    router.register(
      '/swagger',
      ['get'],
      koaSwagger({
        routePrefix: false,
        swaggerOptions: {
          url: '/swagger.json',
        },
      })
    );

    app.use(router.routes());
    app.use(router.allowedMethods());
  }

  public GenSwaggerJson(): any {
    const moduleContainer = container.resolve(ModuleContainer);
    var controllers = moduleContainer.GetAllController();

    const tags: Array<SwaggerTag> = [];
    const paths: {
      [key: string]: { [key: string]: ISwaggerPath };
    } = {};

    controllers.forEach((controller) => {
      const routerInfo = GetRouterInfo(controller);
      const routerPath = routerInfo?.path;
      if (!IsController(controller) || !routerPath) {
        return;
      }

      const tag = GetControllerName(controller);
      tags.push({
        name: tag,
        description: routerInfo.desc,
      });

      const propKeys = Object.getOwnPropertyNames(controller.prototype);
      propKeys.forEach((propKey) => {
        if (propKey === 'constructor') return; // 跳过构造函数

        const property = controller.prototype[propKey];
        if (!property || typeof property !== 'function') return;

        const actionInfo = GetActionInfo(property);
        if (!actionInfo) return;

        const actionName = actionInfo.name;
        const fullPath = `/${this._apiPrefix}/${routerPath}/${actionName}`.replace(/\/{2,}/g, '/');
        const parameters: Array<SwaggerParameter> = [];
        const actionParams = GetActionParamsMetadata(property);
        if (actionParams) {
          actionParams.forEach((actionParam) => {
            if (actionParam.in === 'body') {
              parameters.push({
                name: 'data',
                in: 'body',
                type: 'object',
                collectionFormat: 'multi',
              });
            } else if (actionParam.in === 'query') {
              let key = 'query';
              if (actionParam.key) {
                key = actionParam.key;
              }
              parameters.push({
                in: 'query',
                name: key,
                type: actionParam.type.name.toLowerCase(),
              });
            }
          });
        }
        const swaggerPath = new SwaggerPath(tag, parameters);
        if (actionInfo.desc) {
          swaggerPath.summary = actionInfo.desc;
        }

        paths[fullPath] = { [GetHttpMethodStr(actionInfo.httpMethod)]: swaggerPath };
      });
    });

    return {
      swagger: '2.0',
      info: {
        description: 'Swagger api for Simple-Koa',
        version: '1.0.0',
        title: 'Simple-Koa Swagger',
      },
      schemes: ['http'],
      tags: tags,
      paths: paths,
    };
  }
}
