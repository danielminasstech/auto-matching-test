import fs from 'fs';
import path from 'path';
import { PostgresAdapter } from '../src/connector/adapter/postgres-adapter';
import { config } from '../src/config';

async function runSqlFiles(directory: string, postgresAdapter: PostgresAdapter) {
  for (const file of fs.readdirSync(directory).filter((name) => name.endsWith('.sql')).sort()) {
    const sql = fs.readFileSync(path.join(directory, file), 'utf8');
    await postgresAdapter.pool.query(sql);
  }
}

async function reset() {
  const postgresAdapter = new PostgresAdapter(config.db);
  try {
    await postgresAdapter.pool.query('drop schema public cascade');
    await postgresAdapter.pool.query('create schema public');
    await runSqlFiles(path.join(__dirname, '..', 'migrations'), postgresAdapter);
    await runSqlFiles(path.join(__dirname, '..', 'seeds'), postgresAdapter);
  } finally {
    await postgresAdapter.stop();
  }
}

reset().catch((e) => {
  console.error(e);
  process.exit(1);
});
