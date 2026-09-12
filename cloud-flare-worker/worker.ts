export interface Env {
  API_BASE_URL: string;
  ASSETS: Fetcher;
}

const BOT_UA_PATTERN =
  /bot|crawl|spider|slurp|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|slackbot|discordbot|embedly|quora link preview|pinterest|redditbot|applebot|petalbot|gptbot|claudebot|anthropic|perplexitybot|ccbot|bytespider|amazonbot|google-extended|omgili/i;

const ADMIN_PATHS = ['/admin', '/sign-in', '/sign-up'];

// Whitelist of public paths allowed for SSR bot rendering to prevent origin DoS
const ALLOWED_SSR_EXACT = new Set([
  '/',
  '/work',
  '/services',
  '/reels',
  '/podcasts',
  '/posts',
  '/about',
  '/contact',
  '/blog',
]);

function isAllowedSsrPath(pathname: string): boolean {
  if (ALLOWED_SSR_EXACT.has(pathname)) return true;
  // Valid detail subpaths: only allow alphanumeric, hyphen, and underscore slugs
  if (/^\/work\/[a-zA-Z0-9_-]{1,100}$/.test(pathname)) return true;
  if (/^\/blog\/[a-zA-Z0-9_-]{1,100}$/.test(pathname)) return true;
  return false;
}

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

    // 1. خريطة الموقع sitemap.xml
    if (url.pathname === '/sitemap.xml') {
      const res = await fetch(`${env.API_BASE_URL}/sitemap.xml`);
      return new Response(res.body, {
        status: res.status,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // 2. تمرير طلبات الـ API مباشرة للباك إند مع توثيق الـ IP الحقيقي
    if (url.pathname.startsWith('/api/') || url.pathname === '/api') {
      const apiUrl = new URL(url.pathname + url.search, env.API_BASE_URL);
      const headers = new Headers(request.headers);
      const clientIp = request.headers.get('CF-Connecting-IP');
      if (clientIp) {
        headers.set('CF-Connecting-IP', clientIp);
        headers.set('X-Forwarded-For', clientIp);
      }
      return fetch(new Request(apiUrl, {
        method: request.method,
        headers,
        body: request.body,
        redirect: 'follow',
      }));
    }

    // 3. تمرير الملفات الثابتة (الصور، الـ CSS، الخطوط، الـ JS)
    const isAssetRequest = /\.[a-zA-Z0-9]+$/.test(url.pathname) && url.pathname !== '/';
    if (isAssetRequest) {
      return env.ASSETS.fetch(request);
    }

    // 4. توجيه البوتات ومحركات البحث للـ SSR مع كاش محكم ومسارات محددة
    if (isBot(request) && !isAdminPath(url.pathname)) {
      // حصر الـ SSR على المسارات العامة المعروفة فقط لمنع إغراق الباك إند بمسارات وهمية
      if (!isAllowedSsrPath(url.pathname)) {
        return env.ASSETS.fetch(request);
      }

      try {
        // مفتاح كاش مطبع ومجرد من أي Query Parameters أو Cookies لمنع Cache Poisoning
        const normalizedCacheUrl = new URL(url.pathname, 'https://spark-hub.online');
        const cacheKey = new Request(normalizedCacheUrl.toString(), { method: 'GET' });
        const cache = (caches as any).default;

        let cached = await cache.match(cacheKey);
        if (cached) {
          return cached;
        }

        // استدعاء الـ SSR على الباك إند بدون تمرير أي Cookies أو هيدرات حساسة
        const renderUrl = `${env.API_BASE_URL}/render${url.pathname}`;
        const upstream = await fetch(renderUrl, {
          headers: {
            'User-Agent': request.headers.get('User-Agent') || 'Bot',
            'Accept': 'text/html',
          },
        });

        // عدم تخزين أي استجابة فاشلة (لا تخزين لـ 4xx أو 5xx)
        if (upstream.status !== 200) {
          return env.ASSETS.fetch(request);
        }

        const upstreamBody = await upstream.text();
        const response = new Response(upstreamBody, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Vary': 'User-Agent',
            'Cache-Control': 'public, max-age=900, s-maxage=3600', // كاش 15-60 دقيقة للبوتات عند الـ Edge
          },
        });

        // حفظ النسخة في كاش الـ Cloudflare Edge
        await cache.put(cacheKey, response.clone());
        return response;
      } catch (err) {
        return env.ASSETS.fetch(request);
      }
    }

    // 5. الزوار العاديون يحصلون على تطبيق الـ React SPA مع منع الكاش لـ index.html
    const spaResponse = await env.ASSETS.fetch(request);
    const contentType = spaResponse.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      const headers = new Headers(spaResponse.headers);
      headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      headers.set('Pragma', 'no-cache');
      headers.set('Expires', '0');
      return new Response(spaResponse.body, {
        status: spaResponse.status,
        headers,
      });
    }

    return spaResponse;
  },
};