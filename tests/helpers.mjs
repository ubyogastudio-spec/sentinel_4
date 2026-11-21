import fs from 'node:fs/promises';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { createApp } from '../functions/app.js';

export function makeMemoryRepo({ failOnWrite = false, failOnPing = false } = {}) {
  const contacts = [];
  const quotes = [];
  const seenContactIds = new Set();
  const seenQuoteIds = new Set();

  return {
    contacts,
    quotes,
    async init() {},
    async ping() {
      if (failOnPing) throw new Error('db down');
    },
    async close() {},
    async createContactMessage(entry) {
      if (failOnWrite) throw new Error('write failed');
      if (seenContactIds.has(entry.requestId)) return;
      seenContactIds.add(entry.requestId);
      contacts.push(entry);
    },
    async createQuoteRequest(entry) {
      if (failOnWrite) throw new Error('write failed');
      if (seenQuoteIds.has(entry.requestId)) return;
      seenQuoteIds.add(entry.requestId);
      quotes.push(entry);
    },
  };
}

export async function withTestServer(options, fn) {
  const distDir = options.distDir ?? (await fs.mkdtemp(path.join(os.tmpdir(), 'sentinel-dist-')));
  const ownDist = !options.distDir;
  if (ownDist && options.isProduction) {
    await fs.writeFile(path.join(distDir, 'index.html'), '<!doctype html><html><body>SENTINEL</body></html>');
  }

  const app = createApp({
    repo: options.repo ?? makeMemoryRepo(),
    isDbReady: options.isDbReady ?? (() => true),
    distDir,
    isProduction: options.isProduction ?? false,
  });

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const addr = server.address();
  const baseUrl = `http://127.0.0.1:${addr.port}`;

  try {
    await fn({ baseUrl });
  } finally {
    await new Promise((resolve) => server.close(resolve));
    if (ownDist) {
      await fs.rm(distDir, { recursive: true, force: true });
    }
  }
}
