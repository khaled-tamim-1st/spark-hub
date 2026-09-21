import { Router, type IRouter } from "express";
import { asc, desc, eq } from "drizzle-orm";
import {
  db,
  servicesTable,
  reelsTable,
  podcastsTable,
  postsTable,
  testimonialsTable,
  blogPostsTable,
  teamTable,
} from "@workspace/db";
import { esc, renderShell, SITE_NAME, SITE_URL } from "./shell";

const router: IRouter = Router();

function getLocaleInfo(urlPath: string) {
  const isAr = urlPath === "/ar" || urlPath.startsWith("/ar/");
  return {
    isAr,
    lang: isAr ? "ar" : "en",
    dir: isAr ? "rtl" : "ltr",
    prefix: isAr ? "/ar" : "",
  };
}

function buildFaqSchema(faqs: { q: string; a: string }[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((f) => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.a,
      },
    })),
  };
}

// ============================================================================
// 1. HOME (/) & (/ar) & (/en)
// ============================================================================
router.get(["/", "/ar", "/en"], async (req, res) => {
  const { isAr, lang, dir, prefix } = getLocaleInfo(req.path);
  const [services, testimonials, recentPosts, reels] = await Promise.all([
    db.select().from(servicesTable).orderBy(asc(servicesTable.displayOrder)).limit(8),
    db.select().from(testimonialsTable).orderBy(asc(testimonialsTable.displayOrder)).limit(6),
    db.select().from(blogPostsTable).orderBy(desc(blogPostsTable.publishedAt)).limit(4),
    db.select().from(reelsTable).orderBy(asc(reelsTable.displayOrder)).limit(4),
  ]);

  const homeFaqs = isAr
    ? [
        {
          q: "ما هي وكالة سبارك هب ستوديو (Spark Hub Studio) وما نطاق خدماتها؟",
          a: "سبارك هب ستوديو هي وكالة تسويق رقمي متكاملة (360° Full-Service Marketing Agency) واستوديو استشاري لهندسة نمو الأعمال. نقدم منظومة شاملة تجمع بين التخطيط الاستراتيجي، إدارة الحملات الإعلانية الممولة (Performance Marketing)، تحسين محركات البحث (SEO والسيو المحلي)، إدارة السوشيال ميديا وصناعة المحتوى، تصميم الهويات البصرية والبراندينج، الإنتاج السينمائي والريلز (Reels)، وتطوير المتاجر والمواقع الرقمية.",
        },
        {
          q: "كيف تساعد سبارك هب الشركات والمتاجر في السوق السعودي والخليجي ومصر؟",
          a: "نعمل مع الشركات المتوسطة والكبرى والمتاجر الإلكترونية في السعودية (الرياض، جدة، المنطقة الشرقية)، والإمارات (دبي، أبوظبي)، ومصر على بناء وتطوير منظومات تسويقية متكاملة. نركز على خفض تكلفة الاستحواذ على العملاء (CAC)، ومضاعفة العائد على الإنفاق الإعلاني (ROAS)، وتعزيز التواجد المحلي على خرائط جوجل (Google Maps) ومحركات البحث لتحقيق نمو مستدام وقابل للتوسع.",
        },
        {
          q: "هل تدير سبارك هب المنظومة التسويقية للشركات بالكامل؟",
          a: "نعم، نقدم نموذج الشراكة التسويقية الشاملة (Full-Service Growth Partner) حيث نتولى قيادة الاستراتيجية، وإدارة ميزانيات الإعلانات، وتصميم وتصوير المحتوى المرئي، وتحسين محركات البحث، والتحليل الدوري للبيانات، مما يمنح الإدارة التنفيذية رؤية واضحة ونتائج تجارية قابلة للقياس دون الحاجة للتعامل مع أطراف متعددة.",
        },
        {
          q: "ما الفرق بين سبارك هب ووكالات الإعلانات التقليدية؟",
          a: "لا نقتصر على نشر الإعلانات المؤقتة التي تستنزف الميزانيات، بل نربط التسويق المتقدم بكفاءة العمليات والمبيعات وهندسة مسارات التحويل (Sales Funnels & CRO). منهجيتنا تعتمد على التوافق الاستراتيجي قبل التسارع لضمان استدامة الأرباح والقيمة التراكمية للعلامة التجارية.",
        },
        {
          q: "كيف يمكن للشركات بدء التعاون وحجز استشارة عمل استراتيجية؟",
          a: "يمكنك التواصل معنا عبر نموذج 'ابدأ محادثة عمل' أو مراسلتنا مباشرة على hello@spark-hub.online لمناقشة أهداف شركتك، تقييم الوضع التسويقي الحالي، وتحديد خارطة طريق النمو الأنسب لقطاعك.",
        },
      ]
    : [
        {
          q: "What is Spark Hub Studio and what services does it provide?",
          a: "Spark Hub Studio is a full-service digital marketing agency and growth strategy studio. We provide integrated end-to-end solutions covering growth consulting, performance marketing (Google, Meta, Snapchat, TikTok ads), technical and local SEO, brand identity, commercial video/Reels production, and conversion rate optimization (CRO).",
        },
        {
          q: "How does Spark Hub support enterprise growth across Saudi Arabia, the UAE, and MENA?",
          a: "We partner with scaling businesses, B2B enterprises, and e-commerce stores across Riyadh, Jeddah, Dubai, Cairo, and the broader MENA region to build resilient marketing systems, reduce customer acquisition cost (CAC), maximize return on ad spend (ROAS), and capture organic search dominance.",
        },
        {
          q: "Can Spark Hub manage our entire marketing department?",
          a: "Yes. As a full-service growth partner, we manage strategy, ad spend execution, creative asset generation, video production, SEO campaigns, and analytics reporting under a unified performance framework.",
        },
        {
          q: "How do we get started with Spark Hub?",
          a: "Reach out through our contact page or email us at hello@spark-hub.online to schedule a strategic discovery session and assess your growth roadmap.",
        },
      ];

  const body = isAr
    ? `
<article>
  <header>
    <h1>سبارك هب ستوديو | وكالة تسويق رقمي متكاملة، استشارات نمو الأعمال وهندسة الاستراتيجيات</h1>
    <p><strong>استوديو استشاري ووكالة تسويق متكاملة (360° Marketing & Growth Studio):</strong> نساعد الشركات الطموحة والمتاجر الإلكترونية في <strong>المملكة العربية السعودية، الإمارات العربية المتحدة، ومصر</strong> على بناء منظومات تسويقية متكاملة تحقق انتشاراً واسعاً، تزيد المبيعات، وتضمن عائداً استثمارياً مستداماً.</p>
    <div class="cta-box">
      <h3>جاهز لبناء المنظومة التي تقود نموك القادم؟</h3>
      <p>ندمج التخطيط الاستراتيجي، قيادة التسويق عالي الأداء، الإنتاج السينمائي، وكفاءة العمليات لنمنح مؤسستك مساراً واضحاً وقابلاً للتوسع المستمر.</p>
      <a href="${prefix}/contact" class="cta-btn">ابدأ محادثة عمل استراتيجية</a>
    </div>
  </header>

  <section>
    <h2>منظومة التسويق المتكامل (360° Full-Service Capabilities)</h2>
    <p>في سبارك هب، نؤمن بأن النجاح التسويقي الحقيقي لا يتحقق عبر حملات عشوائية أو حلول مجتزأة، بل عبر تكامل استراتيجي دقيق يغطي كافة جوانب الحضور الرقمي لعلامتك التجارية:</p>
    
    <div class="grid-card">
      <h3>1. التسويق عالي الأداء وإدارة الحملات الإعلانية (Performance Marketing)</h3>
      <p>إدارة محترفة للحملات الإعلانية المدفوعة على Google Ads، وMeta (Facebook & Instagram Ads)، وSnapchat Ads، وTikTok Ads، وLinkedIn Ads. نركز على استهداف الجمهور الأدق، خفض تكلفة الاستحواذ (CAC)، وتحقيق أعلى عائد على الإنفاق الإعلاني (ROAS).</p>
      <p><a href="${prefix}/services">اكتشف تفاصيل خدمات الإعلانات والنمو ←</a></p>
    </div>

    <div class="grid-card">
      <h3>2. تحسين محركات البحث والسيو المحلي (SEO & Local SEO)</h3>
      <p>تصدر نتائج البحث الأولى في Google للكلمات المفتاحية ذات القيمة التجارية العالية. خدمات متخصصة في سيو الشركات، سيو المتاجر الإلكترونية (سلة، زد، شوبيفاي)، والظهور في خرائط جوجل (Google Maps & Google Business Profile) للسيطرة على عمليات البحث المحلية في الرياض، جدة، دبي، والقاهرة.</p>
      <p><a href="${prefix}/services">استكشف خدمات تحسين محركات البحث ←</a></p>
    </div>

    <div class="grid-card">
      <h3>3. إدارة منصات التواصل الاجتماعي وصناعة المحتوى (Social Media Management)</h3>
      <p>صناعة محتوى رقمي متفاعل ومؤثر يرسخ مكانة العلامة التجارية في أذهان العملاء، مع إدارة كاملة للحسابات، التفاعل مع الجمهور، وبناء مجتمعات ولاء نشطة عبر منصات X، انستجرام، لينكد إن، وسناب شات.</p>
      <p><a href="${prefix}/posts">شاهد سجل أعمالنا وتصاميم الحملات ←</a></p>
    </div>

    <div class="grid-card">
      <h3>4. الإنتاج السينمائي، تصوير الإعلانات والريلز (Commercial Video & Reels)</h3>
      <p>إنتاج مقاطع فيديو سينمائية، وتصوير إعلانات المنتجات، وفيديوهات Reels وTikTok وShorts جذابة ترتكز على نصوص إبداعية مدروسة لزيادة الانتشار العضوي ومعدلات التفاعل والتحويل.</p>
      <p><a href="${prefix}/reels">تصفح معرض أعمال الفيديو والريلز ←</a></p>
    </div>

    <div class="grid-card">
      <h3>5. تصميم الهوية البصرية والتموضع المؤسسي (Branding & Identity)</h3>
      <p>بناء هويات بصرية مؤسسية وأدلة إرشادية متكاملة (Brand Guidelines) تمنح علامتك التجارية ثقلاً وسلطة في السوق وتميزها عن المنافسين.</p>
    </div>

    <div class="grid-card">
      <h3>6. تطوير المتاجر الرقمية وتحسين معدلات التحويل (E-Commerce & CRO)</h3>
      <p>تصميم وتطوير مواقع ومتاجر إلكترونية عالية السرعة وتجربة مستخدم سلسة، مع هندسة مسارات المبيعات (Sales Funnels) واختبارات التحسين المستمر لرفع نسبة إتمام الشراء.</p>
    </div>
  </section>

  <section>
    <h2>الخدمات الاستشارية والتنفيذية المعتمدة</h2>
    <ul>
      ${services
        .map(
          (s) =>
            `<li><h3><a href="${prefix}/services">${esc(s.title)}</a></h3><p>${esc(s.summary)}</p></li>`,
        )
        .join("\n")}
    </ul>
    <p><a href="${prefix}/services">عرض كافة تفاصيل الركائز الاستشارية والخدمات ←</a></p>
  </section>

  <section>
    <h2>القطاعات والأنشطة الاقتصادية التي نخدمها</h2>
    <p>نمتلك خبرة معمقة في تلبية المتطلبات التسويقية لعدة قطاعات حيوية تشمل:</p>
    <ul>
      <li><strong>التجارة الإلكترونية والتجزئة:</strong> متاجر الملابس والأزياء، الأغذية والمشروبات، الإلكترونيات، والتجزئة الفاخرة (Retail & E-commerce).</li>
      <li><strong>الرعاية الصحية والمراكز الطبية:</strong> العيادات التخصصية، المستشفيات، وشركات الصناعات الدوائية (Healthcare & Pharma).</li>
      <li><strong>العقارات والتطوير العمراني:</strong> شركات الاستثمار العقاري، المكاتب الهندسية، واستوديوهات العمارة والتصميم الداخلي.</li>
      <li><strong>حلول التقنية والشركات الرقمية:</strong> شركات تكنولوجيا المعلومات المؤسسية، وتطبيقات الهواتف الذكية (Enterprise IT & SaaS).</li>
      <li><strong>قطاع السيارات والخدمات اللوجستية:</strong> مراكز خدمة وصيانة السيارات، وشركات النقل والتوريدات.</li>
      <li><strong>الخدمات المهنية والاستشارية:</strong> مكاتب المحاماة، المحاسبة، والاستشارات الإدارية.</li>
    </ul>
  </section>

  <section>
    <h2>نماذج من إنتاجنا المرئي وحملاتنا</h2>
    <p>تشكيلة مختارة من أعمال الفيديو والإنتاج الإبداعي التي قمنا بتنفيذها لشركاء النجاح:</p>
    <ul>
      ${reels
        .map(
          (r) =>
            `<li><strong>${esc(r.title)}</strong> — العميل: ${esc(r.client)} (${esc(r.category)})</li>`,
        )
        .join("\n")}
    </ul>
    <p><a href="${prefix}/reels">شاهد كافة فيديوهات الريلز والإنتاج السينمائي ←</a> | <a href="${prefix}/posts">شاهد سجل تصاميم الهوية والحملات ←</a></p>
  </section>

  <section>
    <h2>آراء وشهادات شركاء النجاح</h2>
    <ul>
      ${testimonials
        .map((t) => `<li><blockquote>"${esc(t.quote)}"</blockquote><cite>— ${esc(t.client)} (${esc(t.role)})</cite></li>`)
        .join("\n")}
    </ul>
  </section>

  <section>
    <h2>أحدث الرؤى والمقالات الاستراتيجية</h2>
    <p>مقالات ودراسات حالة من مدونة سبارك هب لتحسين الأداء التسويقي ونمو الشركات:</p>
    <ul>
      ${recentPosts
        .map(
          (p) =>
            `<li><h3><a href="${prefix}/blog/${esc(p.slug)}">${esc(p.title)}</a></h3><p>${esc(p.excerpt)}</p><small>تاريخ النشر: ${esc(p.publishedAt)} | التصنيف: ${esc(p.category)}</small></li>`,
        )
        .join("\n")}
    </ul>
    <p><a href="${prefix}/blog">تصفح جميع مقالات المدونة ورؤى الأعمال ←</a></p>
  </section>

  <section>
    <h2>الأسئلة الشائعة حول وكالة سبارك هب (FAQ)</h2>
    ${homeFaqs
      .map((f) => `<div class="faq-item"><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></div>`)
      .join("\n")}
  </section>

  <section class="cta-box">
    <h2>ابدأ رحلة نمو وتوسع أعمالك مع سبارك هب</h2>
    <p>تواصل معنا اليوم لمناقشة أهدافك التسويقية والتجارية وبناء منظومة نمو مستدامة لعلامتك التجارية في السعودية ومصر والخليج.</p>
    <a href="${prefix}/contact" class="cta-btn">تواصل معنا الآن واحجز استشارتك</a>
  </section>
</article>`
    : `
<article>
  <header>
    <h1>Spark Hub Studio — Full-Service Digital Marketing Agency & Growth Strategy Studio</h1>
    <p><strong>A 360° Growth & Marketing Powerhouse:</strong> We partner with ambitious enterprises and modern brands across <strong>Saudi Arabia, the UAE, Egypt, and the MENA region</strong> to architect scalable marketing operations, maximize return on ad spend, and capture dominant search visibility.</p>
    <div class="cta-box">
      <h3>Ready to Build the Engine of Your Next Growth Phase?</h3>
      <p>We combine high-level business strategy, performance marketing, cinematic video production, and operational excellence into a clear, predictable growth trajectory.</p>
      <a href="/contact" class="cta-btn">Start a Strategic Conversation</a>
    </div>
  </header>

  <section>
    <h2>360° Marketing & Growth Capabilities</h2>
    <div class="grid-card">
      <h3>1. Performance Marketing & Paid Advertising</h3>
      <p>Scalable paid acquisition across Google Search & Shopping, Meta Ads (Facebook & Instagram), Snapchat, TikTok, and LinkedIn. Laser-focused on reducing Customer Acquisition Cost (CAC) and scaling ROAS.</p>
      <p><a href="/services">Explore Performance Services ←</a></p>
    </div>

    <div class="grid-card">
      <h3>2. Search Engine Optimization & Local SEO</h3>
      <p>Technical SEO audits, commercial keyword dominance, e-commerce SEO (Salla, Zid, Shopify), and Google Business Profile optimization across major MENA commercial hubs (Riyadh, Jeddah, Dubai, Cairo).</p>
      <p><a href="/services">Explore Search Optimization Services ←</a></p>
    </div>

    <div class="grid-card">
      <h3>3. Social Media Management & Creative Strategy</h3>
      <p>End-to-end social media leadership, editorial planning, community nurturing, and brand voice positioning across X, Instagram, LinkedIn, and Snapchat.</p>
      <p><a href="/posts">Explore Work Journal & Campaigns ←</a></p>
    </div>

    <div class="grid-card">
      <h3>4. Commercial Video & Reels Production</h3>
      <p>Cinematic brand films, social-first TikTok & Instagram Reels, product commercials, and high-impact UGC production engineered for viral reach and paid conversion.</p>
      <p><a href="/reels">View Video & Reels Portfolio ←</a></p>
    </div>

    <div class="grid-card">
      <h3>5. Brand Identity & Visual Systems</h3>
      <p>Comprehensive corporate visual languages, brand guidelines, and strategic market positioning that command market authority.</p>
    </div>

    <div class="grid-card">
      <h3>6. Web Development & Conversion Rate Optimization (CRO)</h3>
      <p>Lightning-fast websites, custom sales funnels, and frictionless checkout flows optimized for maximum conversion velocity.</p>
    </div>
  </section>

  <section>
    <h2>Core Service Offerings</h2>
    <ul>
      ${services
        .map(
          (s) =>
            `<li><h3><a href="/services">${esc(s.title)}</a></h3><p>${esc(s.summary)}</p></li>`,
        )
        .join("\n")}
    </ul>
    <p><a href="/services">View Detailed Service Pillars & Capabilities ←</a></p>
  </section>

  <section>
    <h2>Industries & Markets We Serve</h2>
    <ul>
      <li><strong>E-Commerce & Retail:</strong> Fashion, luxury apparel, consumer electronics, food & beverage.</li>
      <li><strong>Healthcare & Pharmaceuticals:</strong> Specialized clinics, hospitals, and pharmaceutical brands.</li>
      <li><strong>Real Estate & Architecture:</strong> Property developers, interior architecture studios, and luxury living.</li>
      <li><strong>Enterprise Technology:</strong> B2B IT solutions, enterprise SaaS, and digital ecosystems.</li>
      <li><strong>Automotive & Logistics:</strong> Auto services, parts distribution, and supply chain enterprises.</li>
    </ul>
  </section>

  <section>
    <h2>What Partners Say</h2>
    <ul>
      ${testimonials
        .map((t) => `<li><blockquote>"${esc(t.quote)}"</blockquote><cite>— ${esc(t.client)} (${esc(t.role)})</cite></li>`)
        .join("\n")}
    </ul>
  </section>

  <section>
    <h2>Latest Insights & Field Notes</h2>
    <ul>
      ${recentPosts
        .map(
          (p) =>
            `<li><h3><a href="/blog/${esc(p.slug)}">${esc(p.title)}</a></h3><p>${esc(p.excerpt)}</p></li>`,
        )
        .join("\n")}
    </ul>
    <p><a href="/blog">Browse All Business & Strategy Articles ←</a></p>
  </section>

  <section>
    <h2>Frequently Asked Questions</h2>
    ${homeFaqs
      .map((f) => `<div class="faq-item"><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></div>`)
      .join("\n")}
  </section>

  <section class="cta-box">
    <h2>Accelerate Your Business Growth with Spark Hub</h2>
    <p>Connect with our senior consulting and marketing team today to assess your growth potential and establish an actionable market expansion plan.</p>
    <a href="/contact" class="cta-btn">Book Your Strategy Session</a>
  </section>
</article>`;

  const pageTitle = isAr
    ? "سبارك هب ستوديو | وكالة تسويق رقمي متكاملة، استشارات نمو الأعمال وهندسة الاستراتيجيات"
    : "Spark Hub Studio — Full-Service Digital Marketing Agency & Growth Studio";

  const pageDesc = isAr
    ? "استوديو استشاري ووكالة تسويق رقمي متكاملة لهندسة نمو الأعمال، إدارة الحملات الإعلانية الممولة (Google, Meta, TikTok)، السيو، تصميم الهوية البصرية، والإنتاج السينمائي في السعودية والخليج ومصر."
    : "Full-service digital marketing agency and growth strategy studio in Saudi Arabia, UAE, and Egypt. Specializing in performance ads, SEO, brand architecture, and media production.";

  const keywords = isAr
    ? [
        "وكالة تسويق رقمي",
        "شركة تسويق الكتروني",
        "استشارات نمو الاعمال",
        "ادارة حملات اعلانية",
        "تحسين محركات البحث SEO",
        "سيو محلي خرائط جوجل",
        "تصميم هوية بصرية",
        "انتاج فيديو وريلز",
        "تسويق الكتروني في السعودية",
        "وكالة تسويق في مصر",
      ]
    : [
        "digital marketing agency",
        "growth consulting studio",
        "performance marketing",
        "SEO services",
        "brand identity design",
        "commercial video production",
        "marketing agency Saudi Arabia",
        "growth engineering",
      ];

  res.type("html").send(
    renderShell({
      title: pageTitle,
      description: pageDesc,
      path: isAr ? "/ar" : "/",
      bodyHtml: body,
      lang,
      dir,
      keywords,
      schemas: [buildFaqSchema(homeFaqs)],
      breadcrumbs: [
        { name: isAr ? "الرئيسية" : "Home", url: isAr ? "/ar" : "/" },
      ],
    }),
  );
});

