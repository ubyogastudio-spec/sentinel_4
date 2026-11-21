import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { RequestHandler } from 'express';
import { createApp } from './functions/app.js';
import { errorCode } from './functions/lib/errorCode.js';
import { createRepository } from './functions/repository/index.js';

const root = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';
const port = Number(process.env.PORT) || 3000;

const repo = createRepository(process.env);
let dbReady = false;

// The site starts at once and serves every page; the database connects in the background and retries.
function connectDatabase(attempt = 0): void {
  repo.init().then(
    () => {
      dbReady = true;
    },
    (error: unknown) => {
      console.error(`[db:init] ${errorCode(error)}`);
      setTimeout(() => connectDatabase(attempt + 1), Math.min(2000 * 2 ** attempt, 30000));
    },
  );
}

async function main(): Promise<void> {
  let devMiddleware: RequestHandler | undefined;
  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({ server: { middlewareMode: true }, appType: 'spa' });
    devMiddleware = vite.middlewares;
  }

  const app = createApp({
    repo,
    isDbReady: () => dbReady,
    distDir: path.join(root, 'dist'),
    isProduction,
    devMiddleware,
  });
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`[server] listening on ${port}`);
  });
  connectDatabase();

  process.on('SIGTERM', () => {
    server.close(() => {
      void repo.close().finally(() => process.exit(0));
    });
  });
}

void main();
