import '@remix-run/node';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { Pool } from 'pg';
import type { Logger } from 'pino';

declare module '@remix-run/node' {
  export interface AppLoadContext {
    logger: Logger;
    db: NodePgDatabase<Record<string, never>> & { $client: Pool };
  }

  export interface LoaderFunctionArgs {
    context: AppLoadContext;
  }

  export interface ActionFunctionArgs {
    context: AppLoadContext;
  }
}
