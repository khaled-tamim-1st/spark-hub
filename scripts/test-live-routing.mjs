async function testBotRouting() {
  const targetUrl = 'https://spark-hub.online/ar/services';

  console.log('====================================================');
  console.log('1. اختبار طلب زائر بشري عادي (Google Chrome)');
  console.log('====================================================');
  const humanRes = await fetch(targetUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9',
    },
  });
  const humanHtml = await humanRes.text();
  console.log('Status Code:', humanRes.status);
  console.log('Content-Type:', humanRes.headers.get('content-type'));
  console.log('Is React SPA (<div id="root">):', humanHtml.includes('id="root"'));
  console.log('Has React JS bundle:', humanHtml.includes('/assets/index-'));
  console.log('Preview:');
  console.log(humanHtml.slice(0, 350));

  console.log('\n====================================================');
  console.log('2. اختبار طلب روبوت Googlebot');
  console.log('====================================================');
  const botRes = await fetch(targetUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      'Accept': 'text/html',
    },
  });
  const botHtml = await botRes.text();
  console.log('Status Code:', botRes.status);
  console.log('Content-Type:', botRes.headers.get('content-type'));
  console.log('Cache-Control (Edge Cache):', botRes.headers.get('cache-control'));
  console.log('Has JSON-LD Schema:', botHtml.includes('application/ld+json'));
  console.log('Has Semantic HTML Headings (H1/H2):', botHtml.includes('<h1>') || botHtml.includes('<h2>'));
  console.log('Is Pure SSR HTML (No React root):', !botHtml.includes('id="root"'));
  console.log('Preview:');
  console.log(botHtml.slice(0, 450));

  console.log('\n====================================================');
  console.log('3. اختبار طلب روبوت الذكاء الاصطناعي (ClaudeBot / GPTBot)');
  console.log('====================================================');
  const aiBotRes = await fetch('https://spark-hub.online/ar/about', {
    headers: {
      'User-Agent': 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)',
      'Accept': 'text/html',
    },
  });
  const aiBotHtml = await aiBotRes.text();
  console.log('Status Code:', aiBotRes.status);
  console.log('Title in SSR:', aiBotHtml.match(/<title>(.*?)<\/title>/)?.[1] || 'None');
  console.log('Has JSON-LD Schema:', aiBotHtml.includes('application/ld+json'));
  console.log('Is Pure SSR HTML:', !aiBotHtml.includes('id="root"'));

  console.log('\n====================================================');
  console.log('4. اختبار مقال المدونة لروبوت محرك البحث');
  console.log('====================================================');
  const blogBotRes = await fetch('https://spark-hub.online/ar/blog/raf-taqyem-google-map', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      'Accept': 'text/html',
    },
  });
  const blogBotHtml = await blogBotRes.text();
  console.log('Status Code:', blogBotRes.status);
  console.log('Title:', blogBotHtml.match(/<title>(.*?)<\/title>/)?.[1] || 'None');
  console.log('Has JSON-LD BlogPosting Schema:', blogBotHtml.includes('BlogPosting') || blogBotHtml.includes('application/ld+json'));
  console.log('Has Semantic Headings:', blogBotHtml.includes('<h1>') && (blogBotHtml.includes('<h2>') || blogBotHtml.includes('<header>')));
  console.log('====================================================');
}

testBotRouting().catch(console.error);
