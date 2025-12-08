/**
 * Production Server for Review Terminal
 *
 * This server runs in a Docker container and serves:
 * - Static frontend files from /dist
 * - Auth API endpoints on /auth/*
 * - Health check endpoint on /healthz
 *
 * All on a single port (8080) for simplified deployment
 */

import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { getCookie, setCookie } from 'hono/cookie';
import pino from 'pino';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize logger
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

// Initialize Hono app
const app = new Hono();

// Configuration
const port = Number(process.env.PORT || 8080);
const scope = 'read:user user:email';
const gheBaseUrl = process.env.GHE_BASE_URL || 'https://github.com';
const frontendBaseUrl = process.env.FRONTEND_BASE_URL || `http://localhost:${port}`;

logger.info({
  PORT: port,
  NODE_ENV: process.env.NODE_ENV,
  GHE_BASE_URL: gheBaseUrl,
  FRONTEND_BASE_URL: frontendBaseUrl,
  AUTH_REDIRECT_URI: process.env.AUTH_REDIRECT_URI,
  CLIENT_ID_PRESENT: !!process.env.GHE_CLIENT_ID,
}, 'Production server starting');

// Logging middleware
app.use('*', async (c, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;

  // Only log non-static file requests to reduce noise
  if (!c.req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
    logger.info({
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      ms
    }, 'http request');
  }

  await next();
});

// ============================================
// API Routes
// ============================================

// Health check endpoint (for Docker healthcheck and load balancers)
app.get('/healthz', (c) => {
  return c.text('ok');
});

// GitHub Enterprise OAuth authorize endpoint
app.get('/auth/github-enterprise/authorize', (c) => {
  const baseUrl = gheBaseUrl;
  const clientId = process.env.GHE_CLIENT_ID || '';
  const redirectUri = process.env.AUTH_REDIRECT_URI || `http://localhost:${port}/auth/github-enterprise/callback`;

  // Generate and store state for CSRF protection
  const state = crypto.randomUUID();

  setCookie(c, 'ghe_state', state, {
    httpOnly: true,
    sameSite: 'Lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 300, // 5 minutes
  });

  // Build OAuth authorization URL
  const url = new URL(`${baseUrl}/login/oauth/authorize`);
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('state', state);
  url.searchParams.set('scope', scope);

  if (!clientId) {
    logger.warn('Missing GHE_CLIENT_ID. Authorize URL will not work.');
    return c.json({ error: 'missing_client_id' }, 400);
  }

  logger.info({
    redirectUri,
    baseUrl,
    clientId_present: !!clientId
  }, 'generated authorize url');

  return c.json({ url: url.toString() });
});

// GitHub Enterprise OAuth callback endpoint
app.get('/auth/github-enterprise/callback', async (c) => {
  const reqUrl = new URL(c.req.url);
  const incomingState = reqUrl.searchParams.get('state');
  const code = reqUrl.searchParams.get('code');
  const error = reqUrl.searchParams.get('error') || '';
  const storedState = getCookie(c, 'ghe_state');
  const frontendBase = frontendBaseUrl;
  const callbackPath = process.env.VITE_AUTH_CALLBACK_PATH || '/auth/callback';

  const target = new URL(callbackPath, frontendBase);

  if (error) {
    target.searchParams.set('error', error);
  } else if (!incomingState || !storedState || incomingState !== storedState) {
    logger.warn({ incomingState, storedState }, 'OAuth state mismatch');
    target.searchParams.set('error', 'state_mismatch');
  } else if (code) {
    // Exchange code for access token
    try {
      const gheBase = gheBaseUrl;
      const clientId = process.env.GHE_CLIENT_ID;
      const clientSecret = process.env.GHE_CLIENT_SECRET;

      const tokenUrl = `${gheBase}/login/oauth/access_token`;
      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code: code,
        }),
      });

      const tokenData = await tokenResponse.json();

      if (tokenData.access_token) {
        // Get user info from GitHub API
        const apiUrl = gheBase.includes('github.com')
          ? 'https://api.github.com/user'
          : `${gheBase}/api/v3/user`; // GitHub Enterprise uses /api/v3

        const userResponse = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
            'Accept': 'application/json',
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

  // Clear the state cookie
  setCookie(c, 'ghe_state', '', { path: '/', maxAge: 0 });

  const redirectTarget = target.toString();
  logger.info({
    redirectTarget,
    error: target.searchParams.get('error')
  }, 'callback redirect');

  return c.redirect(redirectTarget, 302);
});

// ============================================
// Static File Serving
// ============================================

// Serve static files from dist directory
// This serves all CSS, JS, images, and other assets
app.use('/*', serveStatic({
  root: './dist',
  onNotFound: (path, c) => {
    // Don't log 404s for static files, will be handled by SPA fallback
  }
}));

// SPA fallback - serve index.html for all non-API routes
// This enables client-side routing to work properly
app.get('*', async (c) => {
  try {
    const indexPath = join(__dirname, '..', '..', 'dist', 'index.html');
    const html = readFileSync(indexPath, 'utf-8');
    return c.html(html);
  } catch (error) {
    logger.error({ error }, 'Failed to serve index.html');
    return c.text('Internal Server Error', 500);
  }
});

// ============================================
// Start Server
// ============================================

serve({
  fetch: app.fetch,
  port,
});

logger.info({ port }, '🚀 Production server listening');
logger.info('Routes:');
logger.info('  GET /healthz - Health check');
logger.info('  GET /auth/github-enterprise/authorize - OAuth authorize');
logger.info('  GET /auth/github-enterprise/callback - OAuth callback');
logger.info('  GET /* - Static files + SPA fallback');
