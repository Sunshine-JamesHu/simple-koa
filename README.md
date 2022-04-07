# Simple-Koa

本框架基于 Koa 搭建，拥有完整的 Koa 生态;

# 功能

1.简单且易于使用的 Controller 和 Router

2.强大的依赖注入，支持依赖反转，接口注入等

4.Swagger 文档

5.日志管理

6.QueueManager 支持 MQTT 与 Kafka

7.HttpClient(日程中)

8.Jwt 验证(日程中)

9.DatabaseProvider(目前已支持`postgres`,下一个支持的是`mysql`)

10.定时任务(日程中)

# 启动

```
yarn init  # 初始化项目
yarn add simple-koa # 添加框架引用
yarn add nodemon typescript ts-node --dev # 添加运行调试所需
```

新建一个文件夹 `src`，在`src`文件夹中新建项目入口`App.ts` 

**注意，启动文件必须放在src文件夹下，否则会程序出现起不来的问题**

```
// App.ts
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

目前支持`postgres`，下一个支持`mysql`,未来还将支持`mssql`,`mongo`,`cassandra`
支持连接池，支持事务，支持多种数据库，支持同时连接多个数据库，暂无分布式锁，分布式事务的支持想法

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