// ============================================================================
// 2. SERVICES (/services) & (/ar/services) & (/en/services)
// ============================================================================
router.get(["/services", "/ar/services", "/en/services"], async (req, res) => {
  const { isAr, lang, dir, prefix } = getLocaleInfo(req.path);
  const rows = await db.select().from(servicesTable).orderBy(asc(servicesTable.displayOrder));

  const serviceFaqs = isAr
    ? [
        {
          q: "ما هي المنظومة التسويقية التي تقدمها سبارك هب للشركات؟",
          a: "نقدم منظومة تسويقية متكاملة تشمل: 1) التخطيط الاستراتيجي واختراق السوق (GTM)، 2) إدارة الحملات الإعلانية عالية الأداء (Google Ads, Meta, TikTok, Snapchat)، 3) تحسين محركات البحث والسيو المحلي (SEO)، 4) تصميم الهوية البصرية والأنظمة الإبداعية، 5) تصوير الإعلانات وإنتاج الريلز، 6) تطوير المتاجر الإلكترونية وتحسين معدلات التحويل (CRO)، و7) تمكين وتدريب فرق العمل.",
        },
        {
          q: "هل يمكن التعاقد على خدمة محددة أم تتطلب الشراكة جميع الخدمات؟",
          a: "نقدم حلولاً مرنة تناسب مرحلة نمو شركتك؛ حيث يمكن التعاقد على ركيزة محددة كإدارة الإعلانات الممولة أو تحسين محركات البحث أو الإنتاج المرئي، أو الاعتماد على سبارك هب كشريك تسويقي واستشاري متكامل لإدارة المنظومة بالكامل.",
        },
        {
          q: "كيف تقيس سبارك هب نجاح الخدمات التسويقية والاستشارية؟",
          a: "نعتمد على مؤشرات أداء تجارية ومالية واضحة ومباشرة (Business & Commercial KPIs) مثل: العائد على الإنفاق الإعلاني (ROAS)، تكلفة الاستحواذ على العميل (CAC)، القيمة التراكمية للعميل (LTV)، معدل التحويل التجاري (Conversion Rate)، ونمو المبيعات الصافية، بعيداً عن أرقام المشاهدات السطحية.",
        },
        {
          q: "هل تدعم سبارك هب متاجر سلة وزد وشوبيفاي في تحسين السيو والإعلانات؟",
          a: "نعم، لدينا برامج متخصصة لنمو المتاجر الإلكترونية على منصات سلة (Salla)، وزد (Zid)، وشوبيفاي (Shopify) تشمل تهيئة السيو التقني للرتب الأولى، وإدارة إعلانات الشوبينج والسوشيال، وحملات إعادة الاستهداف الذكية.",
        },
      ]
    : [
        {
          q: "What marketing services does Spark Hub Studio offer?",
          a: "We offer end-to-end marketing & consulting services: GTM Growth Strategy, Performance Paid Media (Google, Meta, TikTok, Snap), Technical & Local SEO, Brand Identity Systems, Commercial Video & Reels Production, E-Commerce Optimization (CRO), and Executive Training.",
        },
        {
          q: "Can we engage Spark Hub for a specific service pillar?",
          a: "Yes. Engagements can be tailored to a focused objective (e.g. Scaling Paid Ads, SEO Dominance, or Rebranding) or delivered as an integrated full-service growth partnership.",
        },
        {
          q: "How do you measure marketing ROI?",
          a: "We prioritize bottom-line business metrics: Return on Ad Spend (ROAS), Customer Acquisition Cost (CAC), Customer Lifetime Value (LTV), Conversion Rate (CVR), and net revenue velocity.",
        },
      ];

  const body = isAr
    ? `
<article>
  <header>
    <h1>منظومة الخدمات التسويقية والاستشارية المتكاملة | سبارك هب ستوديو</h1>
    <p><strong>خدمات متكاملة لهندسة وتوسيع الأعمال:</strong> نطور المنظومات التسويقية والرقمية للشركات والمتاجر في السعودية ومصر والخليج من خلال دمج الاستراتيجية المحكمة مع كفاءة التنفيذ الإبداعي والإعلاني.</p>
  </header>

  <section>
    <h2>الركائز الاستراتيجية والتنفيذية لخدمات سبارك هب</h2>
    <p>تم تصميم خدماتنا لمعالجة كامل مسار العميل من بناء الوعي بالعلامة وحتى إتمام الشراء وتكراره:</p>

    <div class="grid-card">
      <h3>1. التخطيط المؤسسي وهندسة التوسع واختراق السوق (GTM & Growth Strategy)</h3>
      <p>رسم خرائط اختراق السوق، تحليل المنافسين، هندسة مسارات المبيعات والتحويل الرقمي، وتصميم الهيكل التسويقي للشركات لضمان نمو متوازن ومستدام.</p>
    </div>

    <div class="grid-card">
      <h3>2. التسويق عالي الأداء وإدارة الحملات الإعلانية (Performance Marketing)</h3>
      <p>توجيه الإنفاق الإعلاني باحترافية على Google Ads (Search, Display, Shopping, YouTube), Meta (Facebook & Instagram), Snapchat, TikTok, وLinkedIn. إدارة الميزانيات، خفض تكلفة الاستحواذ (CAC)، ومضاعفة العائد على الإنفاق (ROAS).</p>
    </div>

    <div class="grid-card">
      <h3>3. تحسين محركات البحث وسيو المتاجر والشركات (SEO & Local Search)</h3>
      <p>خدمات السيو الشاملة: السيو التقني (Technical SEO)، السيو الداخلي (On-Page SEO)، استراتيجيات الكلمات المفتاحية، بناء الروابط الخلفية القوية (Backlinks)، سيو المتاجر (سلة، زد، شوبيفاي)، والظهور في المراتب الأولى على خرائط جوجل (Google Maps).</p>
    </div>

    <div class="grid-card">
      <h3>4. صناعة المحتوى وإدارة منصات التواصل الاجتماعي (Social Media & Content)</h3>
      <p>إدارة حسابات السوشيال ميديا باحترافية، صناعة المحتوى التحريري والمرئي، تصميم المنشورات التفاعلية، وإدارة حملات التوعية وبناء المجتمعات الرقمية.</p>
    </div>

    <div class="grid-card">
      <h3>5. الإنتاج السينمائي، تصوير المنتجات والريلز (Commercial Video & Reels)</h3>
      <p>إنتاج مقاطع فيديو سينمائية، تصوير إعلانات المنتجات، وكتابة سيناريوهات الريلز والفيديوهات القصيرة عالية الانتشار لمنصات TikTok وInstagram وSnapchat.</p>
      <p><a href="${prefix}/reels">تصفح نماذج أعمال الفيديو والريلز ←</a></p>
    </div>

    <div class="grid-card">
      <h3>6. بناء الهوية البصرية والأنظمة الإبداعية (Branding & Design Systems)</h3>
      <p>تصميم هويات بصرية مؤسسية، أدلة استخدام العلامة التجارية (Brand Guidelines)، تصميم العبوات والمطبوعات، وتوحيد الأصول الرقمية لتعزيز تموضع العلامة التجارية في السوق.</p>
      <p><a href="${prefix}/posts">شاهد سجل تصاميم الحملات والهويات ←</a></p>
    </div>

    <div class="grid-card">
      <h3>7. تطوير المتاجر والمواقع الرقمية وتحسين معدلات التحويل (E-Commerce & CRO)</h3>
      <p>بناء وتطوير صفحات الهبوط والمواقع الإلكترونية، تحسين سرعة التصفح، تبسيط خطوات الشراء، وزيادة نسبة الزوار المتحولين إلى عملاء فعليين.</p>
    </div>

    <div class="grid-card">
      <h3>8. تمكين الكفاءات وتدريب القيادات (Leadership & Team Enablement)</h3>
      <p>نقل الخبرة المعرفية والعملية لفرق العمل الداخلية، وبرامج تدريب متقدمة في المبيعات الاستشارية، والتحليل الرقمي، وإدارة المشاريع التسويقية.</p>
    </div>
  </section>

  <section>
    <h2>تفاصيل الخدمات الاستشارية والتنفيذية المعتمدة</h2>
    <ul>
      ${rows
        .map(
          (s) => `
      <li>
        <h2>${esc(s.title)}</h2>
        <span class="badge">${esc(s.category)}</span>
        <p>${esc(s.summary)}</p>
        <h4>أبرز مخرجات ونطاق الخدمة:</h4>
        <ul>
          ${s.details.map((d) => `<li>${esc(d)}</li>`).join("")}
        </ul>
      </li>`,
        )
        .join("\n")}
    </ul>
  </section>

  <section>
    <h2>مراحل العمل والتعاون مع سبارك هب</h2>
    <ol>
      <li><strong>1. التشخيص والاستكشاف الأولي:</strong> تقييم شامل لوضع الشركة التسويقي، تحليل المنافسين، وتحديد فرص النمو غير المستغلة.</li>
      <li><strong>2. صياغة الاستراتيجية وخطة العمل:</strong> بناء خارطة طريق دقيقة تحدد القنوات الإعلانية، الرسائل التسويقية، والميزانيات المقترحة.</li>
      <li><strong>3. التنفيذ الإبداعي وإطلاق الحملات:</strong> إنتاج الأصول البصرية والمحتوى، وإعداد الحملات الإعلانية، وتهيئة السيو.</li>
      <li><strong>4. التحليل والتحسين المستمر:</strong> مراقبة دقيقة لمؤشرات الأداء، واختبارات التحسين المستمر لتعظيم الأرباح وخفض التكاليف.</li>
    </ol>
  </section>

  <section>
    <h2>الأسئلة الشائعة حول خدماتنا</h2>
    ${serviceFaqs
      .map((f) => `<div class="faq-item"><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></div>`)
      .join("\n")}
  </section>

  <section class="cta-box">
    <h2>هل تبحث عن شريك تسويقي واستشاري موثوق؟</h2>
    <p>تواصل مع فريقنا اليوم لمناقشة احتياجات شركتك وبناء باقة الخدمات الأنسب لأهدافك التجارية.</p>
    <a href="${prefix}/contact" class="cta-btn">ابدأ محادثة عمل استراتيجية</a>
  </section>
</article>`
    : `
<article>
  <header>
    <h1>Strategic Marketing & Growth Consulting Services — Spark Hub Studio</h1>
    <p><strong>Integrated Business Expansion Framework:</strong> Full-service digital marketing solutions engineered to accelerate revenue, scale paid acquisition, and establish commanding search and brand presence across Saudi Arabia, UAE, and MENA.</p>
  </header>

  <section>
    <h2>Integrated Service Pillars & Capabilities</h2>
    <p>Our solutions cover the entire customer lifecycle from initial brand discovery to repeat purchase and customer retention:</p>

    <div class="grid-card">
      <h3>1. Go-to-Market & Business Expansion Strategy (GTM)</h3>
      <p>Market penetration roadmaps, competitor intelligence, sales funnel architecture, and scalable marketing department structuring.</p>
    </div>

    <div class="grid-card">
      <h3>2. Performance Marketing & Paid Advertising</h3>
      <p>Data-driven ad management across Google Ads (Search, Shopping, Display, YouTube), Meta Ads (Facebook & Instagram), Snapchat Ads, TikTok Ads, and LinkedIn Ads. Maximizing ROAS and minimizing CAC.</p>
    </div>

    <div class="grid-card">
      <h3>3. Search Engine Optimization & Local Search (SEO)</h3>
      <p>Technical SEO audits, on-page optimization, high-authority backlink architecture, e-commerce SEO (Salla, Zid, Shopify), and Google Maps local dominance across Riyadh, Jeddah, Dubai, and Cairo.</p>
    </div>

    <div class="grid-card">
      <h3>4. Social Media Management & Editorial Leadership</h3>
      <p>Strategic editorial planning, high-engagement content creation, community management, and active audience building across X, Instagram, LinkedIn, and Snapchat.</p>
    </div>

    <div class="grid-card">
      <h3>5. Commercial Video & Reels Production</h3>
      <p>Cinematic brand films, product commercials, and viral social-first Reels/TikToks designed with high-conversion hooks.</p>
      <p><a href="/reels">Explore Video & Reels Portfolio ←</a></p>
    </div>

    <div class="grid-card">
      <h3>6. Brand Identity & Visual Systems</h3>
      <p>Corporate identity design, comprehensive Brand Guidelines, packaging design, and visual assets that command market authority.</p>
      <p><a href="/posts">Explore Brand & Campaign Journal ←</a></p>
    </div>

    <div class="grid-card">
      <h3>7. Web Development & Conversion Rate Optimization (CRO)</h3>
      <p>High-converting landing pages, seamless checkout flows, performance speed optimization, and rigorous A/B testing.</p>
    </div>

    <div class="grid-card">
      <h3>8. Leadership & Team Enablement</h3>
      <p>Transferring institutional marketing and analytical capabilities to internal client teams through executive enablement sessions.</p>
    </div>
  </section>

  <section>
    <h2>Certified Advisory & Execution Offerings</h2>
    <ul>
      ${rows
        .map(
          (s) => `
      <li>
        <h2>${esc(s.title)}</h2>
        <span class="badge">${esc(s.category)}</span>
        <p>${esc(s.summary)}</p>
        <h4>Core Deliverables & Scope:</h4>
        <ul>
          ${(s.details || []).map((d) => `<li>${esc(d)}</li>`).join("")}
        </ul>
      </li>`,
        )
        .join("\n")}
    </ul>
  </section>

  <section>
    <h2>Our Proven Growth Methodology</h2>
    <ol>
      <li><strong>1. Strategic Discovery & Diagnostics:</strong> Comprehensive audit of current marketing performance, competitive landscape, and untapped acquisition channels.</li>
      <li><strong>2. Strategy & Roadmap Architecture:</strong> Designing a tailored marketing plan defining channel mix, messaging frameworks, and budget allocation.</li>
      <li><strong>3. Creative Execution & Campaign Launch:</strong> Crafting visual assets, launching optimized performance campaigns, and rolling out technical SEO enhancements.</li>
      <li><strong>4. Analytics & Continuous Optimization:</strong> Rigorous KPI monitoring, continuous split testing, and performance scaling to maximize net ROI.</li>
    </ol>
  </section>

  <section>
    <h2>Frequently Asked Questions</h2>
    ${serviceFaqs
      .map((f) => `<div class="faq-item"><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></div>`)
      .join("\n")}
  </section>

  <section class="cta-box">
    <h2>Transform Your Marketing into a Predictable Growth Engine</h2>
    <p>Partner with Spark Hub Studio to engineer sustainable market leadership across Saudi Arabia, the UAE, and Egypt.</p>
    <a href="/contact" class="cta-btn">Book Your Strategy Session</a>
  </section>
</article>`;

  const pageTitle = isAr
    ? "خدمات التسويق الرقمي وهندسة نمو الأعمال | سبارك هب ستوديو"
    : "Digital Marketing & Business Growth Services — Spark Hub Studio";

  const pageDesc = isAr
    ? "منظومة خدمات تسويقية واستشارية شاملة: إدارة الحملات الإعلانية الممولة (Google, Meta, TikTok)، تحسين محركات البحث SEO، السيو المحلي، تصميم الهوية البصرية، والإنتاج السينمائي."
    : "Comprehensive digital marketing and growth services: Performance ads, technical and local SEO, brand systems, commercial video production, and conversion rate optimization.";

  const keywords = isAr
    ? [
        "خدمات تسويق الكتروني",
        "ادارة اعلانات جوجل",
        "اعلانات تيك توك وسناب شات",
        "سيو متاجر سلة وزد",
        "تصميم هوية تجارية",
        "انتاج ريلز اعلانية",
        "استشارات تسويقية للشركات",
      ]
    : [
        "marketing services",
        "paid advertising management",
        "SEO services",
        "commercial video production",
        "brand design services",
        "growth consulting",
      ];

  res.type("html").send(
    renderShell({
      title: pageTitle,
      description: pageDesc,
      path: isAr ? "/ar/services" : "/services",
      bodyHtml: body,
      lang,
      dir,
      keywords,
      schemas: [
        buildFaqSchema(serviceFaqs),
        ...(rows.length > 0
          ? [
              {
                "@context": "https://schema.org",
                "@type": "ItemList",
                "itemListElement": rows.map((s, idx) => ({
                  "@type": "Service",
                  "position": idx + 1,
                  "name": s.title,
                  "description": s.summary,
                  "provider": {
                    "@type": "ProfessionalService",
                    "name": SITE_NAME,
                  },
                })),
              },
            ]
          : []),
      ],
      breadcrumbs: [
        { name: isAr ? "الرئيسية" : "Home", url: isAr ? "/ar" : "/" },
        { name: isAr ? "الخدمات" : "Services", url: isAr ? "/ar/services" : "/services" },
      ],
    }),
  );
});

