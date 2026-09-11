import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { env } from '../config/env';
import * as schema from './schema';

let dbInstance: any = null;
let isConnectedToMysql = false;

export async function getDb() {
  if (dbInstance) return { db: dbInstance, isConnectedToMysql };

  if (!env.USE_DEMO_DATA && env.DATABASE_URL) {
    try {
      const pool = mysql.createPool(env.DATABASE_URL);
      // Test connection
      const conn = await pool.getConnection();
      conn.release();

      dbInstance = drizzle(pool, { schema, mode: 'default' });
      isConnectedToMysql = true;
      console.log('✅ Connected to MySQL database via Drizzle ORM');
      return { db: dbInstance, isConnectedToMysql };
    } catch (err: any) {
      console.warn('⚠️  Could not connect to MySQL (' + err.message + '). Falling back to safe in-memory store.');
    }
  }

  isConnectedToMysql = false;
  return { db: null, isConnectedToMysql: false };
}

export { isConnectedToMysql };
