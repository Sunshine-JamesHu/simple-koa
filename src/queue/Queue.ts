export const METADATA_TOKEN = 'Sys:Queue';

export declare type QueueType = 'kafka' | 'mqtt' | 'rabbitmq' | string;

export function Queue(type: QueueType) {
  return (target: Function) => {
    Reflect.defineMetadata(METADATA_TOKEN, type, target);
  };
}

export function GetQueueType(target: Function): QueueType {
  return Reflect.getMetadata(METADATA_TOKEN, target);
}