// ============================================================================
// 3. REELS & MEDIA (/reels) & (/ar/reels) & (/en/reels)
// ============================================================================
router.get(["/reels", "/ar/reels", "/en/reels"], async (req, res) => {
  const { isAr, lang, dir, prefix } = getLocaleInfo(req.path);
  const rows = await db.select().from(reelsTable).orderBy(asc(reelsTable.displayOrder));

  const reelsFaqs = isAr
    ? [
        {
          q: "ما هي خدمات إنتاج الفيديو والريلز التي يقدمها استوديو سبارك هب؟",
          a: "نقدم إنتاجاً سينمائياً وإعلامياً متكاملاً يشمل: كتابة السيناريو الإعلاني، تصوير فيديوهات Reels وTikTok وShorts احترافية، تصوير إعلانات المنتجات، التوجيه الإبداعي، المونتاج المتقدم، تصحيح الألوان، وتصميم المؤثرات الصوتية والبصرية.",
        },
        {
          q: "كيف تساعد فيديوهات الريلز في زيادة مبيعات الشركات والمتاجر؟",
          a: "الفيديوهات القصيرة (Short-Form Video) هي الأداة الأقوى حالياً للانتشار العضوي وجذب انتباه العملاء. ندمج الجاذبية البصرية مع نصوص موجهة للإقناع والتحويل المباشر لرفع معدل النقر (CTR) وخفض تكلفة الشراء في الإعلانات.",
        },
        {
          q: "هل تتولى سبارك هب مرحلة الإنتاج من الفكرة وحتى التسليم النهائي؟",
          a: "نعم، نتولى كافة مراحل العمل: بدءاً من جلسة العصف الذهني وصياغة الفكرة، واختيار مواقع التصوير والممثلين والمعدات، مروراً بيوم التصوير، وحتى المونتاج والتحسين لخوارزميات منصات التواصل.",
        },
      ]
    : [
        {
          q: "What video production services does Spark Hub provide?",
          a: "We produce end-to-end commercial video content: creative scripting, cinematic filming, social Reels/TikToks, product commercials, advanced post-production, motion graphics, and platform algorithmic optimization.",
        },
        {
          q: "How does short-form video impact performance marketing?",
          a: "Short-form video drives higher organic engagement and significantly elevates paid campaign click-through rates (CTR) while lowering customer acquisition costs.",
        },
      ];

  const body = isAr
    ? `
<article>
  <header>
    <h1>إنتاج الفيديو الإعلاني، الريلز والمحتوى المرئي عالي التأثير | سبارك هب ستوديو</h1>
    <p><strong>الإنتاج السينمائي والميديا المتخصصة:</strong> نصنع عوالم بصرية وقصصاً سينمائية تأسر الانتباه وتدفع المشاهدين إلى التفاعل واتخاذ القرار عبر منصات تيك توك، إنستغرام ريلز، وسناب شات سبوتلايت.</p>
  </header>

  <section>
    <h2>قدرات الإنتاج الإبداعي والمرئي في سبارك هب</h2>
    <div class="grid-card">
      <h3>1. صناعة فيديوهات الريلز والتيك توك (Social-First Short-Form Video)</h3>
      <p>فيديوهات سريعة، جذابة، ومصممة خصيصاً للتوافق مع خوارزميات السوشيال ميديا وتحقيق انتشار واسع (Viral Reach).</p>
    </div>

    <div class="grid-card">
      <h3>2. تصوير الإعلانات التجارية والمنتجات (Commercial & Product Shoots)</h3>
      <p>إبراز تفاصيل وجودة المنتجات بأسلوب بصري ساحر ومعدات تصوير سينمائية احترافية تعزز الثقة بالعلامة التجارية وتضاعف المبيعات.</p>
    </div>

    <div class="grid-card">
      <h3>3. التوجيه الإبداعي وكتابة السيناريو (Creative Direction & Scriptwriting)</h3>
      <p>صياغة أفكار غير تقليدية، وخطافات بصرية قوية (Hooks)، ونصوص مقنعة تحافظ على تركيز المشاهد حتى اللحظة الأخيرة.</p>
    </div>

    <div class="grid-card">
      <h3>4. المونتاج المتقدم والموشن جرافيكس (Post-Production & Motion Design)</h3>
      <p>مونتاج احترافي، تدرج لوني سينمائي (Color Grading)، هندسة صوتية وتأثيرات بصرية تعكس فخامة واحترافية العلامة التجارية.</p>
    </div>
  </section>

  <section>
    <h2>معرض أعمال الفيديو والريلز</h2>
    <p>نماذج من مقاطع الفيديو والحملات المرئية التي قمنا بإنتاجها لشركاء النجاح:</p>
    <ul>
      ${rows
        .map(
          (r) => `
      <li>
        <h2>${esc(r.title)}</h2>
        <p><strong>العميل:</strong> ${esc(r.client)} | <strong>التصنيف:</strong> ${esc(r.category)}</p>
        ${r.thumbnailUrl ? `<img src="${esc(r.thumbnailUrl)}" alt="${esc(r.thumbnailAlt || r.title)}" loading="lazy" />` : ""}
      </li>`,
        )
        .join("\n")}
    </ul>
  </section>

  <section>
    <h2>الأسئلة الشائعة حول إنتاج الفيديو والريلز</h2>
    ${reelsFaqs
      .map((f) => `<div class="faq-item"><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></div>`)
      .join("\n")}
  </section>

  <section class="cta-box">
    <h2>جاهز لإنتاج فيديو إعلاني يصنع الفارق لعلامتك؟</h2>
    <p>تواصل معنا اليوم لمناقشة أفكارك وبدء التخطيط لحملتك المرئية القادمة مع فريق الإنتاج السينمائي في سبارك هب.</p>
    <a href="${prefix}/contact" class="cta-btn">احجز جلسة إنتاج إبداعي</a>
  </section>
</article>`
    : `
<article>
  <header>
    <h1>Commercial Video Production, Reels & Visual Storytelling — Spark Hub Studio</h1>
    <p><strong>Cinematic Production & Media House:</strong> We craft immersive visual universes and commercial stories designed to captivate audiences and drive conversions across TikTok, Instagram Reels, and Snapchat Spotlight.</p>
  </header>

  <section>
    <h2>Creative Production Capabilities</h2>
    <div class="grid-card">
      <h3>1. Social-First Short-Form Video (Reels & TikTok)</h3>
      <p>High-tempo, algorithmically optimized short-form videos designed for organic virality and scalable paid social campaigns.</p>
    </div>

    <div class="grid-card">
      <h3>2. Commercial & Product Shoots</h3>
      <p>Showcasing product craftsmanship and brand value with cinema-grade cinematography, precision lighting, and tailored set designs.</p>
    </div>

    <div class="grid-card">
      <h3>3. Creative Direction & Scriptwriting</h3>
      <p>Compelling visual hooks, persuasive copywriting, and narrative arcs engineered to hold viewer retention through the conversion call-to-action.</p>
    </div>

    <div class="grid-card">
      <h3>4. Post-Production & Motion Design</h3>
      <p>Cinema color grading, custom sound design, VFX, and motion graphics that elevate brand perceived value.</p>
    </div>
  </section>

  <section>
    <h2>Video Production Portfolio</h2>
    <p>Selected commercial films, product shoots, and social campaign reels produced for our partners:</p>
    <ul>
      ${rows
        .map(
          (r) => `
      <li>
        <h2>${esc(r.title)}</h2>
        <p><strong>Client:</strong> ${esc(r.client)} | <strong>Category:</strong> ${esc(r.category)}</p>
        ${r.thumbnailUrl ? `<img src="${esc(r.thumbnailUrl)}" alt="${esc(r.thumbnailAlt || r.title)}" loading="lazy" />` : ""}
      </li>`,
        )
        .join("\n")}
    </ul>
    <p><a href="/services">Explore Integrated Marketing Services ←</a> | <a href="/posts">Explore Visual Identity & Campaigns ←</a></p>
  </section>

  <section>
    <h2>Frequently Asked Questions</h2>
    ${reelsFaqs
      .map((f) => `<div class="faq-item"><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></div>`)
      .join("\n")}
  </section>

  <section class="cta-box">
    <h2>Produce High-Impact Video Content with Spark Hub</h2>
    <p>Partner with our production team to craft high-conversion video assets for your next campaign.</p>
    <a href="/contact" class="cta-btn">Start Your Production</a>
  </section>
</article>`;

  const pageTitle = isAr
    ? "إنتاج الفيديو الإعلاني، الريلز والمحتوى المرئي | سبارك هب ستوديو"
    : "Commercial Video Production & Reels — Spark Hub Studio";

  const pageDesc = isAr
    ? "استوديو إنتاج سينمائي وتصوير إعلاني متخصص في صناعة فيديوهات Reels وTikTok، تصوير المنتجات، والموشن جرافيك للعلامات التجارية في السعودية ومصر والخليج."
    : "Cinematic commercial video production, social reels, TikTok content creation, and product commercials engineered for high engagement and performance.";

  const keywords = isAr
    ? [
        "انتاج فيديو اعلاني",
        "تصوير ريلز وتيك توك",
        "تصوير منتجات احترافي",
        "انتاج اعلانات سينمائية",
        "صناعة محتوى مرئي",
        "استوديو تصوير اعلانات",
      ]
    : [
        "commercial video production",
        "social reels production",
        "tiktok video marketing",
        "product commercial filming",
        "cinematic video studio",
      ];

  res.type("html").send(
    renderShell({
      title: pageTitle,
      description: pageDesc,
      path: isAr ? "/ar/reels" : "/reels",
      bodyHtml: body,
      lang,
      dir,
      keywords,
      schemas: [
        buildFaqSchema(reelsFaqs),
        ...(rows.length > 0
          ? [
              {
                "@context": "https://schema.org",
                "@type": "ItemList",
                "itemListElement": rows.map((r, idx) => ({
                  "@type": "VideoObject",
                  "position": idx + 1,
                  "name": r.title,
                  "description": `${r.title} - ${r.client} (${r.category})`,
                  "thumbnailUrl": r.thumbnailUrl || `${SITE_URL}/og-image.png`,
                  "uploadDate": new Date().toISOString(),
                })),
              },
            ]
          : []),
      ],
      breadcrumbs: [
        { name: isAr ? "الرئيسية" : "Home", url: isAr ? "/ar" : "/" },
        { name: isAr ? "ريلز وميديا" : "Reels", url: isAr ? "/ar/reels" : "/reels" },
      ],
    }),
  );
});

