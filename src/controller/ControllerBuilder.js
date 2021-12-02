"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.ControllerBuilder = exports.INJECT_TOKEN = void 0;
var path = require("path");
var fs = require("fs");
var koa_router_1 = require("koa-router");
var tsyringe_1 = require("tsyringe");
var ModuleContainer_1 = require("../di/ModuleContainer");
var Controller_1 = require("./Controller");
var SettingManager_1 = require("../setting/SettingManager");
var Dependency_1 = require("../di/Dependency");
var RequestData_1 = require("../router/RequestData");
var Router_1 = require("../router/Router");
var Request_1 = require("../router/Request");
exports.INJECT_TOKEN = 'IControllerBuilder';
var ControllerBuilder = /** @class */ (function () {
    function ControllerBuilder(settingManager) {
        this._settingManager = settingManager;
        this._apiPrefix = settingManager.GetConfig('apiPrefix') || 'api';
    }
    ControllerBuilder.prototype.CreateController = function (module) {
        var _this = this;
        var routerPath = (0, Router_1.GetRouterPath)(module);
        if (!(0, Controller_1.IsController)(module) || !routerPath) {
            return;
        }
        var actions = [];
        console.log('注册Controller', module.name, routerPath);
        var propKeys = Object.getOwnPropertyNames(module.prototype);
        propKeys.forEach(function (propKey) {
            if (propKey === 'constructor')
                return; // 跳过构造函数
            var property = module.prototype[propKey];
            if (!property || typeof property !== 'function')
                return;
            var actionInfo = (0, Request_1.GetActionInfo)(property);
            if (!actionInfo)
                return;
            var actionName = actionInfo.name;
            var fullPath = "/".concat(_this._apiPrefix, "/").concat(routerPath, "/").concat(actionName).replace(/\/{2,}/g, '/');
            var mainFunc = function (ctx, next) { return __awaiter(_this, void 0, void 0, function () {
                var actionParams, args, controller, result, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            actionParams = (0, RequestData_1.GetActionParamsMetadata)(property);
                            args = [];
                            if (actionParams && actionParams.length) {
                                actionParams.forEach(function (element) {
                                    var data = null;
                                    if (element["in"] === 'body') {
                                        data = ctx.request.body;
                                    }
                                    else if (element["in"] === 'query') {
                                        var queryData = __assign(__assign({}, ctx.params), ctx.query);
                                        data = queryData;
                                        if (element.key) {
                                            data = queryData[element.key];
                                        }
                                    }
                                    if (data != null)
                                        args[element.index] = data;
                                });
                            }
                            controller = tsyringe_1.container.resolve(module);
                            controller.SetContext(ctx); // 将Ctx丢进去
                            result = property.apply(controller, args);
                            if (!(result instanceof Promise)) return [3 /*break*/, 2];
                            _a = ctx.response;
                            return [4 /*yield*/, result];
                        case 1:
                            _a.body = _b.sent(); // 处理异步
                            return [3 /*break*/, 3];
                        case 2:
                            ctx.response.body = result; // 处理同步
                            _b.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            }); };
            var action = {
                fullPath: fullPath,
                httpMethod: (0, Request_1.GetHttpMethodStr)(actionInfo.httpMethod),
                func: mainFunc
            };
            actions.push(action);
        });
        return actions;
    };
    ControllerBuilder.prototype.CreateControllerByContainer = function (app) {
        var _this = this;
        var moduleContainer = tsyringe_1.container.resolve(ModuleContainer_1.ModuleContainer);
        var controllers = moduleContainer.GetAllController();
        var router = new koa_router_1["default"](); // 定义路由容器
        controllers.forEach(function (element) {
            var actions = _this.CreateController(element);
            if (actions && actions.length) {
                actions.forEach(function (action) {
                    console.log(action.fullPath);
                    router.register(action.fullPath, [action.httpMethod], action.func);
                });
            }
        });
        app.use(router.routes());
        app.use(router.allowedMethods());
    };
    ControllerBuilder.prototype.CreateControllerByModule = function (app, modulePath) {
        var _this = this;
        var files = [];
        try {
            files = fs.readdirSync(modulePath);
        }
        catch (error) {
            console.error('Module路径配置错误,请检查配置后重试.');
            files = [];
        }
        files.forEach(function (filePath) {
            var fullFilePath = path.join(modulePath, filePath);
            if (fs.statSync(fullFilePath).isDirectory()) {
                _this.CreateControllerByModule(app, fullFilePath);
            }
            else {
                var extName = path.extname(fullFilePath);
                if (extName === '.ts' || extName === '.js') {
                    var modules = require(fullFilePath);
                    if (!modules)
                        return;
                    for (var key in modules) {
                        if (Object.prototype.hasOwnProperty.call(modules, key)) {
                            var module_1 = modules[key];
                            if (module_1.prototype) {
                                _this.CreateController(module_1);
                            }
                        }
                    }
                }
            }
        });
    };
    ControllerBuilder = __decorate([
        (0, Dependency_1.Injectable)(),
        (0, Dependency_1.Singleton)(exports.INJECT_TOKEN),
        __param(0, (0, Dependency_1.Inject)(SettingManager_1.INJECT_TOKEN))
    ], ControllerBuilder);
    return ControllerBuilder;
}());
exports.ControllerBuilder = ControllerBuilder;
