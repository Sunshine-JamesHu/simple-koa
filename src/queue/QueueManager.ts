import { container } from 'tsyringe';
import { ISettingManager, SETTING_INJECT_TOKEN as Setting_INJECT_TOKEN } from '../setting/SettingManager';
import { ModuleContainer } from '../di/ModuleContainer';
import { GetQueueType } from './Queue';
import { QueueOptions, QueueSetting } from './QueueOptions';
import { IPublisher } from './Publisher';
import { ISubscriber } from './Subscriber';

export const INJECT_TOKEN = 'IQueueManager';
export const METADATA_TOKEN = 'Sys:QueueManager';

export interface IQueueManager extends IPublisher, ISubscriber {}

@Reflect.metadata(METADATA_TOKEN, true)
export abstract class QueueManager implements IQueueManager {
  private readonly _options: any;
  constructor(options: any) {
    this._options = options;
  }

  public async PublishAsync(topic: string, data: any): Promise<any> {
    const publisher = this.GetPublisher();
    await publisher.PublishAsync(topic, data);
  }

  public Subscription(topic: string, eventKey: string): void {
    const subscriber = this.GetSubscriber();
    subscriber.Subscription(topic, eventKey);
  }

  public async StartAsync(): Promise<void> {
    const subscriber = this.GetSubscriber();
    await subscriber.StartAsync();
  }

  public async StopAsync(): Promise<void> {
    const subscriber = this.GetSubscriber();
    await subscriber.StopAsync();
  }

  protected abstract GetPublisher(): IPublisher;

  protected abstract GetSubscriber(): ISubscriber;

  protected get Options(): any {
    return this._options;
  }
}

export function IsQueueManager(target: Function) {
  return Reflect.getMetadata(METADATA_TOKEN, target);
}

export function GetQueueToken(key: string) {
  if (key === 'default') return INJECT_TOKEN;
  return `${INJECT_TOKEN}_${key}`;
}

export function RegisterQueues() {
  const queueSettings = GetQueuesSettings();

  if (!queueSettings) return;
  const queueKeys = Object.getOwnPropertyNames(queueSettings);
  if (!queueKeys || !queueKeys.length) return;

  const moduleContainer = container.resolve(ModuleContainer);
  const queues = moduleContainer.GetAllModule().filter((p) => IsQueueManager(p));
  queueKeys.forEach((key) => {
    const queueSetting: QueueOptions = queueSettings[key];
    const queue = queues.find((p) => GetQueueType(p) === queueSetting.type);
    const queueToken = GetQueueToken(key);
    if (queue && !container.isRegistered(queueToken)) {
      const Queue: any = queue;
      const queueIns = new Queue(queueSettings[key].options);
      container.registerInstance<IQueueManager>(queueToken, queueIns);
    }
  });
}

export function StartQueues() {
  const queueSettings = GetQueuesSettings();
  if (!queueSettings) return;
  const queueKeys = Object.getOwnPropertyNames(queueSettings);
  if (!queueKeys || !queueKeys.length) return;

  queueKeys.forEach(async (key) => {
    const manager = container.resolve<IQueueManager>(GetQueueToken(key));
    await manager.StartAsync();
  });
}

export function StopQueues() {
  const queueSettings = GetQueuesSettings();
  if (!queueSettings) return;
  const queueKeys = Object.getOwnPropertyNames(queueSettings);
  if (!queueKeys || !queueKeys.length) return;

  queueKeys.forEach((key) => {
    const manager = container.resolve<IQueueManager>(GetQueueToken(key));
    manager.StopAsync();
  });
}

function GetQueuesSettings() {
  const setting = container.resolve<ISettingManager>(Setting_INJECT_TOKEN);
  const queueSettings = setting.GetConfig<QueueSetting>('queues');
  return queueSettings;
}