// ============================================================================
// 4. PODCASTS (/podcasts) & (/ar/podcasts) & (/en/podcasts)
// ============================================================================
router.get(["/podcasts", "/ar/podcasts", "/en/podcasts"], async (req, res) => {
  const { isAr, lang, dir, prefix } = getLocaleInfo(req.path);
  const rows = await db
    .select()
    .from(podcastsTable)
    .orderBy(asc(podcastsTable.displayOrder), asc(podcastsTable.id));

  const podcastFaqs = isAr
    ? [
        {
          q: "ما هي المحاور التي يناقشها بودكاست سبارك هب؟",
          a: "يناقش البودكاست قضايا استراتيجية حيوية في بناء وتوسيع الشركات، قيادة التسويق الحديث، هندسة العمليات، بناء العلامات التجارية، والتحول الرقمي في أسواق الشرق الأوسط والخليج.",
        },
        {
          q: "من هم الضيوف المشاركون في حلقات البودكاست؟",
          a: "نستضيف نخبة من الرؤساء التنفيذيين، رواد الأعمال، خبراء التسويق، وصناع القرار لمشاركة تجاربهم العملية والدروس المستفادة في مسيرة النجاح.",
        },
      ]
    : [
        {
          q: "What topics are covered in the Spark Hub Podcast?",
          a: "We explore executive growth strategies, modern marketing architecture, enterprise operations, brand positioning, and venture scalability across MENA and global markets.",
        },
      ];

  const body = isAr
    ? `
<article>
  <header>
    <h1>بودكاست سبارك هب | حوارات استراتيجية في الأعمال، التسويق وبناء العلامات التجارية</h1>
    <p><strong>حوارات معمقة للأفكار والقرارات الحاسمة:</strong> جلسات نقاشية صوتية ومرئية مع قادة الصناعة ورواد الأعمال لاستكشاف استراتيجيات التوسع المؤسسي، وبناء العلامات المستدامة.</p>
  </header>

  <section>
    <h2>سجل الحلقات والمحاور الصوتية</h2>
    <ul>
      ${rows
        .map(
          (p) => `
      <li>
        <h2>${esc(p.title)}</h2>
        <p><strong>${p.episodeNumber ? `الحلقة: ${esc(p.episodeNumber)} • ` : ""}المحاور:</strong> ${esc(p.host)}${p.guest ? ` مع الضيف: ${esc(p.guest)}` : ""} | <strong>التصنيف:</strong> ${esc(p.category)} ${p.duration ? `(${esc(p.duration)})` : ""}</p>
        <p>${esc(p.description || "")}</p>
      </li>`,
        )
        .join("\n")}
    </ul>
  </section>

  <section>
    <h2>الأسئلة الشائعة حول البودكاست</h2>
    ${podcastFaqs
      .map((f) => `<div class="faq-item"><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></div>`)
      .join("\n")}
  </section>

  <section class="cta-box">
    <h2>هل تود المشاركة كضيف أو رعاية إحدى الحلقات؟</h2>
    <p>تواصل مع فريق الإنتاج الإعلامي في سبارك هب لمناقشة فرص التعاون والرعاية.</p>
    <a href="${prefix}/contact" class="cta-btn">تواصل مع فريق الإنتاج</a>
  </section>
</article>`
    : `
<article>
  <header>
    <h1>Spark Hub Podcasts — Executive Conversations on Business, Brand & Growth</h1>
    <p><strong>Deep Strategic Dialogues:</strong> Audio and video deep-dives with industry leaders, founders, and marketing innovators exploring sustainable business scaling and market positioning across MENA and global markets.</p>
  </header>

  <section>
    <h2>Episodes Archive & Themes</h2>
    <ul>
      ${rows
        .map(
          (p) => `
      <li>
        <h2>${esc(p.title)}</h2>
        <p><strong>${p.episodeNumber ? `Episode ${esc(p.episodeNumber)} • ` : ""}Host:</strong> ${esc(p.host)}${p.guest ? ` with ${esc(p.guest)}` : ""} | <strong>Category:</strong> ${esc(p.category)} ${p.duration ? `(${esc(p.duration)})` : ""}</p>
        <p>${esc(p.description || "")}</p>
      </li>`,
        )
        .join("\n")}
    </ul>
    <p><a href="/blog">Explore Strategy Notes & Articles ←</a> | <a href="/services">Explore Consulting Services ←</a></p>
  </section>

  <section>
    <h2>Frequently Asked Questions</h2>
    ${podcastFaqs
      .map((f) => `<div class="faq-item"><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></div>`)
      .join("\n")}
  </section>

  <section class="cta-box">
    <h2>Interested in Guesting or Sponsoring an Episode?</h2>
    <p>Connect with our media production team to discuss sponsorship opportunities and executive thought leadership features.</p>
    <a href="/contact" class="cta-btn">Contact Production Team</a>
  </section>
</article>`;

  const pageTitle = isAr
    ? "بودكاست وحوارات استراتيجية في الأعمال والتسويق | سبارك هب ستوديو"
    : "Podcasts & Executive Dialogues — Spark Hub Studio";

  const pageDesc = isAr
    ? "استمع إلى بودكاست سبارك هب: حوارات معمقة مع خبراء التسويق وقيادات الأعمال حول استراتيجيات النمو، بناء العلامات التجارية، والابتكار المؤسسي."
    : "Listen to Spark Hub podcasts featuring strategic conversations on marketing architecture, leadership, brand building, and sustainable enterprise scaling.";

  res.type("html").send(
    renderShell({
      title: pageTitle,
      description: pageDesc,
      path: isAr ? "/ar/podcasts" : "/podcasts",
      bodyHtml: body,
      lang,
      dir,
      schemas: [
        buildFaqSchema(podcastFaqs),
        ...(rows.length > 0
          ? [
              {
                "@context": "https://schema.org",
                "@type": "PodcastSeries",
                "name": isAr ? "بودكاست سبارك هب" : "Spark Hub Podcast",
                "description": pageDesc,
                "url": `${SITE_URL}${isAr ? "/ar/podcasts" : "/podcasts"}`,
                "hasPart": rows.map((p, idx) => ({
                  "@type": "AudioObject",
                  "position": idx + 1,
                  "name": p.title,
                  "description": p.description || p.title,
                  "duration": p.duration || undefined,
                  "contentUrl": p.audioUrl || undefined,
                })),
              },
            ]
          : []),
      ],
      breadcrumbs: [
        { name: isAr ? "الرئيسية" : "Home", url: isAr ? "/ar" : "/" },
        { name: isAr ? "بودكاست" : "Podcasts", url: isAr ? "/ar/podcasts" : "/podcasts" },
      ],
    }),
  );
});

