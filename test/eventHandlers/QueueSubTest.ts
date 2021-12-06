import { Singleton } from '../../src/di/Dependency';
import { EventHandler, EventKey, IEventData, INJECT_TOKEN as EventHandler_INJECT_TOKEN } from '../../src/event/EventHandler';

export const EVENT_KEY: string = 'simple_koa_test';

@EventKey(EVENT_KEY)
@Singleton(EventHandler_INJECT_TOKEN)
export class QueueSubTest extends EventHandler {
  HandleEvent(data: IEventData<any>): void {
    console.log(data);
  }
}
