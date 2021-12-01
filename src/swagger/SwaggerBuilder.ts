import Koa from "koa";
import Router from "koa-router";
import { koaSwagger } from "koa2-swagger-ui";
import { container } from "tsyringe";
import { IsController } from "../controller/Controller";
import { Inject, Injectable, Singleton } from "../di/Dependency";
import { ModuleContainer } from "../di/ModuleContainer";
import { REQUEST_BODY, REQUEST_QUERY } from "../router/RequestData";
import { GetRouterPath } from "../router/Router";
import {
  ISettingManager,
  INJECT_TOKEN as SETTING_INJECT_TOKEN,
} from "../setting/SettingManager";

export const INJECT_TOKEN = "ISwaggerBuilder";

interface SwaggerTag {
  name: string;
  description?: string;
}

interface SwaggerParameter {
  name: string;
  in: "query" | "body";
  required?: boolean;
  type: "array" | "string" | "number" | "object";
  collectionFormat?: "multi" | string;
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

  constructor(
    tag: string,
    parameters?: Array<SwaggerParameter>,
    responses?: { [key: number]: SwaggerResponse }
  ) {
    this.tags = [tag];
    this.produces = ["application/json"];

    if (parameters && parameters.length > 0) this.parameters = parameters;
    else this.parameters = [];

    if (responses) {
      this.responses = responses;
    } else {
      this.responses = {
        200: {
          description: "返回值",
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
    this._apiPrefix = settingManager.GetConfig<string>("apiPrefix") || "api";
  }

  public CreateSwaggerApi(app: Koa): void {
    const router = new Router();
    const swagger = this.GenSwaggerJson();
    router.register("/swagger.json", ["get"], (ctx) => {
      ctx.set("Content-Type", "application/json");
      ctx.body = swagger;
    });

    router.register(
      "/swagger",
      ["get"],
      koaSwagger({
        routePrefix: false,
        swaggerOptions: {
          url: "/swagger.json", // example path to json
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
      const routerPath = GetRouterPath(controller);
      if (!IsController(controller) || !routerPath) {
        return;
      }

      const tag = controller.name.replace("Controller", "");
      tags.push({
        name: tag,
        description: tag,
      });

      const propKeys = Object.getOwnPropertyNames(controller.prototype);
      propKeys.forEach((propKey) => {
        if (propKey === "constructor") return; // 跳过构造函数

        const property = controller.prototype[propKey];
        if (property && typeof property === "function") {
          const actionName = property.action;
          const fullPath =
            `/${this._apiPrefix}/${routerPath}/${actionName}`.replace(
              /\/{2,}/g,
              "/"
            );
          const parameters: Array<SwaggerParameter> = [];
          const paramList = property.paramList;
          if (paramList) {
            const paramKeys = Object.getOwnPropertyNames(paramList);
            paramKeys.forEach((paramKey) => {
              if (paramKey === REQUEST_BODY) {
                parameters.push({
                  name: "body",
                  in: "body",
                  type: "object",
                  collectionFormat: "multi",
                });
              } else if (paramKey === REQUEST_QUERY) {
                parameters.push({
                  name: "query",
                  in: "query",
                  type: "object",
                });
              } else {
                parameters.push({
                  name: paramKey,
                  in: "query",
                  type: "string",
                });
              }
            });
          }
          paths[fullPath] = {};
          paths[fullPath][property.httpMethod] = new SwaggerPath(
            tag,
            parameters
          );
        }
      });
    });

    return {
      swagger: "2.0",
      info: {
        description: "Swagger api for Simple-Koa",
        version: "1.0.0",
        title: "Simple-Koa Swagger",
      },
      schemes: ["http"],
      tags: tags,
      paths: paths,
    };
  }
}
