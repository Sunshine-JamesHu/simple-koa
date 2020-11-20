import { IResultHandler } from "./ResultHandler";

class JsonHandler implements IResultHandler {
    Decode(data: any) {
        if (typeof (data) === "string")
            return JSON.parse(data);
        return data;
    }
}

export default new JsonHandler();