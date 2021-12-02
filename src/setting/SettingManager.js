"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.SettingManager = exports.LoadAppConfig = exports.INJECT_TOKEN = void 0;
var fs = require("fs");
var Dependency_1 = require("../di/Dependency");
var APP_CONFIG = {};
var SetConfig = function (cfg) {
    for (var key in cfg) {
        if (cfg.hasOwnProperty(key)) {
            APP_CONFIG[key] = cfg[key];
        }
    }
};
exports.INJECT_TOKEN = "ISettingManager";
function LoadAppConfig() {
    try {
        var appConfig = "";
        if (process.env.Config_FILE && fs.existsSync(process.env.Config_FILE)) {
            appConfig = fs.readFileSync(process.env.Config_FILE, "utf-8");
        }
        else {
            appConfig = fs.readFileSync("./app.config.json", "utf-8");
        }
        if (!appConfig)
            throw new Error();
        SetConfig(JSON.parse(appConfig));
    }
    catch (error) {
        console.warn("App配置为空,采用默认配置");
        SetConfig({
            port: 30000
        });
    }
}
exports.LoadAppConfig = LoadAppConfig;
var SettingManager = /** @class */ (function () {
    function SettingManager() {
    }
    SettingManager.prototype.GetConfig = function (key) {
        var keyPath = key.split(":");
        var cfg = APP_CONFIG[keyPath[0]];
        for (var index = 1; index < keyPath.length; index++) {
            var element = keyPath[index];
            cfg = cfg[element];
        }
        return cfg;
    };
    SettingManager = __decorate([
        (0, Dependency_1.Singleton)(exports.INJECT_TOKEN)
    ], SettingManager);
    return SettingManager;
}());
exports.SettingManager = SettingManager;
