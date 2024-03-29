# Simple-Koa

本框架基于 Koa 搭建，拥有完整的 Koa 生态;

# 功能

- 简单且易于使用的 Controller 和 Router

- 强大的依赖注入，支持依赖反转，接口注入等

- 无须配置的 Swagger 文档

- 简单易用的日志组件

- QueueManager 管道处理器 (支持`kafka`,`mqtt`)

- HttpClient 简单易用的 HttpClient

- Cache (支持 MemoryCache, Redis)

- Jwt 验证(日程中)

- Cron定时任务

- Oss存储支持(支持`local`,`minio`)

- DatabaseProvider 数据库查询器 (支持`postgres`,`mysql`)

  - 支持连接池
  - 支持事务 (暂不支持分布式事务)
  - 支持断线重连
  - 支持多库
  - 提供仓储支持 (日程中)
  - 提供轻量级 ORM (日程中)

#### 启动

```
yarn init  # 初始化项目
yarn add simple-koa # 添加框架引用
yarn add nodemon typescript ts-node --dev # 添加运行调试所需
```

新建一个文件夹 `src`，在`src`文件夹中新建项目入口`App.ts`

**注意，启动文件必须放在 src 文件夹下，否则会程序出现起不来的问题**

```
// App.ts
import 'reflect-metadata'; // 这一句必须要加
import Program from 'simple-koa';

const program = new Program(__dirname);
program.Start();
```

添加 `tsconfig.json` (案例仅供参考,可以自己任意配置)

```
{
    "$schema": "https://json.schemastore.org/tsconfig",
    "display": "Node 14",
    "compilerOptions": {
        "lib": ["es2020"],
        "module": "commonjs",
        "target": "es2020",
        "baseUrl": ".",
        "outDir": "dist",
        "strict": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true,
        "suppressImplicitAnyIndexErrors": true,

        "moduleResolution": "node",
        "sourceMap": true,
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true,
        "declaration": true
    },
    "include": ["src/**/*", "App.ts"],
    "exclude": ["node_modules", "**/*.spec.ts", "dist/**/*"]
}
```

在 `package.json` 添加启动命令

```
  "scripts": {
    "start": "nodemon --inspect --watch \"./src/**/*.ts\" -e ts --exec \"node\" -r ts-node/register \"./src/App.ts\""
  }
```

启动项目

```
yarn start
```

访问界面

[http:127.0.0.1:30000](http:127.0.0.1:30000) 主界面

[http:127.0.0.1:30000/swagger](http:127.0.0.1:30000/swagger) swaggerApi

#### 定义一个 Controller

```
import Program, {
    Controller,
    Inject,
    Injectable,
    Transient,
    HttpDelete,
    HttpGet,
    HttpPut,
    HttpPost,
    RequestBody,
    RequestQuery,
    Router
} from 'simple-koa';

export interface ITestController {
  GetTest(data: { name: string }): string;
  PostTest(id: string, data: Object): string;
  PutTest(file: ArrayBuffer): string;
  DeleteTest(id: number): string;

  ObjTest(): Test;
}

class Test {
  public name?: string;
  public age?: number;
}

@Transient()
@Injectable()
@Router()
export default class TestController extends Controller implements ITestController {
  constructor(@Inject('ITestService') private testService: ITestService) {
    super();
  }
  @HttpGet()
  ObjTest(): Test {
    throw new Error('Method not implemented.');
  }

  @HttpGet()
  public GetTest(@RequestQuery() data: { name: string }): string {
    if (data.name) return data.name;
    return this.testService.TestService();
  }

  @HttpPost()
  public PostTest(@RequestQuery('id') id: string, @RequestBody() data: Object): string {
    return 'PostTest';
  }

  @HttpPut()
  public PutTest(@RequestBody() file: ArrayBuffer): string {
    return 'PutTest';
  }

  @HttpDelete()
  public DeleteTest(@RequestQuery('id') id: number): string {
    console.log(id);
    return '删除成功';
  }
}

```

#### 发布订阅

##### 配置文件

在配置文件中添加如下配置

```
  "queues": {
    "kafkaTest": {  // 唯一Key
      "type": "kafka", // 消息管道类型(支持kafka和mqtt)
      "options": {
        "servers": "server.dev.ai-care.top:9092", // kafka地址
        "clientId": "koa_kafka_test" // clientId
      }
    },
    "mqttTest": { // 唯一Key
      "type": "mqtt", // 消息管道类型(支持kafka和mqtt)
      "options": {
        "address": "mqtt://192.168.1.82", // mqtt地址
        "clientId": "koa_mqtt_test", // clientId
        "userName": "ronds", // mqtt账号
        "password": "ronds@123" // mqtt密码
      }
    }
  }
```

