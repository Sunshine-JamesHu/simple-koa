"use strict";
exports.__esModule = true;
exports.GetRouterPath = exports.Router = void 0;
var Controller_1 = require("../controller/Controller");
var PATH_METADATA = 'Path';
function Router(path) {
    return function (target) {
        if (!path) {
            path = "/".concat((0, Controller_1.GetControllerName)(target).toLowerCase());
        }
        Reflect.defineMetadata(GetMetadataToken(), path, target);
    };
}
exports.Router = Router;
function GetRouterPath(target) {
    return Reflect.getMetadata(GetMetadataToken(), target);
}
exports.GetRouterPath = GetRouterPath;
function GetMetadataToken() {
    return "".concat(Controller_1.METADATA_TOKEN, ":").concat(PATH_METADATA);
}
