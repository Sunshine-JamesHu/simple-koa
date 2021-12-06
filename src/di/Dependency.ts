import { container, inject, injectable } from 'tsyringe';

export enum ServiceLifetime {
  Singleton = 0,
  Scoped = 1,
  Transient = 2,
}

const INJECT_INFO_METADATA_TOKEN = 'Sys:InjectInfo';
const MULTIPLE_INS_METADATA_TOKEN = 'Sys:MultipleInstance';
const REPLACE_SERVICE_METADATA_TOKEN = 'Sys:ReplaceService';

export interface InjectInfo {
  token: string;
  lifetime: ServiceLifetime;
  replace?: boolean;
}

//#region  注入相关
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

  let injectInfo = GetInjectInfo(target);
  if (!injectInfo) injectInfo = {} as any;

  injectInfo.lifetime = lifetime;
  injectInfo.token = token;

  Reflect.defineMetadata(INJECT_INFO_METADATA_TOKEN, injectInfo, target);
}

export function GetInjectInfo(target: Function): InjectInfo {
  return Reflect.getMetadata(INJECT_INFO_METADATA_TOKEN, target);
}
//#endregion

//#region 替换服务
export function ReplaceService() {
  return (target: Function) => {
    Reflect.defineMetadata(REPLACE_SERVICE_METADATA_TOKEN, true, target);
  };
}

export function NeedReplaceService(target: Function): boolean {
  return !!Reflect.getMetadata(REPLACE_SERVICE_METADATA_TOKEN, target);
}
//#endregion

//#region 多实例注册

export function AllowMultiple() {
  return (target: Function) => {
    Reflect.defineMetadata(MULTIPLE_INS_METADATA_TOKEN, true, target);
  };
}

export function IsMultipleRegister(target: Function): boolean {
  return !!Reflect.getMetadata(MULTIPLE_INS_METADATA_TOKEN, target);
}
//#endregion

export const Injectable = injectable;

export const Inject = inject;

export const Container = container;
