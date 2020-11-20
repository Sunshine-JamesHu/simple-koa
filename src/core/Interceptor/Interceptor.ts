import { Inject } from "../di/Injector";
import { Logger } from "../logger/Logger";

export interface IInterceptor {
    NextHandler(result: any, context: any): Promise<any>;

    PreHandler(args: any, context: any): Promise<any>;
}

export class Interceptor implements IInterceptor {
    @Inject()
    protected readonly Logger: Logger;

    public NextHandler(result: any, context: any): Promise<any> {
        return Promise.resolve(result);
    }

    public PreHandler(args: any, context: any): Promise<any> {
        return Promise.resolve(args);
    }
}