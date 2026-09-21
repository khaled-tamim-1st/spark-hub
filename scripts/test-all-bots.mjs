async function testAllBots() {
  const userAgents = [
    { name: 'Googlebot Desktop', ua: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' },
    { name: 'Googlebot Smartphone', ua: 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' },
    { name: 'Bingbot', ua: 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)' },
    { name: 'WhatsApp Preview', ua: 'WhatsApp/2.21.12.21 A' },
    { name: 'Twitterbot Preview', ua: 'Twitterbot/1.0' },
    { name: 'Facebook External Hit', ua: 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)' },
    { name: 'LinkedIn Bot', ua: 'LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com)' },
    { name: 'Human User (Chrome 128)', ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36' },
    { name: 'Human User (Safari iOS)', ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' },
  ];

  console.log('| Bot / User-Agent | Target URL | Status | Delivered Version | JSON-LD Schema | Cache-Control |');
  console.log('| :--- | :--- | :--- | :--- | :--- | :--- |');

  for (const bot of userAgents) {
    try {
      const res = await fetch('https://spark-hub.online/ar/services', {
        headers: { 'User-Agent': bot.ua, 'Accept': 'text/html' },
      });
      const html = await res.text();
      const isSpa = html.includes('id="root"');
      const hasSchema = html.includes('application/ld+json');
      const delivered = isSpa ? '✨ Interactive React SPA' : '🤖 Semantic SSR HTML (Bot)';
      const cache = res.headers.get('cache-control') || 'none';
      console.log(`| ${bot.name} | /ar/services | ${res.status} | ${delivered} | ${hasSchema ? '✅ Yes' : '❌ No'} | ${cache.slice(0, 30)} |`);
    } catch (err) {
      console.log(`| ${bot.name} | /ar/services | ERROR | ${err.message} | ❌ | - |`);
    }
  }
}

testAllBots();
