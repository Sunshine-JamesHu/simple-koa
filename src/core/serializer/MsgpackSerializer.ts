import { ISerializer } from './Serializer';
import Msgpack from 'msgpack5'; // 这个包有猫腻

const msgpack = require('msgpack5');

class MsgpackSerializer implements ISerializer {
    private readonly _msgpack: Msgpack.MessagePack;
    constructor() {
        this._msgpack = msgpack();
    }
    

    public Encode(obj: any): any {
        return this._msgpack.encode(obj);
    }

    public Decode(buf: Buffer): any {
        return this._msgpack.decode(buf);
    }
}

export default new MsgpackSerializer();