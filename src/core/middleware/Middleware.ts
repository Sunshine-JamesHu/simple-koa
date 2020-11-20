import { Context, Next } from "koa";
import { Logger } from "../logger/Logger";
import { Inject } from "../di/Injector";

export interface IMiddleware {
    Execute(ctx: Context, next: Next): Promise<void>;
}

export default abstract class Middleware implements IMiddleware {
    @Inject()
    protected readonly Logger: Logger;

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


