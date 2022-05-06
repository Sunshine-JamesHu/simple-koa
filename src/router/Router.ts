import { GetControllerName } from '../controller/Controller';
const METADATA_ROUTER_INFO = 'Metadata:RouterInfo';

export interface RouterInfo {
  path: string;
  desc?: string;
}

export function Router(data?: string | { path?: string; desc?: string }) {
  return (target: Function) => {
    let routerInfo: RouterInfo = { path: `/${GetControllerName(target).toLowerCase()}` };
    if (data) {
      if (typeof data === 'string') routerInfo.path = data;
      else {
        if (data.path) routerInfo.path = data.path;
        if (data.desc) routerInfo.desc = data.desc;
      }
    }
    SetRouterInfo(target, routerInfo);
  };
}

export function GetRouterPath(target: Function) {
  const routerInfo = GetRouterInfo(target);
  return routerInfo?.path;
}

export function GetRouterInfo(target: Function): RouterInfo {
  return Reflect.getMetadata(GetMetadataToken(), target);
}

function SetRouterInfo(target: Function, routerInfo: RouterInfo) {
  Reflect.defineMetadata(GetMetadataToken(), routerInfo, target);
}

function GetMetadataToken() {
  return `${METADATA_ROUTER_INFO}`;
}
