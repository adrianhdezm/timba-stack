import '@remix-run/node';
import type { DataFunctionArgs } from '@remix-run/node';
import type { Logger } from 'pino';

declare module '@remix-run/node' {
  export interface LoaderArgs extends DataFunctionArgs {
    context: { logger: Logger };
  }

  export interface ActionArgs extends DataFunctionArgs {
    context: { logger: Logger };
  }
}
