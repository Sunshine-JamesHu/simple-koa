import { IRunnable } from '../core/Runnable';
import { Container } from '../di/Dependency';
import { IEventBus, INJECT_TOKEN as EventBus_INJECT_TOKEN } from '../event/EventBus';
import { IEventData } from '../event/EventHandler';
import { ILogger, LOGGER_INJECT_TOKEN as Logger_INJECT_TOKEN } from '../logger/Logger';

export interface ISubscriber extends IRunnable {
  /**
   * 订阅
   * @param topic 主题
   * @param eventKey 事件Key
   */
  Subscription(eventKey: string, topic: string): void;
}

export abstract class Subscriber implements ISubscriber {
  private readonly _logger: ILogger;
  private readonly _eventBus: IEventBus;
  protected readonly _handlerMap: { [key: string]: any };

  constructor() {
    this._handlerMap = {};
    this._logger = Container.resolve<ILogger>(Logger_INJECT_TOKEN);
    this._eventBus = Container.resolve<IEventBus>(EventBus_INJECT_TOKEN);
  }

  Subscription(eventKey: string, topic: string): void {
    this._handlerMap[topic] = eventKey;
  }

  StartAsync(): Promise<void> {
    return Promise.resolve();
  }

  StopAsync(): Promise<void> {
    return Promise.resolve();
  }

  protected EmitEvent(eventKey: string, data: IEventData) {
    this._eventBus.Publish(eventKey, data);
  }

  protected get Logger() {
    return this._logger;
  }
}
