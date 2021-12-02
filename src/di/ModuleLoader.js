"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.ModuleLoader = void 0;
var path = require("path");
var fs = require("fs");
var tsyringe_1 = require("tsyringe");
var Dependency_1 = require("./Dependency");
var ModuleLoader = /** @class */ (function () {
    function ModuleLoader(moduleContainer) {
        this._moduleContainer = moduleContainer;
    }
    ModuleLoader.prototype.LoadModule = function (modulePath) {
        var _this = this;
        var files = [];
        try {
            files = fs.readdirSync(modulePath);
        }
        catch (error) {
            console.error("Module路径配置错误,请检查配置后重试.");
            files = [];
        }
        files.forEach(function (filePath) {
            var fullFilePath = path.join(modulePath, filePath);
            if (fs.statSync(fullFilePath).isDirectory()) {
                _this.LoadModule(fullFilePath);
            }
            else {
                var extName = path.extname(fullFilePath);
                if (extName === ".ts" || extName === ".js") {
                    var modules = require(fullFilePath);
                    if (!modules)
                        return;
                    for (var key in modules) {
                        if (Object.prototype.hasOwnProperty.call(modules, key)) {
                            var module_1 = modules[key];
                            if (module_1.prototype) {
                                _this._moduleContainer.Add(module_1);
                            }
                        }
                    }
                }
            }
        });
    };
    ModuleLoader.prototype.RegisterModule = function (module) {
        var injectInfo = (0, Dependency_1.GetInjectInfo)(module);
        if (!injectInfo)
            return;
        console.log("\u6CE8\u518CModule: ".concat(injectInfo.token, " -> ").concat(module.name));
        var lifetime = injectInfo.lifetime;
        if (!tsyringe_1.container.isRegistered(injectInfo.token)) {
            if (lifetime == Dependency_1.ServiceLifetime.Singleton) {
                tsyringe_1.container.registerSingleton(injectInfo.token, module);
            }
            else if (lifetime == Dependency_1.ServiceLifetime.Scoped) {
                // TODO:暂时不支持此种注册方式
            }
            else if (lifetime == Dependency_1.ServiceLifetime.Transient) {
                tsyringe_1.container.register(injectInfo.token, {
                    useClass: module
                });
            }
        }
    };
    ModuleLoader.prototype.RegisterModuleByContainer = function () {
        var _this = this;
        var modules = this._moduleContainer.GetAllModule();
        modules.forEach(function (module) {
            _this.RegisterModule(module);
        });
    };
    ModuleLoader = __decorate([
        (0, tsyringe_1.singleton)(),
        (0, tsyringe_1.injectable)()
    ], ModuleLoader);
    return ModuleLoader;
}());
exports.ModuleLoader = ModuleLoader;
