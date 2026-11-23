import type { DbConfig } from "../../config";
import { Pool } from "pg";

export class PostgresAdapter {
    public readonly pool: Pool;

    constructor(config: DbConfig) {
        if(!config.username || !config.password || !config.host || !config.port || !config.database) {
            throw new Error("Database configuration is incomplete. Please provide username, password, host, port, and database.");
        }
        this.pool = new Pool({
            host: config.host,
            port: config.port,
            user: config.username,
            password: config.password,
            database: config.database,
        });
    }

    async stop(): Promise<void> {
        await this.pool.end();
    }
}