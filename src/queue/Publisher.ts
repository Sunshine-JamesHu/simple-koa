import { container } from 'tsyringe';
import { ILogger, LOGGER_INJECT_TOKEN as Logger_INJECT_TOKEN } from '../logger/Logger';

export interface IPublisher {
  /**
   * 发布
   * @param topic 主题
   * @param data 数据
   */
  PublishAsync(topic: string, data: any): Promise<void>;
}

export abstract class Publisher implements IPublisher {
  private readonly _logger: ILogger;
  constructor() {
    this._logger = container.resolve<ILogger>(Logger_INJECT_TOKEN);
  }
  abstract PublishAsync(topic: string, data: any): Promise<void>;

  protected get Logger() {
    return this._logger;
  }
}
