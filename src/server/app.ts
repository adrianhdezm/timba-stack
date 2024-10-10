import { createRequestHandler } from '@remix-run/express';
import type { ServerBuild } from '@remix-run/node';
import compression from 'compression';
import cors from 'cors';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import express, { type Application, type NextFunction, type Request, type Response } from 'express';
import helmet from 'helmet';
import createError from 'http-errors';
import type { Pool } from 'pg';
import type { LevelWithSilent } from 'pino';
import pinoHttp from 'pino-http';
import type { ViteDevServer } from 'vite';

import { logger } from './logger';

interface AppParams {
  viteDevServer: ViteDevServer | null;
  remixApp: ServerBuild;
  db: NodePgDatabase<Record<string, never>> & { $client: Pool };
}

export const createApp = async ({ viteDevServer, remixApp, db }: AppParams): Promise<Application> => {
  const app: Application = express();

  // Disable the X-Powered-By header
  app.disable('x-powered-by');

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          ...(viteDevServer ? { connectSrc: ["'self'", 'ws://localhost:24678'] } : {}), // Allow WebSockets to Vite dev server
          scriptSrc: ["'self'", "'unsafe-inline'"], // Allow inline scripts
          styleSrc: ["'self'", "'unsafe-inline'"] // Allow inline styles
        }
      }
    })
  );
  app.use(cors());
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use(compression());
  app.use(
    pinoHttp({
      logger,
      autoLogging: {
        ignore: (req: Request) => ['/favicon.ico'].includes(req.url)
      },
      customLogLevel: (_req: Request, res: Response, err?: Error): LevelWithSilent => {
        if (res.statusCode >= 400 && res.statusCode < 500) {
          return 'warn';
        }
        if (res.statusCode >= 500 || err) {
          return 'error';
        }
        return 'info';
      }
    })
  );

  // Routes

  // handle asset requests
  if (viteDevServer) {
    app.use(viteDevServer.middlewares);
  } else {
    // Vite fingerprints its assets so we can cache forever.
    app.use('/assets', express.static('build/client/assets', { immutable: true, maxAge: '1y' }));

    // Everything else (like favicon.ico) is cached for an hour.
    app.use(express.static('build/client', { maxAge: '1h' }));
  }

  // handle SSR requests
  app.all(
    '*',
    createRequestHandler({
      build: remixApp,
      getLoadContext: () => {
        return { logger, db };
      }
    })
  );

  // Error handling middleware
  app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    // log the error
    req.log.error(err);

    // send the error response
    if (createError.isHttpError(err)) {
      res.status(err.statusCode).json({ code: err.statusCode, message: err.message });
    } else {
      res.status(500).json({ code: 500, message: 'Internal server error' });
    }
  });

  return app;
};
