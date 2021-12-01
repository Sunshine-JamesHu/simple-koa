export const REQUEST_BODY = 'RequestBody';
export const REQUEST_QUERY = 'RequestQuery';

export enum RequestParamType {
  Body = 0,
  Param = 1,
}

export function RequestQuery(paramName?: string) {
  return (target: any, method: string, index: number) => {
    const params = target[method].paramList || {};
    if (paramName) params[paramName] = index;
    else params[REQUEST_QUERY] = index;
    target[method].paramList = params;
  };
}

export function RequestBody() {
  return (target: any, method: string, index: number) => {
    const params = target[method].paramList || {};
    params[REQUEST_BODY] = index;
    target[method].paramList = params;
  };
}
