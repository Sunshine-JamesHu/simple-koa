import { Producer, KafkaClient, ProduceRequest, KafkaClientOptions, ConsumerOptions, Consumer, TopicsNotExistError, Message } from 'kafka-node';
import { IPublisher, Publisher } from '../Publisher';
import { Queue } from '../Queue';
import { IQueueManager, QueueManager } from '../QueueManager';
import { ISubscriber, Subscriber } from '../Subscriber';
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

export class KafkaPublisher extends Publisher {
  private readonly _producer: Producer;
  private readonly _options: KafkaOptions;
  constructor(options: KafkaOptions) {
    super();
    this._options = options;
    this._producer = this.GetProducer();
  }

  public PublishAsync(topic: string, data: any): Promise<void> {
    if (!data) return data;

    if (Array.isArray(data) || typeof data === 'object') {
      data = JSON.stringify(data);
    }
    const payload: ProduceRequest = { topic: topic, messages: data };
    return new Promise((resovle, reject) => {
      this._producer.send([payload], (err, data) => {
        if (err) {
          reject(err);
        }
        resovle();
      });
    });
  }

  private GetProducer() {
    const producer = new Producer(this.GetClient());
    return producer;
  }

  private GetClient(): KafkaClient {
    return GetClient(this._options);
  }
}

export class KafkaSubscriber extends Subscriber {
  private readonly _options: KafkaOptions;
  constructor(options: KafkaOptions) {
    super();
    this._options = options;
  }

  Start(): void {
    super.Start();
    const handlerMap = this._handlerMap;
    const client = this.GetClient();
    if (!Object.keys(handlerMap).length) return;

    const topics = Object.keys(handlerMap).map((p) => {
      return { topic: p } as any;
    });
    const consumer = new Consumer(client, topics, { autoCommit: true, groupId: this._options.groupId });
    consumer.on('message', (message) => this.OnMessage(message));
    consumer.on('error', (error) => this.OnError(error));
  }

  private GetClient(): KafkaClient {
    return GetClient(this._options);
  }

  protected OnError(err: Error) {
    this.Logger.LogError('On sub error', err);
  }

  protected OnMessage(message: Message) {
    const eventKey = this._handlerMap[message.topic];
    this.EmitEvent(eventKey, {
      ext: {
        topic: message.topic,
      },
      data: message.value,
    });
  }
}

function GetClient(options: KafkaOptions) {
  return new KafkaClient({ kafkaHost: options.servers });
}
