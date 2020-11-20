export interface ISerializer {
    Encode(obj: any): any;

    Decode(buf: Buffer): any;
}