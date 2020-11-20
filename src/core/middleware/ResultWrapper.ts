import Middleware from "./Middleware";
import { Context } from "koa";

const _acceptEncodingReg = /gzip|deflate|br/i; // 压缩类型
const _responseTypeReg = /text|json/i; // 需要包装的返回值类型

class ResultWrapper extends Middleware {
    protected PreHandler(ctx: Context): any {
        const encoding = ctx.request.get("accept-encoding");
        if (encoding && _acceptEncodingReg.test(encoding)) {
            ctx.compress = true; // 压缩
        }
    }

    protected NextHandler(ctx: Context): any {
        const responseType = ctx.response.type;

        // 判断头是否需要包装返回值
        if (responseType && _responseTypeReg.test(responseType)) {
            this.WrapperHandler(ctx);
        }
    }

    protected WrapperHandler(ctx: Context) {
        ctx.body = {
            success: true,
            data: ctx.body
        };
    }
}
export default new ResultWrapper();