// ============================================================================
// 5. POSTS / PORTFOLIO (/posts) & (/ar/posts) & (/en/posts)
// ============================================================================
router.get(["/posts", "/ar/posts", "/en/posts"], async (req, res) => {
  const { isAr, lang, dir, prefix } = getLocaleInfo(req.path);
  const rows = await db.select().from(postsTable).orderBy(asc(postsTable.displayOrder));

  const postsFaqs = isAr
    ? [
        {
          q: "ما نوع الأعمال والتصاميم المعروضة في هذا السجل؟",
          a: "يعرض السجل نماذج من الحملات الإعلانية متعددة المنصات، تصاميم الهوية البصرية، الإعلانات الموجهة للتحويل (Performance Creatives)، وحزم الأصول الرقمية المنفذة لعلامات تجارية رائدة.",
        },
        {
          q: "كيف تضمن سبارك هب اتساق الهوية البصرية عبر جميع القنوات؟",
          a: "نقوم بتطوير نظام هوية مرئي متكامل ودليل إرشادي صارم (Design System & Brand Guidelines) يضمن توحيد الألوان والخطوط ونبرة الصوت عبر الإعلانات، منصات التواصل، التغليف، والموقع الإلكتروني.",
        },
      ]
    : [
        {
          q: "What types of creative work are included in this showcase?",
          a: "The journal highlights multi-channel ad creatives, visual identity systems, performance creative kits, and campaign assets developed for leading enterprise clients.",
        },
        {
          q: "How does Spark Hub maintain visual consistency across channels?",
          a: "We develop comprehensive design systems and strict brand guidelines ensuring color fidelity, typography hierarchy, and tone-of-voice alignment across all digital touchpoints.",
        },
      ];

  const body = isAr
    ? `
<article>
  <header>
    <h1>سجل الأعمال، الحملات الإعلانية والتصاميم الإبداعية | سبارك هب ستوديو</h1>
    <p><strong>معرض التوجيه الإبداعي والهويات الرقمية:</strong> تشكيلة مختارة من الحملات الإعلانية، تصاميم منصات التواصل الاجتماعي، والهويات البصرية التي صُممت لتعزيز مكانة العلامة ومضاعفة التفاعل والمبيعات.</p>
  </header>

  <section>
    <h2>معرض الحملات والتصاميم المنفذة</h2>
    <ul>
      ${rows
        .map(
          (p) => `
      <li>
        <h2>${esc(p.client)} — <span class="badge">${esc(p.category)}</span></h2>
        <p>${esc(p.caption)}</p>
        ${p.imageUrls && p.imageUrls.length > 0 ? `<img src="${esc(p.imageUrls[0])}" alt="${esc(p.imageAlt || p.client)}" loading="lazy" />` : ""}
      </li>`,
        )
        .join("\n")}
    </ul>
    <p><a href="${prefix}/services">استكشف خدمات التسويق والإعلانات ←</a> | <a href="${prefix}/reels">شاهد معرض إنتاج الفيديو والريلز ←</a></p>
  </section>

  <section>
    <h2>الأسئلة الشائعة حول أعمالنا الإبداعية</h2>
    ${postsFaqs
      .map((f) => `<div class="faq-item"><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></div>`)
      .join("\n")}
  </section>

  <section class="cta-box">
    <h2>هل تريد بناء حملة إعلانية أو هوية بصرية متميزة؟</h2>
    <p>تواصل مع فريق التصميم والتوجيه الإبداعي في سبارك هب لتحويل رؤية علامتك التجارية إلى واقع ملموس.</p>
    <a href="${prefix}/contact" class="cta-btn">ابدأ مشروعك الإبداعي معنا</a>
  </section>
</article>`
    : `
<article>
  <header>
    <h1>Creative Campaigns & Work Journal — Spark Hub Studio</h1>
    <p><strong>Curated Showcase of Creative Direction & Visual Systems:</strong> High-impact multi-channel ad campaigns, social media creative kits, and corporate identity systems engineered for brand authority and conversion velocity.</p>
  </header>

  <section>
    <h2>Campaigns & Creative Showcase</h2>
    <ul>
      ${rows
        .map(
          (p) => `
      <li>
        <h2>${esc(p.client)} — <span class="badge">${esc(p.category)}</span></h2>
        <p>${esc(p.caption)}</p>
        ${p.imageUrls && p.imageUrls.length > 0 ? `<img src="${esc(p.imageUrls[0])}" alt="${esc(p.imageAlt || p.client)}" loading="lazy" />` : ""}
      </li>`,
        )
        .join("\n")}
    </ul>
    <p><a href="/services">Explore Integrated Marketing Services ←</a> | <a href="/reels">Explore Video & Reels Production ←</a></p>
  </section>

  <section>
    <h2>Frequently Asked Questions</h2>
    ${postsFaqs
      .map((f) => `<div class="faq-item"><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></div>`)
      .join("\n")}
  </section>

  <section class="cta-box">
    <h2>Ready to Architect a Standout Brand Campaign?</h2>
    <p>Partner with our creative and performance design team to bring your brand vision to life.</p>
    <a href="/contact" class="cta-btn">Start Your Creative Project</a>
  </section>
</article>`;

  const pageTitle = isAr
    ? "سجل الأعمال والحملات الإعلانية والهوية البصرية | سبارك هب ستوديو"
    : "Work Journal & Creative Campaigns — Spark Hub Studio";

  const pageDesc = isAr
    ? "تصفح سجل أعمال سبارك هب: نماذج من الحملات الإعلانية، تصاميم الهوية التجارية، ومحتوى منصات التواصل للشركات في السعودية ومصر والخليج."
    : "Explore Spark Hub's portfolio of creative advertising campaigns, brand identity systems, and performance creative assets.";

  res.type("html").send(
    renderShell({
      title: pageTitle,
      description: pageDesc,
      path: isAr ? "/ar/posts" : "/posts",
      bodyHtml: body,
      lang,
      dir,
      schemas: [
        buildFaqSchema(postsFaqs),
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": isAr ? "سجل الأعمال والحملات الإعلانية" : "Creative Campaigns & Work Journal",
          "description": pageDesc,
          "mainEntity": {
            "@type": "ItemList",
            "itemListElement": rows.map((p, idx) => ({
              "@type": "CreativeWork",
              "position": idx + 1,
              "name": `${p.client} - ${p.category}`,
              "description": p.caption,
              "image": p.imageUrls && p.imageUrls.length > 0 ? p.imageUrls[0] : undefined,
            })),
          },
        },
      ],
      breadcrumbs: [
        { name: isAr ? "الرئيسية" : "Home", url: isAr ? "/ar" : "/" },
        { name: isAr ? "سجل الأعمال" : "Work", url: isAr ? "/ar/posts" : "/posts" },
      ],
    }),
  );
});

