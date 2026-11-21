import path from 'node:path';
import express from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { isKnownRoute } from '../shared/routes.js';
import { contactHandler, quoteHandler } from './api/forms.js';
import { errorCode } from './lib/errorCode.js';

/**
 * Builds the Express app. server.ts supplies the real repository and Vite; tests supply fakes.
 * @param {{ repo: object, isDbReady: () => boolean, distDir: string, isProduction: boolean, devMiddleware?: import('express').RequestHandler }} options
 */
export function createApp({ repo, isDbReady, distDir, isProduction, devMiddleware }) {
  const app = express();
  app.set('trust proxy', 1);
  app.use(
    helmet({
      contentSecurityPolicy: false, // fonts, the Spline scene and the 3D models come from other hosts
      frameguard: false, // the AI Studio preview runs the app inside an iframe
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: false,
    }),
  );

  const formLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (_req, res) => res.status(429).json({ ok: false, code: 'rate_limited' }),
  });

  app.use('/api', express.json({ limit: '16kb' }));
  app.get('/api/health', async (_req, res) => {
    try {
      if (!isDbReady()) throw new Error('not ready');
      await repo.ping();
      return res.json({ ok: true });
    } catch {
      return res.status(503).json({ ok: false, code: 'unavailable' });
    }
  });
  app.post('/api/contact', formLimiter, contactHandler(repo, isDbReady));
  app.post('/api/quote', formLimiter, quoteHandler(repo, isDbReady));
  app.use('/api', (_req, res) => res.status(404).json({ ok: false, code: 'not_found' }));

  if (isProduction) {
    app.use('/assets', express.static(path.join(distDir, 'assets'), { immutable: true, maxAge: '1y' }));
    app.use(express.static(distDir, { index: false, maxAge: '1h' })); // includes /models and the favicon
    app.use((req, res, next) => {
      if ((req.method !== 'GET' && req.method !== 'HEAD') || path.extname(req.path)) return next();
      res.setHeader('Cache-Control', 'no-cache');
      // The client router draws the themed 404; the status code tells crawlers the page does not exist.
      return res.status(isKnownRoute(req.path) ? 200 : 404).sendFile(path.join(distDir, 'index.html'), { dotfiles: 'deny' });
    });
  } else if (devMiddleware) {
    app.use(devMiddleware);
  }
  app.use((_req, res) => res.status(404).type('text/plain').send('Not found'));

  // eslint-disable-next-line no-unused-vars
  app.use((error, req, res, _next) => {
    let status = 500;
    let code = 'server_error';
    if (error?.type === 'entity.too.large') [status, code] = [413, 'payload_too_large'];
    else if (error?.type === 'entity.parse.failed') [status, code] = [400, 'invalid_json'];
    if (status === 500) console.error(`[server] ${errorCode(error)}`);
    if (req.path.startsWith('/api')) return res.status(status).json({ ok: false, code });
    return res.status(status).type('text/plain').send(code);
  });

  return app;
}
