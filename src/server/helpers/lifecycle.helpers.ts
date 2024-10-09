import http from 'node:http';

import { logger } from '../logger';

/**
 * Sets up graceful shutdown handlers for the server.
 * Listens for SIGINT and SIGTERM signals, and closes the server gracefully.
 *
 * @param server The HTTP server instance to close
 */
export const setupShutdownHandlers = (server: http.Server) => {
  const gracefulShutdown = () => {
    logger.info('Received shutdown signal, shutting down gracefully');

    // Close the server and exit the process
    server.close((err) => {
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

  // Attach listeners for shutdown signals
  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason: unknown) => {
    logger.error('Unhandled Rejection:', reason);
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1); // Exit on critical failure
  });
};
