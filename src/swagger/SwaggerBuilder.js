"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
exports.__esModule = true;
exports.SwaggerBuilder = exports.INJECT_TOKEN = void 0;
var koa_router_1 = require("koa-router");
var koa2_swagger_ui_1 = require("koa2-swagger-ui");
var tsyringe_1 = require("tsyringe");
var Controller_1 = require("../controller/Controller");
var Dependency_1 = require("../di/Dependency");
var ModuleContainer_1 = require("../di/ModuleContainer");
var Request_1 = require("../router/Request");
var RequestData_1 = require("../router/RequestData");
var Router_1 = require("../router/Router");
var SettingManager_1 = require("../setting/SettingManager");
exports.INJECT_TOKEN = 'ISwaggerBuilder';
var SwaggerPath = /** @class */ (function () {
    function SwaggerPath(tag, parameters, responses) {
        this.tags = [tag];
        this.produces = ['application/json'];
        if (parameters && parameters.length > 0)
            this.parameters = parameters;
        else
            this.parameters = [];
        if (responses) {
            this.responses = responses;
        }
        else {
            this.responses = {
                200: {
                    description: '返回值',
                    schema: {}
                }
            };
        }
    }
    return SwaggerPath;
}());
var SwaggerBuilder = /** @class */ (function () {
    function SwaggerBuilder(settingManager) {
        this._settingManager = settingManager;
        this._apiPrefix = settingManager.GetConfig('apiPrefix') || 'api';
    }
    SwaggerBuilder.prototype.CreateSwaggerApi = function (app) {
        var router = new koa_router_1["default"]();
        var swagger = this.GenSwaggerJson();
        router.register('/swagger.json', ['get'], function (ctx) {
            ctx.set('Content-Type', 'application/json');
            ctx.body = swagger;
        });
        router.register('/swagger', ['get'], (0, koa2_swagger_ui_1.koaSwagger)({
            routePrefix: false,
            swaggerOptions: {
                url: '/swagger.json'
            }
        }));
        app.use(router.routes());
        app.use(router.allowedMethods());
    };
    SwaggerBuilder.prototype.GenSwaggerJson = function () {
        var _this = this;
        var moduleContainer = tsyringe_1.container.resolve(ModuleContainer_1.ModuleContainer);
        var controllers = moduleContainer.GetAllController();
        var tags = [];
        var paths = {};
        controllers.forEach(function (controller) {
            var routerPath = (0, Router_1.GetRouterPath)(controller);
            if (!(0, Controller_1.IsController)(controller) || !routerPath) {
                return;
            }
            var tag = (0, Controller_1.GetControllerName)(controller);
            tags.push({
                name: tag,
                description: tag
            });
            var propKeys = Object.getOwnPropertyNames(controller.prototype);
            propKeys.forEach(function (propKey) {
                if (propKey === 'constructor')
                    return; // 跳过构造函数
                var property = controller.prototype[propKey];
                if (!property || typeof property !== 'function')
                    return;
                var actionInfo = (0, Request_1.GetActionInfo)(property);
                if (!actionInfo)
                    return;
                var actionName = actionInfo.name;
                var fullPath = "/".concat(_this._apiPrefix, "/").concat(routerPath, "/").concat(actionName).replace(/\/{2,}/g, '/');
                var parameters = [];
                var actionParams = (0, RequestData_1.GetActionParamsMetadata)(property);
                if (actionParams) {
                    actionParams.forEach(function (actionParam) {
                        if (actionParam["in"] === 'body') {
                            parameters.push({
                                name: 'data',
                                "in": 'body',
                                type: 'object',
                                collectionFormat: 'multi'
                            });
                        }
                        else if (actionParam["in"] === 'query') {
                            var key = 'query';
                            if (actionParam.key) {
                                key = actionParam.key;
                            }
                            parameters.push({
                                "in": 'query',
                                name: key,
                                type: actionParam.type.name.toLowerCase()
                            });
                        }
                    });
                }
                var tmp = {};
                tmp[(0, Request_1.GetHttpMethodStr)(actionInfo.httpMethod)] = new SwaggerPath(tag, parameters);
                paths[fullPath] = tmp;
            });
        });
        return {
            swagger: '2.0',
            info: {
                description: 'Swagger api for Simple-Koa',
                version: '1.0.0',
                title: 'Simple-Koa Swagger'
            },
            schemes: ['http'],
            tags: tags,
            paths: paths
        };
    };
    SwaggerBuilder = __decorate([
        (0, Dependency_1.Injectable)(),
        (0, Dependency_1.Singleton)(exports.INJECT_TOKEN),
        __param(0, (0, Dependency_1.Inject)(SettingManager_1.INJECT_TOKEN))
    ], SwaggerBuilder);
    return SwaggerBuilder;
}());
exports.SwaggerBuilder = SwaggerBuilder;
