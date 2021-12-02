"use strict";
exports.__esModule = true;
exports.GetActionParamsMetadata = exports.RequestBody = exports.RequestQuery = exports.RequestParamType = void 0;
var ACTION_PARAMS_METADATA = 'ActionParams';
var RequestParamType;
(function (RequestParamType) {
    RequestParamType[RequestParamType["Body"] = 0] = "Body";
    RequestParamType[RequestParamType["Param"] = 1] = "Param";
})(RequestParamType = exports.RequestParamType || (exports.RequestParamType = {}));
function RequestQuery(paramName) {
    return function (target, key, index) {
        var paramTypes = Reflect.getMetadata('design:paramtypes', target, key);
        var params = GetActionParamsMetadata(target[key]);
        params.unshift({ "in": 'query', key: paramName, index: index, type: paramTypes[index] });
        Reflect.defineMetadata(ACTION_PARAMS_METADATA, params, target[key]);
    };
}
exports.RequestQuery = RequestQuery;
function RequestBody() {
    return function (target, key, index) {
        var paramTypes = Reflect.getMetadata('design:paramtypes', target, key);
        var params = GetActionParamsMetadata(target[key]);
        params.push({ "in": 'body', index: index, type: paramTypes[index] });
        Reflect.defineMetadata(ACTION_PARAMS_METADATA, params, target[key]);
    };
}
exports.RequestBody = RequestBody;
function GetActionParamsMetadata(target) {
    return Reflect.getMetadata(ACTION_PARAMS_METADATA, target) || [];
}
exports.GetActionParamsMetadata = GetActionParamsMetadata;
