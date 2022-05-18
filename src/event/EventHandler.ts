import { AllowMultiple, Container } from '../di/Dependency';
import { ModuleContainer } from '../di/ModuleContainer';
import { IEventBus, EVENT_BUS_INJECT_TOKEN as EventBus_INJECT_TOKEN } from './EventBus';

const EVENT_KEY_METADATA = 'Metadata:EventKey';
export const EVENT_HANDLER_INJECT_TOKEN = 'Sys:IEventHandler';

export interface IEventData<TData = any> {
  ext: any;
  data: TData;
}

export interface IEventHandler<TData = any> {
  HandleEventAsync(data: IEventData<TData>): Promise<void>;
}

@AllowMultiple()
export abstract class EventHandler<TData = any> implements IEventHandler<TData> {
  abstract HandleEventAsync(data: IEventData<TData>): Promise<void>;
}

export function GetEventHandlerToken(key: string) {
  return `${EVENT_HANDLER_INJECT_TOKEN}_${key}`;
}

export function EventKey(key: string) {
  return (target: Function) => {
    Reflect.defineMetadata(EVENT_KEY_METADATA, key, target);
  };
}

export function GetEventKey(target: Function): string {
  return Reflect.getMetadata(EVENT_KEY_METADATA, target);
}

export function InitEventHandlers() {
  const moduleContainer = Container.resolve<ModuleContainer>(ModuleContainer);
  const eventBus = Container.resolve<IEventBus>(EventBus_INJECT_TOKEN);
  const modules = moduleContainer.GetNeedRegisterModule();
  modules.forEach((handler) => {
    const eventKey = GetEventKey(handler);
    if (eventKey) {
      eventBus.Subscribe(eventKey, handler);
    }
  });
}
