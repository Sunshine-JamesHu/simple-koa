const ColumnMetadataKey = Symbol('ColumnInfo');

interface ColumnInfo {
  name: string;
  type: any;
  description?: string;
}

export function Column(name: string) {
  return function (target: any, propertyKey: string) {
    let colInfo = GetColumnInfo(target, propertyKey);
    if (!colInfo) colInfo = {} as ColumnInfo;
    colInfo.name = name;
    colInfo.type = Reflect.getMetadata('design:type', target, propertyKey);
    Reflect.defineMetadata(ColumnMetadataKey, colInfo, target, propertyKey);
  };
}

export function GetColumnInfo(target: any, propertyKey: string): ColumnInfo | undefined {
  return Reflect.getMetadata(ColumnMetadataKey, target, propertyKey);
}

export function GetColumnName(target: any, propertyKey: string): string | undefined {
  const columnInfo = GetColumnInfo(target, propertyKey);
  if (columnInfo) return columnInfo.name;
}
