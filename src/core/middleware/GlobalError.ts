import Middleware from "./Middleware";
import { Context, Next } from "koa";
import { IHasErrorInfo, IHasErrorStatus } from "../error/Error";

class GlobalError extends Middleware {
    public async Execute(ctx: Context, next: Next) {
        try {
            await next();
        } catch (err) {
            this.Logger.Error(err.message, err);
            const info = {
                success: false,
                message: "服务器内部错误",
                description: err.message,
                error: {}
            };
            if ((<IHasErrorInfo>err).errorInfo)
                info.error = (<IHasErrorInfo>err).errorInfo;

            if ((<IHasErrorStatus>err).status)
                ctx.response.status = (<IHasErrorStatus>err).status;
            else
                ctx.response.status = 500;

            ctx.body = info;
        }
    }
}

export default new GlobalError();