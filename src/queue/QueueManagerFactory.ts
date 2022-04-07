import { Singleton, Container } from '../di/Dependency';
import { GetQueueToken, IQueueManager } from './QueueManager';

export const INJECT_TOKEN = 'IQueueManagerFactory';
export interface IQueueManagerFactory {
  GetQueueManager(key: string): IQueueManager;
}

@Singleton(INJECT_TOKEN)
export class QueueManagerFactory implements IQueueManagerFactory {
  GetQueueManager(key: string): IQueueManager {
    const queue = Container.resolve<IQueueManager>(GetQueueToken(key));
    if (!queue) throw new Error(`Can not fount queue,key is [${key}]`);
    return queue;
  }
}
