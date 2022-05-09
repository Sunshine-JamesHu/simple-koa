export class Common {
  private constructor() {}

  /**
   * 判断是不是Undefined/Null
   * @param data
   * @returns Undefined|Null => true
   */
  static IsNullOrUndefined(data: any): boolean {
    return data === undefined || data === null;
  }
}
