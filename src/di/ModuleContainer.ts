import { singleton } from "tsyringe";

@singleton()
export class ModuleContainer {
  private readonly _modules: Set<Function>;

  constructor() {
    this._modules = new Set<Function>();
  }

  /**
   * 添加模块
   * @param module
   */
  public Add(module: Function) {
    this._modules.add(module);
  }

  /**
   * 获取所有模块
   * @returns 所有注册的模块
   */
  public GetAllModule(): Array<Function> {
    const array: Array<Function> = [];
    this._modules.forEach((element) => {
      array.push(element);
    });
    return array;
  }

  /**
   * 获取所有控制器
   * @returns
   */
  public GetAllController(): Array<Function> {
    return this.GetAllModule().filter((p) => p.prototype.IsController);
  }

  /**
   * 获取需要注册的模块
   * @returns
   */
  public GetNeedRegisterModule(): Array<Function> {
    return this.GetAllModule().filter((p) => p.prototype.dependency);
  }
}