// ============================================================================
// 6. TEAM (/team) & (/ar/team) & (/en/team)
// ============================================================================
router.get(["/team", "/ar/team", "/en/team"], async (req, res) => {
  const { isAr, lang, dir, prefix } = getLocaleInfo(req.path);
  const team = await db.select().from(teamTable).orderBy(asc(teamTable.displayOrder), asc(teamTable.id));

  const teamFaqs = isAr
    ? [
        {
          q: "ما هي التخصصات والخبرات التي يضمها فريق سبارك هب؟",
          a: "يضم فريقنا نخبة من الخبراء في: التخطيط الاستراتيجي لنمو الأعمال، إدارة الإعلانات الممولة (Media Buyers)، مهندسي السيو والتقنية، المخرجين وصناع المحتوى، مصممي الهويات البصرية، ومستشاري المبيعات.",
        },
        {
          q: "كيف يتفاعل فريق سبارك هب مع إدارة وفريق العميل الداخلي؟",
          a: "نعمل كامتداد طبيعي لفريقك الداخلي من خلال اجتماعات استراتيجية دورية، وقنوات تواصل مباشرة، ولوحات تحكم حية لمتابعة الأداء والنتائج أسبوعياً وشهرياً.",
        },
      ]
    : [
        {
          q: "What expertise does the Spark Hub team possess?",
          a: "Our multidisciplinary team includes senior growth strategists, performance media buyers, technical SEO engineers, creative directors, and conversion architects.",
        },
      ];

  const body = isAr
    ? `
<article>
  <header>
    <h1>فريق عمل وخبراء استوديو سبارك هب | قيادة الاستراتيجية، التسويق والإبداع</h1>
    <p><strong>الكفاءات المتخصصة في هندسة النمو:</strong> فريق متكامل من الاستشاريين، وخبراء التسويق الرقمي عالي الأداء، والمبدعين الذين يكرسون خبراتهم لبناء منظومات نجاح شركائنا في السعودية ومصر والخليج.</p>
  </header>

  <section>
    <h2>أعضاء الفريق والقيادات الاستشارية</h2>
    <ul>
      ${team
        .map(
          (t) => `
      <li>
        <h2>${esc(t.name)}</h2>
        ${t.position ? `<p><strong>${esc(t.position)}</strong> ${t.department ? `(${esc(t.department)})` : ""}</p>` : ""}
        ${t.bio ? `<p>${esc(t.bio)}</p>` : ""}
        ${t.linkedinUrl ? `<p><a href="${esc(t.linkedinUrl)}" target="_blank" rel="noopener noreferrer">حساب لينكد إن الرسمي ←</a></p>` : ""}
      </li>`,
        )
        .join("\n")}
    </ul>
  </section>

  <section>
    <h2>الركائز المهنية لفريقنا</h2>
    <div class="grid-card">
      <h3>التخطيط الاستراتيجي وهندسة التوسع (Strategy & Growth)</h3>
      <p>صياغة استراتيجيات اختراق الأسواق، تحليل الفرص الاستثمارية، وهندسة مسارات المبيعات لتحقيق نمو مستقر وقابل للتوسع.</p>
    </div>
    <div class="grid-card">
      <h3>التسويق عالي الأداء وإدارة الميزانيات (Performance & Paid Media)</h3>
      <p>إدارة الحملات الإعلانية بميزانيات ضخمة مع التركيز الصارم على تحقيق أعلى عائد استثماري (ROAS) وخفض تكلفة الاستحواذ.</p>
    </div>
    <div class="grid-card">
      <h3>الإنتاج السينمائي والتوجيه الإبداعي (Creative Direction & Video)</h3>
      <p>تحويل الأفكار المعقدة إلى قصص بصرية ومقاطع فيديو تلفت الأنظار وتولد رغبة حقيقية في الشراء.</p>
    </div>
    <div class="grid-card">
      <h3>تحسين محركات البحث والحلول التقنية (SEO & Web Technology)</h3>
      <p>تصدر المراتب الأولى في نتائج البحث وحل كافة المشكلات التقنية لضمان تجربة مستخدم سريعة وخالية من العقبات.</p>
    </div>
  </section>

  <section>
    <h2>الأسئلة الشائعة حول فريق العمل</h2>
    ${teamFaqs
      .map((f) => `<div class="faq-item"><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></div>`)
      .join("\n")}
  </section>

  <section class="cta-box">
    <h2>استفد من خبرة فريقنا المتخصص لتسريع نمو شركتك</h2>
    <p>تواصل معنا اليوم لبناء فريق العمل المخصص لاحتياجات مشروعك وتحقيق أهدافك التجارية.</p>
    <a href="${prefix}/contact" class="cta-btn">ابدأ محادثة عمل مع الفريق</a>
  </section>
</article>`
    : `
<article>
  <header>
    <h1>The Team & Leadership — Spark Hub Studio</h1>
    <p><strong>Specialized Capabilities in Growth Engineering:</strong> A dedicated multidisciplinary team of business growth strategists, performance marketers, creative directors, and conversion architects partnering with ambitious enterprises across Saudi Arabia, UAE, and MENA.</p>
  </header>

  <section>
    <h2>Leadership & Advisory Team</h2>
    <ul>
      ${team
        .map(
          (t) => `
      <li>
        <h2>${esc(t.name)}</h2>
        ${t.position ? `<p><strong>${esc(t.position)}</strong> ${t.department ? `(${esc(t.department)})` : ""}</p>` : ""}
        ${t.bio ? `<p>${esc(t.bio)}</p>` : ""}
        ${t.linkedinUrl ? `<p><a href="${esc(t.linkedinUrl)}" target="_blank" rel="noopener noreferrer">Official LinkedIn Profile ←</a></p>` : ""}
      </li>`,
        )
        .join("\n")}
    </ul>
  </section>

  <section>
    <h2>Our Core Professional Pillars</h2>
    <div class="grid-card">
      <h3>Strategy & Growth Architecture</h3>
      <p>Go-to-market planning, competitor intelligence, market penetration roadmaps, and revenue engineering.</p>
    </div>
    <div class="grid-card">
      <h3>Performance & Paid Media</h3>
      <p>Managing large-scale ad spend across Google, Meta, Snapchat, TikTok, and LinkedIn with laser focus on ROAS.</p>
    </div>
    <div class="grid-card">
      <h3>Creative Direction & Commercial Media</h3>
      <p>Transforming complex value propositions into compelling visual narratives, commercial videos, and social reels.</p>
    </div>
    <div class="grid-card">
      <h3>SEO & Web Technology</h3>
      <p>Commanding top organic search rankings, e-commerce SEO, and frictionless technical infrastructure.</p>
    </div>
  </section>

  <section>
    <h2>Frequently Asked Questions</h2>
    ${teamFaqs
      .map((f) => `<div class="faq-item"><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></div>`)
      .join("\n")}
  </section>

  <section class="cta-box">
    <h2>Leverage Our Specialized Team to Accelerate Your Growth</h2>
    <p>Connect with our senior team today to structure a dedicated team for your business expansion goals.</p>
    <a href="/contact" class="cta-btn">Start a Conversation</a>
  </section>
</article>`;

  const pageTitle = isAr
    ? "فريق العمل والقيادات الاستشارية | سبارك هب ستوديو"
    : "Team & Leadership — Spark Hub Studio";

  const pageDesc = isAr
    ? "تعرف على فريق خبراء سبارك هب في التخطيط الاستراتيجي، إدارة الحملات الإعلانية، السيو، الإنتاج السينمائي، وهندسة نمو الأعمال."
    : "Meet Spark Hub's team of growth strategists, performance marketers, creative directors, and business architects.";

  res.type("html").send(
    renderShell({
      title: pageTitle,
      description: pageDesc,
      path: isAr ? "/ar/team" : "/team",
      bodyHtml: body,
      lang,
      dir,
      schemas: [
        buildFaqSchema(teamFaqs),
        {
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "mainEntity": {
            "@type": "ItemList",
            "itemListElement": team.map((t, idx) => ({
              "@type": "Person",
              "position": idx + 1,
              "name": t.name,
              "jobTitle": t.position || "Consultant",
              "description": t.bio || "",
            })),
          },
        },
      ],
      breadcrumbs: [
        { name: isAr ? "الرئيسية" : "Home", url: isAr ? "/ar" : "/" },
        { name: isAr ? "فريق العمل" : "Team", url: isAr ? "/ar/team" : "/team" },
      ],
    }),
  );
});

