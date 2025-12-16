import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const DEFAULT_OG_MAX_AGE_SECONDS = 60 * 60 * 24;

const OG_CACHE_MAX_ITEMS = Number(process.env.OG_CACHE_MAX_ITEMS || 200);
const OG_CACHE_TTL_MS = Number(process.env.OG_CACHE_TTL_MS || DEFAULT_OG_MAX_AGE_SECONDS * 1000);

const ogImageCache = new Map();

const trimTrailingSlashes = (value) => value.replace(/\/+$/g, '');
const trimLeadingSlashes = (value) => value.replace(/^\/+/g, '');

const joinUrl = (baseUrl, path) => `${trimTrailingSlashes(baseUrl)}/${trimLeadingSlashes(path)}`;

const normalizeBaseUrl = (raw, fallbackOrigin) => {
  const value = String(raw || '').trim();
  if (!value) return trimTrailingSlashes(fallbackOrigin);

  if (value.startsWith('/')) {
    return trimTrailingSlashes(new URL(value, fallbackOrigin).toString());
  }

  try {
    return trimTrailingSlashes(new URL(value).toString());
  } catch {
    return trimTrailingSlashes(new URL(`/${value}`, fallbackOrigin).toString());
  }
};

const getRequestOrigin = (c) => {
  const forwardedProto = c.req.header('x-forwarded-proto');
  const forwardedHost = c.req.header('x-forwarded-host');
  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  const host = c.req.header('host');
  if (host) {
    const proto = forwardedProto || new URL(c.req.url).protocol.replace(':', '');
    return `${proto}://${host}`;
  }

  return new URL(c.req.url).origin;
};

const escapeHtmlAttr = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const isCrawlerUserAgent = (userAgent) => {
  const ua = (userAgent || '').toLowerCase();
  if (!ua) return false;

  return [
    'bot',
    'crawler',
    'spider',
    'preview',
    'facebookexternalhit',
    'twitterbot',
    'linkedinbot',
    'slackbot',
    'discordbot',
    'whatsapp',
    'telegrambot',
    'vkshare',
    'embedly',
  ].some((token) => ua.includes(token));
};

const fnv1a32 = (text) => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
};

const mulberry32 = (seed) => {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

const buildOgData = (reportId) => {
  const seed = fnv1a32(reportId);
  const rand = mulberry32(seed);

  const score = Math.floor(72 + rand() * 26);
  const growth = Math.floor(6 + rand() * 28);
  const percentile = Math.floor(80 + rand() * 19);

  const name = reportId.replace(/\s+/g, ' ').trim().slice(0, 28) || 'guest';

  return {
    reportId,
    displayName: name,
    score,
    growth,
    percentile,
  };
};

let cachedFonts = null;

const loadFonts = (logger) => {
  if (cachedFonts) return cachedFonts;

  const fontsDir = join(process.cwd(), 'server', 'assets', 'fonts');
  const regularPath = join(fontsDir, 'JetBrainsMono-Regular.ttf');
  const boldPath = join(fontsDir, 'JetBrainsMono-Bold.ttf');

  try {
    const regular = readFileSync(regularPath);
    const bold = readFileSync(boldPath);
    cachedFonts = [
      { name: 'JetBrains Mono', data: regular, weight: 400, style: 'normal' },
      { name: 'JetBrains Mono', data: bold, weight: 700, style: 'normal' },
    ];
    return cachedFonts;
  } catch (error) {
    logger?.error?.({ error, fontsDir }, 'OG fonts missing; ensure server/assets/fonts are shipped');
    throw error;
  }
};

const buildOgSvg = async ({ displayName, score, growth, percentile }, fonts) => {
  const subtitle = `Top ${percentile}% this year`;
  const growthText = `Power Growth +${growth}%`;

  return satori(
    {
      type: 'div',
      props: {
        style: {
          width: OG_WIDTH,
          height: OG_HEIGHT,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 64,
          backgroundColor: '#0a0e1a',
          backgroundImage:
            'linear-gradient(135deg, rgba(88,166,255,0.18), rgba(210,168,255,0.10) 40%, rgba(251,81,73,0.06) 85%)',
          border: '8px solid rgba(255,255,255,0.06)',
          color: '#e6edf3',
          fontFamily: '"JetBrains Mono"',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: 22,
                      letterSpacing: 4,
                      color: 'rgba(230,237,243,0.78)',
                      textTransform: 'uppercase',
                    },
                    children: 'Review Terminal',
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: 18,
                      letterSpacing: 2,
                      color: 'rgba(230,237,243,0.60)',
                    },
                    children: new Date().getFullYear().toString(),
                  },
                },
              ],
            },
          },
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: 52,
                      fontWeight: 700,
                      lineHeight: 1.1,
                      color: '#e6edf3',
                    },
                    children: `${displayName}'s Yearly Review`,
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: 26,
                      color: 'rgba(230,237,243,0.74)',
                    },
                    children: subtitle,
                  },
                },
              ],
            },
          },
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                    },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: 18,
                            letterSpacing: 2,
                            color: 'rgba(230,237,243,0.62)',
                            textTransform: 'uppercase',
                          },
                          children: 'Final Score',
                        },
                      },
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: 120,
                            fontWeight: 700,
                            lineHeight: 0.9,
                            letterSpacing: 2,
                            color: '#ffd700',
                            textShadow: '0 6px 0 rgba(0,0,0,0.35)',
                          },
                          children: String(score),
                        },
                      },
                    ],
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: 10,
                      padding: '14px 16px',
                      border: '3px solid rgba(255,255,255,0.10)',
                      backgroundColor: 'rgba(20,25,37,0.65)',
                    },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: { fontSize: 18, color: 'rgba(230,237,243,0.78)' },
                          children: growthText,
                        },
                      },
                      {
                        type: 'div',
                        props: {
                          style: { fontSize: 16, color: 'rgba(230,237,243,0.54)' },
                          children: 'Open the link to view the full report',
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      fonts,
    }
  );
};

