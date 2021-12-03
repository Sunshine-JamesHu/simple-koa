import { QueueType } from './Queue';

export interface QueueOptions {
  type: QueueType;
  options: any;
}
export interface QueueSetting {
  [key: string]: QueueOptions;
}
