import { Kafka, Producer, logLevel as LogLevel } from 'kafkajs';
import AsyncLock from 'async-lock';
import { ILogger } from '../../logger/Logger';
import { Publisher } from '../Publisher';
import { Subscriber } from '../Subscriber';
import { KafkaOptions } from './KafkaOptions';

export class KafkaPublisher extends Publisher {
  private readonly _client: Kafka;
  private readonly _lock: AsyncLock;
  private producer: Producer | undefined;
  private producerTimer: NodeJS.Timeout | undefined;
  constructor(options: KafkaOptions) {
    super();
    this._client = GetClient(options, this.Logger);
    this._lock = new AsyncLock({ timeout: 3000, maxPending: 2000 });
  }

  public async PublishAsync(topic: string, data: any): Promise<void> {
    if (!topic) throw new Error('topic is not null or empry');
    if (!data) return;

    const isBuffer = data instanceof Buffer;
    if (!isBuffer) {
      if (Array.isArray(data) || typeof data === 'object') {
        data = JSON.stringify(data);
      }
    }
    const producer = await this.GetProducer();
    await producer.send({
      topic: topic,
      messages: [{ value: data }],
    });
  }

  private async GetProducer(): Promise<Producer> {
    this.StartOrReBuildTimer();
    if (this.producer) return this.producer;
    return await new Promise((resolve, reject) => {
      this._lock.acquire<Producer>(
        'get_kafka_producer',
        async (done) => {
          if (this.producer) {
            done(undefined, this.producer);
          } else {
            try {
              const producer = this._client.producer();
              this.Logger.LogDebug('开始连接Kafka');
              await producer.connect();
              this.Logger.LogDebug('Kafka连接成功');
              done(undefined, producer);
            } catch (error: any) {
              done(error);
            }
          }
        },
        (err, ret) => {
          if (err) {
            this.Logger.LogError('Get kafka producer error', err);
            reject(err);
          } else if (ret) {
            if (this.producer != ret) {
              this.producer = ret;
            }
            resolve(ret);
          } else {
            reject();
          }
        }
      );
    });
  }

  private StartOrReBuildTimer() {
    if (this.producerTimer) clearTimeout(this.producerTimer);
    const disconnTime = 1000 * 30;
    this.producerTimer = setTimeout(async () => {
      if (this.producer) {
        this.Logger.LogDebug('Kafka客户端30S没有操作,开始断开客户端');
        await this.producer.disconnect();
        this.Logger.LogDebug('Kafka客户端已经成功断开');
        this.producer = undefined;
      }
    }, disconnTime);
  }
}

export class KafkaSubscriber extends Subscriber {
  private readonly _client: Kafka;
  private readonly _options: KafkaOptions;
  constructor(options: KafkaOptions) {
    super();
    this._options = options;
    this._client = GetClient(options, this.Logger);
  }

  async StartAsync(): Promise<void> {
    const subTopics = Object.keys(this._handlerMap);
    if (!subTopics.length) return;
    const consumer = await this.GetConsumer();
    for (let index = 0; index < subTopics.length; index++) {
      const topic = subTopics[index];
      await consumer.subscribe({ topic: topic, fromBeginning: true });
    }
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        this.OnMessage({ topic: topic, value: message.value });
      },
    });
  }

  async StopAsync(): Promise<void> {
    await Promise.resolve();
  }

  async GetConsumer() {
    const consumer = this._client.consumer({ groupId: this._options.clientId });
    await consumer.connect();
    return consumer;
  }

  protected OnMessage(message: any) {
    const eventKey = this._handlerMap[message.topic];
    if (eventKey) {
      this.EmitEvent(eventKey, {
        ext: {
          topic: message.topic,
        },
        data: message.value,
      });
    }
  }
}

function GetClient(options: KafkaOptions, logger: ILogger): Kafka {
  if (!options.servers) {
    throw new Error('Kafka servers is not null or empty');
  }
  const brokers = options.servers.split(',');
  const kafka = new Kafka({
    clientId: options.clientId,
    brokers: brokers,
    logCreator: GetKafkaLogger(logger),
  });
  return kafka;
}

function GetKafkaLogger(logger: ILogger) {
  return (logLevel: LogLevel) => {
    let levelLogger: (msg: string, ...args: any[]) => void = (msg: string, ...args: any[]) => {
      logger.LogDebug(msg, args);
    };
    if (logLevel === LogLevel.INFO) {
      levelLogger = (msg: string, ...args: any[]) => {
        logger.LogInfo(msg, args);
      };
    } else if (logLevel === LogLevel.WARN) {
      levelLogger = (msg: string, ...args: any[]) => {
        logger.LogWarn(msg, args);
      };
    } else if (logLevel === LogLevel.ERROR) {
      levelLogger = (msg: string, ...args: any[]) => {
        logger.LogError(msg, args);
      };
    }

    return ({ namespace, level, label, log }: any) => {
      const { message, ...extra } = log;
      levelLogger(message, log);
    };
  };
}
