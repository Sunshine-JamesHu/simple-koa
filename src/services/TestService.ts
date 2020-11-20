import Service from '../core/services/Service';
import { Injectable } from '../core/di/Injector';

@Injectable('Transient')
export default class TestService extends Service {
  public Test() {
    return 'Test method';
  }
}
