"use strict";
exports.__esModule = true;
require("reflect-metadata");
var koa_1 = require("koa");
var SettingManager_1 = require("./setting/SettingManager");
var tsyringe_1 = require("tsyringe");
var ModuleLoader_1 = require("./di/ModuleLoader");
var ControllerBuilder_1 = require("./controller/ControllerBuilder");
var SettingManager_2 = require("./setting/SettingManager");
var SwaggerBuilder_1 = require("./swagger/SwaggerBuilder");
var Program = /** @class */ (function () {
    function Program(rootPath) {
        this._rootPath = rootPath;
        this._app = new koa_1["default"]();
        this.Init();
    }
    Program.prototype.GetApp = function () {
        return this._app;
    };
    Program.prototype.Init = function () {
        this.OnPreApplicationInitialization();
        this.OnApplicationInitialization();
        this.OnPostApplicationInitialization();
    };
    /**
     * 初始化之前
     */
    Program.prototype.OnPreApplicationInitialization = function () {
        this.InitSettingManager(); // 初始化设置
        this.InitModules(); // 初始化所有模块
        this.RegisterModules(); // 将所有模块注册到容器中
    };
    /**
     * 初始化
     */
    Program.prototype.OnApplicationInitialization = function () {
        this.CreateController();
        this.CreateSwaggerApi();
    };
    /**
     * 初始化之后
     */
    Program.prototype.OnPostApplicationInitialization = function () { };
    /**
     * 当服务启动之后
     */
    Program.prototype.OnServerStarted = function () { };
    /**
     * 创建控制器
     */
    Program.prototype.CreateController = function () {
        var controllerBuilder = tsyringe_1.container.resolve(ControllerBuilder_1.INJECT_TOKEN);
        controllerBuilder.CreateControllerByContainer(this.GetApp());
    };
    /**
     * 创建SwaggerApi
     */
    Program.prototype.CreateSwaggerApi = function () {
        var swaggerBuilder = tsyringe_1.container.resolve(SwaggerBuilder_1.INJECT_TOKEN);
        swaggerBuilder.CreateSwaggerApi(this.GetApp());
    };
    Program.prototype.InitSettingManager = function () {
        (0, SettingManager_1.LoadAppConfig)();
    };
    Program.prototype.InitModules = function () {
        var moduleLoader = tsyringe_1.container.resolve(ModuleLoader_1.ModuleLoader);
        this.LoadModules(moduleLoader);
    };
    Program.prototype.LoadModules = function (moduleLoader) {
        moduleLoader.LoadModule(__dirname);
        moduleLoader.LoadModule(this._rootPath);
    };
    Program.prototype.RegisterModules = function () {
        var moduleLoader = tsyringe_1.container.resolve(ModuleLoader_1.ModuleLoader);
        moduleLoader.RegisterModuleByContainer();
    };
    Program.prototype.Start = function () {
        var _this = this;
        var app = this.GetApp();
        var port = this.GetPortSetting();
        app.listen(port, function () {
            console.log("Server running on port ".concat(port));
            _this.OnServerStarted();
        });
    };
    Program.prototype.GetPortSetting = function () {
        var setting = tsyringe_1.container.resolve(SettingManager_2.INJECT_TOKEN);
        var port = setting.GetConfig("port");
        if (port && port > 0)
            return port;
        return 30000;
    };
    return Program;
}());
exports["default"] = Program;
