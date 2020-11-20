import { IResultHandler } from "./ResultHandler";
import MsgpackHandler from "./MsgpackHandler";
import JsonHandler from "./JsonHandler";

export default class ResultHandlerFactory {
    public static GetResultHandler(contentType: string): IResultHandler | undefined {
        // console.log(contentType, "contentType");
        if (contentType.toLowerCase().indexOf('json') > -1) {
            return JsonHandler;
        }
        else if (contentType.toLowerCase().indexOf('msgpack') > -1) {
            return MsgpackHandler;
        }
        else if (contentType.toLowerCase().indexOf('protobuf') > -1) {
            // TODO:准备支持
        }
    }
}