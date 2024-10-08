import { createRequestHandler } from '@remix-run/express';
import type { ServerBuild } from '@remix-run/node';
import compression from 'compression';
import cors from 'cors';
import express, { type Application, type Request, type Response } from 'express';
import helmet from 'helmet';
import type { LevelWithSilent } from 'pino';
import pinoHttp from 'pino-http';
import type { ViteDevServer } from 'vite';

import { logger } from './logger';

export const createApp = async ({ viteDevServer }: { viteDevServer: ViteDevServer | null }): Promise<Application> => {
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
  const remixApp = (
    viteDevServer
      ? () => viteDevServer.ssrLoadModule('virtual:remix/server-build')
      : // @ts-expect-error - the file might not exist yet but it will
        await import('./remix-app.js').catch(() => ({}))
  ) as ServerBuild | (() => Promise<ServerBuild>);

  const remixHandler = createRequestHandler({
    build: remixApp,
    getLoadContext: () => {
      return { logger };
    }
  });
  app.all('*', remixHandler);

  return app;
};
