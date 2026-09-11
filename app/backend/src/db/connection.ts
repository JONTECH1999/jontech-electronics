import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { env } from '../config/env';
import * as schema from './schema';

let dbInstance: any = null;
let isConnectedToMysql = false;

export async function getDb() {
  if (dbInstance) return { db: dbInstance, isConnectedToMysql };

  const candidateUrls = Array.from(new Set([
    env.DATABASE_URL,
    'mysql://root:@127.0.0.1:3306/kitflow_db',
    'mysql://root:@localhost:3306/kitflow_db',
    'mysql://root:password@127.0.0.1:3306/kitflow_db'
  ].filter(Boolean) as string[]));

  for (const url of candidateUrls) {
    try {
      const pool = mysql.createPool(url);
      const conn = await pool.getConnection();
      conn.release();

      dbInstance = drizzle(pool, { schema, mode: 'default' });
      isConnectedToMysql = true;
      console.log(`✅ Connected to MySQL database via Drizzle ORM`);
      return { db: dbInstance, isConnectedToMysql: true };
    } catch (err: any) {
      // try next candidate URL
    }
  }

  console.warn('⚠️  Could not connect to MySQL. Falling back to safe in-memory store.');
  isConnectedToMysql = false;
  return { db: null, isConnectedToMysql: false };
}

export { isConnectedToMysql };
