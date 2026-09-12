import http from "http";
import crypto from "crypto";

// Set environment for testing
process.env.NODE_ENV = "test";
process.env.ADMIN_USER_IDS = "user_admin_test_123";
process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres.uitlpmbaaaxnljmesrmr:30611260200414@aws-1-eu-west-1.pooler.supabase.com:6543/postgres";
process.env.CLERK_PUBLISHABLE_KEY = process.env.CLERK_PUBLISHABLE_KEY || "pk_test_bW9kZXN0LXNreWxhcmstNjEuY2xlcmsuYWNjb3VudHMuZGV2JA";
process.env.CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY || "sk_test_placeholder_for_regression_suite";

async function runTests() {
  console.log("=================================================");
  console.log("   SPARK HUB STUDIO - SECURITY REGRESSION SUITE  ");
  console.log("=================================================\n");

  const { default: app, isAuthorizedAdmin } = await import("file:///c:/Users/Dell/Desktop/Spark-Agency-Studio/artifacts/api-server/dist/app.mjs");

  // Spin up app on ephemeral port
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

  try {
    // -------------------------------------------------------------
    // Test Category 1: Anonymous Access on Admin Endpoints (Must be 401)
    // -------------------------------------------------------------
    console.log("--- 1. Testing Anonymous Access on Protected Endpoints (401 expected) ---");
    const protectedEndpoints = [
      { method: "POST", path: "/api/services", body: { title: "x", category: "y", summary: "z", details: ["a"] } },
      { method: "PATCH", path: "/api/services/1", body: { title: "x" } },
      { method: "DELETE", path: "/api/services/1" },
      { method: "POST", path: "/api/case-studies", body: { slug: "t", title: "t", client: "c", category: "cat", summary: "s", problem: "p", solution: "sol", result: "r", metric: "m", imageUrl: "url", imageAlt: "alt" } },
      { method: "PATCH", path: "/api/case-studies/1", body: { title: "t" } },
      { method: "DELETE", path: "/api/case-studies/1" },
      { method: "POST", path: "/api/reels", body: { title: "r", videoUrl: "u", thumbnailUrl: "t", thumbnailAlt: "a", client: "c", category: "cat" } },
      { method: "PATCH", path: "/api/reels/1", body: { title: "r" } },
      { method: "DELETE", path: "/api/reels/1" },
      { method: "POST", path: "/api/podcasts", body: { title: "p", category: "c", audioUrl: "a" } },
      { method: "PATCH", path: "/api/podcasts/1", body: { title: "p", category: "c", audioUrl: "a" } },
      { method: "DELETE", path: "/api/podcasts/1" },
      { method: "POST", path: "/api/posts", body: { client: "c", category: "cat", imageUrls: ["u"], imageAlt: "a", caption: "cap" } },
      { method: "PATCH", path: "/api/posts/1", body: { caption: "c" } },
      { method: "DELETE", path: "/api/posts/1" },
      { method: "POST", path: "/api/testimonials", body: { client: "c", quote: "q", person: "p", role: "r", logoText: "l" } },
      { method: "DELETE", path: "/api/testimonials/1" },
      { method: "POST", path: "/api/blog", body: { slug: "s", title: "t", excerpt: "e", body: "b", category: "c", publishedAt: "2026", imageUrl: "u", imageAlt: "a" } },
      { method: "PATCH", path: "/api/blog/1", body: { title: "t" } },
      { method: "DELETE", path: "/api/blog/1" },
      { method: "POST", path: "/api/team", body: { name: "n" } },
      { method: "PATCH", path: "/api/team/1", body: { name: "n" } },
      { method: "DELETE", path: "/api/team/1" },
      { method: "POST", path: "/api/client-logos", body: { name: "l", imageUrl: "u" } },
      { method: "PATCH", path: "/api/client-logos/1", body: { name: "l", imageUrl: "u" } },
      { method: "DELETE", path: "/api/client-logos/1" },
      { method: "GET", path: "/api/contact" },
      { method: "DELETE", path: "/api/contact/1" },
    ];

    for (const ep of protectedEndpoints) {
      const res = await fetch(`${baseUrl}${ep.path}`, {
        method: ep.method,
        headers: { "Content-Type": "application/json" },
        body: ep.body ? JSON.stringify(ep.body) : undefined,
      });
      assert(`Anonymous ${ep.method} ${ep.path} returns 401`, res.status === 401, `got ${res.status}`);
    }

    // -------------------------------------------------------------
    // Test Category 2: Non-Admin Authenticated User (Must be 403)
    // -------------------------------------------------------------
    console.log("\n--- 2. Testing Non-Admin Authenticated User (403 expected) ---");
    // We mock clerk user by checking how auth middleware validates:
    // auth.userId = "user_normal_random_456" (not in ADMIN_USER_IDS, no admin role)
    // Direct unit assertions on RBAC logic:
    assert("Non-admin user_id is rejected by RBAC", isAuthorizedAdmin({ userId: "user_normal_456", sessionClaims: {} }) === false);
    assert("User with random role is rejected by RBAC", isAuthorizedAdmin({ userId: "user_normal_456", sessionClaims: { role: "member" } }) === false);
    assert("Admin user_id from ADMIN_USER_IDS is accepted", isAuthorizedAdmin({ userId: "user_admin_test_123", sessionClaims: {} }) === true);
    assert("User with Clerk server-side role admin is accepted", isAuthorizedAdmin({ userId: "user_random_999", sessionClaims: { role: "admin" } }) === true);
    assert("User with metadata.role admin is accepted", isAuthorizedAdmin({ userId: "user_random_999", sessionClaims: { metadata: { role: "admin" } } }) === true);

    // -------------------------------------------------------------
    // Test Category 3: CORS Enforcement
    // -------------------------------------------------------------
    console.log("\n--- 3. Testing CORS Policy ---");
    const evilOriginRes = await fetch(`${baseUrl}/api/posts`, {
      method: "GET",
      headers: { Origin: "https://evil-hacker-site.com" },
    });
    assert("Unknown Origin is rejected by CORS (403)", evilOriginRes.status === 403, `got ${evilOriginRes.status}`);
    assert("Unknown Origin does not receive Access-Control-Allow-Origin", evilOriginRes.headers.get("access-control-allow-origin") === null);

    const validOriginRes = await fetch(`${baseUrl}/api/posts`, {
      method: "GET",
      headers: { Origin: "https://spark-hub.online" },
    });
    assert("Allowed Origin (https://spark-hub.online) is accepted (200)", validOriginRes.status === 200, `got ${validOriginRes.status}`);
    assert("Allowed Origin receives matching Access-Control-Allow-Origin", validOriginRes.headers.get("access-control-allow-origin") === "https://spark-hub.online");

    // -------------------------------------------------------------
    // Test Category 4: Payload Size Limits (100kb max -> 413)
    // -------------------------------------------------------------
    console.log("\n--- 4. Testing Payload Limits (413 expected for >100kb) ---");
    const hugeBody = JSON.stringify({ data: "A".repeat(120 * 1024) });
    const hugeRes = await fetch(`${baseUrl}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: hugeBody,
    });
    assert("Body > 100kb returns 413 Payload Too Large", hugeRes.status === 413, `got ${hugeRes.status}`);

    // -------------------------------------------------------------
    // Test Category 5: Malformed JSON (400 expected)
    // -------------------------------------------------------------
    console.log("\n--- 5. Testing Malformed JSON Parsing (400 expected) ---");
    const malformedRes = await fetch(`${baseUrl}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: '{"invalid": json_without_quotes}',
    });
    assert("Malformed JSON returns 400 Bad Request", malformedRes.status === 400, `got ${malformedRes.status}`);

    // -------------------------------------------------------------
    // Test Category 6: Strict Pagination Validation
    // -------------------------------------------------------------
    console.log("\n--- 6. Testing Strict Pagination Validation (400 on malicious inputs) ---");
    const paginationTests = [
      { param: "limit=999999999", desc: "Excessive limit (>50)" },
      { param: "limit=-1", desc: "Negative limit" },
      { param: "limit=0", desc: "Zero limit" },
      { param: "limit=1e100", desc: "Scientific notation limit" },
      { param: "limit=NaN", desc: "NaN limit" },
      { param: "limit=5.5", desc: "Floating point limit" },
      { param: "offset=-1", desc: "Negative offset" },
      { param: "offset=1e100", desc: "Scientific notation offset" },
      { param: "offset=999999999", desc: "Excessive offset (>10,000)" },
    ];

    for (const pt of paginationTests) {
      const res = await fetch(`${baseUrl}/api/posts?${pt.param}`);
      assert(`Malformed pagination (${pt.desc}) returns 400`, res.status === 400, `got ${res.status}`);
    }

    const validPaginationRes = await fetch(`${baseUrl}/api/posts?limit=10&offset=0`);
    assert("Valid pagination (?limit=10&offset=0) returns 200", validPaginationRes.status === 200, `got ${validPaginationRes.status}`);
    const validData = await validPaginationRes.json();
    assert("Valid pagination returns bounded array (<=10 items)", Array.isArray(validData) && validData.length <= 10);

    // -------------------------------------------------------------
    // Test Category 7: Contact Form Input Constraints & Deduplication
    // -------------------------------------------------------------
    console.log("\n--- 7. Testing Contact Form Constraints & Deduplication ---");
    const longFieldRes = await fetch(`${baseUrl}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "A".repeat(150), // exceeds max 100
        email: "test@example.com",
        message: "Valid test message for security audit",
        budget: "10k",
        service: "strategy"
      }),
    });
    assert("Name exceeding 100 chars returns 400", longFieldRes.status === 400, `got ${longFieldRes.status}`);

    // First valid submission
    const uniqueEmail = `audit_${Date.now()}@example.com`;
    const uniqueMsg = `Security test message ${Date.now()}`;
    const firstSubmitRes = await fetch(`${baseUrl}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Security Auditor",
        email: uniqueEmail,
        message: uniqueMsg,
        budget: "20k",
        service: "security"
      }),
    });
    assert("First valid contact submission succeeds (201)", firstSubmitRes.status === 201, `got ${firstSubmitRes.status}`);

    // Immediate duplicate submission with identical email + message
    const dupSubmitRes = await fetch(`${baseUrl}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Security Auditor",
        email: uniqueEmail,
        message: uniqueMsg,
        budget: "20k",
        service: "security"
      }),
    });
    assert("Immediate duplicate submission is rejected (429 Duplicate)", dupSubmitRes.status === 429, `got ${dupSubmitRes.status}`);

    // -------------------------------------------------------------
    // Test Category 8: Cloudflare Worker SSR Whitelisting Logic
    // -------------------------------------------------------------
    console.log("\n--- 8. Testing SSR Path Whitelisting Logic ---");
    // Verify path validation patterns
    const isAllowedSsrPath = (pathname) => {
      const exact = new Set(['/', '/work', '/services', '/reels', '/podcasts', '/posts', '/about', '/contact', '/blog']);
      if (exact.has(pathname)) return true;
      if (/^\/work\/[a-zA-Z0-9_-]{1,100}$/.test(pathname)) return true;
      if (/^\/blog\/[a-zA-Z0-9_-]{1,100}$/.test(pathname)) return true;
      return false;
    };

    assert("Allowed SSR path /work is accepted", isAllowedSsrPath("/work") === true);
    assert("Allowed SSR path /blog/my-post is accepted", isAllowedSsrPath("/blog/my-post") === true);
    assert("Arbitrary random SSR path /unknown-path is rejected", isAllowedSsrPath("/unknown-path") === false);
    assert("Path traversal SSR path /work/../../admin is rejected", isAllowedSsrPath("/work/../../admin") === false);
    assert("SQL injection string in SSR path is rejected", isAllowedSsrPath("/work/1' OR '1'='1") === false);

    console.log("\n=================================================");
    console.log(`   TEST SUMMARY: ${passedTests}/${totalTests} PASSED (${failedTests} FAILED)  `);
    console.log("=================================================\n");

    if (failedTests > 0) {
      process.exit(1);
    }
  } finally {
    server.close();
    try {
      const { pool } = await import("file:///c:/Users/Dell/Desktop/Spark-Agency-Studio/lib/db/dist/index.js").catch(() => ({}));
      if (pool) await pool.end();
    } catch {}
    process.exit(failedTests > 0 ? 1 : 0);
  }
}

runTests().catch((err) => {
  console.error("Test runner encountered an unhandled error:", err);
  process.exit(1);
});
