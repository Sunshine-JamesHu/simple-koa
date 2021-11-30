/**
 * 路由
 * @param path 路由
 * @param description 描述
 * @returns
 */
export function Router(options?: { path?: string; description?: string }) {
  return (target: Function) => {
    let path = options?.path;
    if (!path) {
      path = `/${target.name.replace("Controller", "").toLowerCase()}`;
    }
    target.prototype.path = path;
    target.prototype.description = options?.description;
  };
}
