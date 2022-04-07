export const METADATA_TOKEN = 'Sys:Database';

import { DatabaseType } from './DatabaseOptions';

export function Database(type: DatabaseType) {
  return (target: Function) => {
    Reflect.defineMetadata(METADATA_TOKEN, type, target);
  };
}

export function GetDatabaseType(target: Function): DatabaseType {
  return Reflect.getMetadata(METADATA_TOKEN, target);
}

export function IsDatabase(target: Function) {
  return Reflect.getMetadata(METADATA_TOKEN, target);
}
