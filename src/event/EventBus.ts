import EventEmitter from 'events';
import { Singleton } from '../..';
import { Container, Inject, Injectable } from '../di/Dependency';
import { ILogger, INJECT_TOKEN as Logger_INJECT_TOKEN } from '../logger/Logger';
import { EventHandler, IEventHandler } from './EventHandler';

export const INJECT_TOKEN = 'IEventBus';

export interface IEventBus {
  Publish(key: string, data: any): void;
  Subscribe(key: string, handlerToken: string | Function): void;
}

@Singleton(INJECT_TOKEN)
@Injectable()
export class EventBus extends EventEmitter implements IEventBus {
  protected readonly Logger: ILogger;
  constructor(@Inject(Logger_INJECT_TOKEN) logger: ILogger) {
    super();
    this.Logger = logger;
  }

  Publish(key: string, data: any): void {
    this.emit(key, data);
  }

  Subscribe(key: string, handlerToken: string | Function): void {
    this.on(key, (data) => {
      try {
        const hanlder = Container.resolve<IEventHandler>(handlerToken as any);
        if (hanlder instanceof EventHandler) hanlder.HandleEvent(data);
        else throw new Error('handler must be EventHandler');
      } catch (error: any) {
        this.Logger.LogError('执行事件出错', error);
      }
    });
  }
}
