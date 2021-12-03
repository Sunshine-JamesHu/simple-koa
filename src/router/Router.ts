import { GetControllerName, METADATA_TOKEN as Controller_METADATA_TOKEN } from '../controller/Controller';
const PATH_METADATA = 'Sys:Path';

export function Router(path?: string) {
  return (target: Function) => {
    if (!path) {
      path = `/${GetControllerName(target).toLowerCase()}`;
    }
    Reflect.defineMetadata(GetMetadataToken(), path, target);
  };
}

export function GetRouterPath(target: Function) {
  return Reflect.getMetadata(GetMetadataToken(), target);
}

function GetMetadataToken() {
  return `${Controller_METADATA_TOKEN}:${PATH_METADATA}`;
}
