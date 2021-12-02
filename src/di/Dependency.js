"use strict";
exports.__esModule = true;
exports.Inject = exports.Injectable = exports.GetInjectInfo = exports.Scoped = exports.Singleton = exports.Transient = exports.ServiceLifetime = void 0;
var tsyringe_1 = require("tsyringe");
var ServiceLifetime;
(function (ServiceLifetime) {
    ServiceLifetime[ServiceLifetime["Singleton"] = 0] = "Singleton";
    ServiceLifetime[ServiceLifetime["Scoped"] = 1] = "Scoped";
    ServiceLifetime[ServiceLifetime["Transient"] = 2] = "Transient";
})(ServiceLifetime = exports.ServiceLifetime || (exports.ServiceLifetime = {}));
var METADATA_TOKEN = "InjectInfo";
function Transient(token) {
    return function (target) {
        DefineInjectInfo(target, ServiceLifetime.Transient, token);
    };
}
exports.Transient = Transient;
function Singleton(token) {
    return function (target) {
        DefineInjectInfo(target, ServiceLifetime.Singleton, token);
    };
}
exports.Singleton = Singleton;
function Scoped(token) {
    return function (target) {
        DefineInjectInfo(target, ServiceLifetime.Scoped, token);
    };
}
exports.Scoped = Scoped;
function DefineInjectInfo(target, lifetime, token) {
    if (!token)
        token = target.name;
    var injectInfo = {
        lifetime: lifetime,
        token: token
    };
    Reflect.defineMetadata(METADATA_TOKEN, injectInfo, target);
}
function GetInjectInfo(target) {
    return Reflect.getMetadata(METADATA_TOKEN, target);
}
exports.GetInjectInfo = GetInjectInfo;
exports.Injectable = tsyringe_1.injectable;
exports.Inject = tsyringe_1.inject;
