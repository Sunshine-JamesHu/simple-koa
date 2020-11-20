import Middleware from "./Middleware";
import { Context, Next } from "koa";
import { RequestLogger } from "../logger/Logger";


class LoggerMiddleware extends Middleware {
    public async Execute(ctx: Context, next: Next) {
        await RequestLogger(ctx.req, ctx.res, next);
    }
}
export default new LoggerMiddleware();