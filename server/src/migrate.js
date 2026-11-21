// Applies migrations/*.sql in filename order, once each. Usage: npm run migrate
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { withClient, closePool } from './config/db.js';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'migrations');

try {
  const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort();
  await withClient(async (client) => {
    await client.query(
      'CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, "appliedAt" timestamptz NOT NULL DEFAULT now())'
    );
    const { rows } = await client.query('SELECT name FROM schema_migrations');
    const applied = new Set(rows.map((r) => r.name));

    for (const file of files) {
      if (applied.has(file)) continue;
      await client.query('BEGIN');
      try {
        await client.query(await readFile(path.join(dir, file), 'utf8'));
        await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`applied ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
    }
  });
  console.log('migrations up to date');
} catch (err) {
  console.error(err);
  process.exitCode = 1;
} finally {
  await closePool();
}
