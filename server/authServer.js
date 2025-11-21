import dotenv from 'dotenv';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { getCookie, setCookie } from 'hono/cookie';
import { cors } from 'hono/cors';
import pino from 'pino';

const envLoaded = dotenv.config({ path: '.env.local' });
if (envLoaded.error) {
  dotenv.config();
}

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const app = new Hono();
const port = Number(process.env.PORT || 3000);
const scope = 'read:user user:email';
const frontendOrigin = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';

logger.info({
  FRONTEND_BASE_URL: frontendOrigin,
  GHE_BASE_URL: process.env.GHE_BASE_URL,
  AUTH_REDIRECT_URI: process.env.AUTH_REDIRECT_URI,
  CLIENT_ID_PRESENT: !!process.env.GHE_CLIENT_ID
}, 'env loaded');

app.use('*', cors({
  origin: frontendOrigin,
  credentials: true,
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
}));
app.use('*', async (c, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  logger.info({ method: c.req.method, path: c.req.path, status: c.res.status, ms }, 'http');
});

app.get('/healthz', (c) => c.text('ok'));

app.get('/auth/github-enterprise/authorize', (c) => {
  const baseUrl = process.env.GHE_BASE_URL || 'https://github.com';
  const clientId = process.env.GHE_CLIENT_ID || '';
  const redirectUri = process.env.AUTH_REDIRECT_URI || `http://localhost:${port}/auth/github-enterprise/callback`;
  logger.info({clientId},':clientId' )
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

  logger.info({ redirectUri, baseUrl, clientId_present: !!clientId }, 'generated authorize url');
  return c.json({ url: url.toString() });
});

app.get('/auth/github-enterprise/callback', async (c) => {
  const reqUrl = new URL(c.req.url);
  const incomingState = reqUrl.searchParams.get('state');
  const code = reqUrl.searchParams.get('code');
  const error = reqUrl.searchParams.get('error') || '';
  const storedState = getCookie(c, 'ghe_state');
  const frontendBase = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';
  const callbackPath = process.env.VITE_AUTH_CALLBACK_PATH || '/auth/callback';

  const target = new URL(callbackPath, frontendBase);

  if (error) {
    target.searchParams.set('error', error);
  } else if (!incomingState || !storedState || incomingState !== storedState) {
    target.searchParams.set('error', 'state_mismatch');
  } else if (code) {
    // Exchange code for access token and get user info
    try {
      const gheBase = process.env.GHE_BASE_URL || 'https://github.com';
      const clientId = process.env.GHE_CLIENT_ID;
      const clientSecret = process.env.GHE_CLIENT_SECRET;
      
      // Exchange code for token
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
  logger.info({ redirectTarget, error: target.searchParams.get('error') }, 'callback redirect');
  return c.redirect(redirectTarget, 302);
});

serve({
  fetch: app.fetch,
  port,
});
logger.info({ port }, 'auth server listening');
