import { AllowMultiple, Container } from '../di/Dependency';
import { ModuleContainer } from '../di/ModuleContainer';
import { IEventBus, INJECT_TOKEN as EventBus_INJECT_TOKEN } from './EventBus';

const METADATA_TOKEN = 'Sys:EventKey';
export const INJECT_TOKEN = 'IEventHandler';

export interface IEventData<TData = any> {
  ext: any;
  data: TData;
}

export interface IEventHandler<TData = any> {
  HandleEvent(data: IEventData<TData>): void;
}

@AllowMultiple()
export abstract class EventHandler<TData = any> implements IEventHandler<TData> {
  abstract HandleEvent(data: IEventData<TData>): void;
}

export function GetEventHandlerToken(key: string) {
  return `${INJECT_TOKEN}_${key}`;
}

export function EventKey(key: string) {
  return (target: Function) => {
    Reflect.defineMetadata(METADATA_TOKEN, key, target);
  };
}

export function GetEventKey(target: Function): string {
  return Reflect.getMetadata(METADATA_TOKEN, target);
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
