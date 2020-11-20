
export class SimpleResult<TData = any> implements ISimpleResult {
    constructor(data?: {
        code?: number;
        message?: string;
        data?: TData;
    }) {
        if (!data) data = { code: 0 };

        this.code = data.code ? data.code : 0;
        this.success = this.code === 0;
        this.message = data.message;
        this.data = data.data;
    }

    message: string;
    data: TData;
    code: number;
    readonly success: boolean;
}

export interface ISimpleResult<TData = any> {
    code: number;
    message: string;
    success: boolean;
    data: TData;
}