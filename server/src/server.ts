import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { createApp } from './app.js';

async function bootstrap() {
  try {
    console.log('----------------------------------------------------');
    console.log('🕵️  AI MYSTERY ROOM — DETECTIVE GAME SERVER');
    console.log(`📡 Environment: ${env.NODE_ENV}`);
    console.log(`🤖 Configured Gemini Model: ${env.GEMINI_MODEL}`);
    console.log('----------------------------------------------------');

    // Connect to database
    await connectDB();

    const app = createApp();

    const server = app.listen(env.PORT, '0.0.0.0', () => {
      console.log(`🚀 Detective Server active at: http://localhost:${env.PORT}`);
      console.log(`🔍 Health check: http://localhost:${env.PORT}/api/health`);
    });

    const shutdown = async (signal: string) => {
      console.log(`\n[SHUTDOWN] Received ${signal}. Closing detective server...`);
      server.close(async () => {
        await disconnectDB();
        console.log('[SHUTDOWN] Clean exit.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('[BOOTSTRAP FATAL ERROR]', error);
    process.exit(1);
  }
}

bootstrap();
