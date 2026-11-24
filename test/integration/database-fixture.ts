import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { config } from "../../src/config";

export async function createRepositoryTestDatabase() {
  const schema = `matching_test_${randomUUID().replaceAll("-", "")}`;
  const databaseConfig = {
    host: config.db.host,
    port: config.db.port,
    user: config.db.username,
    password: config.db.password,
    database: config.db.database,
  };
  const adminPool = new Pool(databaseConfig);
  let pool: Pool | undefined;

  try {
    await adminPool.query(`create schema ${schema}`);
    pool = new Pool({ ...databaseConfig, max: 1 });
    await pool.query(`set search_path to ${schema}`);

    const migration = readFileSync(
      new URL("../../migrations/20260101000000_initial_schema.sql", import.meta.url),
      "utf8",
    );
    const seed = readFileSync(new URL("../fixtures/repositories.sql", import.meta.url), "utf8");
    await pool.query(migration);
    await pool.query(seed);

    return {
      pool,
      async close() {
        await pool?.end();
        await adminPool.query(`drop schema if exists ${schema} cascade`);
        await adminPool.end();
      },
    };
  } catch (error) {
    await pool?.end();
    await adminPool.query(`drop schema if exists ${schema} cascade`);
    await adminPool.end();
    throw error;
  }
}

export async function findMatchedInvoiceId(pool: Pool, transactionId: string) {
  const { rows } = await pool.query(
    "select matched_invoice_id from transaction where id = $1",
    [transactionId],
  );
  return rows[0]?.matched_invoice_id ?? null;
}
