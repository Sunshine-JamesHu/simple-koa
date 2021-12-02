import { Context } from 'koa';
import { container } from 'tsyringe';
import { ILogger, INJECT_TOKEN as Logger_INJECT_TOKEN } from '../logger/Logger';

export const METADATA_TOKEN = 'Controller';

export interface IController {}

@Reflect.metadata(METADATA_TOKEN, true)
export abstract class Controller implements IController {
  private _context: Context | undefined;
  protected Logger: ILogger;

  constructor() {
    this.Logger = container.resolve<ILogger>(Logger_INJECT_TOKEN);
  }

  // 系统会调用该函数
  private SetContext(ctx: Context): void {
    this._context = ctx;
  }

  protected Context(): Context {
    return this._context as Context;
  }
}

export function IsController(target: Function) {
  return Reflect.getMetadata(METADATA_TOKEN, target);
}

export function GetControllerName(controller: Function): string {
  return controller.name.replace('Controller', '');
}
