### Athene Api

##### 本框架基于 Koa 搭建,使用约定高于配置的编码方式

### 快速开始

#### 安装框架

`npm i easy-koa --save`

#### 框架启动

    import * as path from 'path';
    import { Startup } from "easy-koa";

    const controllerPath = './controller';
    const app = new Startup(path.join(__dirname, controllerPath));
    app.StartServer();

### 快速开始

##### 定义一个 get 请求 127.0.0.1:8000/hello 返回 HelloWorldController

    ```
    import { Router, HttpRequest, Controller } from "easy-koa";
    @Router('/hello') // 定义该Controller的父路由为/hello
    @Injectable("Transient") // 标记这是一个瞬时注入的类
    export default class HelloWorldController extends Controller { //继承Controller
    	constructor(private readonly _testService: TestService) {
    		super();
    	}
        @HttpRequest({ path: "/", method: "get" }) // 定义子路由的请求路径和请求方式
        public Hello() {
    		this._testService.Test();
            return "HelloWorldController";
        }
    }
	
    ```

    ```
    // Service的写法
    @Injectable("Transient")
    export default class TestService extends Service {
    	private readonly _test2Service: TestService2;
    	private readonly _test3Service: TestService3;
    	constructor(test2Service: TestService2, test3Service: TestService3) {
        	super();
        	this._test2Service = test2Service;
        	this._test3Service = test3Service;
    	}
    	public async Test() {
        	this._test2Service.Test();
        	this._test3Service.Test();
    	}
    }
    ```
