export enum HttpMethod {
  GET = 0,
  POST = 1,
  PUT = 2,
  DELETE = 3,
  OPTIONS = 4,
}

const ACTION_INFO_METADATA = 'Sys:ActionInfo';

export interface ActionInfo {
  httpMethod: HttpMethod;
  name: string;
  returnType: any;
}

export function HttpGet(actionName?: string) {
  return HttpRequest(HttpMethod.GET, actionName);
}

export function HttpPost(actionName?: string) {
  return HttpRequest(HttpMethod.POST, actionName);
}

export function HttpPut(actionName?: string) {
  return HttpRequest(HttpMethod.PUT, actionName);
}

export function HttpDelete(actionName?: string) {
  return HttpRequest(HttpMethod.DELETE, actionName);
}

export function HttpOptions(actionName?: string) {
  return HttpRequest(HttpMethod.OPTIONS, actionName);
}

export function HttpRequest(httpMethod: HttpMethod, actionName?: string) {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    if (!actionName) actionName = key;
    const actionInfo: ActionInfo = {
      name: GetActionName(actionName),
      httpMethod: httpMethod,
      returnType: Reflect.getMetadata('design:returntype', target, key),
    };
    Reflect.defineMetadata(ACTION_INFO_METADATA, actionInfo, descriptor.value);
  };
}

export function GetHttpMethodStr(httpMethod: HttpMethod): string {
  let methodStr = 'get';
  switch (httpMethod) {
    case HttpMethod.POST:
      methodStr = 'post';
      break;
    case HttpMethod.PUT:
      methodStr = 'put';
      break;
    case HttpMethod.DELETE:
      methodStr = 'delete';
      break;
    case HttpMethod.OPTIONS:
      methodStr = 'options';
      break;
    default:
      methodStr = 'get';
      break;
  }
  return methodStr;
}

function GetActionName(actionName: string): string {
  actionName = `${actionName[0].toLowerCase()}${actionName.substring(1, actionName.length)}`;
  // if (actionName.endsWith('Async')) actionName = actionName.replace('Async', ''); // TODO:是否需要加上?????
  return actionName;
}

export function GetActionInfo(action: Function): ActionInfo {
  return Reflect.getMetadata(ACTION_INFO_METADATA, action);
}
