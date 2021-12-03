import { inject, injectable } from 'tsyringe';

export enum ServiceLifetime {
  Singleton = 0,
  Scoped = 1,
  Transient = 2,
}

const METADATA_TOKEN = 'Sys:InjectInfo';

export interface InjectInfo {
  token: string;
  lifetime: ServiceLifetime;
}

export function Transient(token?: string) {
  return (target: Function) => {
    DefineInjectInfo(target, ServiceLifetime.Transient, token);
  };
}

export function Singleton(token?: string) {
  return (target: Function) => {
    DefineInjectInfo(target, ServiceLifetime.Singleton, token);
  };
}

export function Scoped(token?: string) {
  return (target: Function) => {
    DefineInjectInfo(target, ServiceLifetime.Scoped, token);
  };
}

function DefineInjectInfo(target: Function, lifetime: ServiceLifetime, token?: string) {
  if (!token) token = target.name;
  const injectInfo: InjectInfo = {
    lifetime,
    token,
  };
  Reflect.defineMetadata(METADATA_TOKEN, injectInfo, target);
}

export function GetInjectInfo(target: Function): InjectInfo {
  return Reflect.getMetadata(METADATA_TOKEN, target);
}

export const Injectable = injectable;

export const Inject = inject;
