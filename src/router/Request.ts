export enum HttpMethod {
  GET = 0,
  POST = 1,
  PUT = 2,
  DELETE = 3,
  OPTIONS = 4,
}

export function HttpGet(action?: string) {
  return HttpRequest(HttpMethod.GET, action);
}

export function HttpPost(action?: string) {
  return HttpRequest(HttpMethod.POST, action);
}

export function HttpPut(action?: string) {
  return HttpRequest(HttpMethod.PUT, action);
}

export function HttpDelete(action?: string) {
  return HttpRequest(HttpMethod.DELETE, action);
}

export function HttpOptions(action?: string) {
  return HttpRequest(HttpMethod.OPTIONS, action);
}

export function HttpRequest(httpMethod: HttpMethod, action?: string) {
  return (target: any, name: string, descriptor: PropertyDescriptor) => {
    if (!action) action = name;
    target[name].action = `${action[0].toLowerCase()}${action.substring(
      1,
      action.length
    )}`;
    target[name].httpMethod = GetHttpMethod(httpMethod);
  };
}

function GetHttpMethod(httpMethod: HttpMethod): string {
  let methodStr = "get";
  switch (httpMethod) {
    case HttpMethod.POST:
      methodStr = "post";
      break;
    case HttpMethod.PUT:
      methodStr = "put";
      break;
    case HttpMethod.DELETE:
      methodStr = "delete";
      break;
    case HttpMethod.OPTIONS:
      methodStr = "options";
      break;
    default:
      methodStr = "get";
      break;
  }
  return methodStr;
}
