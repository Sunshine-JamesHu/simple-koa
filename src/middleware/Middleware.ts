import { Context, Next } from "koa";
import IMiddleware from "./IMiddleware";

export default abstract class Middleware implements IMiddleware {
  /**
   * 执行中间件
   * @param ctx 上下文
   * @param next 下一个中间件
   */
  public async Execute(ctx: Context, next: Next) {
    this.PreHandler(ctx);

    await next();

    this.NextHandler(ctx);
  }

  /**
   * 中间件处理程序
   */
  protected PreHandler(ctx: Context): any {
    // 空实现
  }

  /**
   * next执行后
   * @param ctx 上下文
   */
  protected NextHandler(ctx: Context): any {
    // 空实现
  }
}
