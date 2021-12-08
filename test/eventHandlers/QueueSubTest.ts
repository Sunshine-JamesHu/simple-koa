import { GetQueueToken, IQueueManager } from '../../src/queue/QueueManager';
import { Inject, Injectable, Singleton } from '../../src/di/Dependency';
import { EventHandler, EventKey, IEventData, INJECT_TOKEN as EventHandler_INJECT_TOKEN } from '../../src/event/EventHandler';

export const EVENT_KEY: string = 'simple_koa_test';

@EventKey(EVENT_KEY)
@Singleton(EventHandler_INJECT_TOKEN)
@Injectable()
export class QueueSubTest extends EventHandler {
  private readonly _pubQueueManager: IQueueManager;
  constructor(@Inject(GetQueueToken('pub')) pubQueueManager: IQueueManager) {
    super();
    this._pubQueueManager = pubQueueManager;
  }

  HandleEvent(data: IEventData<Buffer>): void {
    const json = data.data.toString();
    console.log({
      topic: data.ext.topic,
      data: JSON.parse(json),
    });
    this._pubQueueManager.PublishAsync('simple_koa_test2', data.data);
  }
}