##### 订阅

在入口文件中重写 StartQueues 函数进行订阅操作

```
class App extends Program {
  override StartQueues() {
    const factory = Container.resolve<IQueueManagerFactory>(QMF_INJECT_TOKEN);

    const kafkaManager = factory.GetQueueManager('kafkaTest');
    const mqttManager = factory.GetQueueManager('mqttTest');

    const mqttTestTopic = GetEventKey(MqttSubTest);
    mqttManager.Subscription(mqttTestTopic, 'simple_koa_test/#');

    const kafkaTestTopic = GetEventKey(KafkaSubTest);
    kafkaManager.Subscription(kafkaTestTopic, kafkaTestTopic);

    super.StartQueues();
  }
}

const app = new App(__dirname);
app.Start();
```

##### 发布

```
import { Inject, Injectable, Singleton } from '../../src/di/Dependency';
import { GetQueueToken, IQueueManager } from '../../src/queue/QueueManager';
import { Service } from '../../src/service/Service';

export interface IQueueTestService {
  PublishAsync(data: any): Promise<void>;
}

@Injectable()
@Singleton('IQueueTestService')
export class QueueTestService extends Service implements IQueueTestService {
  constructor(@Inject(GetQueueToken('mqttTest')) private pubQueueManager: IQueueManager) {
    super();
  }

  async PublishAsync(data: any): Promise<void> {
    await this.pubQueueManager.PublishAsync('simple_koa_test', data);
    await this.pubQueueManager.PublishAsync('simple_koa_test', Buffer.from(JSON.stringify(data), 'utf-8'));
  }
}


```

#### 数据库操作

目前支持`postgres`，`mysql`,未来还将支持`mongo`,`cassandra`

支持连接池，支持事务，支持多种数据库，支持同时连接多个数据库，暂无分布式锁，分布式事务的支持想法

**目前 MYSQL8+的数据库需要执行如下脚本才行**

```
alter user root@'%' identified with mysql_native_password by "123456";
```

##### 配置文件

```
"databases": {
    "default": {
      "type": "postgres",
      "options": {
        "address": "192.168.1.159",
        "port": 5432,
        "database": "koa_test",
        "userName": "postgres",
        "password": "123456"
      }
    }
  }
```

##### 用法

可以使用`IDatabaseProviderFactory`来进行工厂注入
也可以使用 `IDatabaseProvider` 来直接注入,InjectKey 为配置文件中的 key，默认为`default`

`ExecuteAsync`函数用来执行数据库操作
`UseTransaction`用来支持事务，抛出错误会自动回滚，结束后无报错会自动提交事务

```
@Injectable()
@Singleton('IPostgresTestService')
export class PostgresTestService extends Service implements IPostgresTestService {
  constructor(
    @Inject(DPF_INJECT_TOKEN) private dbProviderFactory: IDatabaseProviderFactory,
    @Inject(DBP_INJECT_TOKEN) private dbProvider: IDatabaseProvider
  ) {
    super();
  }

  async GetUserName(id: number): Promise<string> {
    const result = await this.dbProvider.ExecuteAsync<{ name: string }>(`SELECT "name" FROM public.test1 WHERE id = $1`, id);
    return result.rows[0]?.name;
  }

  public async GetList(): Promise<Array<{ id: number; name: string }>> {
    const dbProvider = this.dbProviderFactory.GetProvider();
    const a = await dbProvider.ExecuteAsync('SELECT id, "name" FROM public.test1');
    return a.rows;
  }

  public async Create(id: number, name: string): Promise<void> {
    await this.dbProvider.UseTransaction(async (client) => {
      await client.ExecuteAsync(`INSERT INTO public.test1 (id, "name") VALUES($1, $2)`, id, name);
    });
  }

  public async BatchCreate(data: { id: number; name: string }[]): Promise<void> {
    await this.dbProvider.UseTransaction(async (client) => {
      for (let index = 0; index < data.length; index++) {
        const element = data[index];
        await client.ExecuteAsync(`INSERT INTO public.test1 (id, "name") VALUES($1, $2)`, element.id, element.name);
      }
    });
  }
}
```

#### 缓存操作

##### 抽象定义

```
export interface ICache {
  Get<TCache = any>(key: string): TCache;
  GetAsync<TCache = any>(key: string): Promise<TCache>;

  Set<TCache = any>(key: string, data: TCache, options?: ICacheEntryOptions): void;
  SetAsync<TCache = any>(key: string, data: TCache, options?: ICacheEntryOptions): Promise<void>;

  Remove(key: string): void;
  RemoveAsync(key: string): Promise<void>;

  GetOrAdd<TCache = any>(key: string, func: () => TCache, options?: ICacheEntryOptions): TCache;
  GetOrAddAsync<TCache = any>(key: string, func: () => Promise<TCache> | TCache, options?: ICacheEntryOptions): Promise<TCache>;
}

```

