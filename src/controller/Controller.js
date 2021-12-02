"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.GetControllerName = exports.IsController = exports.Controller = exports.METADATA_TOKEN = void 0;
exports.METADATA_TOKEN = 'Controller';
var Controller = /** @class */ (function () {
    function Controller() {
    }
    Controller.prototype.SetContext = function (ctx) {
        this._context = ctx;
    };
    Controller.prototype.Context = function () {
        return this._context;
    };
    Controller = __decorate([
        Reflect.metadata(exports.METADATA_TOKEN, true)
    ], Controller);
    return Controller;
}());
exports.Controller = Controller;
function IsController(target) {
    return Reflect.getMetadata(exports.METADATA_TOKEN, target);
}
exports.IsController = IsController;
function GetControllerName(controller) {
    return controller.name.replace('Controller', '');
}
exports.GetControllerName = GetControllerName;
