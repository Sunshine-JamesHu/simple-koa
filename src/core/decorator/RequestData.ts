
export const REQUEST_BODY = 'RequestBody';
export const REQUEST_QUERY = 'RequestQuery';
export const REQUEST_CONTEXT = 'RequestContext';


export function RequestParam(paramName?: string) {
    return (target: any, methodName: string, index: number) => {
        const params = target[methodName].paramList || {};
        if (paramName)
            params[paramName] = index;
        else
            params[REQUEST_QUERY] = index;

        target[methodName].paramList = params;
    };
}

export function RequestBody() {
    return (target: any, methodName: string, index: number) => {
        const params = target[methodName].paramList || {};
        params[REQUEST_BODY] = index;
        target[methodName].paramList = params;
    };
}

export function RequestContext() {
    return (target: any, methodName: string, index: number) => {
        const params = target[methodName].paramList || {};
        params[REQUEST_CONTEXT] = index;
        target[methodName].paramList = params;
    };
}
