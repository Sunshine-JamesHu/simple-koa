import { Controller } from "../../src/controller/Controller";
import { Injectable, Transient } from "../../src/di/Dependency";
import { HttpGet, HttpPost } from "../../src/router/Request";
import { RequestBody, RequestQuery } from "../../src/router/RequestData";
import { Router } from "../../src/router/Router";

export interface IUserController {
  GetUserName(name: string, name2: string): Promise<string>;
}

@Transient()
@Injectable()
@Router()
export default class UserController
  extends Controller
  implements IUserController
{
  @HttpGet()
  GetUserName(
    @RequestQuery("name") name: string,
    @RequestQuery("name2") name2: string
  ): Promise<string> {
    return new Promise((res, rej) => res(`创建用户->${name},${name2}`));
  }

  @HttpPost()
  CreateUser(@RequestBody() data: any) {
    return "用户创建成功";
  }
}
