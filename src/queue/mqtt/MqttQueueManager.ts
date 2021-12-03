import { IPublisher, Publisher } from '../Publisher';
import { Queue } from '../Queue';
import { IQueueManager, QueueManager } from '../QueueManager';
import { ISubscriber, Subscriber } from '../Subscriber';
import { MqttOptions } from './MqttOptions';

export interface IMqttQueueManager extends IQueueManager {}

@Queue('mqtt')
export class MqttQueueManager extends QueueManager implements IMqttQueueManager {
  protected readonly _publisher: IPublisher;
  protected readonly _subscriber: ISubscriber;
  constructor(options: MqttOptions) {
    super(options);

    this._publisher = new MqttPublisher();
    this._subscriber = new MqttSubscriber();
  }

  protected GetPublisher(): IPublisher {
    return this._publisher;
  }

  protected GetSubscriber(): ISubscriber {
    return this._subscriber;
  }
}

export class MqttPublisher extends Publisher {
  Publish(topic: string, data: any): void {
    throw new Error('Method not implemented.');
  }

  PublishAsync(topic: string, data: any): Promise<void> {
    throw new Error('Method not implemented.');
  }
}

export class MqttSubscriber extends Subscriber {
  Start(): void {
    super.Start();
  }
}
