export interface PostgresOptions {
  address: string;
  port?: number;
  database: string;
  userName: string;
  password: string;
  maxConn?: number;
}
