import Koa from 'koa';
import { container } from 'tsyringe';
import { ILogger, INJECT_TOKEN as Logger_INJECT_TOKEN } from '../logger/Logger';

export function InitGlobalError(app: Koa) {
  const logger = container.resolve<ILogger>(Logger_INJECT_TOKEN);
  app.on('error', (err: Error) => {
    logger.LogError('error', err);
  });
}