const buildOgPng = async (reportId, logger) => {
  const ogData = buildOgData(reportId);
  const fonts = loadFonts(logger);
  const svg = await buildOgSvg(ogData, fonts);
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'original' },
    background: 'rgba(0,0,0,0)',
  });
  return resvg.render().asPng();
};

const getCachedOgPng = (reportId) => {
  const cached = ogImageCache.get(reportId);
  if (!cached) return null;

  const isExpired = Date.now() - cached.createdAt > OG_CACHE_TTL_MS;
  if (isExpired) {
    ogImageCache.delete(reportId);
    return null;
  }

  return cached.png;
};

const putCachedOgPng = (reportId, png) => {
  ogImageCache.set(reportId, { createdAt: Date.now(), png });

  if (ogImageCache.size <= OG_CACHE_MAX_ITEMS) return;
  const oldestKey = ogImageCache.keys().next().value;
  if (oldestKey) ogImageCache.delete(oldestKey);
};

const buildShadowHtml = ({
  title,
  description,
  imageUrl,
  canonicalUrl,
  redirectUrl,
  includeRedirectScript,
}) => {
  const safeTitle = escapeHtmlAttr(title);
  const safeDescription = escapeHtmlAttr(description);
  const safeImage = escapeHtmlAttr(imageUrl);
  const safeCanonical = escapeHtmlAttr(canonicalUrl);

  const redirectScript = includeRedirectScript
    ? `<script>window.location.replace(${JSON.stringify(redirectUrl)});</script>`
    : '';
  const linkFallback = includeRedirectScript
    ? `<p style="font-family: monospace; color: #8b949e; padding: 16px;">Redirecting... <a href="${escapeHtmlAttr(redirectUrl)}" style="color: #58a6ff;">Continue</a></p>`
    : `<p style="font-family: monospace; color: #8b949e; padding: 16px;">Preview generated.</p>`;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDescription}" />
    <meta property="og:image" content="${safeImage}" />
    <meta property="og:image:width" content="${OG_WIDTH}" />
    <meta property="og:image:height" content="${OG_HEIGHT}" />
    <meta property="og:url" content="${safeCanonical}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDescription}" />
    <meta name="twitter:image" content="${safeImage}" />
    <link rel="canonical" href="${safeCanonical}" />
    <title>${safeTitle}</title>
  </head>
  <body style="margin:0;background:#0a0e1a;">
    ${linkFallback}
    ${redirectScript}
  </body>
</html>`;
};

export const registerShareRoutes = (app, { logger } = {}) => {
  app.get('/share/card/:reportId', (c) => {
    const reportId = c.req.param('reportId') || 'guest';
    const userAgent = c.req.header('user-agent');
    const isCrawler = isCrawlerUserAgent(userAgent);

    const requestOrigin = getRequestOrigin(c);
    const backendBaseUrl = normalizeBaseUrl(process.env.APP_BASE_URL, requestOrigin);
    const frontendBaseUrl = normalizeBaseUrl(process.env.FRONTEND_BASE_URL, requestOrigin);

    const canonicalUrl = joinUrl(backendBaseUrl, `share/card/${encodeURIComponent(reportId)}`);
    const imageUrl = joinUrl(backendBaseUrl, `api/og-image/${encodeURIComponent(reportId)}.png`);
    const redirectUrl = joinUrl(frontendBaseUrl, `report/view/${encodeURIComponent(reportId)}`);

    const og = buildOgData(reportId);
    const title = `${og.displayName}'s Yearly Review`;
    const description = `Final Score ${og.score}. ${og.growth >= 0 ? '+' : ''}${og.growth}% power growth.`;

    const html = buildShadowHtml({
      title,
      description,
      imageUrl,
      canonicalUrl,
      redirectUrl,
      includeRedirectScript: !isCrawler,
    });

    return c.html(html, 200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    });
  });

  app.get('/api/og-image/:reportId{[^/]+\\.png}', async (c) => {
    const reportIdWithSuffix = c.req.param('reportId') || 'guest.png';
    const reportId = reportIdWithSuffix.endsWith('.png')
      ? reportIdWithSuffix.slice(0, -4)
      : reportIdWithSuffix;

    const cached = getCachedOgPng(reportId);
    if (cached) {
      return c.body(cached, 200, {
        'Content-Type': 'image/png',
        'Cache-Control': `public, max-age=${DEFAULT_OG_MAX_AGE_SECONDS}, immutable`,
      });
    }

    try {
      const png = await buildOgPng(reportId, logger);
      putCachedOgPng(reportId, png);
      return c.body(png, 200, {
        'Content-Type': 'image/png',
        'Cache-Control': `public, max-age=${DEFAULT_OG_MAX_AGE_SECONDS}, immutable`,
      });
    } catch (error) {
      logger?.error?.({ error, reportId }, 'failed to generate OG image');
      return c.text('OG image generation failed', 500);
    }
  });
};
