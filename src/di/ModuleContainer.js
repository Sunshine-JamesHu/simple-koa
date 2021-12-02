"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.ModuleContainer = void 0;
var tsyringe_1 = require("tsyringe");
var Controller_1 = require("../controller/Controller");
var Dependency_1 = require("./Dependency");
var ModuleContainer = /** @class */ (function () {
    function ModuleContainer() {
        this._modules = new Set();
    }
    /**
     * 添加模块
     * @param module
     */
    ModuleContainer.prototype.Add = function (module) {
        this._modules.add(module);
    };
    /**
     * 获取所有模块
     * @returns 所有注册的模块
     */
    ModuleContainer.prototype.GetAllModule = function () {
        var array = [];
        this._modules.forEach(function (element) {
            array.push(element);
        });
        return array;
    };
    /**
     * 获取所有控制器
     * @returns
     */
    ModuleContainer.prototype.GetAllController = function () {
        return this.GetAllModule().filter(function (p) { return (0, Controller_1.IsController)(p); });
    };
    /**
     * 获取需要注册的模块
     * @returns
     */
    ModuleContainer.prototype.GetNeedRegisterModule = function () {
        return this.GetAllModule().filter(function (p) { return !!(0, Dependency_1.GetInjectInfo)(p); });
    };
    ModuleContainer = __decorate([
        (0, tsyringe_1.singleton)()
    ], ModuleContainer);
    return ModuleContainer;
}());
exports.ModuleContainer = ModuleContainer;
