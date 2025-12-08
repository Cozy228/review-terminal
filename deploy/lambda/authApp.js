import { Hono } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import { cors } from 'hono/cors';
import pino from 'pino';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

// Initialize logger
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

// Initialize Secrets Manager client
const secretsClient = new SecretsManagerClient({ region: process.env.AWS_REGION || 'us-east-1' });

// Cache for secrets to avoid repeated API calls
const secretsCache = {};

/**
 * Fetch secret from AWS Secrets Manager with caching
 */
async function getSecret(secretArn) {
  if (secretsCache[secretArn]) {
    return secretsCache[secretArn];
  }

  try {
    const command = new GetSecretValueCommand({ SecretId: secretArn });
    const response = await secretsClient.send(command);
    const secret = response.SecretString;
    secretsCache[secretArn] = secret;
    return secret;
  } catch (error) {
    logger.error({ error, secretArn }, 'Failed to fetch secret from Secrets Manager');
    throw error;
  }
}

/**
 * Initialize and configure the Hono application
 */
const app = new Hono();

// OAuth scope for GitHub
const scope = 'read:user user:email';

// Get environment variables
const frontendOrigin = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';
const gheBaseUrl = process.env.GHE_BASE_URL || 'https://github.com';

logger.info({
  FRONTEND_BASE_URL: frontendOrigin,
  GHE_BASE_URL: gheBaseUrl,
  AUTH_REDIRECT_URI: process.env.AUTH_REDIRECT_URI,
  NODE_ENV: process.env.NODE_ENV
}, 'Lambda auth app initializing');

// CORS middleware
app.use('*', cors({
  origin: frontendOrigin,
  credentials: true,
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
}));

// Logging middleware
app.use('*', async (c, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  logger.info({
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    ms
  }, 'http request');
});

// Health check endpoint
app.get('/healthz', (c) => {
  return c.text('ok');
});

// GitHub Enterprise OAuth authorize endpoint
app.get('/auth/github-enterprise/authorize', async (c) => {
  try {
    const baseUrl = gheBaseUrl;

    // Get client ID from Secrets Manager
    let clientId;
    const clientIdSecretArn = process.env.GHE_CLIENT_ID_SECRET_ARN;

    if (clientIdSecretArn) {
      clientId = await getSecret(clientIdSecretArn);
    } else {
      // Fallback to environment variable (for testing)
      clientId = process.env.GHE_CLIENT_ID || '';
    }

    const redirectUri = process.env.AUTH_REDIRECT_URI;

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
  } catch (error) {
    logger.error({ error }, 'Error in authorize endpoint');
    return c.json({ error: 'internal_server_error' }, 500);
  }
});

// GitHub Enterprise OAuth callback endpoint
app.get('/auth/github-enterprise/callback', async (c) => {
  try {
    const reqUrl = new URL(c.req.url);
    const incomingState = reqUrl.searchParams.get('state');
    const code = reqUrl.searchParams.get('code');
    const error = reqUrl.searchParams.get('error') || '';
    const storedState = getCookie(c, 'ghe_state');
    const frontendBase = frontendOrigin;
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

        // Get credentials from Secrets Manager
        let clientId, clientSecret;

        const clientIdSecretArn = process.env.GHE_CLIENT_ID_SECRET_ARN;
        const clientSecretSecretArn = process.env.GHE_CLIENT_SECRET_SECRET_ARN;

        if (clientIdSecretArn && clientSecretSecretArn) {
          clientId = await getSecret(clientIdSecretArn);
          clientSecret = await getSecret(clientSecretSecretArn);
        } else {
          // Fallback to environment variables (for testing)
          clientId = process.env.GHE_CLIENT_ID;
          clientSecret = process.env.GHE_CLIENT_SECRET;
        }

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
  } catch (error) {
    logger.error({ error }, 'Error in callback endpoint');
    return c.json({ error: 'internal_server_error' }, 500);
  }
});

// Export the app for Lambda handler
export { app };
