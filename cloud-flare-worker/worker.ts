/**
 * Spark Hub Studio — Cloudflare Worker
 *
 * Human visitors:
 *   Worker → static React SPA
 *
 * Bots / crawlers:
 *   Worker → API /render/... → server-rendered HTML
 *
 * Sitemap:
 *   Worker → API /sitemap.xml
 *
 * API:
 *   Worker → API backend
 */

export interface Env {
  API_BASE_URL: string;
  ASSETS: Fetcher;
}

/**
 * Crawlers, search engines, AI crawlers and link-preview bots.
 */
const BOT_UA_PATTERN =
  /bot|crawl|spider|slurp|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|slackbot|discordbot|embedly|quora link preview|pinterest|redditbot|applebot|petalbot|gptbot|claudebot|anthropic|perplexitybot|ccbot|bytespider|amazonbot|google-extended|omgili/i;

const ADMIN_PATHS = ['/admin', '/sign-in', '/sign-up'];

function isBot(request: Request): boolean {
  const userAgent = request.headers.get('User-Agent') || '';
  return BOT_UA_PATTERN.test(userAgent);
}

function isAdminPath(pathname: string): boolean {
  return ADMIN_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    /**
     * ---------------------------------------------------------
     * 1. Sitemap
     * ---------------------------------------------------------
     */
    if (url.pathname === '/sitemap.xml') {
      const sitemapUrl = new URL('/sitemap.xml', env.API_BASE_URL);

      const upstream = await fetch(sitemapUrl, {
        headers: {
          'User-Agent':
            request.headers.get('User-Agent') || 'SparkHub-Worker',
        },
      });

      const headers = new Headers(upstream.headers);
      headers.set('Content-Type', 'application/xml; charset=utf-8');
      headers.set(
        'Cache-Control',
        'public, max-age=300, s-maxage=300'
      );

      return new Response(upstream.body, {
        status: upstream.status,
        headers,
      });
    }

    /**
     * ---------------------------------------------------------
     * 2. Proxy /api/* to backend
     * ---------------------------------------------------------
     */
    if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
      const apiUrl = new URL(
        `${url.pathname}${url.search}`,
        env.API_BASE_URL
      );

      return fetch(
        new Request(apiUrl, request)
      );
    }

    /**
     * ---------------------------------------------------------
     * 3. Static assets
     *
     * JS / CSS / images / fonts / favicon etc.
     * should NEVER go through SSR.
     * ---------------------------------------------------------
     */
    const isAssetRequest =
      /\.[a-zA-Z0-9]+$/.test(url.pathname) &&
      url.pathname !== '/';

    if (isAssetRequest) {
      return env.ASSETS.fetch(request);
    }

    /**
     * ---------------------------------------------------------
     * 4. Admin routes
     *
     * Never SSR these.
     * Always serve the normal SPA.
     * ---------------------------------------------------------
     */
    if (isAdminPath(url.pathname)) {
      return env.ASSETS.fetch(
        new Request(new URL('/', url), request)
      );
    }

    /**
     * ---------------------------------------------------------
     * 5. BOT SSR
     *
     * Googlebot / GPTBot / Facebook crawler / etc.
     * gets real HTML from the API.
     * ---------------------------------------------------------
     */
    if (isBot(request)) {
      const renderUrl = new URL(
        `/render${url.pathname}${url.search}`,
        env.API_BASE_URL
      );

      const upstream = await fetch(renderUrl, {
        headers: {
          'User-Agent':
            request.headers.get('User-Agent') || 'SparkHub-Worker',
          Accept: 'text/html',
        },
      });

      const headers = new Headers(upstream.headers);

      headers.set(
        'Content-Type',
        'text/html; charset=utf-8'
      );

      /**
       * During testing, don't let Cloudflare cache
       * an incorrect SPA response.
       */
      headers.set(
        'Cache-Control',
        'no-store, no-cache, must-revalidate'
      );

      return new Response(upstream.body, {
        status: upstream.status,
        headers,
      });
    }

    /**
     * ---------------------------------------------------------
     * 6. HUMAN VISITORS
     *
     * Normal React SPA.
     * ---------------------------------------------------------
     */
    return env.ASSETS.fetch(
      new Request(new URL('/', url), request)
    );
  },
};