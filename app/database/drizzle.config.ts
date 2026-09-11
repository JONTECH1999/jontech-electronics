import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export default {
  schema: './src/db/schema.ts',
  out: './database/migrations',
  dialect: 'mysql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'mysql://root:password@127.0.0.1:3306/kitflow_db'
  },
  verbose: true,
  strict: true
} satisfies Config;
