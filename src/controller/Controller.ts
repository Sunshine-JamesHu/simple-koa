import { Context } from "koa";

export const METADATA_TOKEN = "Controller";

export interface IController {}

@Reflect.metadata(METADATA_TOKEN, true)
export abstract class Controller implements IController {
  protected _context: Context | undefined;

  constructor() {}

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
