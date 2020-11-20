import { IMiddleware } from "../middleware/Middleware";

/**
 * 路由
 * @param path 路径
 * @param interceptors 拦截器
 */
export function Router(path = '/', interceptors?: IMiddleware[]) {
    return (target: any) => {
        target.prototype.path = path;
        target.prototype.interceptors = interceptors;
        target.prototype.isController = true;
    };
}