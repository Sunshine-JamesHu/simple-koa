import { IPublisher } from '../Publisher';
import { Queue } from '../Queue';
import { IQueueManager, QueueManager } from '../QueueManager';
import { ISubscriber } from '../Subscriber';
import { MqttPublisher, MqttSubscriber } from './Mqtt';
import { MqttOptions } from './MqttOptions';

export interface IMqttQueueManager extends IQueueManager {}

@Queue('mqtt')
export class MqttQueueManager extends QueueManager implements IMqttQueueManager {
  protected readonly _publisher: IPublisher;
  protected readonly _subscriber: ISubscriber;

  constructor(options: MqttOptions) {
    super(options);
    this._publisher = new MqttPublisher(options);
    this._subscriber = new MqttSubscriber(options);
  }

  protected GetPublisher(): IPublisher {
    return this._publisher;
  }

  protected GetSubscriber(): ISubscriber {
    return this._subscriber;
  }
}
