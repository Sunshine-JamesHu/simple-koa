import { METADATA_TOKEN as Controller_METADATA_TOKEN } from "../controller/Controller";
const PATH_METADATA = "Path";

export function Router(path?: string) {
  return (target: Function) => {
    if (!path) {
      path = `/${target.name.replace("Controller", "").toLowerCase()}`;
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