// ============================================================================
// 7. ABOUT (/about) & (/ar/about) & (/en/about)
// ============================================================================
router.get(["/about", "/ar/about", "/en/about"], async (req, res) => {
  const { isAr, lang, dir, prefix } = getLocaleInfo(req.path);
  const team = await db.select().from(teamTable).orderBy(asc(teamTable.id));

  const aboutFaqs = isAr
    ? [
        {
          q: "ما هي الرؤية والفلسفة الأساسية لاستوديو سبارك هب؟",
          a: "نؤمن بأن النمو الحقيقي للأعمال لا يتحقق عبر التسرع أو الإنفاق العشوائي، بل عبر التوافق التام (Alignment) بين الاستراتيجية المؤسسية، قيادة التسويق، وكفاءة العمليات التشغيلية لبناء قيمة تجارية مستدامة.",
        },
        {
          q: "ما هي المناطق الجغرافية التي يغطيها استوديو سبارك هب؟",
          a: "نخدم عملاءنا وشركاءنا في المملكة العربية السعودية (الرياض، جدة، الشرقية)، والإمارات العربية المتحدة (دبي، أبوظبي)، وجمهورية مصر العربية، مع تقديم استشارات وحلول رقمية للشركات إقليمياً ودولياً.",
        },
        {
          q: "كيف تختلف منهجية سبارك هب عن الوكالات التقليدية؟",
          a: "نعمل كاستوديو استشاري وشريك نمو متكامل ولسنا مجرد منفذ لإعلانات مؤقتة؛ نتحمل المسؤولية المشتركة عن تحقيق مؤشرات الأداء التجارية ونربط التسويق بالمبيعات والأرباح الفعلية.",
        },
      ]
    : [
        {
          q: "What is the core philosophy of Spark Hub Studio?",
          a: "We believe the healthiest business growth feels less like reckless acceleration and more like complete alignment across strategy, marketing architecture, operational efficiency, and people development.",
        },
        {
          q: "Which geographic regions do you serve?",
          a: "We actively serve scaling enterprises across Saudi Arabia (Riyadh, Jeddah), the United Arab Emirates (Dubai, Abu Dhabi), Egypt (Cairo), and international markets remotely.",
        },
        {
          q: "How is Spark Hub different from traditional advertising agencies?",
          a: "We operate as strategic growth partners taking joint accountability for commercial KPIs (ROAS, CAC, net revenue), connecting high-level corporate strategy directly to operational marketing execution.",
        },
      ];

  const body = isAr
    ? `
<article>
  <header>
    <h1>عن استوديو سبارك هب | رؤيتنا، فلسفتنا ومنهجية هندسة نمو الأعمال المستدام</h1>
    <p><strong>استوديو استراتيجي مستقل لهندسة ونمو الأعمال:</strong> نساعد المؤسسات الطموحة على تحويل التطلعات إلى مسارات توسع واضحة من خلال تكامل التخطيط الاستراتيجي، إدارة التسويق عالي الأداء، والإنتاج الإبداعي رفيع المستوى.</p>
  </header>

  <section>
    <h2>بوصلتنا الاستراتيجية ومنهجية العمل</h2>
    <div class="grid-card">
      <h3>الرؤية المؤسسية</h3>
      <p>نبني المنظومة التي تقود نموك القادم. أفضل نمو للأعمال لا يبدو كتسارع عشوائي يربك المؤسسة، بل هو اتساق وتناغم كامل بين أركانها.</p>
    </div>

    <div class="grid-card">
      <h3>الرسالة</h3>
      <p>ندمج الفكر الاستراتيجي، منظومة التسويق الرقمي، العمليات التشغيلية، وتطوير الكفاءات البشرية في مسار عملي واحد ومستدام يحقق قيمة حقيقية للمؤسسة والمجتمع.</p>
    </div>

    <div class="grid-card">
      <h3>الفلسفة والقيم التشغيلية</h3>
      <p>الخبرة والرؤية البشرية حين تصنع فارقاً عملياً وملموساً. نعتمد على التحليل المنضبط للبيانات، واحترام الميزانيات، والتركيز على العائد الاستثماري الحقيقي بدلاً من المقاييس السطحية.</p>
    </div>
  </section>

  <section>
    <h2>حضور إقليمي وتنفيذ بمعايير عالمية</h2>
    <p>يقدم سبارك هب ستوديو حلوله الاستشارية والتنفيذية للشركات في:</p>
    <ul>
      <li><strong>المملكة العربية السعودية:</strong> الرياض، جدة، المنطقة الشرقية، والمدن الاقتصادية الكبرى.</li>
      <li><strong>الإمارات العربية المتحدة:</strong> دبي، أبوظبي، والشارقة.</li>
      <li><strong>جمهورية مصر العربية:</strong> القاهرة والإسكندرية ومجتمعات الأعمال الحيوية.</li>
      <li><strong>الأسواق الإقليمية والدولية:</strong> من خلال نماذج العمل الهجينة والاستشارات عن بُعد.</li>
    </ul>
  </section>

  <section>
    <h2>فريق القيادة والاستشارات</h2>
    <p>نخبة من الشركاء والمستشارين التنفيذيين الذين يقودون مسارات النمو والتطوير لشركائنا:</p>
    <ul>
      ${team
        .map(
          (t) => `
      <li>
        <h3>${esc(t.name)}</h3>
        ${t.position ? `<p><strong>${esc(t.position)}</strong></p>` : ""}
        ${t.bio ? `<p>${esc(t.bio)}</p>` : ""}
      </li>`,
        )
        .join("\n")}
    </ul>
    <p><a href="${prefix}/team">تعرف على كامل فريق الخبراء والقيادات ←</a></p>
  </section>

  <section>
    <h2>الأسئلة الشائعة عن الاستوديو</h2>
    ${aboutFaqs
      .map((f) => `<div class="faq-item"><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></div>`)
      .join("\n")}
  </section>

  <section class="cta-box">
    <h2>جاهز للعمل مع شريك استراتيجي يفهم تطلعاتك؟</h2>
    <p>دعنا نبدأ نقاشاً استراتيجياً حول وضع مؤسستك الحالي وخارطة الطريق الأنسب لتوسعها.</p>
    <a href="${prefix}/contact" class="cta-btn">ابدأ محادثة عمل استراتيجية</a>
  </section>
</article>`
    : `
<article>
  <header>
    <h1>About Spark Hub Studio — Growth Strategy & Business Architecture</h1>
    <p><strong>Independent Growth Consulting & Marketing Studio:</strong> We help ambitious enterprises transform growth targets into predictable trajectories through integrated strategy, performance marketing, and creative excellence.</p>
  </header>

  <section>
    <h2>Our Compass & Operating Philosophy</h2>
    <div class="grid-card">
      <h3>Vision</h3>
      <p>We build the engine that powers your next phase of growth. The healthiest expansion feels less like reckless acceleration and more like complete alignment across all corporate pillars.</p>
    </div>

    <div class="grid-card">
      <h3>Mission</h3>
      <p>We integrate strategy, marketing operations, technology, and human capabilities into one clear, sustainable path forward.</p>
    </div>

    <div class="grid-card">
      <h3>Operating Values</h3>
      <p>Human insight backed by disciplined data analytics, capital stewardship, and ruthless focus on bottom-line business ROI rather than vanity metrics.</p>
    </div>
  </section>

  <section>
    <h2>Regional Presence & Global Standards</h2>
    <p>Spark Hub Studio delivers strategic consulting and execution across:</p>
    <ul>
      <li><strong>Saudi Arabia:</strong> Riyadh, Jeddah, Eastern Province, and major commercial hubs.</li>
      <li><strong>United Arab Emirates:</strong> Dubai, Abu Dhabi, and Sharjah.</li>
      <li><strong>Egypt:</strong> Cairo, Alexandria, and dynamic business ecosystems.</li>
      <li><strong>Regional & International Markets:</strong> Delivered seamlessly via hybrid consulting engagements.</li>
    </ul>
  </section>

  <section>
    <h2>Leadership & Advisory</h2>
    <ul>
      ${team
        .map(
          (t) => `
      <li>
        <h3>${esc(t.name)}</h3>
        ${t.position ? `<p>${esc(t.position)}</p>` : ""}
        ${t.bio ? `<p>${esc(t.bio)}</p>` : ""}
      </li>`,
        )
        .join("\n")}
    </ul>
    <p><a href="/team">Meet our Full Advisory & Leadership Team ←</a></p>
  </section>

  <section>
    <h2>Frequently Asked Questions</h2>
    ${aboutFaqs
      .map((f) => `<div class="faq-item"><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></div>`)
      .join("\n")}
  </section>

  <section class="cta-box">
    <h2>Ready to Partner with a Strategy Studio that Understands Your Ambition?</h2>
    <p>Let's initiate a strategic discovery dialogue regarding your company's expansion roadmap.</p>
    <a href="/contact" class="cta-btn">Start a Strategic Conversation</a>
  </section>
</article>`;

  const pageTitle = isAr
    ? "عن استوديو سبارك هب | الرؤية، الفلسفة وهندسة نمو الأعمال"
    : "About Spark Hub Studio — Growth Strategy & Marketing Architecture";

  const pageDesc = isAr
    ? "تعرف على رؤية وفلسفة استوديو سبارك هب: استوديو استراتيجي متكامل لهندسة نمو الأعمال والتسويق الرقمي وبناء العلامات التجارية في السعودية والخليج ومصر."
    : "Learn about Spark Hub Studio: Our vision, consulting philosophy, leadership, and integrated growth methodology across Saudi Arabia, UAE, and MENA.";

  res.type("html").send(
    renderShell({
      title: pageTitle,
      description: pageDesc,
      path: isAr ? "/ar/about" : "/about",
      bodyHtml: body,
      lang,
      dir,
      schemas: [
        buildFaqSchema(aboutFaqs),
        {
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "mainEntity": {
            "@type": "Organization",
            "name": SITE_NAME,
            "url": SITE_URL,
            "description": pageDesc,
          },
        },
      ],
      breadcrumbs: [
        { name: isAr ? "الرئيسية" : "Home", url: isAr ? "/ar" : "/" },
        { name: isAr ? "عن الاستوديو" : "About", url: isAr ? "/ar/about" : "/about" },
      ],
    }),
  );
});

// ============================================================================
// 8. CONTACT (/contact) & (/ar/contact) & (/en/contact)
// ============================================================================
router.get(["/contact", "/ar/contact", "/en/contact"], async (req, res) => {
  const { isAr, lang, dir, prefix } = getLocaleInfo(req.path);

  const contactFaqs = isAr
    ? [
        {
          q: "كيف يمكنني طلب استشارة أو عرض سعر لمشروعي؟",
          a: "يمكنك إرسال متطلبات مشروعك عبر النموذج في هذه الصفحة أو مراسلتنا مباشرة عبر البريد الإلكتروني hello@spark-hub.online وسيقوم مستشار متخصص بالرد عليك خلال 24 ساعة.",
        },
        {
          q: "ما هي المراحل التي تلي تقديم طلب الاستشارة؟",
          a: "1) مراجعة الطلب وتقييم التحديات الحالية، 2) عقد جلسة استكشافية استراتيجية لمناقشة الأهداف بالتفصيل، 3) تقديم مقترح عمل مفصل وخارطة طريق للنمو، و4) إطلاق الشراكة وبدء التنفيذ.",
        },
        {
          q: "هل تقدمون خدماتكم للشركات خارج مصر والسعودية؟",
          a: "نعم، نقدم خدماتنا للشركات والمتاجر في كافة دول مجلس التعاون الخليجي، ومنطقة الشرق الأوسط، والشركات العالمية التي تستهدف هذه الأسواق.",
        },
      ]
    : [
        {
          q: "How can I request a growth consultation or RFP?",
          a: "Submit your project requirements via the form or email us at hello@spark-hub.online. A senior growth consultant will respond within 24 hours.",
        },
        {
          q: "What is the onboarding process?",
          a: "We conduct an initial diagnostic review, follow with a strategic discovery call, present a tailored growth proposal, and initiate implementation upon agreement.",
        },
        {
          q: "Do you work with enterprises outside Saudi Arabia and Egypt?",
          a: "Yes. We serve leading companies across the UAE, GCC, MENA, and international enterprises entering Middle Eastern markets.",
        },
      ];

  const body = isAr
    ? `
<article>
  <header>
    <h1>تواصل مع استوديو سبارك هب | ابدأ محادثة عمل استراتيجية وشراكة نمو</h1>
    <p><strong>جاهز لتحويل الاستراتيجية إلى نمو حقيقي؟</strong> أخبرنا بالتحدي الذي يواجهك، أو ما تخطط لبنائه وتطويره معاً، وسيتواصل معك شريك استشاري من فريقنا لمناقشة أهداف النمو وتحديد مسار العمل المشترك.</p>
  </header>

  <section>
    <h2>قنوات التواصل المباشرة</h2>
    <div class="grid-card">
      <h3>البريد الإلكتروني الرسمي للاستشارات والشراكات</h3>
      <p><a href="mailto:hello@spark-hub.online">hello@spark-hub.online</a></p>
      <p><em>نرد على جميع الاستفسارات والطلبات المؤهلة خلال 24 ساعة عمل.</em></p>
    </div>

    <div class="grid-card">
      <h3>المناطق والأسواق المخدومة</h3>
      <p>المملكة العربية السعودية (الرياض، جدة)، الإمارات العربية المتحدة (دبي، أبوظبي)، جمهورية مصر العربية (القاهرة)، وعالمياً عبر الاستشارات الرقمية المباشرة.</p>
    </div>
  </section>

  <section>
    <h2>الركائز والخدمات المتاحة للاستشارة</h2>
    <ul>
      <li><strong>التخطيط المؤسسي وهندسة التوسع (GTM):</strong> دراسات الجدوى التسويقية، وهندسة مسارات المبيعات.</li>
      <li><strong>التسويق عالي الأداء (Performance Ads):</strong> إدارة حملات Google Ads وMeta وTikTok وSnapchat.</li>
      <li><strong>تحسين محركات البحث والسيو المحلي (SEO):</strong> صدارة نتائج Google وسيو المتاجر (سلة، زد، شوبيفاي).</li>
      <li><strong>الهوية البصرية والأنظمة الإبداعية:</strong> تصميم وتطوير البراندينج والأدلة الإرشادية.</li>
      <li><strong>الإنتاج السينمائي والريلز (Reels):</strong> إنتاج إعلانات الفيديو والمحتوى المرئي عالي الانتشار.</li>
      <li><strong>تطوير المتاجر وتحسين معدل التحويل (CRO):</strong> تحسين تجربة الشراء ورفع كفاءة المبيعات.</li>
    </ul>
    <p><a href="${prefix}/services">استكشف التفاصيل الكاملة لخدماتنا ←</a></p>
  </section>

  <section>
    <h2>الأسئلة الشائعة حول التواصل وبدء الشراكة</h2>
    ${contactFaqs
      .map((f) => `<div class="faq-item"><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></div>`)
      .join("\n")}
  </section>

  <section class="cta-box">
    <h2>لنبدأ نقاش عمل استراتيجي اليوم</h2>
    <p>أرسل تفاصيل مشروعك إلى <a href="mailto:hello@spark-hub.online" style="color: #ffffff; font-weight: bold;">hello@spark-hub.online</a> وسنبدأ التخطيط لنموك القادم.</p>
  </section>
</article>`
    : `
<article>
  <header>
    <h1>Contact Spark Hub Studio — Start a Strategic Business Conversation</h1>
    <p><strong>Ready to Transform Strategy into Measurable Growth?</strong> Bring us a challenge or growth target. Connect with our senior consultants to assess your current marketing performance and architect a tailored roadmap.</p>
  </header>

  <section>
    <h2>Direct Contact Information</h2>
    <div class="grid-card">
      <h3>Official Advisory & Partnerships Email</h3>
      <p><a href="mailto:hello@spark-hub.online">hello@spark-hub.online</a></p>
      <p><em>We respond to all qualified business inquiries within 24 hours.</em></p>
    </div>

    <div class="grid-card">
      <h3>Regions & Markets Served</h3>
      <p>Saudi Arabia (Riyadh, Jeddah), United Arab Emirates (Dubai, Abu Dhabi), Egypt (Cairo), and international markets via hybrid consulting.</p>
    </div>
  </section>

  <section>
    <h2>Consulting & Service Pillars</h2>
    <ul>
      <li><strong>Growth Architecture & GTM:</strong> Market expansion strategies and sales funnel design.</li>
      <li><strong>Performance Marketing:</strong> Scalable paid acquisition across Google, Meta, Snapchat, and TikTok.</li>
      <li><strong>SEO & Local Search Dominance:</strong> E-commerce SEO and Google Maps authority.</li>
      <li><strong>Brand Architecture:</strong> Comprehensive identity design and creative direction.</li>
      <li><strong>Commercial Video & Reels:</strong> High-conversion social short-form and product commercials.</li>
      <li><strong>E-Commerce Optimization (CRO):</strong> Checkout funnel engineering and revenue velocity.</li>
    </ul>
    <p><a href="/services">Explore Detailed Services & Deliverables ←</a></p>
  </section>

  <section>
    <h2>Frequently Asked Questions</h2>
    ${contactFaqs
      .map((f) => `<div class="faq-item"><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></div>`)
      .join("\n")}
  </section>

  <section class="cta-box">
    <h2>Let's Start a Strategic Growth Dialogue Today</h2>
    <p>Send your project details to <a href="mailto:hello@spark-hub.online" style="color: #ffffff; font-weight: bold;">hello@spark-hub.online</a> to schedule your discovery session.</p>
  </section>
</article>`;

  const pageTitle = isAr
    ? "تواصل معنا | ابدأ استشارة تسويقية وشراكة نمو — سبارك هب ستوديو"
    : "Contact Spark Hub Studio — Strategic Marketing & Growth Partnership";

  const pageDesc = isAr
    ? "تواصل مع استوديو سبارك هب للاستشارات التسويقية ونمو الأعمال. احجز جلستك الاستكشافية وابدأ شراكة نمو متكاملة لشركتك في السعودية ومصر والخليج."
    : "Get in touch with Spark Hub Studio. Book your strategic growth consultation and explore integrated marketing partnerships across Saudi Arabia, UAE, and MENA.";

  res.type("html").send(
    renderShell({
      title: pageTitle,
      description: pageDesc,
      path: isAr ? "/ar/contact" : "/contact",
      bodyHtml: body,
      lang,
      dir,
      schemas: [
        buildFaqSchema(contactFaqs),
        {
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "mainEntity": {
            "@type": "ProfessionalService",
            "name": SITE_NAME,
            "url": SITE_URL,
            "email": "hello@spark-hub.online",
          },
        },
      ],
      breadcrumbs: [
        { name: isAr ? "الرئيسية" : "Home", url: isAr ? "/ar" : "/" },
        { name: isAr ? "تواصل معنا" : "Contact", url: isAr ? "/ar/contact" : "/contact" },
      ],
    }),
  );
});

