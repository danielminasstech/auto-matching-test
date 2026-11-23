export interface Config {
    db: DbConfig
}
export interface DbConfig {
    username: string;
    password: string;
    host: string;
    port: number;
    database: string;
}
export const config: Config = {
    db: {
        username: process.env.PGUSER ?? 'postgres',
        password: process.env.PGPASSWORD ?? 'postgres',
        host: process.env.PGHOST ?? 'localhost',
        port: Number(process.env.PGPORT ?? 5432),
        database: process.env.PGDATABASE ?? 'matching',
    }
}