import { Context, Next } from "koa";

export default interface IMiddleware {
  Execute(ctx: Context, next: Next): Promise<void>;
}
