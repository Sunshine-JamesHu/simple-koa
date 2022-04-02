import AsyncLock from 'async-lock';
import mqtt, { IConnackPacket, IDisconnectPacket, IPublishPacket, Packet } from 'mqtt';
const { v4: uuidv4 } = require('uuid');
import { Publisher } from '../Publisher';
import { Subscriber } from '../Subscriber';
import { MqttOptions } from './MqttOptions';

export class MqttPublisher extends Publisher {
  private readonly _lock: AsyncLock;
  private readonly _options: MqttOptions;

  private producer: mqtt.MqttClient | undefined;
  private producerTimer: NodeJS.Timeout | undefined;

  constructor(options: MqttOptions) {
    super();
    this._options = options;
    this._lock = new AsyncLock({ timeout: 3000, maxPending: 2000 });
  }

  async PublishAsync(topic: string, data: any): Promise<void> {
    if (!topic) throw new Error('topic is not null or empry');
    if (!data) return;

    const isBuffer = data instanceof Buffer;
    if (!isBuffer) {
      if (Array.isArray(data) || typeof data === 'object') {
        data = JSON.stringify(data);
      }
    }

    const producer = await this.GetProducer();
    return new Promise((resolve, reject) => {
      producer.publish(topic, data, (error?: Error, packet?: Packet) => {
        if (error) {
          reject(error);
        }
        resolve();
      });
    });
  }

  private async GetProducer(): Promise<mqtt.Client> {
    this.StartOrReBuildTimer();
    if (this.producer) return this.producer;
    return await new Promise((resolve, reject) => {
      this._lock.acquire<mqtt.Client>(
        'get_mqtt_producer',
        async (done) => {
          if (this.producer) {
            done(undefined, this.producer);
          } else {
            try {
              this.Logger.LogDebug('开始连接Mqtt');
              const producer = GetClient({ ...this._options, clientId: GetClientId('pub', this._options.clientId) });

              producer.on('connect', (packet: IConnackPacket) => {
                this.Logger.LogDebug('Mqtt连接成功');
                if (producer.connected) {
                  done(undefined, producer);
                } else {
                  done(new Error('Mqtt连接失败'));
                }
              });

              producer.on('error', (error) => {
                done(error);
              });
            } catch (error: any) {
              done(error);
            }
          }
        },
        (err, ret) => {
          if (err) {
            this.Logger.LogError('Get mqtt producer error', err);
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
    this.producerTimer = setTimeout(() => {
      if (this.producer) {
        this.Logger.LogDebug('Mqtt客户端30S没有操作,开始断开客户端');
        this.producer.end(undefined, undefined, () => {
          this.Logger.LogDebug('Mqtt客户端已经成功断开');
          this.producer = undefined;
        });
      }
    }, disconnTime);
  }
}

export class MqttSubscriber extends Subscriber {
  private _client: mqtt.MqttClient | undefined;

  private readonly _options: MqttOptions;
  private readonly _topicMapEventKey: { [key: string]: string };

  constructor(options: MqttOptions) {
    super();
    this._options = options;
    this._topicMapEventKey = {};
  }

  async StartAsync(): Promise<void> {
    const subTopics = Object.keys(this._handlerMap);
    if (!subTopics.length) return;

    this.Logger.LogDebug(JSON.stringify(this._options));

    this._client = GetClient({ ...this._options, clientId: GetClientId('sub', this._options.clientId) });
    this.Init(this._client);
  }

  async StopAsync(): Promise<void> {
    await Promise.resolve();
  }

  Subscription(eventKey: string, topic: string): void {
    this._handlerMap[eventKey] = topic.split('/');
  }

  protected Init(client: mqtt.Client) {
    this.Logger.LogInfo('MQTT连接成功');
    client.on('connect', (packet: IConnackPacket) => {
      this.Connect(packet);
    });
    client.on('disconnect', (packet: IDisconnectPacket) => {
      this.Disconnect(packet);
    });
    client.on('reconnect', () => {
      this.Reconnect();
    });
    client.on('message', (topic: string, payload: Buffer, packet: IPublishPacket) => {
      this.OnMessage(topic, payload, packet);
    });
  }

  protected Connect(packet: IConnackPacket) {
    if (this._client && this._client.connected) {
      this.Logger.LogInfo('MQTT连接成功');
      for (const key in this._handlerMap) {
        if (Object.prototype.hasOwnProperty.call(this._handlerMap, key)) {
          const element = this._handlerMap[key];

          const topic = element.join('/');
          this.Logger.LogInfo(`开始订阅主题[${topic}]...`);
          this._client.subscribe(topic, (err) => {
            if (err) {
              this.Logger.LogError(`订阅主题[${topic}]出现错误,${err.message}`);
            }
            this.Logger.LogInfo(`订阅主题[${topic}]成功`);
          });
        }
      }
    }
  }

  protected Disconnect(packet: IDisconnectPacket) {
    this.Logger.LogInfo('MQTT断开连接');
  }

  protected Reconnect() {
    this.Logger.LogInfo('MQTT断开连接,开始重连');
  }

  protected OnMessage(topic: string, payload: Buffer, packet: IPublishPacket) {
    const eventKey = this.GetTopicEventKey(topic);
    if (eventKey) {
      this.EmitEvent(eventKey, {
        ext: {
          topic: topic,
        },
        data: payload,
      });
    }
  }

  protected GetTopicEventKey(topic: string): string | undefined {
    const eventKey = this._topicMapEventKey[topic];
    if (eventKey) return eventKey;

    const curPaths = topic.split('/');
    for (const key in this._handlerMap) {
      if (Object.prototype.hasOwnProperty.call(this._handlerMap, key)) {
        const paths = this._handlerMap[key];

        let isThis = true;
        for (let index = 0; index < curPaths.length; index++) {
          const curPath = curPaths[index];
          const path = paths[index];

          if (path === '#') {
            // # 通配符直接返回
            break;
          } else if (path === '+') {
            // + 单层匹配符需要检验长度
            isThis = curPaths.length == paths.length;
            break;
          } else if (curPath !== path) {
            isThis = false;
            break;
          }
        }

        if (isThis) {
          this._topicMapEventKey[topic] = key;
          return key;
        }
      }
    }
  }
}

function GetClientId(clientType: 'pub' | 'sub', clientId?: string) {
  if (!clientId) return uuidv4();
  return `${clientId}_${clientType}`;
}

function GetClient(options: MqttOptions): mqtt.Client {
  const client = mqtt.connect(options.address, {
    clientId: options.clientId,
    username: options.userName,
    password: options.password,
  });
  return client;
}
