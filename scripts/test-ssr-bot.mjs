import http from "http";

process.env.NODE_ENV = "test";
process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres.uitlpmbaaaxnljmesrmr:30611260200414@aws-1-eu-west-1.pooler.supabase.com:6543/postgres";
process.env.CLERK_PUBLISHABLE_KEY = process.env.CLERK_PUBLISHABLE_KEY || "pk_test_bW9kZXN0LXNreWxhcmstNjEuY2xlcmsuYWNjb3VudHMuZGV2JA";
process.env.CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY || "sk_test_placeholder_for_regression_suite";

async function runSsrTests() {
  console.log("=================================================");
  console.log("   SPARK HUB STUDIO - SSR BOT RENDERING TESTS   ");
  console.log("=================================================\n");

  const { default: app } = await import("file:///c:/Users/Dell/Desktop/Spark-Agency-Studio/artifacts/api-server/dist/app.mjs");

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  console.log(`[+] Test server running on ${baseUrl}\n`);

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  function assert(name, condition, details = "") {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  ✓ PASS: ${name}`);
    } else {
      failedTests++;
      console.error(`  ✗ FAIL: ${name} ${details ? "--> " + details : ""}`);
    }
  }

  const routesToTest = [
    { path: "/render/", expectedLang: "en", expectedTitle: "Spark Hub Studio", expectedH1: "Spark Hub Studio" },
    { path: "/render/ar", expectedLang: "ar", expectedTitle: "سبارك هب ستوديو", expectedH1: "سبارك هب ستوديو" },
    { path: "/render/services", expectedLang: "en", expectedTitle: "Digital Marketing &amp; Business Growth Services", expectedH1: "Strategic Marketing & Growth Consulting Services" },
    { path: "/render/ar/services", expectedLang: "ar", expectedTitle: "خدمات التسويق الرقمي", expectedH1: "منظومة الخدمات التسويقية والاستشارية المتكاملة" },
    { path: "/render/reels", expectedLang: "en", expectedTitle: "Commercial Video Production &amp; Reels", expectedH1: "Commercial Video Production, Reels & Visual Storytelling" },
    { path: "/render/ar/reels", expectedLang: "ar", expectedTitle: "إنتاج الفيديو الإعلاني", expectedH1: "إنتاج الفيديو الإعلاني، الريلز والمحتوى المرئي" },
    { path: "/render/podcasts", expectedLang: "en", expectedTitle: "Podcasts &amp; Executive Dialogues", expectedH1: "Spark Hub Podcasts" },
    { path: "/render/ar/podcasts", expectedLang: "ar", expectedTitle: "بودكاست وحوارات استراتيجية", expectedH1: "بودكاست سبارك هب" },
    { path: "/render/posts", expectedLang: "en", expectedTitle: "Work Journal &amp; Creative Campaigns", expectedH1: "Creative Campaigns & Work Journal" },
    { path: "/render/ar/posts", expectedLang: "ar", expectedTitle: "سجل الأعمال والحملات", expectedH1: "سجل الأعمال، الحملات الإعلانية" },
    { path: "/render/team", expectedLang: "en", expectedTitle: "Team &amp; Leadership", expectedH1: "The Team & Leadership" },
    { path: "/render/ar/team", expectedLang: "ar", expectedTitle: "فريق العمل والقيادات", expectedH1: "فريق عمل وخبراء استوديو سبارك هب" },
    { path: "/render/about", expectedLang: "en", expectedTitle: "About Spark Hub Studio", expectedH1: "About Spark Hub Studio" },
    { path: "/render/ar/about", expectedLang: "ar", expectedTitle: "عن استوديو سبارك هب", expectedH1: "عن استوديو سبارك هب" },
    { path: "/render/contact", expectedLang: "en", expectedTitle: "Contact Spark Hub Studio", expectedH1: "Contact Spark Hub Studio" },
    { path: "/render/ar/contact", expectedLang: "ar", expectedTitle: "تواصل معنا", expectedH1: "تواصل مع استوديو سبارك هب" },
    { path: "/render/blog", expectedLang: "en", expectedTitle: "Notes &amp; Strategic Insights", expectedH1: "Spark Hub Notes" },
    { path: "/render/ar/blog", expectedLang: "ar", expectedTitle: "مدونة سبارك هب", expectedH1: "مدونة سبارك هب" },
    { path: "/sitemap.xml", isXml: true },
  ];

  for (const route of routesToTest) {
    console.log(`\n--- Testing ${route.path} ---`);
    const res = await fetch(`${baseUrl}${route.path}`);
    assert(`${route.path} status is 200`, res.status === 200, `got ${res.status}`);

    if (route.isXml) {
      const xml = await res.text();
      assert("sitemap.xml contains urlset", xml.includes("<urlset"));
      assert("sitemap.xml contains /ar/services", xml.includes("/ar/services"));
      assert("sitemap.xml contains /ar/team", xml.includes("/ar/team"));
      continue;
    }

    const html = await res.text();
    assert(`${route.path} has <!DOCTYPE html>`, html.includes("<!DOCTYPE html>"));
    assert(`${route.path} has lang="${route.expectedLang}"`, html.includes(`lang="${route.expectedLang}"`));
    assert(`${route.path} has correct title`, html.includes(route.expectedTitle), `title check`);
    assert(`${route.path} has correct H1`, html.includes(route.expectedH1), `H1 check`);
    assert(`${route.path} has canonical link`, html.includes('<link rel="canonical"'));
    assert(`${route.path} has hreflang ar`, html.includes('hreflang="ar"'));
    assert(`${route.path} has hreflang en`, html.includes('hreflang="en"'));
    assert(`${route.path} has hreflang x-default`, html.includes('hreflang="x-default"'));
    assert(`${route.path} has JSON-LD schema`, html.includes('application/ld+json'));
    assert(`${route.path} has header navigation`, html.includes('<nav aria-label='));
    assert(`${route.path} has semantic footer`, html.includes('<footer>'));

    // Check JSON-LD validity
    const schemaMatches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    assert(`${route.path} has at least 1 JSON-LD script`, schemaMatches.length > 0);
    for (let i = 0; i < schemaMatches.length; i++) {
      try {
        const parsed = JSON.parse(schemaMatches[i][1]);
        assert(`${route.path} schema #${i + 1} is valid JSON`, Boolean(parsed));
      } catch (err) {
        assert(`${route.path} schema #${i + 1} is valid JSON`, false, err.message);
      }
    }
  }

  // Test 301 redirects on /work
  console.log("\n--- Testing Redirects ---");
  const workRes = await fetch(`${baseUrl}/render/work`, { redirect: "manual" });
  assert("/render/work redirects (301)", workRes.status === 301);
  assert("/render/work location is /services", workRes.headers.get("location") === "/services");

  const arWorkRes = await fetch(`${baseUrl}/render/ar/work`, { redirect: "manual" });
  assert("/render/ar/work redirects (301)", arWorkRes.status === 301);
  assert("/render/ar/work location is /ar/services", arWorkRes.headers.get("location") === "/ar/services");

  server.close();

  console.log("\n=================================================");
  console.log(`   TOTAL TESTS: ${totalTests}`);
  console.log(`   PASSED: ${passedTests}`);
  console.log(`   FAILED: ${failedTests}`);
  console.log("=================================================\n");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runSsrTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
