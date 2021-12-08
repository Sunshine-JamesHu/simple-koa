import 'reflect-metadata';
import Koa from 'koa';
import koaBody from 'koa-body';
import koaCompress from 'koa-compress';
import koaStatic from 'koa-static';
import { InitSettingManager } from './setting/SettingManager';
import { ModuleLoader, IModuleLoader } from './di/ModuleLoader';
import { INJECT_TOKEN as ControllerBuilder_INJECT_TOKEN, IControllerBuilder } from './controller/ControllerBuilder';

import { ISettingManager, INJECT_TOKEN as Setting_INJECT_TOKEN } from './setting/SettingManager';
import { ISwaggerBuilder, INJECT_TOKEN as SwaggerBuilder_INJECT_TOKEN } from './swagger/SwaggerBuilder';
import { ILogger, InitLogger, INJECT_TOKEN as Logger_INJECT_TOKEN } from './logger/Logger';
import { InitGlobalError } from './error/Error';
import { CorsOptions, AddCors } from './cors/Cors';
import { RegisterQueues, StartQueues, StopQueues } from './queue/QueueManager';
import { Container } from './di/Dependency';
import { InitEventHandlers } from './event/EventHandler';

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

  //#region 程序预处理

  /**
   * 初始化之前
   */
  protected OnPreApplicationInitialization() {
    this.InitSettingManager(); // 初始化设置
    this.InitLogger(); // 初始化日志
    this.InitModules(); // 初始化所有模块
    this.RegisterModules(); // 将所有模块注册到容器中

    this.InitGlobalError(); // 全局错误捕获
    this.RegisterQueues(); // 注册管道
  }

  protected InitLogger() {
    InitLogger();
  }

  protected InitSettingManager() {
    InitSettingManager();
  }

  private InitModules() {
    const moduleLoader = Container.resolve<IModuleLoader>(ModuleLoader);
    this.LoadModules(moduleLoader);
  }

  protected LoadModules(moduleLoader: IModuleLoader) {
    moduleLoader.LoadModule(__dirname);
    moduleLoader.LoadModule(this._rootPath);
  }

  protected RegisterModules() {
    const moduleLoader = Container.resolve<IModuleLoader>(ModuleLoader);
    moduleLoader.RegisterModuleByContainer();
  }

  protected InitGlobalError() {
    InitGlobalError(this.GetApp());
  }

  protected RegisterQueues() {
    RegisterQueues();
  }

  //#endregion

  //#region 程序初始化

  /**
   * 初始化
   */
  protected OnApplicationInitialization() {
    this.InitSysMiddlewares();
    this.CreateController();
    this.CreateSwaggerApi();
    this.InitEventHandlers();
  }

  protected InitSysMiddlewares() {
    this.InitCors();
    this.InitCompress();
    this.InitStaticResource();

    this.InitBody();
  }

  /**
   * 初始化跨域
   */
  protected InitCors() {
    const setting = this.GetSettingManager();
    const enableCors = setting.GetConfig<boolean>('cors:enable');
    if (enableCors) {
      const options = setting.GetConfig<CorsOptions>('cors:options');
      AddCors(this.GetApp(), options);
    }
  }

  /**
   * 初始化压缩
   */
  protected InitCompress() {
    const app = this.GetApp();
    app.use(
      koaCompress({
        filter: (content_type) => {
          // 压缩Filter
          return /html|text|javascript|css|json/i.test(content_type);
        },
        threshold: 128 * 1024, // 超过128k就压缩
      })
    );
  }

  /**
   * 初始化静态资源
   */
  protected InitStaticResource() {
    const app = this.GetApp();
    app.use(koaStatic(`${this._rootPath}/public`));
  }

  /**
   * 初始化Body参数
   */
  protected InitBody() {
    const app = this.GetApp();
    const setting = this.GetSettingManager();
    let maxFileSize = setting.GetConfig<number | undefined>('maxFileSize');
    if (!maxFileSize) maxFileSize = 200 * 1024 * 1024;

    app.use(
      koaBody({
        parsedMethods: ['POST', 'PUT', 'PATCH', 'DELETE', 'GET', 'HEAD'],
        multipart: true,
        formidable: {
          maxFileSize: maxFileSize,
        },
      })
    );
  }

  /**
   * 创建控制器
   */
  protected CreateController() {
    const controllerBuilder = Container.resolve<IControllerBuilder>(ControllerBuilder_INJECT_TOKEN);
    controllerBuilder.CreateControllerByContainer(this.GetApp());
  }

  /**
   * 创建SwaggerApi
   */
  protected CreateSwaggerApi() {
    const swaggerBuilder = Container.resolve<ISwaggerBuilder>(SwaggerBuilder_INJECT_TOKEN);
    swaggerBuilder.CreateSwaggerApi(this.GetApp());
  }

  /**
   * 初始化事件处理者
   */
  protected InitEventHandlers() {
    InitEventHandlers();
  }

  //#endregion

  //#region 程序初始化之后

  /**
   * 初始化之后
   */
  protected OnPostApplicationInitialization() {
    this.StartQueues();
  }

  protected StartQueues() {
    StartQueues();
  }

  //#endregion

  //#region 程序启动后

  /**
   * 当服务启动之后
   */
  protected OnServerStarted() {}

  //#endregion

  //#region  程序退出

  protected OnApplicationShutdown() {
    this.StopQueues();
  }

  protected StopQueues() {
    StopQueues();
  }

  //#endregion

  /**
   *
   */
  public Start() {
    const app = this.GetApp();
    const port = this.GetPortSetting();
    app.listen(port, () => {
      const Logger = Container.resolve<ILogger>(Logger_INJECT_TOKEN);
      Logger.LogInfo(`Server running on port ${port}`);
      this.OnServerStarted();
    });
    process.on('SIGINT', () => {
      this.OnApplicationShutdown();
      process.exit(0);
    });
  }

  private GetSettingManager() {
    return Container.resolve<ISettingManager>(Setting_INJECT_TOKEN);
  }

  private GetPortSetting(): number {
    const setting = this.GetSettingManager();
    const port = setting.GetConfig<number>('port');
    if (port && port > 0) return port;
    return 30000;
  }
}
