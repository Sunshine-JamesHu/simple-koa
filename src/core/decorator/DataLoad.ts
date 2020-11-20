import { IInterceptor } from "../Interceptor/Interceptor";

export default function DataLoad(...dataLoads: IInterceptor[]) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const action = descriptor.value;

        descriptor.value = async function () {
            let args = arguments;

            // 执行前置函数
            for (const dataLoad of dataLoads) {
                args = await dataLoad.PreHandler.apply(dataLoad, [args, this.Context]);
            }

            // 执行主函数
            let result = await Promise.resolve(action.apply(this, args)); // 主执行函数

            // 执行后置函数
            for (const dataLoad of dataLoads) {
                result = await dataLoad.NextHandler.apply(dataLoad, [result, this.Context]);
            }

            return result;
        };

        return descriptor;
    };
}