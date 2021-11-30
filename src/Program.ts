import "reflect-metadata";
import Koa from "koa";
import { LoadAppConfig } from "./setting/SettingManager";
import { container } from "tsyringe";
import { koaSwagger } from "koa2-swagger-ui";
import {
  ModuleLoader,
  IModuleLoader,
  RegisterModuleByContainer,
} from "./di/ModuleLoader";
import {
  INJECT_TOKEN as ControllerBuilder_INJECT_TOKEN,
  IControllerBuilder,
} from "./controller/ControllerBuilder";

import {
  ISettingManager,
  INJECT_TOKEN as Setting_INJECT_TOKEN,
} from "./setting/SettingManager";
import {
  ISwaggerBuilder,
  INJECT_TOKEN as SwaggerBuilder_INJECT_TOKEN,
} from "./swagger/SwaggerBuilder";

export default class Program {
  private readonly _app: Koa;
  private readonly _rootPath: string;
  constructor(rootPath: string) {
    this._rootPath = rootPath;
    this._app = new Koa();
    this.Init();
  }

  protected GetApp(): Koa {
    return this._app;
  }

  private Init() {
    this.OnPreApplicationInitialization();
    this.OnApplicationInitialization();
    this.OnPostApplicationInitialization();
  }

  /**
   * 初始化之前
   */
  protected OnPreApplicationInitialization() {
    this.InitSettingManager(); // 初始化设置
    this.InitModules(); // 初始化所有模块
    this.RegisterModules(); // 将所有模块注册到容器中
  }

  /**
   * 初始化
   */
  protected OnApplicationInitialization() {
    this.CreateController();
    this.CreateSwaggerApi();
  }

  /**
   * 初始化之后
   */
  protected OnPostApplicationInitialization() {}

  /**
   * 当服务启动之后
   */
  protected OnServerStarted() {}

  /**
   * 创建控制器
   */
  protected CreateController() {
    const controllerBuilder = container.resolve<IControllerBuilder>(
      ControllerBuilder_INJECT_TOKEN
    );
    controllerBuilder.CreateControllerByContainer(this.GetApp());
  }

  /**
   * 创建SwaggerApi
   */
  protected CreateSwaggerApi() {
    const swaggerBuilder = container.resolve<ISwaggerBuilder>(
      SwaggerBuilder_INJECT_TOKEN
    );
    swaggerBuilder.CreateSwaggerApi(this.GetApp());
  }

  protected InitSettingManager() {
    LoadAppConfig();
  }

  private InitModules() {
    const moduleLoader = container.resolve<IModuleLoader>(ModuleLoader);
    this.LoadModules(moduleLoader);
  }

  protected LoadModules(moduleLoader: IModuleLoader) {
    moduleLoader.LoadModule(__dirname);
    moduleLoader.LoadModule(this._rootPath);
  }

  protected RegisterModules() {
    RegisterModuleByContainer();
  }

  public Start() {
    const app = this.GetApp();
    const port = this.GetPortSetting();
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      this.OnServerStarted();
    });
  }

  private GetPortSetting(): number {
    const setting = container.resolve<ISettingManager>(Setting_INJECT_TOKEN);
    const port = setting.GetConfig<number>("port");
    if (port && port > 0) return port;
    return 30000;
  }
}
