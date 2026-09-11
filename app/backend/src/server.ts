import { createApp } from './app';
import { env } from './config/env';
import { getDb } from './db/connection';

async function startServer() {
  const app = createApp();

  // Test database connection
  await getDb();

  app.listen(env.PORT, () => {
    console.log('====================================================');
    console.log(`🚀 KitFlow Embedded Backend running on port ${env.PORT}`);
    console.log(`📡 URL: ${env.APP_URL}`);
    console.log(`🏬 Demo Shop: ${env.DEMO_SHOP_DOMAIN}`);
    console.log(`🔒 Mode: ${env.USE_DEMO_DATA ? 'SAFE DEMO MODE (In-Memory + Realistic Fallbacks)' : 'PRODUCTION'}`);
    console.log(`🤖 AI Model: ${env.ANTHROPIC_MODEL} (${env.ANTHROPIC_API_KEY ? 'Active API Key' : 'Simulated Response Fallback'})`);
    console.log('====================================================');
  });
}

if (require.main === module) {
  startServer().catch(err => {
    console.error('Fatal Server Startup Error:', err);
    process.exit(1);
  });
}

export { startServer };
