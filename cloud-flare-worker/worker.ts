export interface Env {
  API_BASE_URL: string;
  ASSETS: Fetcher;
}

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

    // 2. تمرير طلبات الـ API مباشرة للباك إند
    if (url.pathname.startsWith('/api/') || url.pathname === '/api') {
      const apiUrl = new URL(url.pathname + url.search, env.API_BASE_URL);
      return fetch(new Request(apiUrl, request));
    }

    // 3. تمرير الملفات الثابتة (الصور، الـ CSS، الخطوط، الـ JS)
    const isAssetRequest = /\.[a-zA-Z0-9]+$/.test(url.pathname) && url.pathname !== '/';
    if (isAssetRequest) {
      return env.ASSETS.fetch(request);
    }

    // 4. توجيه البوتات ومحركات البحث للـ SSR
    if (isBot(request) && !isAdminPath(url.pathname)) {
      try {
        const renderUrl = `${env.API_BASE_URL}/render${url.pathname}${url.search}`;
        const upstream = await fetch(renderUrl, {
          headers: { 'User-Agent': request.headers.get('User-Agent') || '' },
        });

        const upstreamBody = await upstream.text();

        return new Response(upstreamBody, {
          status: upstream.status,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Vary': 'User-Agent',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        });
      } catch (err) {
        // في حال حدوث أي خطأ طارئ يرجع للـ SPA
        return env.ASSETS.fetch(new Request(new URL('/', url), request));
      }
    }

    // 5. الزوار العاديون يحصلون على تطبيق الـ React SPA
    const response = await env.ASSETS.fetch(new Request(new URL('/', url), request));
    const newHeaders = new Headers(response.headers);
    newHeaders.set('Vary', 'User-Agent');

    return new Response(response.body, {
      status: response.status,
      headers: newHeaders,
    });
  },
};