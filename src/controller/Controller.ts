import { Context } from 'koa';
import { Container } from '../di/Dependency';
import { ILogger, LOGGER_INJECT_TOKEN as Logger_INJECT_TOKEN } from '../logger/Logger';

export const CONTROLLER_METADATA = 'Metadata:Controller';

export interface IController {}

@Reflect.metadata(CONTROLLER_METADATA, true)
export abstract class Controller implements IController {
  private _context: Context | undefined;
  private readonly _logger: ILogger;

  constructor() {
    this._logger = Container.resolve<ILogger>(Logger_INJECT_TOKEN);
  }

  // 系统会调用该函数
  private SetContext(ctx: Context): void {
    this._context = ctx;
  }

  protected get Context(): Context {
    return this._context as Context;
  }

  protected get Logger() {
    return this._logger;
  }
}

export function IsController(target: Function) {
  return Reflect.getMetadata(CONTROLLER_METADATA, target);
}

export function GetControllerName(controller: Function): string {
  return controller.name.replace('Controller', '');
}
