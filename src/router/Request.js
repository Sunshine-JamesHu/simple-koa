"use strict";
exports.__esModule = true;
exports.GetActionInfo = exports.GetHttpMethodStr = exports.HttpRequest = exports.HttpOptions = exports.HttpDelete = exports.HttpPut = exports.HttpPost = exports.HttpGet = exports.HttpMethod = void 0;
var HttpMethod;
(function (HttpMethod) {
    HttpMethod[HttpMethod["GET"] = 0] = "GET";
    HttpMethod[HttpMethod["POST"] = 1] = "POST";
    HttpMethod[HttpMethod["PUT"] = 2] = "PUT";
    HttpMethod[HttpMethod["DELETE"] = 3] = "DELETE";
    HttpMethod[HttpMethod["OPTIONS"] = 4] = "OPTIONS";
})(HttpMethod = exports.HttpMethod || (exports.HttpMethod = {}));
var ACTION_INFO_METADATA = 'ActionInfo';
function HttpGet(actionName) {
    return HttpRequest(HttpMethod.GET, actionName);
}
exports.HttpGet = HttpGet;
function HttpPost(actionName) {
    return HttpRequest(HttpMethod.POST, actionName);
}
exports.HttpPost = HttpPost;
function HttpPut(actionName) {
    return HttpRequest(HttpMethod.PUT, actionName);
}
exports.HttpPut = HttpPut;
function HttpDelete(actionName) {
    return HttpRequest(HttpMethod.DELETE, actionName);
}
exports.HttpDelete = HttpDelete;
function HttpOptions(actionName) {
    return HttpRequest(HttpMethod.OPTIONS, actionName);
}
exports.HttpOptions = HttpOptions;
function HttpRequest(httpMethod, actionName) {
    return function (target, key, descriptor) {
        if (!actionName)
            actionName = key;
        var actionInfo = {
            name: GetActionName(actionName),
            httpMethod: httpMethod,
            returnType: Reflect.getMetadata('design:returntype', target, key)
        };
        Reflect.defineMetadata(ACTION_INFO_METADATA, actionInfo, descriptor.value);
    };
}
exports.HttpRequest = HttpRequest;
function GetHttpMethodStr(httpMethod) {
    var methodStr = 'get';
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
exports.GetHttpMethodStr = GetHttpMethodStr;
function GetActionName(actionName) {
    actionName = "".concat(actionName[0].toLowerCase()).concat(actionName.substring(1, actionName.length));
    // if (actionName.endsWith('Async')) actionName = actionName.replace('Async', ''); // TODO:是否需要加上?????
    return actionName;
}
function GetActionInfo(action) {
    return Reflect.getMetadata(ACTION_INFO_METADATA, action);
}
exports.GetActionInfo = GetActionInfo;
