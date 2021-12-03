import { container } from 'tsyringe';
import { IRunnable } from '../core/Runnable';
import { ILogger, INJECT_TOKEN as Logger_INJECT_TOKEN } from '../logger/Logger';

export interface ISubscriber extends IRunnable {
  /**
   * 订阅
   * @param topic 主题
   * @param eventKey 事件Key
   */
  Subscription(topic: string, eventKey: string): void;
}

export abstract class Subscriber implements ISubscriber {
  private readonly _logger: ILogger;
  protected readonly _handlerMap: { [key: string]: string };

  constructor() {
    this._handlerMap = {};
    this._logger = container.resolve<ILogger>(Logger_INJECT_TOKEN);
  }

  Subscription(topic: string, eventKey: string): void {
    this._handlerMap[topic] = eventKey;
  }

  Start(): void {
    if (!this._handlerMap || !Object.keys(this._handlerMap).length) return;
    console.log(Object.keys(this._handlerMap));
    this.Logger.LogInfo('启动订阅');
  }

  Stop(): void {
    // TODO:不实现, 因为无法捕获到进程结束事件
  }

  protected get Logger() {
    return this._logger;
  }
}
