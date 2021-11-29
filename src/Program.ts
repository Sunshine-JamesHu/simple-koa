import "reflect-metadata";
import Koa from "koa";
import { LoadAppConfig } from "./setting/SettingManager";
import { container } from "tsyringe";
import {
  ModuleLoader,
  IModuleLoader,
  RegisterModuleByContainer,
} from "./di/ModuleLoader";
import {
  INJECT_TOKEN as CONTROLLERBUILDER_INJECT_TOKEN,
  IControllerBuilder,
} from "./controller/ControllerBuilder";

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
      CONTROLLERBUILDER_INJECT_TOKEN
    );
    controllerBuilder.CreateControllerByContainer(this.GetApp());
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
    const a = container.resolve("ISettingManager");
    console.log(a);
    const controllerBuilder = container.resolve<IControllerBuilder>(
      CONTROLLERBUILDER_INJECT_TOKEN
    );
  }

  public Start(port?: number) {
    const app = this.GetApp();
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      this.OnServerStarted();
    });
  }
}
