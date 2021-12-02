### Simple-Koa

本框架基于 Koa 搭建，拥有完整的 Koa 生态;

#### 功能

1.简单且易于使用的 Controller 和 Router

2.强大的依赖注入，支持依赖反转，接口注入等

4.Swagger 文档

5.数据仓储(日程中)

6.HttpClient(日程中)

7.Jwt 验证(日程中)

### 快速开始

#### 定义一个Controller

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

#### 启动

```
import Program from 'simple-koa';

const program = new Program(__dirname);
program.Start();

```

#### 访问

http:127.0.0.1:30000(主界面)

http:127.0.0.1:30000/swagger(SwaggerApi)