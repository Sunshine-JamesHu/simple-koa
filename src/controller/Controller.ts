import { Context } from "koa";

export interface IController {}

export abstract class Controller implements IController {
  protected _context: Context | undefined;

  constructor() {}

  private SetContext(ctx: Context): void {
    this._context = ctx;
  }

  protected Context(): Context {
    return this._context as Context;
  }

  private get IsController() {
    return true;
  }
}
