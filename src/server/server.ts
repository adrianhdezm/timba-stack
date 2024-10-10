import type { ServerBuild } from '@remix-run/node';
import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import http from 'node:http';
import pg from 'pg';
import type { ViteDevServer } from 'vite';

import { createApp } from './app';
import { logger } from './logger';

// Load environment variables from .env file
dotenv.config();

let remixApp: ServerBuild | (() => Promise<ServerBuild>) | null = null;
let viteDevServer: ViteDevServer | null = null;

try {
  // Conditionally load Vite dev server if not in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await import('vite');
    viteDevServer = await vite.createServer({ server: { middlewareMode: true } });
  }

  // Load the Remix app for SSR
  if (viteDevServer) {
    remixApp = (await viteDevServer.ssrLoadModule('virtual:remix/server-build')) as ServerBuild;
    logger.info('Remix App loaded in dev mode');
  } else {
    // @ts-expect-error - the file might not exist yet but it will
    remixApp = (await import('./remix-app.js')) as ServerBuild;
    logger.info('Remix App loaded in production mode');
  }

  if (!remixApp) {
    throw new Error('Remix App Not Found');
  }

  // Database connection
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL
  });
  const db = drizzle(pool);

  // Create Express app with Remix and Vite (if available)
  const app = await createApp({ viteDevServer, remixApp, db });
  const server = http.createServer(app);

  // Start the HTTP server
  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    logger.info('Server is up and running!');
    if (viteDevServer) {
      logger.info(`URL: http://localhost:${port}`);
    }
  });

  // Graceful shutdown
  const onCloseSignal = () => {
    logger.info('Received shutdown signal, shutting down gracefully');

    // Close the server and exit the process
    server.close(async (err) => {
      await pool.end();
      logger.info('Database disconnected!');
      if (err) {
        logger.error('Error during server close:', err);
        process.exit(1); // Force exit with error
      } else {
        logger.info('Server closed successfully');
        process.exit(0); // Successful exit
      }
    });

    // Force shutdown if not closed within 2 seconds
    setTimeout(() => {
      logger.error('Forced shutdown due to timeout');
      process.exit(1); // Force exit with error
    }, 2000).unref(); // Allow the timer to run without blocking
  };

  process.on('SIGINT', onCloseSignal);
  process.on('SIGTERM', onCloseSignal);
} catch (error) {
  logger.error('Failed to start the server:', error);
  process.exit(1);
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled Rejection:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1); // Exit on critical failure
});
