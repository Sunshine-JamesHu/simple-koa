import { Interceptor } from "../Interceptor";
import Service from "../../services/Service";
import { CreateServiceAndInjectContext } from "../../di/Injector";

export default abstract class DataLoad extends Interceptor {
    private readonly _name: string;
    private readonly _keyPath: string;

    constructor(name: string, keyPath: string) {
        super();

        this._name = name;
        this._keyPath = keyPath;
    }

    public async NextHandler(result: any, context: any): Promise<any> {
        const paths = this._keyPath.split(".");
        let keys: Array<string | number> = [];
        try {
            keys = this.GetKeys(result, paths);
        } catch (error) {
            this.Logger.Error(`DataLoad:[${this._name}] Path:[${this._keyPath}]->提取路径中的Key失败`, error);
            return result;
        }

        try {
            return await this.DataHandling(keys, result, context);
        } catch (error) {
            this.Logger.Error(`DataLoad:[${this._name}]->数据处理时出现错误`, error);
        }
    }

    /**
     * 找到路径中的Key
     * @param data  需要处理的数据
     * @param paths  路径
     */
    protected GetKeys(data: any, paths: string[]): any {
        const key = paths[0];
        let tempData: any;
        if (Array.isArray(data)) {
            tempData = [];
            data.forEach(element => {
                const item = element[key];
                if (Array.isArray(item)) {
                    element[key].forEach((childElement: any) => {
                        tempData.push(childElement);
                    });
                }
                else
                    tempData.push(element[key]);
            });
        }
        else {
            tempData = data[key];
        }

        paths.shift();
        if (paths && paths.length)
            return this.GetKeys(tempData, paths);

        return tempData;
    }

    /**
     * 生成返回值
     */
    protected abstract DataHandling(keys: Array<string | number>, result: any, context: any): Promise<any>;

    /**
     * 获取Service
     * @param Service  Service
     * @param context  Context
     */
    protected GetService<TService extends Service>(Service: any, context: any): TService {
        return CreateServiceAndInjectContext(Service, context);
    }
}