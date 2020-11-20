
export interface IHasErrorInfo {
    errorInfo: any;
}

export interface IHasErrorStatus {
    status?: number;
}


export class HttpResponseError extends Error implements IHasErrorInfo, IHasErrorStatus {
    public errorInfo: any;
    public status?: number;
    constructor(errorOrMsg: Error | string, info: any, status?: number) {
        const msg = typeof (errorOrMsg) === 'string' ? errorOrMsg : errorOrMsg.message;
        super(msg);
        this.errorInfo = info;
        this.status = status;
    }
}

