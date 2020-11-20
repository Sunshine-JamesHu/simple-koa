import { IResultHandler } from "./ResultHandler";
import MsgpackSerializer from "../../serializer/MsgpackSerializer";

class MsgpackHandler implements IResultHandler {
    Decode(data: any) {
        return MsgpackSerializer.Decode(data);
    }
}

export default new MsgpackHandler();