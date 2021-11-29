/**
 * 路由
 * @param path 路径
 * @param interceptors 拦截器
 */
export function Router(name?: string) {
  return (target: Function) => {
    // 如果没有输入Path就直接使用当前的名字作为Path
    if (!name) {
      name = `/${target.name.replace("Controller", "").toLowerCase()}`;
    }
    target.prototype.name = name;
  };
}
