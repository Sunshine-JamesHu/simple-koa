import "reflect-metadata";

const _servicePool: Map<any, any> = new Map<any, any>();

/**
 * 从容器中获取注入类型的单例模式
 */
export function Inject() {
    return function (target: any, propertyKey: string) {
        const InjectService = Reflect.getMetadata("design:type", target, propertyKey);
        if (!InjectService)
            throw new Error("无法找到元数据");
        target[propertyKey] = CreateService(InjectService);
    };
}

export function Injectable(type: "Singleton" | "Scoped" | "Transient" = "Singleton") {
    return function (target: any) {
        let paramtypes: any[] = Reflect.getMetadata('design:paramtypes', target);
        if (!paramtypes) paramtypes = [];

        if (paramtypes.indexOf(target) > -1)
            throw new Error('自己不能依赖自己');
        else {
            target.prototype.DependsOn = paramtypes; // 依赖组件
            target.prototype.InjectType = type; // 注入类型
        }

    };
}

// 不带Context的注入
export function CreateService(target: any) {
    let service;
    // 瞬时实例注入
    if (target.prototype.InjectType === "Transient") {
        service = new target(...GetDependsOnService(target));
    }
    // 单次请求注入
    else if (target.prototype.InjectType === "Scoped") {
        throw new Error("实现比较麻烦,暂不支持,实在需要拿源码自己进行拓展.");
    }
    // 单例注入 (因为是工具库，或者是其他不涉及Context的库,所以不注入Context)
    else {
        let ins = _servicePool.get(target);
        if (!ins) {
            ins = new target(...GetDependsOnService(target));
            _servicePool.set(target, ins);
        }
        service = ins;
    }
    return service;
}

function GetDependsOnService(target: any): Array<any> {
    const dependsOn: any[] = target.prototype.DependsOn ? target.prototype.DependsOn : [];
    const dependsOnService: any[] = [];
    dependsOn.forEach((ServiceType: any) => {
        dependsOnService.push(CreateService(ServiceType));
    });
    return dependsOnService;
}


// 带Context的注入
export function CreateServiceAndInjectContext(target: any, context: any) {
    let service;
    // 瞬时实例注入
    if (target.prototype.InjectType === "Transient") {
        service = new target(...GetDependsOnServiceAndInjectContext(target, context));

        // 一般是业务服务库,需要注入Context
        if (service.IsService && service.IsService()) {
            service.Context = context;
        }
    }
    // 单次请求注入
    else if (target.prototype.InjectType === "Scoped") {
        throw new Error("实现比较麻烦,暂不支持,实在需要拿源码自己进行拓展.");
    }
    // 单例注入 (因为是工具库，或者是其他不涉及Context的库,所以不注入Context)
    else {
        let ins = _servicePool.get(target);
        if (!ins) {
            ins = new target(...GetDependsOnServiceAndInjectContext(target, context));
            _servicePool.set(target, ins);
        }
        service = ins;
    }
    return service;
}

function GetDependsOnServiceAndInjectContext(target: any, context: any): Array<any> {
    const dependsOn: any[] = target.prototype.DependsOn ? target.prototype.DependsOn : [];
    const dependsOnService: any[] = [];
    dependsOn.forEach((ServiceType: any) => {
        dependsOnService.push(CreateServiceAndInjectContext(ServiceType, context));
    });
    return dependsOnService;
}





