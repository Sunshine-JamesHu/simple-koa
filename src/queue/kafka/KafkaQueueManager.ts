import { IPublisher } from '../Publisher';
import { Queue } from '../Queue';
import { IQueueManager, QueueManager } from '../QueueManager';
import { ISubscriber } from '../Subscriber';
import { KafkaPublisher, KafkaSubscriber } from './Kafka';
import { KafkaOptions } from './KafkaOptions';

export interface IkafkaQueueManager extends IQueueManager {}

@Queue('kafka')
export class KafkaQueueManager extends QueueManager implements IkafkaQueueManager {
  protected readonly _publisher: IPublisher;
  protected readonly _subscriber: ISubscriber;
  constructor(options: KafkaOptions) {
    super(options);
    this._publisher = new KafkaPublisher(options);
    this._subscriber = new KafkaSubscriber(options);
  }

  protected GetPublisher(): IPublisher {
    return this._publisher;
  }

  protected GetSubscriber(): ISubscriber {
    return this._subscriber;
  }
}
