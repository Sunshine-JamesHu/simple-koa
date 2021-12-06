import { ReplaceService, Singleton } from '../../src/di/Dependency';
import { Service } from '../../src/service/Service';

export interface ITestService {
  TestService(): string;
}

@Singleton('ITestService')
export class TestService extends Service implements ITestService {
  constructor() {
    super();
  }

  public TestService(): string {
    return 'TestService';
  }
}

@ReplaceService()
@Singleton('ITestService')
export class TestService3 extends Service implements ITestService {
  constructor() {
    super();
  }

  public TestService(): string {
    return 'TestService3';
  }
}

@ReplaceService()
@Singleton('ITestService')
export class TestService2 extends Service implements ITestService {
  constructor() {
    super();
  }

  public TestService(): string {
    return 'TestService2';
  }
}
