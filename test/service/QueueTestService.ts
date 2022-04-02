import { Inject, Injectable, Singleton } from '../../src/di/Dependency';
import { GetQueueToken, IQueueManager } from '../../src/queue/QueueManager';
import { Service } from '../../src/service/Service';

export interface IQueueTestService {
  PublishAsync(data: any): Promise<void>;
}

@Injectable()
@Singleton('IQueueTestService')
export class QueueTestService extends Service implements IQueueTestService {
  constructor(@Inject(GetQueueToken('mqttTest')) private pubQueueManager: IQueueManager) {
    super();
  }

  async PublishAsync(data: any): Promise<void> {
    await this.pubQueueManager.PublishAsync('simple_koa_test', data);
    await this.pubQueueManager.PublishAsync('simple_koa_test', Buffer.from(JSON.stringify(data), 'utf-8'));
  }
}