##### 使用例子

```
import { Controller } from '../../src/controller/Controller';
import { Inject, Injectable, Transient } from '../../src/di/Dependency';
import { HttpDelete, HttpGet, HttpPost } from '../../src/router/Request';
import { RequestBody, RequestQuery } from '../../src/router/RequestData';
import { Router } from '../../src/router/Router';
import { IMemoryCache, MEMORY_INJECT_TOKEN } from '../../src/cache/Cache';

@Transient()
@Injectable()
@Router({ desc: '缓存测试' })
export default class CacheController extends Controller {
  constructor(@Inject(MEMORY_INJECT_TOKEN) private memoryCache: IMemoryCache) {
    super();
  }

  @HttpGet()
  MGet(@RequestQuery('key') key: string) {
    return this.memoryCache.GetAsync(key);
  }

  @HttpPost()
  async MPost(@RequestBody() data: { key: string; val: any; ttl: number; sliding: boolean }[]) {
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      await this.memoryCache.SetAsync(element.key, element.val, { ttl: element.ttl ?? 5000, sliding: element.sliding });
    }
  }

  @HttpDelete()
  MDel(@RequestQuery('key') key: string) {
    return this.memoryCache.Remove(key);
  }
}

```

#### 定时任务

基于`Corn`实现，不支持`[?]`通配符号

```
import { Singleton } from '../../src/di/Dependency';
import { Cron, CronInfo, CronJob, CRON_JOB_INJECT_TOKEN } from '../../src/cron/Cron';

@Cron({ cron: '0/5 * * * * *' })
@Singleton(CRON_JOB_INJECT_TOKEN)
export class TestCronJob extends CronJob {
  DoWorkAsync(): Promise<void> {
    this.Logger.LogDebug('我是每5秒执行一次的任务');
    return Promise.resolve();
  }
}

@Singleton(CRON_JOB_INJECT_TOKEN)
export class TestCronJob2 extends CronJob {
  DoWorkAsync(): Promise<void> {
    this.Logger.LogDebug('我是每10秒执行一次的任务');
    return Promise.resolve();
  }

  protected GetCronInfo(): CronInfo | undefined {
    return {
      cron: '0/10 * * * * *',
    };
  }
}

```

#### Oss存储支持
Oss存储由 服务`IOssService`与提供者`IOssProvider`组成，框架中已经实现`minio`与`local`的Oss存储

用法：
首先注册通用的`IOssService`,其中`UseOssProvider`有两个参数，type为Oss提供者的key,options为Oss提供者的配置。如果options不指定的话，会从配置文件中的oss节点下拿一次

**注册**
```
class App extends Program {
  override OnPreApplicationInitialization() {
    super.OnPreApplicationInitialization();

    UseOssProvider('local'); // 可选项为 local,minio,自己实现的provider的唯一key
  }
}

```
**配置**

```
  "oss": {
    "minio": {
      "addr": "127.0.0.1",
      "port": 9000,
      "userName": "admin",
      "password": "Admin@123456",
      "useSSL": false
    },
    "local": {
      "dir": "data"
    }
  }
```

**用法**
```
@Transient()
@Injectable()
@Router({ desc: 'Oss存储测试' })
export default class OssController extends Controller {
  constructor(@Inject(OSS_SVC_INJECT_TOKEN) private readonly _ossService: IOssService) {
    super();
  }

  @HttpGet()
  async GetFile(@RequestQuery('path') path: string): Promise<Buffer> {
    const mimeType = lookup(path) || 'application/octet-stream';
    this.Context.set('Content-Type', mimeType);
    this.Context.set('Content-Disposition', `filename=${path.substring(path.indexOf('/') + 1)}`);
    const res = await this._ossService.GetAsync(path);
    return res;
  }

  @HttpPost()
  async UploadFile(@RequestBody() data: { group: string | undefined; data?: File }): Promise<string> {
    if (data && data.data) {
      const reader = fs.createReadStream(data.data.path);
      const buffer = await StreamHelper.StreamToBuffer(reader);
      return await this._ossService.SaveAsync(buffer, data.data.name || Guid.Create(), data.group);
    }
    throw new UserFriendlyError('请选择一个文件进行上传');
  }

  @HttpDelete()
  async DeleteFile(@RequestQuery('path') path: string): Promise<void> {
    await this._ossService.RemoveAsync(path);
  }
}

```
