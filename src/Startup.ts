import * as Koa from 'koa';
import * as bodyParser from 'koa-bodyparser';
import * as cors from 'koa2-cors';
import * as koaStatic from 'koa-static';
import * as compress from 'koa-compress';

import { IMiddleware } from './core/middleware/Middleware';
import ModuleLoader from './core/ModuleLoader';
import GlobalError from './core/middleware/GlobalError';
import ResultWrapper from './core/middleware/ResultWrapper';
import LoggerMiddleware from './core/middleware/LoggerMiddleware';
import AxiosStartup from './core/http/axios/AxiosStartup';
import SettingManager, { LoadAppConfig, APP_CONFIG } from './core/setting/SettingManager';
import { Inject } from './core/di/Injector';

export default class Startup {
  private readonly _app: Koa;
  private readonly _controllerPath: string;
  private readonly _moduleLoader: ModuleLoader;

  @Inject()
  public readonly settingManager: SettingManager;

  constructor(controllerPath: string) {
    this._app = new Koa();
    this._controllerPath = controllerPath;
    this._moduleLoader = new ModuleLoader(this._app);
    // this.Init(middleware);
    this.InitConfig();
  }

  public getKoa() {
    return this._app;
  }

  private Init() {
    this.InitMiddleware();
    this.InitHttpClient();
    this.InitModule();
  }

  private InitConfig() {
    LoadAppConfig();
  }

  public InitMiddleware() {
    // 异常处理中间件
    this.UseMiddleware(GlobalError);

    // 跨域处理
    const corsConfig = this.settingManager.GetCors();
    if (corsConfig === true) {
      this._app.use(cors(corsConfig));
    }

    // 添加gzip/deflate压缩
    this._app.use(
      compress({
        filter: (content_type) => {
          // 压缩Filter
          return /html|text|javascript|css|json/i.test(content_type);
        },
        threshold: 64, // 超过64k就压缩
      }),
    );

    // 静态文件代理
    this._app.use(koaStatic('./public'));

    if (APP_CONFIG['useResultWrapper'] !== false) {
      // 返回值包装中间件
      this.UseMiddleware(ResultWrapper);
    }

    // body处理中间件
    this._app.use(bodyParser());

    // 日志处理中间件
    const reqLog = this.settingManager.GetRequestLog();
    if (reqLog) this.UseMiddleware(LoggerMiddleware);
  }

  private InitHttpClient() {
    const apiAddress = this.settingManager.GetApiAddress();
    AxiosStartup.UseAxios(apiAddress);
  }

  private InitModule() {
    this._moduleLoader.LoadModule(this._controllerPath);
  }

  public StartServer(port?: number) {
    this.Init();
    if (!port) port = this.settingManager.GetConfig('port');
    this._app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  }

  /**
   * 添加中间件
   * @param middleware 中间件
   */
  public UseMiddleware<TMiddleware extends IMiddleware>(middleware: TMiddleware) {
    this._app.use(async (cxt, next) => {
      await middleware.Execute(cxt, next);
    });
  }
}
