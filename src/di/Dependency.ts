import { inject, injectable } from "tsyringe";

export enum ServiceLifetime {
  Singleton = 0,
  Scoped = 1,
  Transient = 2,
}

export function Transient(token?: string) {
  return (target: Function) => {
    InitDependency(target, ServiceLifetime.Transient, token);
  };
}

export function Singleton(token?: string) {
  return (target: Function) => {
    InitDependency(target, ServiceLifetime.Singleton, token);
  };
}

export function Scoped(token?: string) {
  return (target: Function) => {
    InitDependency(target, ServiceLifetime.Scoped, token);
  };
}

export const Injectable = injectable;
export const Inject = inject;

function InitDependency(
  target: Function,
  lifetime: ServiceLifetime,
  token?: string
) {
  if (!token) token = target.name;
  target.prototype.lifetime = lifetime;
  target.prototype.token = token;
}
