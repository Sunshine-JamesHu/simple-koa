import { Controller } from '../../src/controller/Controller';
import { Injectable, Transient } from '../../src/di/Dependency';
import { HttpGet, HttpPost } from '../../src/router/Request';
import { RequestBody, RequestQuery } from '../../src/router/RequestData';
import { Router } from '../../src/router/Router';

export interface IUserController {
  GetUserName(name: string, age: number): Promise<string>;
  CreateUser(data: any): { name: string };
}

@Transient()
@Injectable()
@Router()
export default class UserController extends Controller implements IUserController {
  @HttpGet()
  GetUserName(@RequestQuery('name') name: string, @RequestQuery('age') age: number): Promise<string> {
    return new Promise((res, rej) => res(`创建用户->${name},${age}`));
  }

  @HttpPost()
  CreateUser(@RequestBody() data: any): { name: string } {
    console.log('用户创建成功');
    return { name: '7778888' };
  }
}
