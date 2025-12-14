import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import pool from '../src/config/database.js';
import logger from '../src/utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '../');

async function runMigrations() {
  try {
    const sql = readFileSync(join(__dirname, '001_initial_schema.sql'), 'utf-8');
    const statements = sql.split(';').filter((s) => s.trim().length > 0);

    for (const statement of statements) {
      if (statement.trim()) {
        await pool.execute(statement);
      }
    }

    logger.info('Migrations completed successfully');
  } catch (error) {
    logger.error('Migration error:', error);
    throw error;
  }
}

runMigrations()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Migration failed:', error);
    process.exit(1);
  });

