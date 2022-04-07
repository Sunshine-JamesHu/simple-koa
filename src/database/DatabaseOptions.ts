export declare type DatabaseType = 'postgres' | 'mysql' | 'mssql' | string;

export interface DatabaseOptions {
  type: DatabaseType;
  options: any;
}

export interface DatabaseSetting {
  [key: string]: DatabaseOptions;
}
