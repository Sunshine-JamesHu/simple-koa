import { Singleton } from "../../src/di/Dependency";
import { Service } from "../../src/service/Service";

export interface ITestService {
  TestService(): string;
}

@Singleton("ITestService")
export class TestService extends Service implements ITestService {
  constructor() {
    super();
    console.log("调用了构造函数Service");
  }

  public TestService(): string {
    return "TestService";
  }
}
