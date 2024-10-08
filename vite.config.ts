import { vitePlugin as remix } from '@remix-run/dev';
import { defineConfig, type UserConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import esbuild from 'esbuild';

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true
      },
      serverBuildFile: 'remix-app.js',
      appDirectory: 'src/app',
      buildEnd: async () => {
        try {
          await esbuild.build({
            outfile: 'build/server/server.js',
            entryPoints: ['src/server/server.ts'],
            external: ['./build/server/*'],
            platform: 'node',
            format: 'esm',
            packages: 'external',
            bundle: true,
            logLevel: 'info'
          });
        } catch (error) {
          console.error('Error building server:', error);
          process.exit(1);
        }
      }
    }),
    tsconfigPaths()
  ]
}) satisfies UserConfig;
