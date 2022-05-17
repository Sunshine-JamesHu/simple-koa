import Koa, { Context, Next } from 'koa';
import { container } from 'tsyringe';
import { ILogger, LOGGER_INJECT_TOKEN as Logger_INJECT_TOKEN } from '../logger/Logger';
import { UserFriendlyError } from './UserFriendlyError';

export function InitGlobalError(app: Koa) {
  const logger = container.resolve<ILogger>(Logger_INJECT_TOKEN);

  // 处理常规错误
  app.on('error', (err: Error) => {
    logger.LogError('error', err);
  });

  // 处理用户自定义错误
  app.use(async (ctx: Context, next: Next) => {
    try {
      await next();
    } catch (error: any) {
      if (error instanceof UserFriendlyError) {
        ctx.status = error.status ?? 403;

        if (error.data) ctx.body = error.data;
      } else {
        ctx.throw(500, error.message);
      }
    }
  });
}
