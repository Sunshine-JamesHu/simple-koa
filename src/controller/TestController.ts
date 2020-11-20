import Controller from '../core/controller/Controller';
import { RequestContext, RequestBody, RequestParam } from '../core/decorator/RequestData';
import { Router } from '../core/decorator/Router';
import { HttpRequest, HttpProxy } from '../core/decorator/HttpRequest';
import TestService from '../services/TestService';
import { Injectable } from '../core/di/Injector';
// import { OrganizationApi } from '../../apis/OrganizationApi';
// import { SampleApi } from '../../apis/SampleApi';

@Router('/test')
@Injectable('Transient')
export default class TestController extends Controller {
  private readonly _test: TestService;
  constructor(test: TestService) {
    super();
    this._test = test;
  }

  @HttpRequest({ path: '/test', method: 'get' })
  public Test(): any {
    return this._test.Test();
  }
  @HttpRequest({ path: '/test1/:id', method: 'get' })
  public Test1(@RequestParam('id') data: any): any {
    return this._test.Test();
  }
  public Test3(id: string): any {
    return this._test.Test();
  }

  @HttpRequest({ path: '/test2', method: 'post' })
  public Test2(): any {
    return this._test.Test();
  }
}