// ============================================================================
// 9. BLOG LIST (/blog) & (/ar/blog) & (/en/blog)
// ============================================================================
router.get(["/blog", "/ar/blog", "/en/blog"], async (req, res) => {
  const { isAr, lang, dir, prefix } = getLocaleInfo(req.path);
  const rows = await db.select().from(blogPostsTable).orderBy(desc(blogPostsTable.publishedAt));

  const body = isAr
    ? `
<article>
  <header>
    <h1>مدونة سبارك هب | رؤى وأفكار استراتيجية في التسويق، الإدارة ونمو الأعمال</h1>
    <p><strong>زاوية أوضح لقراءة مشهد الأعمال:</strong> تأملات، تحليلات، ودراسات حالة استراتيجية من ملتقى التخطيط المؤسسي، التسويق الرقمي عالي الأداء، وصناعة الأثر في أسواق الشرق الأوسط.</p>
  </header>

  <section>
    <h2>أحدث المقالات والرؤى المنشورة</h2>
    <ul>
      ${rows
        .map(
          (p) => `
      <li>
        <h2><a href="${prefix}/blog/${esc(p.slug)}">${esc(p.title)}</a></h2>
        <p><small><strong>تاريخ النشر:</strong> ${esc(p.publishedAt)} | <strong>التصنيف:</strong> ${esc(p.category)}</small></p>
        <p>${esc(p.excerpt)}</p>
        <p><a href="${prefix}/blog/${esc(p.slug)}">اقرأ المقال كاملاً ←</a></p>
      </li>`,
        )
        .join("\n")}
    </ul>
  </section>

  <section class="cta-box">
    <h2>هل تبحث عن تطبيق هذه الرؤى الاستراتيجية في شركتك؟</h2>
    <p>تواصل مع فريق سبارك هب لمساعدتك على تحويل المعرفة إلى خطط عمل ونتائج نمو ملموسة.</p>
    <a href="${prefix}/contact" class="cta-btn">ابدأ محادثة عمل استراتيجية</a>
  </section>
</article>`
    : `
<article>
  <header>
    <h1>Spark Hub Notes — Strategic Insights on Marketing, Growth & Business</h1>
    <p>Field notes, industry analyses, and strategic perspectives from the intersection of corporate planning, performance marketing, and sustainable scale.</p>
  </header>

  <section>
    <h2>Articles Archive</h2>
    <ul>
      ${rows
        .map(
          (p) => `
      <li>
        <h2><a href="/blog/${esc(p.slug)}">${esc(p.title)}</a></h2>
        <p><small><strong>Published:</strong> ${esc(p.publishedAt)} | <strong>Category:</strong> ${esc(p.category)}</small></p>
        <p>${esc(p.excerpt)}</p>
        <p><a href="/blog/${esc(p.slug)}">Read full article ←</a></p>
      </li>`,
        )
        .join("\n")}
    </ul>
  </section>
</article>`;

  const pageTitle = isAr
    ? "مدونة سبارك هب | رؤى وأفكار استراتيجية في التسويق ونمو الأعمال"
    : "Notes & Strategic Insights — Spark Hub Studio";

  const pageDesc = isAr
    ? "تصفح مدونة سبارك هب ستوديو: مقالات متخصصة في استراتيجيات التسويق الرقمي، تحسين محركات البحث، إدارة الحملات الإعلانية، وبناء العلامات التجارية للشركات."
    : "Insights and strategic field notes on performance marketing, business growth, brand architecture, and SEO by Spark Hub Studio.";

  res.type("html").send(
    renderShell({
      title: pageTitle,
      description: pageDesc,
      path: isAr ? "/ar/blog" : "/blog",
      bodyHtml: body,
      lang,
      dir,
      schemas: [
        {
          "@context": "https://schema.org",
          "@type": "Blog",
          "name": isAr ? "مدونة سبارك هب" : "Spark Hub Blog",
          "description": pageDesc,
          "blogPost": rows.map((p) => ({
            "@type": "BlogPosting",
            "headline": p.title,
            "description": p.excerpt,
            "url": `${SITE_URL}${isAr ? "/ar" : ""}/blog/${p.slug}`,
            "datePublished": p.publishedAt,
          })),
        },
      ],
      breadcrumbs: [
        { name: isAr ? "الرئيسية" : "Home", url: isAr ? "/ar" : "/" },
        { name: isAr ? "المدونة" : "Blog", url: isAr ? "/ar/blog" : "/blog" },
      ],
    }),
  );
});

// ============================================================================
// 10. BLOG DETAIL (/blog/:slug) & (/ar/blog/:slug) & (/en/blog/:slug)
// ============================================================================
router.get(["/blog/:slug", "/ar/blog/:slug", "/en/blog/:slug"], async (req, res) => {
  const { isAr, lang, dir, prefix } = getLocaleInfo(req.path);
  const slug = String(req.params.slug || "").trim();
  const [row] = await db.select().from(blogPostsTable).where(eq(blogPostsTable.slug, slug));

  if (!row) {
    res.status(404).type("html").send(
      renderShell({
        title: isAr ? `الصفحة غير موجودة — سبارك هب ستوديو` : `Not found — ${SITE_NAME}`,
        description: isAr ? "المقال المطلوب غير موجود أو تم نقله." : "This post could not be found.",
        path: isAr ? `/ar/blog/${slug}` : `/blog/${slug}`,
        bodyHtml: `
<article>
  <h1>${isAr ? "الصفحة غير موجودة (404)" : "Article Not Found"}</h1>
  <p>${isAr ? "المقال الذي تبحث عنه غير متوفر حالياً. يمكنك العودة لصفحة المقالات الرئيسية." : "The requested article is not available."}</p>
  <p><a href="${prefix}/blog">${isAr ? "العودة إلى جميع المقالات ←" : "Back to Blog ←"}</a></p>
</article>`,
        lang,
        dir,
      }),
    );
    return;
  }

  const paragraphs = (row.body || "")
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${esc(p)}</p>`)
    .join("\n");

  const body = `
<article>
  <header>
    <h1>${esc(row.title)}</h1>
    <p><small><strong>${isAr ? "تاريخ النشر:" : "Published:"}</strong> ${esc(row.publishedAt)} | <strong>${isAr ? "التصنيف:" : "Category:"}</strong> ${esc(row.category)} | <strong>${isAr ? "المؤلف:" : "Author:"}</strong> ${esc(SITE_NAME)}</small></p>
    ${row.imageUrl ? `<img src="${esc(row.imageUrl)}" alt="${esc(row.imageAlt || row.title)}" />` : ""}
  </header>

  <div class="article-content">
    ${paragraphs}
  </div>

  <hr style="border: 0; border-top: 1px solid #1f293d; margin: 2.5rem 0;" />

  <div class="cta-box">
    <h3>${isAr ? "هل تبحث عن استراتيجية مخصصة لنمو شركتك؟" : "Looking to scale your marketing performance?"}</h3>
    <p>${isAr ? "يساعدك استوديو سبارك هب في بناء منظومة تسويق واستشارات متكاملة تحقق أهدافك التجارية بأعلى كفاءة." : "Partner with Spark Hub Studio to build predictable, sustainable revenue engines."}</p>
    <a href="${prefix}/contact" class="cta-btn">${isAr ? "احجز استشارتك الاستراتيجية الآن" : "Book a Consultation"}</a>
  </div>

  <p><a href="${prefix}/blog">${isAr ? "← العودة إلى جميع المقالات والرؤى" : "← Back to all articles"}</a></p>
</article>`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": row.title,
    "description": row.excerpt,
    "image": row.imageUrl || `${SITE_URL}/og-image.png`,
    "datePublished": row.publishedAt,
    "dateModified": row.publishedAt,
    "author": {
      "@type": "Organization",
      "name": SITE_NAME,
      "url": SITE_URL,
    },
    "publisher": {
      "@type": "Organization",
      "name": SITE_NAME,
      "url": SITE_URL,
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/logo.png`,
      },
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${SITE_URL}${isAr ? "/ar" : ""}/blog/${row.slug}`,
    },
  };

  res.type("html").send(
    renderShell({
      title: `${row.title} — ${isAr ? "سبارك هب ستوديو" : SITE_NAME}`,
      description: row.excerpt,
      path: isAr ? `/ar/blog/${row.slug}` : `/blog/${row.slug}`,
      image: row.imageUrl,
      bodyHtml: body,
      lang,
      dir,
      type: "article",
      schemas: [articleSchema],
      breadcrumbs: [
        { name: isAr ? "الرئيسية" : "Home", url: isAr ? "/ar" : "/" },
        { name: isAr ? "المدونة" : "Blog", url: isAr ? "/ar/blog" : "/blog" },
        { name: row.title, url: isAr ? `/ar/blog/${row.slug}` : `/blog/${row.slug}` },
      ],
    }),
  );
});

// ============================================================================
// 11. WORK REDIRECTS (/work -> /services)
// ============================================================================
router.get(["/work", "/ar/work", "/en/work"], (req, res) => {
  const { isAr } = getLocaleInfo(req.path);
  res.redirect(301, isAr ? "/ar/services" : "/services");
});

router.get(["/work/:slug", "/ar/work/:slug", "/en/work/:slug"], (req, res) => {
  const { isAr } = getLocaleInfo(req.path);
  res.redirect(301, isAr ? "/ar/services" : "/services");
});

export default router;