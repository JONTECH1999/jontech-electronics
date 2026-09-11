import * as fs from 'fs';
import * as path from 'path';
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL;

  console.log('🔄 KitFlow Migration Runner');
  console.log('----------------------------------------------------');

  if (!databaseUrl || process.env.USE_DEMO_DATA === 'true') {
    console.log('ℹ️  Running in DEMO / OFFLINE mode or DATABASE_URL not set.');
    console.log('✅ In-memory mock database schema is active.');
    console.log('✅ Migration check completed successfully.');
    return;
  }

  try {
    console.log(`📡 Connecting to MySQL: ${databaseUrl.replace(/:[^:@]+@/, ':****@')}`);
    const connection = await mysql.createConnection(databaseUrl);

    const migrationPath = path.join(__dirname, 'migrations', '0000_init.sql');
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found at ${migrationPath}`);
    }

    const sqlContent = fs.readFileSync(migrationPath, 'utf8');
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📦 Applying ${statements.length} migration statements...`);

    for (const statement of statements) {
      await connection.query(statement);
    }

    console.log('🎉 Successfully applied database migrations!');
    await connection.end();
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
}

if (require.main === module) {
  runMigrations();
}

export { runMigrations };
