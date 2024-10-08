import dotenv from 'dotenv';
import http from 'node:http';

import { createApp } from './app';
import { logger } from './logger';

// Load environment variables from .env file
dotenv.config();

const viteDevServer =
  process.env.NODE_ENV === 'production'
    ? null
    : await import('vite').then((vite) =>
        vite.createServer({
          server: { middlewareMode: true }
        })
      );

// Create the HTTP server using the Express app
const app = await createApp({ viteDevServer });
const server = http.createServer(app);

// Start the server
const port = process.env.PORT || 3000;
server.listen(port, () => {
  logger.info(`Server is running!${viteDevServer ? ` http://localhost:${port}` : ''}`);
});

const onCloseSignal = () => {
  logger.info('SIGINT received, shutting down');
  server.close(async () => {
    logger.info('Server closed, exiting process');
    process.exit();
  });

  setTimeout(() => process.exit(1), 2000).unref(); // Force shutdown after 2s
};

process.on('SIGINT', onCloseSignal);
process.on('SIGTERM', onCloseSignal);

process.on('unhandledRejection', (reason) => {
  if (reason) {
    logger.error(reason, 'Unhandled Rejection');
  }
});
process.on('uncaughtException', (err) => {
  logger.error(err, 'Uncaught Exception');
  process.exit(1);
});
