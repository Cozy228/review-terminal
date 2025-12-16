/**
 * Production server that serves:
 * - Static frontend files from ./dist (with precompressed .br/.gz support)
 * - Auth API endpoints on /auth/*
 * - Health check endpoint on /healthz
 *
 * All on a single port for simplified deployment.
 */

import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { getCookie, setCookie } from 'hono/cookie';
import pino from 'pino';
import { readFileSync } from 'fs';
import { join } from 'path';
import { registerShareRoutes } from './shareRoutes.js';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const app = new Hono();

const port = Number(process.env.PORT || 8080);
const scope = 'read:user user:email';

const distDir = join(process.cwd(), 'dist');
const indexHtmlPath = join(distDir, 'index.html');
let cachedIndexHtml = null;

try {
  cachedIndexHtml = readFileSync(indexHtmlPath, 'utf-8');
} catch (error) {
  logger.warn({ error, indexHtmlPath }, 'index.html not readable at startup');
}

logger.info(
  {
    PORT: port,
    NODE_ENV: process.env.NODE_ENV,
    DIST_DIR: distDir,
    GHE_BASE_URL: process.env.GHE_BASE_URL,
    AUTH_REDIRECT_URI: process.env.AUTH_REDIRECT_URI,
    CLIENT_ID_PRESENT: !!process.env.GHE_CLIENT_ID,
  },
  'Production server starting'
);

app.use('*', async (c, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;

  if (!c.req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
    logger.info(
      {
        method: c.req.method,
        path: c.req.path,
        status: c.res.status,
        ms,
      },
      'http request'
    );
  }
});

app.get('/healthz', (c) => c.text('ok'));

registerShareRoutes(app, { logger });

app.get('/auth/github-enterprise/authorize', (c) => {
  const baseUrl = process.env.GHE_BASE_URL || 'https://github.com';
  const clientId = process.env.GHE_CLIENT_ID || '';

  const origin = new URL(c.req.url).origin;
  const redirectUri =
    process.env.AUTH_REDIRECT_URI || `${origin}/auth/github-enterprise/callback`;

  const state = crypto.randomUUID();
  setCookie(c, 'ghe_state', state, {
    httpOnly: true,
    sameSite: 'Lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 300,
  });

  const url = new URL(`${baseUrl}/login/oauth/authorize`);
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('state', state);
  url.searchParams.set('scope', scope);

  if (!clientId) {
    logger.warn('Missing GHE_CLIENT_ID. Authorize URL will not work.');
    return c.json({ error: 'missing_client_id' }, 400);
  }

  logger.info(
    { redirectUri, baseUrl, clientId_present: !!clientId },
    'generated authorize url'
  );
  return c.json({ url: url.toString() });
});

app.get('/auth/github-enterprise/callback', async (c) => {
  const reqUrl = new URL(c.req.url);
  const incomingState = reqUrl.searchParams.get('state');
  const code = reqUrl.searchParams.get('code');
  const error = reqUrl.searchParams.get('error') || '';
  const storedState = getCookie(c, 'ghe_state');

  const origin = new URL(c.req.url).origin;
  const frontendBase = process.env.FRONTEND_BASE_URL || origin;
  const callbackPath = process.env.VITE_AUTH_CALLBACK_PATH || '/auth/callback';
  const target = new URL(callbackPath, frontendBase);

  if (error) {
    target.searchParams.set('error', error);
  } else if (!incomingState || !storedState || incomingState !== storedState) {
    logger.warn({ incomingState, storedState }, 'OAuth state mismatch');
    target.searchParams.set('error', 'state_mismatch');
  } else if (code) {
    try {
      const gheBase = process.env.GHE_BASE_URL || 'https://github.com';
      const clientId = process.env.GHE_CLIENT_ID;
      const clientSecret = process.env.GHE_CLIENT_SECRET;

      const tokenUrl = `${gheBase}/login/oauth/access_token`;
      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
        }),
      });

      const tokenData = await tokenResponse.json();
      if (tokenData.access_token) {
        const apiUrl = gheBase.includes('github.com')
          ? 'https://api.github.com/user'
          : `${gheBase}/api/v3/user`;

        const userResponse = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
            Accept: 'application/json',
          },
        });

        const userData = await userResponse.json();
        target.searchParams.set('ok', 'true');
        target.searchParams.set('user', userData.login || 'user');
        logger.info({ user: userData.login, apiUrl }, 'user authenticated');
      } else {
        logger.error({ tokenData }, 'Failed to get access token');
        target.searchParams.set('error', 'token_exchange_failed');
      }
    } catch (err) {
      logger.error({ err }, 'failed to exchange code or fetch user');
      target.searchParams.set('error', 'auth_failed');
    }
  } else {
    target.searchParams.set('ok', 'true');
  }

  setCookie(c, 'ghe_state', '', { path: '/', maxAge: 0 });
  const redirectTarget = target.toString();
  logger.info(
    { redirectTarget, error: target.searchParams.get('error') },
    'callback redirect'
  );
  return c.redirect(redirectTarget, 302);
});

app.use(
  '/*',
  serveStatic({
    root: distDir,
    precompressed: true,
    onNotFound: () => {
      // 404s will be handled by SPA fallback.
    },
  })
);

app.get('*', (c) => {
  try {
    if (cachedIndexHtml) {
      return c.html(cachedIndexHtml);
    }

    const html = readFileSync(indexHtmlPath, 'utf-8');
    cachedIndexHtml = html;
    return c.html(html);
  } catch (error) {
    logger.error({ error, indexHtmlPath }, 'Failed to serve index.html');
    return c.text('Internal Server Error', 500);
  }
});

serve({
  fetch: app.fetch,
  port,
});

logger.info({ port }, 'Production server listening');
