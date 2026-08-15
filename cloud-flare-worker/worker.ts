/**
 * Spark Hub Studio — edge dynamic rendering
 *
 * Human visitors always get the normal React SPA (fast, interactive,
 * unstyled-HTML-free). Requests from bots/crawlers that don't execute
 * JavaScript (search engines, AI crawlers, link-preview bots) are
 * instead routed to full server-rendered HTML pages generated live
 * from the database by the API on the VPS — so they see the real
 * content, not an empty <div id="root">.
 *
 * /sitemap.xml is always proxied from the API, regardless of who's
 * asking, since every crawler needs it.
 *
 * The admin app (/admin, /sign-in, /sign-up) is never rendered for
 * bots — it's excluded from indexing entirely (see robots.txt) and
 * always served as the normal SPA.
 *
 * Setup:
 * 1. Set API_BASE_URL in wrangler.jsonc to your VPS API's public URL.
 * 2. Point [assets].directory at the built frontend (dist/public).
 * 3. `wrangler dev` to test, `wrangler deploy` to ship.
 */

export interface Env {
  API_BASE_URL: string;
  ASSETS: Fetcher;
}

// Common crawlers/bots that either don't run JS at all, or that we
// specifically want to hand real HTML to (search engines, AI
// crawlers, link-preview unfurlers for chat apps and social media).
const BOT_UA_PATTERN =
  /bot|crawl|spider|slurp|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|slackbot|discordbot|embedly|quora link preview|pinterest|redditbot|applebot|petalbot|gptbot|claudebot|anthropic|perplexitybot|ccbot|bytespider|amazonbot|google-extended|omgili/i;

const ADMIN_PATHS = ['/admin', '/sign-in', '/sign-up'];

function isBot(request: Request): boolean {
  const ua = request.headers.get('User-Agent') || '';
  return BOT_UA_PATTERN.test(ua);
}

function isAdminPath(pathname: string): boolean {
  return ADMIN_PATHS.some(p => pathname === p || pathname.startsWith(`${p}/`));
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Always proxy the sitemap straight from the API — every crawler
    // needs it regardless of JS support.
    if (url.pathname === '/sitemap.xml') {
      const res = await fetch(`${env.API_BASE_URL}/sitemap.xml`);
      return new Response(res.body, {
        status: res.status,
        headers: { 'Content-Type': 'application/xml; charset=utf-8' },
      });
    }

    // Proxy all /api requests directly to the API backend
    if (url.pathname.startsWith('/api/') || url.pathname === '/api') {
      const apiUrl = new URL(url.pathname + url.search, env.API_BASE_URL);
      return fetch(new Request(apiUrl, request));
    }

    // Let real files (JS, CSS, images, fonts...) pass through untouched.
    const isAssetRequest = /\.[a-zA-Z0-9]+$/.test(url.pathname) && url.pathname !== '/';
    if (isAssetRequest) {
      return env.ASSETS.fetch(request);
    }

    // Bots get fully server-rendered HTML for every public page —
    // except the admin app, which is never rendered or indexed.
    if (isBot(request) && !isAdminPath(url.pathname)) {
      const upstream = await fetch(`${env.API_BASE_URL}/render${url.pathname}`, {
        headers: { 'User-Agent': request.headers.get('User-Agent') || '' },
      });
      return new Response(upstream.body, {
        status: upstream.status,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    // Everyone else (real visitors) gets the normal SPA.
    return env.ASSETS.fetch(new Request(new URL('/', url), request));
  },
};