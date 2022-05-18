import { GetQueueToken, IQueueManager } from '../../src/queue/QueueManager';
import { Inject, Injectable, Singleton } from '../../src/di/Dependency';
import { EventHandler, EventKey, IEventData, EVENT_HANDLER_INJECT_TOKEN as EventHandler_INJECT_TOKEN } from '../../src/event/EventHandler';

export const EVENT_KEY: string = 'MqttSubTest';

@EventKey(EVENT_KEY)
@Singleton(EventHandler_INJECT_TOKEN)
@Injectable()
export class MqttSubTest extends EventHandler {
  private readonly _pubQueueManager: IQueueManager;
  constructor(@Inject(GetQueueToken('kafkaTest')) pubQueueManager: IQueueManager) {
    super();
    this._pubQueueManager = pubQueueManager;
  }

  async HandleEventAsync(data: IEventData<Buffer>): Promise<void> {
    const json = data.data.toString();
    console.log({
      topic: data.ext.topic,
      data: JSON.parse(json),
    });
    await this._pubQueueManager.PublishAsync('simple_koa_test', data.data);
  }
}
