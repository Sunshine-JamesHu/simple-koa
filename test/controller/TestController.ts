/*
 * @Author: your name
 * @Date: 2021-11-29 18:18:44
 * @LastEditTime: 2021-11-29 18:26:26
 * @LastEditors: Please set LastEditors
 * @Description: 测试文件
 * @FilePath: \simple-koa\test\controller\TestController.ts
 */
import { Controller } from "../../src/controller/Controller";
import {
  Inject,
  Injectable,
  Singleton,
  Transient,
} from "../../src/di/Dependency";
import {
  HttpDelete,
  HttpGet,
  HttpPut,
  HttpPost,
} from "../../src/router/Request";
import { Router } from "../../src/router/Router";
import { ITestService } from "../service/TestService";

export interface ITestController {
  GetTest(): string;
  PostTest(): string;
  PutTest(): string;
  DeleteTest(): string;
}

@Transient()
@Injectable()
@Router()
export default class TestController
  extends Controller
  implements ITestController
{
  constructor(@Inject("ITestService") private testService: ITestService) {
    super();
  }

  @HttpGet()
  public GetTest(): string {
    
    return this.testService.TestService();
  }
  @HttpPost()
  public PostTest(): string {
    return "PostTest";
  }
  @HttpPut()
  public PutTest(): string {
    return "PutTest";
  }

  @HttpDelete()
  public DeleteTest(): string {
    return "DeleteTest";
  }
}
