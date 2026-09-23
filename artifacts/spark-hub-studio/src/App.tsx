import {
  type ReactNode,
  type FormEvent,
  type CSSProperties,
  useEffect,
  useRef,
  useState,
  useMemo,
} from 'react';

import type { LucideIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  Link,
  Route,
  Switch,
  useLocation,
  useParams,
} from 'wouter';

import {
  ClerkProvider,
  SignIn,
  UserButton,
  useAuth,
  useUser,
} from '@clerk/react';

import { publishableKeyFromHost } from '@clerk/react/internal';
import { dark } from '@clerk/themes';

import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Facebook,
  FileText,
  Film,
  Grid2X2,
  Headphones,
  Image,
  Instagram,
  Loader2,
  Mail,
  Menu,
  Mic,
  Moon,
  MoveRight,
  Pencil,
  Play,
  Plus,
  Radio,
  Send,
  Settings2,
  Sparkles,
  Sun,
  Trash2,
  Users,
  X,
} from 'lucide-react';

import {
  useGetOverview,
  useListServices,
  useListCaseStudies,
  useGetCaseStudy,
  useListReels,
  useListPosts,
  useListTestimonials,
  useListBlogPosts,
  useGetBlogPost,
  useCreateContactLead,
  useCreateService,
  useUpdateService,
  useDeleteService,
  useCreateReel,
  useUpdateReel,
  useDeleteReel,
  useCreatePost,
  useUpdatePost,
  useDeletePost,
  useCreateCaseStudy,
  useUpdateCaseStudy,
  useDeleteCaseStudy,
  type ServiceInputCategory,
} from '@workspace/api-client-react';

import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { ConversionCta } from '@/components/conversion-cta';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import { allPostsData } from '@/data/posts-data';
import {
  LanguageProvider,
  useLanguage,
  type Locale,
} from '@/context/language-context';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useSEO } from '@/hooks/useSEO';
import { SEOBreadcrumbs } from '@/components/seo/SEOBreadcrumbs';
import { RelatedBlogPosts } from '@/components/seo/RelatedBlogPosts';
import {
  GlowingGoldenCube,
  type GlowingGoldenCubeHandle,
  type GlowMode,
} from '@/components/GlowingGoldenCube';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes cache
      gcTime: 1000 * 60 * 30, // 30 minutes garbage collection
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const navConfig = [
  { href: '/services', key: 'services', defaultLabel: 'Services' },
  { href: '/team', key: 'team', defaultLabel: 'Team' },
  { href: '/reels', key: 'reels', defaultLabel: 'Reels' },
  { href: '/podcasts', key: 'podcasts', defaultLabel: 'Podcasts' },
  { href: '/posts', key: 'posts', defaultLabel: 'Journal' },
  { href: '/about', key: 'about', defaultLabel: 'About' },
  { href: '/blog', key: 'blog', defaultLabel: 'Notes' },
] as const;

const gold = 'text-primary';

const LOGO_SRC = '/logo.png';

/* -------------------------------------------------------------------------- */
/*                                    Logo                                    */
/* -------------------------------------------------------------------------- */

function Logo() {
  const { locale, localizePath } = useLanguage();

  return (
    <Link
      href={localizePath('/')}
      className="group flex items-center gap-3"
      data-testid="link-logo"
    >
      <span className="grid h-9 w-9 place-items-center border border-primary p-1 transition-colors">
        <img
          src={LOGO_SRC}
          alt="Spark Hub Studio logo"
          className="h-full w-full scale-125 object-contain"
        />
      </span>

      <span className="leading-none">
        <strong
          className="block text-[14px] font-extrabold tracking-[.14em] rtl:tracking-normal"
        >
          SPARK HUB
        </strong>

        <small
          className="mt-1 block text-[10px] font-medium tracking-[.16em] rtl:tracking-normal text-muted-foreground"
        >
          {locale === 'ar' ? 'استوديو استشاري / مصر' : 'STUDIO / Q1'}
        </small>
      </span>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Theme Lock (Dark)                           */
/* -------------------------------------------------------------------------- */

function ThemeToggle() {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.classList.add('dark');
    localStorage.removeItem('spark-theme');
  }, []);

  return null;
}

/* -------------------------------------------------------------------------- */
/*                                   Shell                                    */
/* -------------------------------------------------------------------------- */

function Shell({
  children,
  hideCta = false,
}: {
  children: ReactNode;
  hideCta?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const { t, localizePath, isRTL } = useLanguage();

  // Normalize location for active link styling
  const cleanLoc = location === '/ar' || location === '/en' ? '/' : location.replace(/^\/(?:ar|en)/, '');

  const isContactPage =
    cleanLoc === '/contact' || cleanLoc.startsWith('/contact');
  const showCta = !hideCta && !isContactPage;

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`grain min-h-[100dvh] bg-background ${
        isRTL ? 'rtl font-sans' : 'ltr font-sans'
      }`}
    >
      <ThemeToggle />
      <header className="fixed inset-x-0 top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 md:px-10">
          <Logo />

          <nav className="hidden items-center gap-7 md:flex">
            {navConfig.map(({ href, key, defaultLabel }) => (
              <Link
                key={href}
                href={localizePath(href)}
                data-testid={`link-nav-${key}`}
                className={`text-[13px] font-bold uppercase tracking-[.12em] rtl:tracking-normal transition-colors hover:text-primary ${
                  cleanLoc === href
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                {t(`nav.${key}`, defaultLabel)}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 sm:flex">
            <LanguageSwitcher />

            <Link
              href={localizePath('/contact')}
              className="btn-shimmer flex items-center gap-2 border border-primary/80 bg-primary/10 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[.14em] rtl:tracking-normal text-primary transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_20px_rgba(233,190,88,0.35)]"
              data-testid="link-header-contact"
            >
              {t('nav.contact', 'Start a conversation')}
              <ArrowUpRight size={14} className="rtl:-rotate-90" />
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:hidden">
            <LanguageSwitcher />

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="grid h-10 w-10 place-items-center border border-border text-primary"
              aria-label={
                open ? 'Close navigation' : 'Open navigation'
              }
              aria-expanded={open}
              data-testid="button-open-navigation"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {open && (
          <div className="border-t border-border bg-background px-5 py-5 md:hidden">
            <nav className="flex flex-col gap-5">
              {navConfig.map(({ href, key, defaultLabel }) => (
                <Link
                  onClick={() => setOpen(false)}
                  key={href}
                  href={localizePath(href)}
                  data-testid={`link-mobile-${key}`}
                  className={`text-sm font-bold uppercase tracking-[.12em] rtl:tracking-normal transition-colors ${
                    cleanLoc === href
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  {t(`nav.${key}`, defaultLabel)}
                </Link>
              ))}

              <Link
                onClick={() => setOpen(false)}
                href={localizePath('/contact')}
                className="text-sm font-bold uppercase tracking-[.12em] rtl:tracking-normal text-primary flex items-center gap-1.5 pt-1"
                data-testid="link-mobile-contact"
              >
                {t('nav.contact', 'Start a conversation')}{' '}
                <ArrowUpRight
                  size={14}
                  className="inline-block rtl:-rotate-90"
                />
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main className="pt-[76px]">{children}</main>

      {showCta && <ConversionCta />}

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Footer                                   */
/* -------------------------------------------------------------------------- */

function Footer() {
  const { t, localizePath } = useLanguage();

  return (
    <footer className="relative z-10 border-t border-border bg-sidebar px-5 py-14 md:px-10">
      <div className="mx-auto grid max-w-[1440px] gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />

          <p className="mt-7 max-w-xs text-sm leading-7 text-muted-foreground">
            {t('footer.bio', 'Strategy, systems and stories for organizations with somewhere meaningful to go.')}
          </p>
        </div>

        <div>
          <p className="eyebrow text-primary">{t('footer.explore', 'Explore')}</p>

          <div className="mt-5 flex flex-col gap-3 text-sm text-muted-foreground">
            <Link
              href={localizePath('/posts')}
              className="transition-colors hover:text-foreground"
              data-testid="link-footer-posts"
            >
              {t('footer.explore_work', 'Work')}
            </Link>

            <Link
              href={localizePath('/services')}
              className="transition-colors hover:text-foreground"
              data-testid="link-footer-services"
            >
              {t('footer.explore_services', 'Services')}
            </Link>

            <Link
              href={localizePath('/team')}
              className="transition-colors hover:text-foreground"
              data-testid="link-footer-team"
            >
              {t('footer.explore_team', 'Team')}
            </Link>

            <Link
              href={localizePath('/reels')}
              className="transition-colors hover:text-foreground"
              data-testid="link-footer-reels"
            >
              {t('footer.explore_reels', 'Reels')}
            </Link>
          </div>
        </div>

        <div>
          <p className="eyebrow text-primary">{t('footer.studio', 'Studio')}</p>

          <div className="mt-5 flex flex-col gap-3 text-sm text-muted-foreground">
            <Link href={localizePath('/about')} data-testid="link-footer-about">
              {t('footer.point_of_view', 'Our point of view')}
            </Link>

            <Link href={localizePath('/blog')} data-testid="link-footer-blog">
              {t('footer.field_notes', 'Field notes')}
            </Link>

            <Link href={localizePath('/contact')} data-testid="link-footer-contact">
              {t('footer.work_with_us', 'Work with us')}
            </Link>
          </div>
        </div>

        <div>
          <p className="eyebrow text-primary">{t('footer.say_hello', 'Say hello')}</p>

          <a
            href="mailto:hello@spark-hub.online"
            className="mt-5 block text-sm text-muted-foreground hover:text-foreground"
            data-testid="link-footer-email"
          >
            hello@spark-hub.online
          </a>

          <p className="mt-7 font-mono rtl:font-sans text-[10px] rtl:text-xs text-muted-foreground">
            {t('footer.location', 'EGYPT / REMOTE / EVERYWHERE')}
          </p>

          <div className="mt-6">
            <LanguageSwitcher variant="button" />
          </div>
        </div>
      </div>

      <div className="mx-auto mt-16 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border pt-5 font-mono rtl:font-sans text-[11px] rtl:text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} {t('footer.rights', 'SPARK HUB')}</span>
        <span>{t('footer.tagline', 'WHERE STRATEGY MEETS GROWTH')}</span>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

function PageFrame({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-28 ${className}`}
    >
      {children}
    </div>
  );
}

function RevealOnScroll({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.2,
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${className} ${
        visible ? 'reveal-visible' : 'reveal-hidden'
      }`}
    >
      {children}
    </div>
  );
}

function GoldenDust() {
  // Toggle to disable/enable falling golden rain dust across the site. Kept intact to re-enable anytime.
  const ENABLE_GOLDEN_DUST = false;
  if (!ENABLE_GOLDEN_DUST) {
    return null;
  }

  const [location] = useLocation();
  const cleanLoc = location.replace(/^\/(?:ar|en)/, '');
  const isBlog = cleanLoc === '/blog' || cleanLoc.startsWith('/blog');

  const [particles] = useState(() =>
    Array.from({ length: 55 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 5 + 5,
      delay: Math.random() * 7,
      drift: Math.random() * 160 - 80,
      opacity: Math.random() * 0.65 + 0.25,
    })),
  );

  if (isBlog) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[35] overflow-hidden"
      aria-hidden="true"
    >
      {particles.map((particle) => (
        <span
          key={particle.id}
          className="gold-dust-particle"
          style={
            {
              left: `${particle.left}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
              '--gold-drift': `${particle.drift}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add('is-visible');
          observer.unobserve(element);
        }
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -60px 0px',
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`scroll-reveal ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
function TypingParagraph({
  text,
  className = '',
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [started, setStarted] = useState(false);
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.3,
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;

    let index = 0;
    let timeout: number;

    const startTyping = () => {
      timeout = window.setInterval(() => {
        index += 1;

        setDisplayedText(text.slice(0, index));

        if (index >= text.length) {
          window.clearInterval(timeout);
        }
      }, 35);
    };

    const delayTimeout = window.setTimeout(
      startTyping,
      delay,
    );

    return () => {
      window.clearTimeout(delayTimeout);
      window.clearInterval(timeout);
    };
  }, [started, text, delay]);

  return (
    <p ref={ref} className={className}>
      {displayedText}
      {started && displayedText.length < text.length && (
        <span className="typing-cursor">|</span>
      )}
    </p>
  );
}
function SectionHead({
  kicker,
  title,
  intro,
  typingIntro = false,
}: {
  kicker: string;
  title: string;
  intro: string;
  typingIntro?: boolean;
}) {
  return (
    <div className="mb-10 max-w-3xl text-start">
      <Reveal>
        <p className="eyebrow text-primary inline-flex items-center gap-2 mb-3 font-mono text-[11px] rtl:text-xs tracking-[.18em] rtl:tracking-normal">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(233,190,88,0.85)]" />
          {kicker}
        </p>
      </Reveal>

      <div>
        <Reveal delay={100}>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold leading-snug sm:leading-normal text-foreground tracking-normal">
            {title}
          </h2>
        </Reveal>

        <Reveal delay={180}>
          {typingIntro ? (
            <TypingParagraph
              text={intro}
              className="mt-4 max-w-2xl text-sm sm:text-base leading-relaxed rtl:leading-[1.8] text-muted-foreground"
              delay={300}
            />
          ) : (
            <p className="mt-4 max-w-2xl text-sm sm:text-base leading-relaxed rtl:leading-[1.8] text-muted-foreground">
              {intro}
            </p>
          )}
        </Reveal>
      </div>
    </div>
  );
}

function QueryState({
  loading,
  error,
  children,
  empty = false,
  label = 'content',
}: {
  loading?: boolean;
  error?: boolean;
  children: ReactNode;
  empty?: boolean;
  label?: string;
}) {
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-56 animate-pulse bg-card"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-destructive/50 bg-destructive/5 p-8 text-start">
        <p className="eyebrow text-destructive">
          {t('common.error_signal', 'Signal interrupted')}
        </p>

        <p className="mt-3 text-sm text-muted-foreground">
          {t('common.error_desc', `We couldn't load this ${label} right now.`)}
        </p>
      </div>
    );
  }

  if (empty) {
    return (
      <div className="border border-dashed border-border p-12 text-center">
        <Sparkles
          className="mx-auto text-primary"
          size={20}
        />

        <p className="mt-4 text-sm text-muted-foreground">
          {t('common.empty', 'This space is taking shape. Check back soon.')}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

/* -------------------------------------------------------------------------- */
/*                                    Home                                    */
/* -------------------------------------------------------------------------- */

const curatedPartnersRow1 = [
  { name: 'Roots New Edition', category: 'Fashion & Retail', arCategory: 'أزياء وتجزئة فاخرة', imageUrl: '' },
  { name: 'HEROINERA', category: 'Health & Wellness', arCategory: 'صحة وعافية واستشفاء', imageUrl: '' },
  { name: 'VIOLLA Atelier', category: 'Haute Couture', arCategory: 'أزياء راقية وهوت كوتور', imageUrl: '' },
  { name: 'VEXON', category: 'Activewear', arCategory: 'ملابس رياضية وأداء', imageUrl: '' },
  { name: 'Era Egypt Pharma', category: 'Pharmaceuticals', arCategory: 'صناعات دوائية وطبية', imageUrl: '' },
  { name: 'Optima Clinic', category: 'Healthcare', arCategory: 'مراكز طبية تخصصية', imageUrl: '' },
];

const curatedPartnersRow2 = [
  { name: 'Dr. Cars', category: 'Automotive Services', arCategory: 'خدمات سيارات متكاملة', imageUrl: '' },
  { name: 'Elite Systems', category: 'Enterprise IT', arCategory: 'حلول وتقنية مؤسسية', imageUrl: '' },
  { name: 'Dr. Eslam Amer', category: 'Medical Speciality', arCategory: 'طب وجراحة تخصصية', imageUrl: '' },
  { name: 'Aura Studio', category: 'Architecture & Design', arCategory: 'عمارة وتصميم داخلي', imageUrl: '' },
  { name: 'Al-Basha Group', category: 'Trading & Logistics', arCategory: 'تجارة وتوريدات لوجستية', imageUrl: '' },
  { name: 'Apex Media', category: 'Broadcast & Media', arCategory: 'إنتاج إعلامي وبث', imageUrl: '' },
];

function Home() {
  const { t, locale, localizePath, isRTL } = useLanguage();
  const overview = useGetOverview();
  const services = useListServices();
  const testimonials = useListTestimonials();
  const clientLogos = useListClientLogos();

  useSEO({
    title:
      locale === 'ar'
        ? 'سبارك هب ستوديو — حيث تلتقي الاستراتيجية بالنمو | استوديو استشاري ووكالة تسويق'
        : 'Spark Hub Studio — Where Strategy Meets Growth | Digital Agency & Consulting',
    description:
      locale === 'ar'
        ? 'سبارك هب ستوديو: شريك نمو متكامل في مصر والشرق الأوسط. ندمج الاستراتيجية المؤسسية، إدارة التسويق الرقمي، الهوية البصرية، والإنتاج السينمائي لتحقيق نمو مستدام.'
        : 'Spark Hub Studio is an independent growth studio in Egypt helping ambitious organizations integrate strategy, marketing, creative execution, and business development.',
    ogType: 'website',
  });

  const o = overview.data;

  // Build high-contrast partner logo rows without duplicate placeholder icons
  const activeLogos = clientLogos.data || [];
  const customLogosWithImages = activeLogos.filter(
    (l) => l.imageUrl && (l.imageUrl.startsWith('http://') || l.imageUrl.startsWith('https://')) && !l.imageUrl.includes('logo.png')
  );

  const displayPartnersRow1 = customLogosWithImages.length > 0
    ? [...customLogosWithImages.slice(0, Math.ceil(customLogosWithImages.length / 2)), ...curatedPartnersRow1]
    : curatedPartnersRow1;

  const displayPartnersRow2 = customLogosWithImages.length > 0
    ? [...customLogosWithImages.slice(Math.ceil(customLogosWithImages.length / 2)), ...curatedPartnersRow2]
    : curatedPartnersRow2;

  const homeServices = [
    {
      id: 1,
      titleKey: 'services.items.strategy.title',
      summaryKey: 'services.items.strategy.summary',
      defaultTitle: 'Strategy & Planning',
      defaultSummary: 'Go-To-Market trajectories, in-depth competitor intelligence, sales funnel engineering, and strategic marketing reorganization.',
    },
    {
      id: 2,
      titleKey: 'services.items.marketing.title',
      summaryKey: 'services.items.marketing.summary',
      defaultTitle: 'Marketing Management & Growth',
      defaultSummary: 'Omnichannel performance leadership, technical SEO architecture, disciplined budget allocation, and continuous ROI analysis.',
    },
    {
      id: 3,
      titleKey: 'services.items.creative.title',
      summaryKey: 'services.items.creative.summary',
      defaultTitle: 'Visual Brand Strategy & Systems',
      defaultSummary: 'Comprehensive typographic systems, creative direction, cinematic media production, and complete brand guidelines.',
    },
  ];

  return (
    <Shell>
      {/* 3D Three.js Interactive Persistent Background Canvas */}
      <GlowingGoldenCube
        isRTL={isRTL}
        glowMode="balanced"
      />

      <section className="editorial-grid hero-grid-bg relative min-h-0 md:min-h-[640px] lg:min-h-[720px] border-b border-border bg-transparent">
        {/* Radial Vignette Overlay to blend cube smoothly with typography */}
        <div className="absolute inset-0 w-full h-full z-[1] vignette-overlay pointer-events-none" />

        <PageFrame className="relative z-10 min-h-0 md:min-h-[640px] lg:min-h-[720px] pb-10 pt-16 md:pb-16 md:pt-24 flex flex-col justify-between pointer-events-none">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-2 sm:mt-6">
            {/* Left Column: Headlines & 3D HUD Controls */}
            <div className="lg:col-span-7 flex flex-col justify-center text-start pointer-events-auto">
              <p className="eyebrow mb-6 text-primary tracking-[.22em] rtl:tracking-normal font-mono text-[11px] rtl:text-xs inline-flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                {locale === 'ar' ? t('hero.eyebrow') : (o?.eyebrow || t('hero.eyebrow'))}
              </p>

              <h1 className="display max-w-4xl text-[clamp(3.5rem,8.5vw,7.5rem)] rtl:text-[clamp(3.2rem,8vw,6.8rem)] font-extrabold leading-[0.88] rtl:leading-[1.18] tracking-[-0.05em] rtl:tracking-normal text-foreground">
                {locale === 'ar' ? (
                  <>
                    <span className="hero-line block pb-1">
                      <span className="hero-word hero-word-1 inline-block">حيث تلتقي</span>
                    </span>
                    <span className="hero-line block pb-1">
                      <span className="strategy-gold gold-glow-title hero-word hero-word-2 inline-block font-extrabold">الاستراتيجية</span>
                    </span>
                    <span className="hero-line block pb-1">
                      <span className="hero-word hero-word-3 inline-block">بالنمو.</span>
                    </span>
                  </>
                ) : (
                  <>
                    <span className="hero-line block pb-1">
                      <span className="hero-word hero-word-1 inline-block">Where</span>
                    </span>
                    <span className="hero-line block pb-1">
                      <span className="strategy-gold gold-glow-title hero-word hero-word-2 inline-block font-extrabold">strategy</span>
                    </span>
                    <span className="hero-line block pb-1">
                      <span className="hero-word hero-word-3 inline-block">meets</span>
                    </span>
                    <span className="hero-line block pb-1">
                      <span className="hero-word hero-word-4 inline-block">growth.</span>
                    </span>
                  </>
                )}
              </h1>

              <p className="mt-6 sm:mt-7 max-w-lg text-foreground/70 text-sm sm:text-base leading-relaxed font-normal">
                {locale === 'ar'
                  ? 'ندمج الفكر الاستراتيجي، منظومة التسويق، العمليات التشغيلية، وصناعة المحتوى في مسار عملي واحد ومستدام.'
                  : 'We engineer high-impact brand narratives, scalable growth architectures, and multi-channel acquisition funnels designed for market leadership.'}
              </p>
            </div>

            {/* Right Column: Spatial 3D Cube Canvas Area */}
            <div className="lg:col-span-5 relative h-24 sm:h-48 lg:h-[420px] pointer-events-none" />
          </div>

          {/* Bottom Tactical Bar: Status Indicators & Bill Gates Quote Card */}
          <div className="mt-10 sm:mt-14 w-full flex flex-col sm:flex-row items-stretch sm:items-end justify-between gap-6 pointer-events-auto">
            {/* System Coordinates & Status Indicator */}
            <div className="hidden md:flex items-center gap-6 font-mono text-[11px] text-muted-foreground/60 text-start">
              <div>
                <span className="text-primary/90 block font-semibold text-[10px] tracking-wider">TIMEZONE</span>
                <span>CAIRO GMT+3 // RIYADH GMT+3</span>
              </div>
              <div className="w-px h-6 bg-border/60" />
              <div>
                <span className="text-primary/90 block font-semibold text-[10px] tracking-wider">COORDINATES</span>
                <span>30.0444° N, 31.2357° E</span>
              </div>
              <div className="w-px h-6 bg-border/60" />
              <div>
                <span className="text-primary/90 block font-semibold text-[10px] tracking-wider">SYSTEM STATUS</span>
                <span className="text-emerald-400 font-bold">100% OPERATIONAL</span>
              </div>
            </div>

            {/* Tactical Perspective Quote Card */}
            <div className="w-full sm:w-[420px] tactical-card rounded-2xl p-5 shadow-2xl text-start">
              <div className="flex items-center justify-between text-[11px] font-mono text-primary font-semibold tracking-wider pb-2.5 border-b border-border/40">
                <div className="flex items-center gap-1.5">
                  <span className="text-primary">◆</span>
                  <span>{t('hero.perspective', 'PERSPECTIVE')}</span>
                </div>
                <span className="text-muted-foreground/70">{t('hero.ref', 'REF // 01')}</span>
              </div>

              <blockquote className="mt-3 text-xs sm:text-[13px] leading-relaxed text-foreground/90 italic font-sans font-medium">
                {t('hero.quote')}
              </blockquote>

              <div className="mt-3 flex items-center justify-between font-mono text-[11px] pt-2 border-t border-border/30">
                <span className="font-bold text-primary tracking-wide uppercase">
                  {t('hero.quote_author')}
                </span>
                <span className="text-muted-foreground/70 text-[10px]">
                  {t('hero.quote_role')}
                </span>
              </div>
            </div>
          </div>
        </PageFrame>

        {/* Marquee ticker */}
        <div
          className={`marquee py-3 text-muted-foreground border-t border-border/40 relative z-10 bg-background/80 backdrop-blur-sm ${
            isRTL ? 'text-xs font-semibold tracking-normal' : 'text-[11px] font-bold tracking-[.2em]'
          }`}
        >
          <span>
            {t('hero.marquee')}&nbsp;&nbsp;&nbsp;✦&nbsp;&nbsp;&nbsp;
            {t('hero.marquee')}&nbsp;&nbsp;&nbsp;✦&nbsp;&nbsp;&nbsp;
            {t('hero.marquee')}&nbsp;&nbsp;&nbsp;✦&nbsp;&nbsp;&nbsp;
          </span>
        </div>
      </section>

      <PageFrame>
        <div className="mb-8 max-w-2xl text-start">
          <Reveal>
            <p className="eyebrow text-primary inline-flex items-center gap-2 mb-2 font-mono text-[10px] rtl:text-xs tracking-[.18em] rtl:tracking-normal">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(233,190,88,0.85)]" />
              {t('hero.premise_kicker', 'The premise')}
            </p>
          </Reveal>

          <div>
            <Reveal delay={100}>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold leading-relaxed sm:leading-relaxed text-foreground">
                {locale === 'ar' ? t('hero.vision') : (o?.vision || t('hero.vision'))}
              </h2>
            </Reveal>

            <Reveal delay={180}>
              <p className="mt-3 max-w-xl text-xs sm:text-sm leading-relaxed rtl:leading-6 text-muted-foreground">
                {locale === 'ar' ? t('hero.mission') : (o?.mission || t('hero.mission'))}
              </p>
            </Reveal>
          </div>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {homeServices.map((service, index) => (
            <Link
              href={localizePath('/services')}
              key={service.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-border/60 bg-card/40 p-8 md:p-9 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:bg-card/70 hover:shadow-[0_12px_36px_rgba(233,190,88,0.09)] hover:-translate-y-1"
              data-testid={`card-home-service-${service.id}`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-primary px-2.5 py-1 rounded-full border border-primary/30 bg-primary/10">
                    0{index + 1}
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                </div>

                <h3 className="display mt-8 text-xl sm:text-2xl font-bold leading-snug text-foreground group-hover:text-primary transition-colors">
                  {t(service.titleKey, service.defaultTitle)}
                </h3>

                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {t(service.summaryKey, service.defaultSummary)}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-border/40 flex items-center justify-between text-xs font-semibold text-primary">
                <span>{locale === 'ar' ? 'استكشف المسار' : 'Explore Service'}</span>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 group-hover:bg-primary group-hover:text-primary-foreground">
                  <ArrowRight size={14} className="rtl:rotate-180" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </PageFrame>

      <section className="border-t border-border bg-card/50 py-20">
        <PageFrame>
          <SectionHead
            kicker={t('partners.kicker', 'Trusted by / built through partnership')}
            title={t('partners.title', 'Good work travels.')}
            intro={t('partners.intro', 'A few of the teams and organizations who have trusted Spark Hub with the work that matters.')}
          />

          <div className="mt-12 space-y-4">
            {[
              { reverse: false, list: displayPartnersRow1 },
              { reverse: true, list: displayPartnersRow2 },
            ].map((row, rowIndex) => {
              const fullList = [...row.list, ...row.list, ...row.list, ...row.list];
              return (
                <div
                  key={rowIndex}
                  className="relative overflow-hidden border-y border-border/60 py-5 bg-background/30 backdrop-blur-sm"
                >
                  <div
                    className={`trusted-marquee-track ${
                      row.reverse ? 'trusted-marquee-reverse' : ''
                    }`}
                  >
                    {fullList.map((partner, index) => {
                      const partnerCategory = ('arCategory' in partner && isRTL)
                        ? (partner.arCategory || '')
                        : ('category' in partner ? partner.category : '');

                      return (
                        <div
                          key={`${partner.name}-${index}`}
                          className="flex min-w-[13rem] items-center justify-center px-4 md:min-w-[16rem]"
                        >
                          {partner.imageUrl && (partner.imageUrl.startsWith('http://') || partner.imageUrl.startsWith('https://')) && !partner.imageUrl.includes('logo.png') ? (
                            <img
                              src={partner.imageUrl}
                              alt={partner.name}
                              loading="lazy"
                              decoding="async"
                              className="block h-10 w-auto object-contain opacity-75 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0 md:h-12"
                              onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                            />
                          ) : (
                            <div className="flex items-center gap-3 px-5 py-2.5 rounded-xl border border-border/70 bg-card/60 hover:border-primary/50 hover:bg-card/90 transition-all shadow-sm group">
                              <span className="h-2 w-2 rounded-full bg-primary/70 group-hover:bg-primary transition-colors" />
                              <div className="text-start">
                                <span className="block text-sm font-bold tracking-wide uppercase text-foreground/90 group-hover:text-primary transition-colors font-sans">
                                  {partner.name}
                                </span>
                                {partnerCategory ? (
                                  <span className="block text-[10px] text-muted-foreground/70 font-mono rtl:font-sans">
                                    {partnerCategory}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 flex items-center gap-4">
            <span className="h-px flex-1 bg-border/60" />
            <span className="font-mono rtl:font-sans text-[10px] rtl:text-xs tracking-[.18em] rtl:tracking-normal text-muted-foreground uppercase font-semibold">
              {t('partners.counter', 'PARTNERS')} / 12+
            </span>
            <span className="h-px flex-1 bg-border/60" />
          </div>
        </PageFrame>
      </section>

    </Shell>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    Work                                    */
/* -------------------------------------------------------------------------- */

function WorkCard({
  item,
  featured = false,
}: {
  item: any;
  featured?: boolean;
}) {
  const { localizePath } = useLanguage();

  return (
    <Link
      href={localizePath(`/work/${item.slug}`)}
      className={`group art-panel gold-glow-card block min-h-[300px] p-6 border border-border/60 rounded-xl transition-all duration-300 ${
        featured
          ? 'md:min-h-[400px]'
          : 'md:min-h-[340px]'
      }`}
      data-testid={`card-work-${item.id}`}
    >
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex justify-between">
          <span className="eyebrow text-primary">
            {item.category}
          </span>

          <span className="mono text-[10px] text-muted-foreground">
            {String(item.id).padStart(2, '0')}
          </span>
        </div>

        <div>
          <p className="mono text-[10px] text-primary">
            {item.client}
          </p>

          <h3 className={`mt-2 max-w-lg font-bold leading-snug transition-transform duration-300 group-hover:translate-x-1 ${
            featured
              ? 'text-xl sm:text-2xl md:text-3xl'
              : 'text-lg sm:text-xl md:text-2xl'
          }`}>
            {item.title}
          </h3>

          <div className="mt-5 flex items-center justify-between border-t border-border/70 pt-4">
            <span className="text-sm text-muted-foreground">
              {item.metric}
            </span>

            <ArrowUpRight
              size={17}
              className="text-primary transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 rtl:-rotate-90 rtl:group-hover:-translate-x-1"
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

function Work() {
  const { t, locale } = useLanguage();
  const query = useListCaseStudies();

  useSEO({
    title:
      locale === 'ar'
        ? 'سجل دراسات الحالة والنتائج التجارية — سبارك هب ستوديو'
        : 'Selected Case Studies & Commercial Results — Spark Hub Studio',
    description:
      locale === 'ar'
        ? 'استكشف دراسات الحالة والتحولات التجارية لعملاء سبارك هب ستوديو: استراتيجيات اختراق السوق، مضاعفة العائد الإعلاني، وبناء الهويات المؤسسية.'
        : 'Explore case studies and verified business results achieved with Spark Hub Studio across strategic marketing, performance advertising, and visual brand systems.',
  });

  return (
    <Shell>
      <PageFrame>
        <SEOBreadcrumbs
          items={[
            { label: locale === 'ar' ? 'الرئيسية' : 'Home', href: '/' },
            { label: locale === 'ar' ? 'سجل الأعمال' : 'Work', href: '/work' },
          ]}
        />

        <SectionHead
          kicker={locale === 'ar' ? 'أعمال مختارة / 2019—الآن' : 'Selected work / 2019—now'}
          title={locale === 'ar' ? 'أعمال تصنع فارقاً جوهرياً في مسار السوق.' : 'Work that shifts the room.'}
          intro={locale === 'ar'
            ? 'نشارك المؤسسات في اللحظة التي تتطلب أكثر من مجرد إعلان: رؤية استراتيجية جديدة، منظومة تشغيلية فعالة، وبصمة تعلق في الأذهان.'
            : 'We partner at the point where a business needs more than a campaign: a new direction, a working system, or a story people can carry.'}
          typingIntro
        />

        <QueryState
          loading={query.isLoading}
          error={!!query.error}
          empty={
            !query.isLoading &&
            !query.error &&
            !query.data?.length
          }
        >
          <div className="grid gap-5 md:grid-cols-2">
            {(query.data || []).map((item, index) => (
              <WorkCard
                key={item.id}
                item={item}
                featured={index % 3 === 0}
              />
            ))}
          </div>
        </QueryState>
      </PageFrame>
    </Shell>
  );
}

function WorkDetail() {
  const { id = '' } = useParams<{ id: string }>();
  const { localizePath, locale } = useLanguage();
  const query = useGetCaseStudy(id);
  const item = query.data;

  useSEO({
    title: item
      ? `${item.title} — ${locale === 'ar' ? 'دراسة حالة' : 'Case Study'} | Spark Hub Studio`
      : 'Case Study — Spark Hub Studio',
    description:
      item?.summary ||
      (locale === 'ar'
        ? 'دراسة حالة تفصيلية توثق التحدي والاستراتيجية والأثر التجاري المحقق.'
        : 'Detailed case study documenting strategic challenge, execution, and commercial results achieved with Spark Hub Studio.'),
    canonical: item ? `/work/${item.slug}` : undefined,
    ogType: 'article',
    ogImage: item?.imageUrl || undefined,
    ogImageAlt: item?.imageAlt || item?.title,
    schema: item
      ? {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: item.title,
          description: item.summary,
          image: item.imageUrl ? [item.imageUrl] : undefined,
          about: { '@type': 'Thing', name: item.category },
          author: { '@type': 'Organization', name: 'Spark Hub Studio' },
          publisher: {
            '@type': 'Organization',
            name: 'Spark Hub Studio',
            logo: { '@type': 'ImageObject', url: 'https://spark-hub.online/logo.png' },
          },
        }
      : undefined,
  });

  return (
    <Shell>
      <PageFrame>
        <SEOBreadcrumbs
          items={[
            { label: locale === 'ar' ? 'الرئيسية' : 'Home', href: '/' },
            { label: locale === 'ar' ? 'سجل الأعمال' : 'Work', href: '/work' },
            { label: item?.title || (locale === 'ar' ? 'دراسة حالة' : 'Case Study'), href: `/work/${id}` },
          ]}
        />

        <Link
          href={localizePath('/work')}
          className="eyebrow text-primary inline-flex items-center gap-2 mb-8"
          data-testid="link-back-work"
        >
          {locale === 'ar' ? '← العودة لسجل الأعمال' : '← Back to work'}
        </Link>

        <QueryState
          loading={query.isLoading}
          error={!!query.error}
          empty={
            !query.isLoading &&
            !query.error &&
            !item
          }
          label="case study"
        >
          {item && (
            <>
              <div className="mt-8 max-w-5xl animate-rise text-start">
                <p className="eyebrow text-primary">
                  {item.category} / {item.client}
                </p>

                <h1 className="display mt-5 text-4xl sm:text-6xl md:text-8xl leading-[.95] tracking-[-.04em] rtl:tracking-normal">
                  {item.title}
                </h1>

                <p className="mt-8 max-w-2xl text-lg sm:text-xl leading-8 text-muted-foreground">
                  {item.summary}
                </p>
              </div>

              <div className="art-panel mt-14 flex min-h-72 items-end p-7 md:min-h-[460px] md:p-12 text-start rounded-2xl overflow-hidden border border-border/60">
                <div className="relative z-10">
                  <p className="eyebrow text-primary">
                    {locale === 'ar' ? 'التحول المحقق' : 'The shift'}
                  </p>

                  <p className="display mt-3 max-w-xl text-3xl sm:text-5xl text-foreground font-bold" dir="ltr">
                    {item.metric}
                  </p>
                </div>
              </div>

              <div className="mt-14 grid gap-10 md:grid-cols-3 text-start">
                {[
                  [locale === 'ar' ? 'التحدي والفرصة' : 'The question', item.problem],
                  [locale === 'ar' ? 'المسار الاستراتيجي' : 'The move', item.solution],
                  [locale === 'ar' ? 'النتائج والأثر' : 'The result', item.result],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-border/50 bg-card/30 p-6">
                    <p className="eyebrow text-primary text-xs">
                      {label}
                    </p>

                    <p className="mt-4 text-sm sm:text-base leading-7 text-muted-foreground">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </QueryState>
      </PageFrame>
    </Shell>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Services                                  */
/* -------------------------------------------------------------------------- */

const categoryLabels: Record<string, string> = {
  strategy: 'Strategy & clarity',
  marketing: 'Marketing & demand',
  creative: 'Creative direction',
  business: 'Business development',
  media: 'Media production',
  training: 'People development',
  software: 'Software solutions',
};

const categoryLabelsAr: Record<string, string> = {
  strategy: 'التخطيط المؤسسي وهندسة التوسع',
  marketing: 'إدارة التسويق ومضاعفة الأثر',
  creative: 'بناء الهوية والأنظمة البصرية',
  training: 'تمكين القيادات وبناء الكفاءات',
  business: 'تطوير الأعمال والحلول الاستشارية',
  media: 'الإنتاج الإبداعي والسينمائي',
  software: 'الحلول الرقمية والأنظمة',
};

const localizedCoreServicesMap: Record<string, { title: string; summary: string; details: string[] }> = {
  strategy: {
    title: 'التخطيط المؤسسي وهندسة التوسع',
    summary: 'رسم خرائط اختراق السوق، تحليل تنافسي معمق، وإعادة تصميم الهيكل التسويقي للمؤسسات لضمان عائد مستقر طويل المدى.',
    details: [
      'رسم خرائط اختراق السوق والتوسع المدروس (GTM)',
      'تحليل تنافسي معمق وتحديد الفجوات والفرص الاستثمارية',
      'هندسة قمع المبيعات ورفع كفاءة معدلات التحويل التجاري',
      'إعادة تصميم الهيكل التسويقي وحوكمة منظومة النمو',
    ],
  },
  marketing: {
    title: 'إدارة التسويق ومضاعفة الأثر',
    summary: 'توجيه الإنفاق الإعلاني، إدارة منصات الاستحواذ، وهندسة رحلة العميل الرقمية لتقليل تكلفة الاستحواذ ومضاعفة القيمة التراكمية.',
    details: [
      'توجيه الإنفاق الإعلاني وإدارة الميزانيات بكفاءة مالية منضبطة',
      'إدارة منصات الاستحواذ والحملات الإعلانية متعددة القنوات',
      'هندسة رحلة العميل الرقمية وخفض تكلفة الاستحواذ (CAC)',
      'مضاعفة القيمة التراكمية للعميل (LTV) وتحليل العائد (ROI)',
    ],
  },
  creative: {
    title: 'بناء الهوية والأنظمة البصرية',
    summary: 'تصميم لغات بصرية مؤسسية تفرض حضورها في السوق، وتوحيد الأصول المرئية والإنتاج السينمائي بما يعكس مكانة العلامة الحقيقية.',
    details: [
      'تصميم لغات بصرية مؤسسية تفرض حضورها ومكانتها السوقية',
      'توحيد الأصول المرئية والأدلة الإرشادية المتكاملة للعلامة',
      'التوجيه الإبداعي والإنتاج السينمائي رفيع المستوى',
      'حوكمة العلامة التجارية وتطوير أصول التموضع المؤسسي',
    ],
  },
  training: {
    title: 'تمكين القيادات وبناء الكفاءات',
    summary: 'نقل الخبرة إلى فرق العمل الداخلية عبر برامج تدريب وتأهيل عملي في المبيعات الاستشارية، التحليل الرقمي، وإدارة المشاريع.',
    details: [
      'نقل الخبرة المعرفية والعملية لفرق العمل الداخلية',
      'برامج تدريب وتأهيل عملي في المبيعات الاستشارية المعقدة',
      'التحليل الرقمي واستخلاص مؤشرات الأداء الحيوية (KPIs)',
      'إدارة المشاريع بالمنهجيات الرشيقة وتسريع وتيرة التنفيذ',
    ],
  },
};

function Services() {
  const { t, locale, localizePath } = useLanguage();
  const query = useListServices();
  const blogQuery = useListBlogPosts();
  const latestNotes = (blogQuery.data || []).slice(0, 3);

  useSEO({
    title:
      locale === 'ar'
        ? 'الخدمات الاستشارية وهندسة النمو المؤسسي — سبارك هب ستوديو'
        : 'Consulting Capabilities & Growth Systems — Spark Hub Studio',
    description:
      locale === 'ar'
        ? 'استكشف منظومة خدمات سبارك هب ستوديو: التخطيط الاستراتيجي، إدارة التسويق ومضاعفة الأثر، بناء الهوية البصرية، والإنتاج السينمائي والتدريب المؤسسي.'
        : 'Explore Spark Hub Studio’s capabilities across institutional strategy, performance marketing, luxury brand identity, cinema-grade media, and executive training.',
  });

  return (
    <Shell>
      <PageFrame>
        <SEOBreadcrumbs
          items={[
            { label: locale === 'ar' ? 'الرئيسية' : 'Home', href: '/' },
            { label: locale === 'ar' ? 'الخدمات' : 'Services', href: '/services' },
          ]}
        />

        <SectionHead
          kicker={t('services.kicker', 'Capabilities / not packages')}
          title={t('services.title', 'The connective tissue of growth.')}
          intro={t('services.intro', 'The work sits between disciplines. That is where we are most useful — translating strategy into action, and action into something that lasts.')}
          typingIntro
        />

        <QueryState
          loading={query.isLoading}
          error={!!query.error}
          empty={
            !query.isLoading &&
            !query.error &&
            !query.data?.length
          }
        >
          <div className="divide-y divide-border border-y border-border">
            {(query.data || []).map((service, index) => {
              const cat = service.category?.toLowerCase() || '';
              const arData =
                localizedCoreServicesMap[cat] ||
                (index === 0
                  ? localizedCoreServicesMap.strategy
                  : index === 1
                  ? localizedCoreServicesMap.marketing
                  : index === 2
                  ? localizedCoreServicesMap.creative
                  : index === 3
                  ? localizedCoreServicesMap.training
                  : null);

              const displayTitle =
                locale === 'ar'
                  ? arData?.title || categoryLabelsAr[cat] || service.title
                  : categoryLabels[service.category] || service.title;

              const displaySummary =
                locale === 'ar'
                  ? arData?.summary || service.summary
                  : service.summary;

              const displayDetails =
                locale === 'ar' && arData?.details?.length
                  ? arData.details
                  : service.details || [];

              const serviceSlug =
                cat === 'strategy'
                  ? 'strategy-and-planning'
                  : cat === 'marketing'
                  ? 'marketing-management'
                  : cat === 'creative'
                  ? 'brand-identity'
                  : cat === 'media'
                  ? 'media-production'
                  : cat === 'training'
                  ? 'training-and-development'
                  : null;

              return (
                <details
                  key={service.id}
                  className="group py-5 sm:py-6"
                  data-testid={`service-${service.id}`}
                >
                  <summary className="flex cursor-pointer list-none items-center gap-4 sm:gap-6">
                    <span className="font-mono w-8 text-xs font-bold text-primary shrink-0">
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <h2 className="flex-1 text-lg sm:text-xl md:text-2xl font-bold text-foreground transition-colors group-hover:text-primary leading-snug">
                      {displayTitle}
                    </h2>

                    <ChevronDown
                      className="text-primary transition-transform group-open:rotate-180 shrink-0"
                      size={18}
                    />
                  </summary>

                  <div className="grid gap-6 ps-6 md:ps-14 pt-5 md:grid-cols-[1fr_1fr]">
                    <div>
                      <p className="max-w-lg text-sm leading-7 text-muted-foreground">
                        {displaySummary}
                      </p>

                      {serviceSlug && (
                        <div className="mt-5">
                          <Link
                            href={localizePath(`/services/${serviceSlug}`)}
                            className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-primary hover:underline"
                          >
                            <span>{locale === 'ar' ? 'عرض تفاصيل المسار والمنهجية' : 'Deep-dive capability details'}</span>
                            <ArrowUpRight size={13} className="rtl:-rotate-90" />
                          </Link>
                        </div>
                      )}
                    </div>

                    <ul className="space-y-3">
                      {displayDetails.map((detail) => (
                        <li
                          key={detail}
                          className="flex gap-3 text-sm"
                        >
                          <Check
                            className="mt-0.5 shrink-0 text-primary"
                            size={15}
                          />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </details>
              );
            })}
          </div>
        </QueryState>

        {/* Cross-linking: Latest field notes related to capabilities */}
        {latestNotes.length > 0 && (
          <section className="mt-24 border-t border-border/70 pt-16 text-start">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <p className="eyebrow text-primary text-xs font-mono">
                  {locale === 'ar' ? 'رؤى وأفكار استراتيجية' : 'Thinking in Practice'}
                </p>
                <h3 className="display text-2xl sm:text-3xl font-bold text-foreground mt-2">
                  {locale === 'ar' ? 'كيف نطبق هذه المفاهيم في الواقع؟' : 'Notes from the intersection of strategy & growth.'}
                </h3>
              </div>
              <Link
                href={localizePath('/blog')}
                className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-primary hover:underline"
              >
                <span>{locale === 'ar' ? 'استكشف كافة المقالات' : 'View all field notes'}</span>
                <ArrowUpRight size={13} className="rtl:-rotate-90" />
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {latestNotes.map((post) => (
                <Link
                  key={post.id}
                  href={localizePath(`/blog/${post.slug}`)}
                  className="group rounded-xl border border-border/60 bg-card/40 p-5 transition-all hover:border-primary/50 hover:bg-card/70"
                >
                  <span className="eyebrow text-primary text-[10px] font-mono">{post.category}</span>
                  <h4 className="mt-2 font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h4>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {post.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </PageFrame>
    </Shell>
  );
}

const SERVICE_PILLARS_DATA: Record<
  string,
  {
    category: string;
    titleEn: string;
    titleAr: string;
    kickerEn: string;
    kickerAr: string;
    summaryEn: string;
    summaryAr: string;
    detailsEn: string[];
    detailsAr: string[];
    benefitsEn: { title: string; desc: string }[];
    benefitsAr: { title: string; desc: string }[];
  }
> = {
  'strategy-and-planning': {
    category: 'strategy',
    titleEn: 'Strategy & Planning',
    titleAr: 'التخطيط المؤسسي وهندسة التوسع',
    kickerEn: 'Market Entry & Growth Trajectories',
    kickerAr: 'خرائط اختراق السوق وهندسة النمو',
    summaryEn: 'Go-To-Market trajectories, in-depth competitor intelligence, sales funnel engineering, and strategic marketing reorganization designed for lasting compounding returns.',
    summaryAr: 'رسم خرائط اختراق السوق، تحليل تنافسي معمق، وإعادة تصميم الهيكل التسويقي للمؤسسات لضمان عائد مستقر طويل المدى ومضاعفة كفاءة المبيعات.',
    detailsEn: [
      'Comprehensive Go-To-Market trajectories and phased market entry roadmaps',
      'In-depth competitor intelligence, gap analysis, and unexploited opportunity discovery',
      'Sales funnel engineering, lead velocity acceleration, and conversion optimization',
      'Strategic corporate marketing reorganization and growth governance frameworks',
    ],
    detailsAr: [
      'رسم خرائط اختراق السوق والتوسع المدروس (GTM)',
      'تحليل تنافسي معمق وتحديد الفجوات والفرص الاستثمارية',
      'هندسة قمع المبيعات ورفع كفاءة معدلات التحويل التجاري',
      'إعادة تصميم الهيكل التسويقي وحوكمة منظومة النمو',
    ],
    benefitsEn: [
      { title: 'Market Clarity', desc: 'Eliminate speculative guesswork with data-backed competitor intelligence and target ICP profiling.' },
      { title: 'Funnel Optimization', desc: 'Plug leaky sales funnels and align sales teams with qualified marketing demand.' },
      { title: 'Scalable Architecture', desc: 'Build governance frameworks that allow your organization to expand without operational chaos.' },
    ],
    benefitsAr: [
      { title: 'وضوح استثماري وتسويقي', desc: 'القضاء على التخمين من خلال بيانات استخباراتية تنافسية وتحديد دقيق لشريحة العملاء المثالية.' },
      { title: 'كفاءة قمع المبيعات', desc: 'معالجة تسرب الفرص البيعية وربط فرق المبيعات بطلب تسويقي عالي الجودة والجاهزية.' },
      { title: 'هيكل نمو قابل للتوسع', desc: 'بناء أطر حوكمة تسمح بتوسع عمليات الشركة دون اختناقات إدارية أو إهدار للموارد.' },
    ],
  },
  'marketing-management': {
    category: 'marketing',
    titleEn: 'Marketing Management & Growth',
    titleAr: 'إدارة التسويق ومضاعفة الأثر',
    kickerEn: 'Omnichannel Performance & ROI',
    kickerAr: 'التسويق عالي الأداء وإدارة الميزانيات',
    summaryEn: 'Omnichannel performance leadership, disciplined budget allocation, advanced SEO architecture, and continuous ROI maximization across digital acquisition channels.',
    summaryAr: 'توجيه الإنفاق الإعلاني، إدارة منصات الاستحواذ، وهندسة رحلة العميل الرقمية لتقليل تكلفة الاستحواذ ومضاعفة القيمة التراكمية للعميل.',
    detailsEn: [
      'Disciplined ad spend allocation and financial efficiency across paid acquisition channels',
      'Omnichannel performance campaigns (Meta, Google Search & Display, TikTok, LinkedIn)',
      'Customer journey engineering, CAC reduction, and Lifetime Value (LTV) maximization',
      'Technical SEO architecture, local search dominance, and high-intent inbound organic pipeline',
    ],
    detailsAr: [
      'توجيه الإنفاق الإعلاني وإدارة الميزانيات بكفاءة مالية منضبطة',
      'إدارة منصات الاستحواذ والحملات الإعلانية متعددة القنوات',
      'هندسة رحلة العميل الرقمية وخفض تكلفة الاستحواذ (CAC)',
      'مضاعفة القيمة التراكمية للعميل (LTV) وتحليل العائد (ROI)',
    ],
    benefitsEn: [
      { title: 'Capital Efficiency', desc: 'Every dollar of ad spend is tied to verified pipeline metrics and incremental revenue.' },
      { title: 'Organic Inbound Dominance', desc: 'Establish long-term keyword ownership that drives inbound leads with zero marginal ad cost.' },
      { title: 'Unified Attribution', desc: 'Transparent multichannel analytics tracking first-touch to closed-won deals.' },
    ],
    benefitsAr: [
      { title: 'انضباط مالي في الإنفاق', desc: 'ربط كل جنيه يُنفق بمؤشرات أداء واضحة وعائد تجاري مباشر وملموس.' },
      { title: 'استدامة التدفق العضوي', desc: 'بناء حضور عضوي قوي عبر محركات البحث يولد عملاء مؤهلين دون تكلفة نقرة متكررة.' },
      { title: 'شفافية التحليل والتقارير', desc: 'لوحات قياس موحدة تتبع رحلة العميل من أول تفاعل حتى إتمام التعاقد.' },
    ],
  },
  'brand-identity': {
    category: 'creative',
    titleEn: 'Visual Brand Strategy & Systems',
    titleAr: 'بناء الهوية والأنظمة البصرية',
    kickerEn: 'Distinct Visual Language & Guidelines',
    kickerAr: 'الهوية المؤسسية والأنظمة المرئية',
    summaryEn: 'Designing prestigious corporate visual identities that command authority, comprehensive typography systems, and institutional guidelines that protect brand equity.',
    summaryAr: 'تصميم لغات بصرية مؤسسية تفرض حضورها في السوق، وتوحيد الأصول المرئية والأدلة الإرشادية بما يعكس مكانة العلامة الحقيقية.',
    detailsEn: [
      'Corporate typographic systems, color theory, and high-contrast visual standards',
      'Comprehensive brand guideline books and institutional design governance',
      'Creative direction for commercial positioning and premium packaging',
      'Cross-platform brand asset harmonization for web, physical spaces, and print',
    ],
    detailsAr: [
      'تصميم لغات بصرية مؤسسية تفرض حضورها ومكانتها السوقية',
      'توحيد الأصول المرئية والأدلة الإرشادية المتكاملة للعلامة',
      'التوجيه الإبداعي والإنتاج السينمائي رفيع المستوى',
      'حوكمة العلامة التجارية وتطوير أصول التموضع المؤسسي',
    ],
    benefitsEn: [
      { title: 'Command Premium Pricing', desc: 'Elevate your visual perception to compete with category leaders and command higher margins.' },
      { title: 'Cohesive Execution', desc: 'Ensure every internal team and external vendor follows an unambiguous brand guideline.' },
      { title: 'Memorable Brand Equity', desc: 'Stand out from visual noise with tailored typography and distinctive art direction.' },
    ],
    benefitsAr: [
      { title: 'تعزيز القيمة السعرية', desc: 'الارتقاء بالانطباع الذهني والمكانة البصرية للمنافسة بقوة وفرض أسعار تتناسب مع جودة الخدمة.' },
      { title: 'اتساق كامل عبر جميع المنصات', desc: 'أدلة واضحة تضمن توافق كافة تصاميم الفريق الداخلي والشركاء مع روح العلامة.' },
      { title: 'بصمة بصرية فريدة', desc: 'الخروج من التكرار والنمطية عبر خطوط مخصصة وتوجيه فني يعلق في ذهن الجمهور.' },
    ],
  },
  'media-production': {
    category: 'media',
    titleEn: 'Media Production & Creative Direction',
    titleAr: 'الإنتاج الإبداعي والسينمائي',
    kickerEn: 'Moving Image & Cinematic Storytelling',
    kickerAr: 'الإنتاج السينمائي والمحتوى عالي التأثير',
    summaryEn: 'Cinema-grade video production, short-form viral storytelling (Reels & Shorts), and commercial narrative development tailored to hold modern attention.',
    summaryAr: 'إنتاج إعلاني وسينمائي رفيع المستوى، صناعة فيديوهات قصيرة سريعة الانتشار، وإخراج قصص بصرية تأسر انتباه الجمهور المستهدف.',
    detailsEn: [
      'Commercial film production and high-end video ad campaigns',
      'High-velocity vertical video production (Reels, TikTok, Shorts)',
      'Podcast studio setup, multi-camera filming, and sound design engineering',
      'Art direction, set design, color grading, and broadcast-quality post-production',
    ],
    detailsAr: [
      'إنتاج الأفلام التجارية والحملات الإعلانية السينمائية',
      'إنتاج الفيديوهات الرأسية الإبداعية سريعة الانتشار (Reels & Shorts)',
      'تسجيل وتصوير البودكاست المؤسسي بأنظمة متعددة الكاميرات وهندسة صوتية متقدمة',
      'التوجيه الفني وتصحيح الألوان (Color Grading) وعمليات المونتاج الاحترافي',
    ],
    benefitsEn: [
      { title: 'Attention Retention', desc: 'Craft narratives engineered specifically to capture attention in the first 3 seconds.' },
      { title: 'Cinema Aesthetics', desc: 'Give your brand the prestige of full cinema cameras, calibrated lighting, and pristine audio.' },
      { title: 'Multi-Format Repurposing', desc: 'Turn one production shoot into dozens of high-performing micro-assets.' },
    ],
    benefitsAr: [
      { title: 'اقتناص الانتباه الفوري', desc: 'صياغة هوك وافتتاحية مدروسة تأسر اهتمام المشاهد خلال أول 3 ثوانٍ وتمنع تخطي الإعلان.' },
      { title: 'جودة سينمائية فائقة', desc: 'إبراز منتجاتك وخدماتك بكاميرات سينمائية متطورة وإضاءة مدروسة تعكس الاحترافية.' },
      { title: 'إعادة تدوير الأصول الإبداعية', desc: 'تحويل يوم التصوير الواحد إلى عشرات المقاطع الإعلانية المتنوعة لمختلف القنوات.' },
    ],
  },
  'training-and-development': {
    category: 'training',
    titleEn: 'Executive Training & Skill Acceleration',
    titleAr: 'تمكين القيادات وبناء الكفاءات',
    kickerEn: 'Capability Transfer & In-House Mastery',
    kickerAr: 'نقل الخبرة العملية وتأهيل الكوادر',
    summaryEn: 'Practical hands-on training transferring senior growth frameworks, consultative sales workflows, and digital analytics mastery directly to your internal team.',
    summaryAr: 'نقل الخبرة المعرفية والعملية لفرق العمل الداخلية عبر ورش تطبيقية مكثفة في المبيعات الاستشارية، التحليل الرقمي، وإدارة المشاريع الرشيقة.',
    detailsEn: [
      'In-house capability transfer and marketing team leadership acceleration',
      'Hands-on consultative sales training for complex high-ticket deals',
      'Digital analytics workshops, KPI dashboards, and data-informed decision making',
      'Agile marketing project delivery frameworks and sprint management',
    ],
    detailsAr: [
      'نقل الخبرة المعرفية والعملية لفرق العمل الداخلية',
      'برامج تدريب وتأهيل عملي في المبيعات الاستشارية المعقدة',
      'التحليل الرقمي واستخلاص مؤشرات الأداء الحيوية (KPIs)',
      'إدارة المشاريع بالمنهجيات الرشيقة وتسريع وتيرة التنفيذ',
    ],
    benefitsEn: [
      { title: 'Self-Sustaining Teams', desc: 'Reduce reliance on external agencies by elevating the competency of your internal talent.' },
      { title: 'Consultative Sales Lift', desc: 'Empower commercial teams to close enterprise contracts through strategic advisory methods.' },
      { title: 'Data-Driven Culture', desc: 'Equip leadership with real-time KPI visibility to make proactive capital decisions.' },
    ],
    benefitsAr: [
      { title: 'استقلالية الفريق الداخلي', desc: 'تقليل الاعتماد الدائم على جهات خارجية عبر رفع كفاءة كوادر شركتك الذاتية.' },
      { title: 'مضاعفة إغلاق الصفقات المعقدة', desc: 'تمكين فريق المبيعات من التحاور الاستشاري مع صانعي القرار وإغلاق صفقات كبرى.' },
      { title: 'ثقافة اتخاذ القرار بالبيانات', desc: 'تزويد الإدارة برؤية واضحة لمؤشرات الأداء لاتخاذ قرارات استثمارية استباقية ومربحة.' },
    ],
  },
};

function ServiceDetail() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { locale, localizePath } = useLanguage();
  const service = SERVICE_PILLARS_DATA[slug];

  const title = service ? (locale === 'ar' ? service.titleAr : service.titleEn) : 'Service';
  const kicker = service ? (locale === 'ar' ? service.kickerAr : service.kickerEn) : 'Service';
  const summary = service ? (locale === 'ar' ? service.summaryAr : service.summaryEn) : '';
  const details = service ? (locale === 'ar' ? service.detailsAr : service.detailsEn) : [];
  const benefits = service ? (locale === 'ar' ? service.benefitsAr : service.benefitsEn) : [];

  useSEO({
    title: service
      ? `${title} — ${locale === 'ar' ? 'خدمات سبارك هب ستوديو' : 'Spark Hub Studio Capabilities'}`
      : 'Service — Spark Hub Studio',
    description: summary,
    canonical: `/services/${slug}`,
    ogType: 'website',
    schema: service
      ? {
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: title,
          provider: {
            '@type': 'Organization',
            name: 'Spark Hub Studio',
            url: 'https://spark-hub.online',
          },
          description: summary,
          areaServed: [
            { '@type': 'Country', name: 'Egypt' },
            { '@type': 'Country', name: 'Saudi Arabia' },
            { '@type': 'AdministrativeArea', name: 'MENA Region' },
          ],
          serviceType: service.category,
        }
      : undefined,
  });

  if (!service) {
    return <NotFound />;
  }

  return (
    <Shell>
      <PageFrame>
        <SEOBreadcrumbs
          items={[
            { label: locale === 'ar' ? 'الرئيسية' : 'Home', href: '/' },
            { label: locale === 'ar' ? 'الخدمات' : 'Services', href: '/services' },
            { label: title, href: `/services/${slug}` },
          ]}
        />

        <Link
          href={localizePath('/services')}
          className="eyebrow text-primary inline-flex items-center gap-2 mb-8"
        >
          {locale === 'ar' ? '← العودة لكافة الخدمات' : '← Back to all capabilities'}
        </Link>

        <div className="max-w-4xl text-start">
          <p className="eyebrow text-primary font-mono">{kicker}</p>
          <h1 className="display mt-4 text-4xl sm:text-6xl md:text-7xl font-extrabold leading-tight text-foreground">
            {title}
          </h1>
          <p className="mt-6 text-lg sm:text-xl md:text-2xl text-muted-foreground leading-relaxed">
            {summary}
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 text-start">
          {benefits.map((b, idx) => (
            <div key={idx} className="rounded-2xl border border-border/60 bg-card/40 p-6">
              <span className="mono text-xs text-primary font-bold">0{idx + 1}</span>
              <h3 className="mt-3 font-bold text-lg text-foreground">{b.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>

        {/* Deliverables & Capabilities */}
        <div className="mt-16 rounded-2xl border border-border/60 bg-card/20 p-8 md:p-12 text-start">
          <h2 className="display text-2xl sm:text-3xl font-bold text-foreground mb-6">
            {locale === 'ar' ? 'نطاق العمل والمخرجات الأساسية' : 'Key Deliverables & Execution Scope'}
          </h2>
          <ul className="grid gap-4 md:grid-cols-2">
            {details.map((detail, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm sm:text-base text-muted-foreground">
                <Check className="mt-1 shrink-0 text-primary" size={16} />
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Direct CTA */}
        <div className="mt-20 border border-primary/40 bg-primary/5 rounded-2xl p-8 md:p-12 text-center">
          <p className="eyebrow text-primary text-xs font-mono">
            {locale === 'ar' ? 'شراكة نمو' : 'Growth Partnership'}
          </p>
          <h3 className="display text-3xl sm:text-4xl mt-2 text-foreground font-bold">
            {locale === 'ar' ? `هل أنت جاهز لتفعيل مسار ${title}؟` : `Ready to deploy ${title} on your business?`}
          </h3>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
            {locale === 'ar'
              ? 'تحدث مع فريقنا الاستشاري لبناء خارطة طريق محكمة تناسب متطلبات وأهداف مؤسستك.'
              : 'Start a conversation with our leadership to build a customized roadmap tailored to your specific commercial goals.'}
          </p>
          <Link
            href={localizePath('/contact')}
            className="mt-8 inline-flex items-center gap-2 border border-primary bg-primary px-8 py-3.5 text-xs font-bold uppercase tracking-[.14em] text-primary-foreground transition hover:bg-transparent hover:text-primary"
          >
            {locale === 'ar' ? 'ابدأ محادثة عمل الآن' : 'Start a conversation'}
            <ArrowUpRight size={14} className="rtl:-rotate-90" />
          </Link>
        </div>
      </PageFrame>
    </Shell>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Reels                                    */
/* -------------------------------------------------------------------------- */

function toEmbedUrl(
  url: string,
): { kind: 'iframe' | 'video' | 'audio'; src: string } {
  if (!url) {
    return {
      kind: 'video',
      src: '',
    };
  }

  // Check YouTube first using helper
  const ytId = getYoutubeId(url);
  if (ytId) {
    return {
      kind: 'iframe',
      src: `https://www.youtube.com/embed/${encodeURIComponent(ytId)}?autoplay=1&rel=0`,
    };
  }

  try {
    const parsedUrl = new URL(url);
    const host = parsedUrl.hostname.replace(/^www\./, '');

    if (host === 'vimeo.com') {
      const id = parsedUrl.pathname
        .split('/')
        .filter(Boolean)
        .pop();

      if (id) {
        return {
          kind: 'iframe',
          src: `https://player.vimeo.com/video/${encodeURIComponent(
            id,
          )}?autoplay=1`,
        };
      }
    }

    if (host === 'open.spotify.com') {
      const parts = parsedUrl.pathname.split('/').filter(Boolean);
      if (parts.length >= 2) {
        return {
          kind: 'iframe',
          src: `https://open.spotify.com/embed/${parts.slice(0, 2).join('/')}?utm_source=generator&theme=0`,
        };
      }
    }

    if (parsedUrl.pathname.match(/\.(mp3|m4a|wav|aac|ogg)$/i)) {
      return {
        kind: 'audio',
        src: url,
      };
    }
  } catch {
    // Fall through to direct video/audio.
  }

  return {
    kind: url.match(/\.(mp3|m4a|wav|aac|ogg)$/i) ? 'audio' : 'video',
    src: url,
  };
}

function getYoutubeId(url?: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') {
      return parsed.pathname.replace(/^\/+/, '').split('/')[0] || null;
    }
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const v = parsed.searchParams.get('v');
      if (v) return v;
      const parts = parsed.pathname.split('/').filter(Boolean);
      const embedIndex = parts.indexOf('embed');
      if (embedIndex >= 0 && parts[embedIndex + 1]) return parts[embedIndex + 1];
      const shortsIndex = parts.indexOf('shorts');
      if (shortsIndex >= 0 && parts[shortsIndex + 1]) return parts[shortsIndex + 1];
    }
  } catch {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|watch\?.+&v=))([\w-]{11})/);
    if (match?.[1]) return match[1];
  }
  return null;
}

function resolveThumbnail(thumbnailUrl?: string | null, ...fallbackUrls: (string | null | undefined)[]): string {
  if (thumbnailUrl && thumbnailUrl.trim().length > 0 && !thumbnailUrl.includes('placeholder')) {
    return thumbnailUrl.trim();
  }
  for (const fallback of fallbackUrls) {
    if (!fallback) continue;
    const ytId = getYoutubeId(fallback);
    if (ytId) {
      return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    }
  }
  return thumbnailUrl || '/media/spark-reels.png';
}

function ReelLightbox({
  reel,
  onClose,
}: {
  reel: any;
  onClose: () => void;
}) {
  const embed = toEmbedUrl(reel.videoUrl);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-background/90 p-5 backdrop-blur-sm"
      onClick={onClose}
      data-testid="overlay-reel-lightbox"
    >
      <div
        className="flex max-h-[92dvh] flex-col items-center animate-reel-pop"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex w-full max-w-sm items-center justify-between pb-3" dir="auto">
          <div className="pe-3 flex-1 min-w-0">
            <h3 className="font-arabic font-bold text-lg sm:text-xl text-foreground leading-snug">
              {reel.title}
            </h3>

            <p className="mt-1 text-xs text-primary font-medium">
              {reel.client} {reel.category ? `• ${reel.category}` : ''}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded-full p-2"
            aria-label="Close"
            data-testid="button-close-reel-lightbox"
          >
            <X size={20} />
          </button>
        </div>

        <div className="art-panel aspect-[9/16] h-[75dvh] max-h-[640px] w-auto overflow-hidden rounded-xl bg-black">
          {embed.kind === 'iframe' ? (
            <iframe
              src={embed.src}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              title={reel.title}
            />
          ) : embed.src ? (
            <video
              src={embed.src}
              className="h-full w-full object-cover"
              controls
              autoPlay
              playsInline
            />
          ) : (
            <div className="grid h-full place-items-center p-6 text-center text-sm text-muted-foreground">
              No video URL available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Reels() {
  const { t, locale } = useLanguage();
  const query = useListReels();
  const [active, setActive] = useState<any>(null);

  useSEO({
    title:
      locale === 'ar'
        ? 'ريلز وإنتاج إعلامي وسينمائي — سبارك هب ستوديو'
        : 'Reels, Commercial Films & Media Production — Spark Hub Studio',
    description:
      locale === 'ar'
        ? 'أعمال الإنتاج الإعلامي والحملات البصرية من سبارك هب ستوديو: أفلام تجارية، ريلز إبداعية، وقصص بصرية للعلامات التجارية.'
        : 'Commercial video production, cinematic brand films, social reels, and moving visual systems crafted by Spark Hub Studio.',
    schema:
      query.data && query.data.length > 0
        ? {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            itemListElement: query.data.slice(0, 12).map((reel, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              item: {
                '@type': 'VideoObject',
                name: reel.title,
                description: `${reel.title} — ${reel.client || 'Spark Hub Studio'}`,
                thumbnailUrl: resolveThumbnail(reel.thumbnailUrl, reel.videoUrl),
                uploadDate: '2026-01-01',
              },
            })),
          }
        : undefined,
  });

  return (
    <Shell>
      <PageFrame>
        <SEOBreadcrumbs
          items={[
            { label: locale === 'ar' ? 'الرئيسية' : 'Home', href: '/' },
            { label: locale === 'ar' ? 'ريلز وإنتاج' : 'Reels', href: '/reels' },
          ]}
        />

        <SectionHead
          kicker={t('reels.kicker', 'Moving image')}
          title={t('reels.title', 'Stories with a pulse.')}
          intro={t('reels.intro', 'The work between the takes: films, campaign worlds and visual systems made to hold attention.')}
          typingIntro
        />

        <QueryState
          loading={query.isLoading}
          error={!!query.error}
          empty={
            !query.isLoading &&
            !query.error &&
            !query.data?.length
          }
        >
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(query.data || []).map((reel) => (
              <button
                type="button"
                onClick={() => setActive(reel)}
                className="group text-start transition-all duration-300 hover:-translate-y-1"
                key={reel.id}
                data-testid={`link-reel-${reel.id}`}
              >
                  <div className="art-panel relative aspect-[4/5] overflow-hidden rounded-xl bg-card border border-border/40 group-hover:border-primary/60 group-hover:shadow-[0_8px_30px_-6px_rgba(233,190,88,0.28)] transition-all duration-500">
                    <img
                      src={resolveThumbnail(reel.thumbnailUrl, reel.videoUrl)}
                      alt={reel.thumbnailAlt || reel.title}
                      loading='lazy'
                      className="absolute inset-0 h-full w-full object-cover opacity-75 transition duration-700 ease-out group-hover:scale-105 group-hover:opacity-95"
                    />

                  <div className="relative z-10 flex h-full items-center justify-center">
                    <span className="grid h-14 w-14 place-items-center rounded-full border border-primary/40 bg-background/60 backdrop-blur-sm text-primary shadow-lg transition duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-background group-hover:shadow-[0_0_20px_rgba(233,190,88,0.5)]">
                      <Film size={18} />
                    </span>
                  </div>

                  <span className="absolute bottom-4 start-4 eyebrow text-primary text-[10px]">
                    {reel.category}
                  </span>
                </div>

                <div className="mt-3.5 flex items-start justify-between gap-3" dir="auto">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-arabic font-bold text-base sm:text-lg leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {reel.title}
                    </h3>

                    <p className="mt-1 text-xs text-muted-foreground font-medium">
                      {reel.client}
                    </p>
                  </div>

                  <span className="mt-1 grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-background transition-all shrink-0">
                    <Play size={12} fill="currentColor" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </QueryState>
      </PageFrame>

      {active && (
        <ReelLightbox
          reel={active}
          onClose={() => setActive(null)}
        />
      )}
    </Shell>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Podcasts                                  */
/* -------------------------------------------------------------------------- */

function PodcastLightbox({
  podcast,
  onClose,
}: {
  podcast: any;
  onClose: () => void;
}) {
  const embed = toEmbedUrl(podcast.audioUrl);
  const thumb = resolveThumbnail(podcast.thumbnailUrl, podcast.audioUrl, podcast.youtubeUrl);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-background/90 p-5 backdrop-blur-sm"
      onClick={onClose}
      data-testid="overlay-podcast-lightbox"
    >
      <div
        className="flex max-h-[92dvh] w-full max-w-2xl flex-col animate-reel-pop"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex w-full items-center justify-between pb-3" dir="auto">
          <div className="flex-1 min-w-0 pe-3">
            <div className="flex items-center gap-2 flex-wrap">
              {podcast.episodeNumber && (
                <span className="rounded-md bg-primary/15 px-2.5 py-0.5 font-sans font-semibold text-xs text-primary border border-primary/20">
                  {podcast.episodeNumber}
                </span>
              )}
              <span className="rounded-md bg-muted/60 px-2.5 py-0.5 font-sans text-xs text-muted-foreground font-medium">
                {podcast.category}
              </span>
            </div>
            <h3 className="font-arabic font-bold text-xl sm:text-2xl mt-2 text-foreground leading-snug">
              {podcast.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              {podcast.host} {podcast.guest ? `• ${podcast.guest}` : ''} {podcast.duration ? `• ${podcast.duration}` : ''}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded-full p-2 shrink-0"
            aria-label="Close"
            data-testid="button-close-podcast-lightbox"
          >
            <X size={20} />
          </button>
        </div>

        <div className="art-panel relative w-full overflow-hidden rounded-xl bg-card border border-border/40">
          {embed.kind === 'iframe' ? (
            <div className="aspect-video w-full">
              <iframe
                src={embed.src}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                title={podcast.title}
              />
            </div>
          ) : embed.kind === 'audio' ? (
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={thumb}
                  alt={podcast.thumbnailAlt || podcast.title}
                  className="h-20 w-20 rounded-lg object-cover"
                />
                <div>
                  <h4 className="font-arabic font-bold text-base text-foreground">{podcast.title}</h4>
                  <p className="text-xs text-muted-foreground font-medium">{podcast.host}</p>
                </div>
              </div>
              <audio src={embed.src} controls autoPlay className="w-full" />
            </div>
          ) : embed.src ? (
            <div className="aspect-video w-full">
              <video
                src={embed.src}
                className="h-full w-full object-cover"
                controls
                autoPlay
                playsInline
              />
            </div>
          ) : (
            <div className="grid h-48 place-items-center p-6 text-center text-sm text-muted-foreground">
              No media stream available.
            </div>
          )}
        </div>

        {podcast.description && (
          <p className="mt-3.5 w-full text-sm text-muted-foreground leading-relaxed font-sans" dir="auto">
            {podcast.description}
          </p>
        )}

        {(podcast.spotifyUrl || podcast.appleUrl || podcast.youtubeUrl) && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <span className="font-sans text-xs text-muted-foreground font-medium uppercase tracking-wider">Listen on:</span>
            {podcast.spotifyUrl && (
              <a
                href={podcast.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3.5 py-1.5 text-xs text-primary hover:bg-primary/15 transition font-medium"
              >
                <Radio size={13} />
                Spotify
                <ExternalLink size={11} />
              </a>
            )}
            {podcast.appleUrl && (
              <a
                href={podcast.appleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3.5 py-1.5 text-xs text-primary hover:bg-primary/15 transition font-medium"
              >
                <Headphones size={13} />
                Apple Podcasts
                <ExternalLink size={11} />
              </a>
            )}
            {podcast.youtubeUrl && (
              <a
                href={podcast.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3.5 py-1.5 text-xs text-primary hover:bg-primary/15 transition font-medium"
              >
                <Film size={13} />
                YouTube
                <ExternalLink size={11} />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Podcasts() {
  const { t, locale } = useLanguage();
  const query = useListPodcasts();
  const [active, setActive] = useState<any>(null);

  useSEO({
    title:
      locale === 'ar'
        ? 'بودكاست وحوارات النمو الاستراتيجي — سبارك هب ستوديو'
        : 'Podcasts & Strategic Growth Conversations — Spark Hub Studio',
    description:
      locale === 'ar'
        ? 'بودكاست سبارك هب ستوديو: حوارات معمقة حول استراتيجيات العلامات التجارية، القيادة المؤسسية، والنمو المستدام مع رواد الصناعة.'
        : 'In-depth podcast episodes and conversations on strategic leadership, brand building, culture, and sustainable business scaling.',
  });

  return (
    <Shell>
      <PageFrame>
        <SEOBreadcrumbs
          items={[
            { label: locale === 'ar' ? 'الرئيسية' : 'Home', href: '/' },
            { label: locale === 'ar' ? 'بودكاست وحوارات' : 'Podcasts', href: '/podcasts' },
          ]}
        />

        <SectionHead
          kicker={t('podcasts.kicker', 'Audio & Conversations')}
          title={t('podcasts.title', 'Ideas in conversation.')}
          intro={t('podcasts.intro', 'Deep dives into brand strategy, leadership, culture, and sustainable growth with industry shapers.')}
          typingIntro
        />

        <QueryState
          loading={query.isLoading}
          error={!!query.error}
          empty={
            !query.isLoading &&
            !query.error &&
            !query.data?.length
          }
        >
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(query.data || []).map((podcast) => {
              const thumb = resolveThumbnail(podcast.thumbnailUrl, podcast.audioUrl, podcast.youtubeUrl);
              return (
                <button
                  type="button"
                  onClick={() => setActive(podcast)}
                  className="group text-start transition-all duration-300 hover:-translate-y-1"
                  key={podcast.id}
                  data-testid={`card-podcast-${podcast.id}`}
                >
                  <div className="art-panel relative aspect-[16/10] overflow-hidden rounded-xl bg-card border border-border/40 group-hover:border-primary/60 group-hover:shadow-[0_8px_30px_-6px_rgba(233,190,88,0.28)] transition-all duration-500">
                    <img
                      src={thumb}
                      alt={podcast.thumbnailAlt || podcast.title}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover opacity-75 transition duration-700 ease-out group-hover:scale-105 group-hover:opacity-95"
                    />

                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />

                  <div className="relative z-10 flex h-full items-center justify-center">
                    <span className="grid h-12 w-12 place-items-center rounded-full border border-primary/40 bg-background/60 backdrop-blur-sm text-primary shadow-lg transition duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-background group-hover:shadow-[0_0_20px_rgba(233,190,88,0.5)]">
                      <Headphones size={18} />
                    </span>
                  </div>

                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    {podcast.episodeNumber && (
                      <span className="rounded bg-background/80 px-2 py-0.5 font-sans font-medium text-[10px] text-primary backdrop-blur-sm border border-primary/20">
                        {podcast.episodeNumber}
                      </span>
                    )}
                    {podcast.duration && (
                      <span className="rounded bg-background/80 px-2 py-0.5 font-sans text-[10px] text-muted-foreground backdrop-blur-sm">
                        {podcast.duration}
                      </span>
                    )}
                  </div>

                  <span className="absolute bottom-3 left-3 eyebrow text-primary text-[10px]">
                    {podcast.category}
                  </span>
                </div>

                <div className="mt-3.5 flex items-start justify-between gap-3" dir="auto">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-arabic font-bold text-base sm:text-lg leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {podcast.title}
                    </h3>

                    <p className="mt-1.5 text-xs text-muted-foreground font-medium flex items-center gap-1.5 flex-wrap">
                      <span>{podcast.host}</span>
                      {podcast.guest && <span>• {podcast.guest}</span>}
                    </p>
                  </div>

                  <span className="mt-1 grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-background transition-all shrink-0">
                    <Play size={13} fill="currentColor" />
                  </span>
                </div>
              </button>
            );
          })}
          </div>
        </QueryState>
      </PageFrame>

      {active && (
        <PodcastLightbox
          podcast={active}
          onClose={() => setActive(null)}
        />
      )}
    </Shell>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Posts                                    */
/* -------------------------------------------------------------------------- */

function Posts() {
  const { t, locale } = useLanguage();
  const query = useListPosts();
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [activeImageModal, setActiveImageModal] = useState<{
    url: string;
    alt: string;
    caption: string;
    client: string;
    category: string;
  } | null>(null);

  useSEO({
    title:
      locale === 'ar'
        ? 'سجل الحملات الإعلانية والتصاميم الإبداعية — سبارك هب ستوديو'
        : 'Creative Campaigns & Visual Direction Journal — Spark Hub Studio',
    description:
      locale === 'ar'
        ? 'معرض الحملات الرقمية، تصاميم منصات التواصل، وتطوير الهويات البصرية المنفذة بواسطة استوديو سبارك هب لنخبة من العلامات التجارية.'
        : 'A curated showcase of commercial campaigns, social media designs, and digital visual identities crafted by Spark Hub Studio.',
  });

  // Merge all 109 curated brand posts with any live updates from query.data so all 8 brands are displayed
  const posts = useMemo(() => {
    const postMap = new Map<number, any>();
    (allPostsData as any[]).forEach((p, idx) => {
      const id = p.id ?? idx + 1;
      postMap.set(id, { id, ...p });
    });

    if (query.data && Array.isArray(query.data)) {
      query.data.forEach((p: any) => {
        if (p && p.id) {
          postMap.set(p.id, { ...postMap.get(p.id), ...p });
        }
      });
    }

    return Array.from(postMap.values()).sort(
      (a, b) => (a.displayOrder ?? a.id) - (b.displayOrder ?? b.id)
    );
  }, [query.data]);

  // Extract unique brands with their count and category
  const brandsMap = new Map<string, { count: number; category: string }>();
  posts.forEach((p) => {
    const existing = brandsMap.get(p.client);
    if (existing) {
      existing.count += 1;
    } else {
      brandsMap.set(p.client, { count: 1, category: p.category });
    }
  });

  const brandsList = Array.from(brandsMap.entries()).map(([client, info]) => ({
    client,
    ...info,
  }));

  const filteredPosts =
    selectedBrand === 'all'
      ? posts
      : posts.filter((p) => p.client === selectedBrand);

  // Grouped by brand when 'all' is selected
  const groupedByBrand = brandsList.map((b) => ({
    brand: b.client,
    category: b.category,
    posts: posts.filter((p) => p.client === b.client),
  }));

  return (
    <Shell>
      <PageFrame>
        <SEOBreadcrumbs
          items={[
            { label: locale === 'ar' ? 'الرئيسية' : 'Home', href: '/' },
            { label: locale === 'ar' ? 'الأعمال الإبداعية' : 'Journal', href: '/posts' },
          ]}
        />

        <SectionHead
          kicker={t('posts.kicker', 'Social & Creative Direction')}
          title={t('posts.title', 'Campaigns & Visual Stories.')}
          intro={t('posts.intro', 'A curated collection of social media designs, commercial campaigns, and digital brand identities executed by Spark Hub Studio.')}
          typingIntro
        />

        <QueryState
          loading={query.isLoading && !posts.length}
          error={!!query.error && !posts.length}
          empty={!posts.length}
        >
          {/* Brand Filter Pills */}
          <div className="mb-12 flex flex-wrap items-center gap-2 border-b border-border/60 pb-6">
            <button
              onClick={() => setSelectedBrand('all')}
              className={`rounded-full px-4 py-2 text-xs font-mono transition-all ${
                selectedBrand === 'all'
                  ? 'bg-primary text-primary-foreground font-semibold shadow-[0_0_15px_rgba(233,190,88,0.35)]'
                  : 'bg-card border border-border/80 text-muted-foreground hover:border-primary/50 hover:text-foreground'
              }`}
            >
              {t('posts.all_brands', 'All Campaigns')} ({posts.length})
            </button>

            {brandsList.map((b) => (
              <button
                key={b.client}
                onClick={() => setSelectedBrand(b.client)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-mono transition-all ${
                  selectedBrand === b.client
                    ? 'bg-primary text-primary-foreground font-semibold shadow-[0_0_15px_rgba(233,190,88,0.35)]'
                    : 'bg-card border border-border/80 text-muted-foreground hover:border-primary/50 hover:text-foreground'
                }`}
              >
                <span>{b.client}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                    selectedBrand === b.client
                      ? 'bg-black/30 text-primary-foreground'
                      : 'bg-primary/10 text-primary'
                  }`}
                >
                  {b.count}
                </span>
              </button>
            ))}
          </div>

          {/* If a specific brand is selected */}
          {selectedBrand !== 'all' ? (
            <div>
              <div className="mb-8 flex items-center justify-between border-s-2 border-primary ps-4">
                <div>
                  <h2 className="display text-2xl font-bold text-foreground">
                    {selectedBrand}
                  </h2>
                  <p className="mono text-xs text-primary mt-1">
                    {brandsMap.get(selectedBrand)?.category} • {filteredPosts.length} {locale === 'ar' ? 'تصميم إبداعي' : 'Creative Designs'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onOpen={() =>
                      setActiveImageModal({
                        url: post.imageUrls[0],
                        alt: post.imageAlt,
                        caption: post.caption,
                        client: post.client,
                        category: post.category,
                      })
                    }
                  />
                ))}
              </div>
            </div>
          ) : (
            /* Grouped Sections by Brand when All is selected */
            <div className="space-y-16">
              {groupedByBrand.map((group) => (
                <section
                  key={group.brand}
                  className="rounded-2xl border border-border/50 bg-card/30 p-6 md:p-8 backdrop-blur-sm"
                >
                  {/* Brand Group Header */}
                  <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/30 text-primary font-mono text-sm font-bold shadow-[0_0_12px_rgba(233,190,88,0.2)]">
                        {group.brand.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
                          {group.brand}
                        </h2>
                        <span className="mono text-[11px] text-primary tracking-wider uppercase">
                          {group.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="mono text-xs text-muted-foreground bg-card border border-border px-3 py-1 rounded-full">
                        {group.posts.length} {locale === 'ar' ? 'تصميم' : 'Designs'}
                      </span>
                      <button
                        onClick={() => setSelectedBrand(group.brand)}
                        className="text-xs font-mono text-primary hover:underline inline-flex items-center gap-1"
                      >
                        {locale === 'ar' ? 'عرض هذه العلامة فقط' : 'View brand only'}{' '}
                        <ChevronRight size={14} className="rtl:rotate-180" />
                      </button>
                    </div>
                  </div>

                  {/* Brand Posts Grid */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {group.posts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onOpen={() =>
                          setActiveImageModal({
                            url: post.imageUrls[0],
                            alt: post.imageAlt,
                            caption: post.caption,
                            client: post.client,
                            category: post.category,
                          })
                        }
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </QueryState>

        {/* Full-Screen Lightbox Modal */}
        {activeImageModal && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 md:p-8 animate-fade"
            onClick={() => setActiveImageModal(null)}
          >
            <div
              className="relative max-h-[90vh] max-w-4xl w-full bg-[#080c14] border border-primary/40 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col md:flex-row"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveImageModal(null)}
                className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-primary hover:text-black transition-colors"
              >
                <X size={18} />
              </button>

              <div className="flex-1 bg-black flex items-center justify-center p-2 min-h-[300px] md:min-h-[500px]">
                <img
                  src={activeImageModal.url}
                  alt={activeImageModal.alt}
                  className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/media/spark-brand-poster.png';
                  }}
                />
              </div>

              <div className="w-full md:w-80 p-6 flex flex-col justify-between border-t md:border-t-0 md:border-l border-border/80 bg-card/60">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span className="mono text-xs uppercase tracking-widest text-primary font-semibold">
                      {activeImageModal.client}
                    </span>
                  </div>

                  <p className="mono text-[11px] text-muted-foreground mb-4">
                    {activeImageModal.category}
                  </p>

                  <p className="text-sm leading-relaxed text-foreground font-sans">
                    {activeImageModal.caption}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-xs mono text-muted-foreground">
                  <span>Spark Hub Studio</span>
                  <a
                    href={activeImageModal.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    HD Image <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </PageFrame>
    </Shell>
  );
}

function PostCard({
  post,
  onOpen,
}: {
  post: any;
  onOpen: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const hasImage = post.imageUrls?.[0] && !imgError;

  return (
    <article
      className="group relative flex flex-col justify-between rounded-xl border border-border/70 bg-card/90 overflow-hidden transition-all duration-300 hover:border-primary/60 hover:shadow-[0_8px_30px_rgba(233,190,88,0.15)] cursor-pointer"
      onClick={onOpen}
      data-testid={`card-post-${post.id}`}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-black/40 flex items-center justify-center">
        {hasImage ? (
          <img
            src={post.imageUrls[0]}
            alt={post.imageAlt || post.caption}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#0c121e] via-[#080d17] to-black border-b border-border/50">
            <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-mono text-base font-bold mb-3 shadow-[0_0_15px_rgba(233,190,88,0.15)]">
              {post.client ? post.client.slice(0, 2).toUpperCase() : 'SH'}
            </div>
            <span className="eyebrow text-[10px] text-primary mb-1">{post.category}</span>
            <p className="text-xs text-foreground/80 font-medium line-clamp-2">{post.client}</p>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <span className="mono text-xs text-primary font-semibold flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
            Click to expand
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="eyebrow text-primary">
              {post.category}
            </span>
            <span className="mono text-[10px] text-muted-foreground/70">
              #{String(post.id).padStart(2, '0')}
            </span>
          </div>

          <p className="text-sm leading-relaxed text-foreground font-sans line-clamp-3">
            {post.caption}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
          <span className="mono text-[11px] font-semibold text-muted-foreground group-hover:text-primary transition-colors">
            {post.client}
          </span>
          <ArrowUpRight
            size={15}
            className="text-primary transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
          />
        </div>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    About                                   */
/* -------------------------------------------------------------------------- */

type TeamMember = {
  id: number;
  name: string;
  position: string | null;
  bio: string | null;
  imageUrl: string | null;
  displayOrder?: number | null;
  category?: 'leadership' | 'team' | string | null;
  department?: string | null;
  linkedinUrl?: string | null;
  email?: string | null;
};

function useListTeam() {
  return useQuery<TeamMember[]>({
    queryKey: ['/api/team'],
    queryFn: async () => {
      const response = await fetch('/api/team');

      if (!response.ok) {
        throw new Error(
          `Failed to load team: ${response.status}`,
        );
      }

      const data: unknown = await response.json();

      if (!Array.isArray(data)) {
        return [];
      }

      return data as TeamMember[];
    },
  });
}

type ContactMessage = {
  id: number;
  name: string;
  email: string;
  message: string;
  budget: string;
  service: string;
  createdAt: string;
};

function useListMessages() {
  const { getToken } = useAuth();
  return useQuery<ContactMessage[]>({
    queryKey: ['/api/contact'],
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch('/api/contact', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to load messages');
      return res.json();
    },
  });
}

function useDeleteMessage() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const token = await getToken();
      const res = await fetch(`/api/contact/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to delete message');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['/api/contact'] }),
  });
}

type TeamMemberInput = {
  name: string;
  position: string | null;
  bio: string | null;
  imageUrl: string | null;
  displayOrder?: number;
  category?: 'leadership' | 'team' | string;
  department?: string | null;
  linkedinUrl?: string | null;
  email?: string | null;
};

function useCreateTeamMember() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: TeamMemberInput) => {
      const token = await getToken();
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create team member');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['/api/team'] }),
  });
}

function useUpdateTeamMember() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: TeamMemberInput }) => {
      const token = await getToken();
      const res = await fetch(`/api/team/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update team member');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['/api/team'] }),
  });
}

function useDeleteTeamMember() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const token = await getToken();
      const res = await fetch(`/api/team/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to delete team member');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['/api/team'] }),
  });
}

type ClientLogo = { id: number; name: string; imageUrl: string; displayOrder: number };

function useListClientLogos() {
  return useQuery<ClientLogo[]>({
    queryKey: ['/api/client-logos'],
    queryFn: () => fetch('/api/client-logos').then(r => r.json()),
  });
}

type ClientLogoInput = { name: string; imageUrl: string; displayOrder: number };

function useCreateClientLogo() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: ClientLogoInput) => {
      const token = await getToken();
      const res = await fetch('/api/client-logos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create logo');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['/api/client-logos'] }),
  });
}

function useUpdateClientLogo() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ClientLogoInput }) => {
      const token = await getToken();
      const res = await fetch(`/api/client-logos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update logo');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['/api/client-logos'] }),
  });
}

function useDeleteClientLogo() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const token = await getToken();
      const res = await fetch(`/api/client-logos/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to delete logo');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['/api/client-logos'] }),
  });
}

type BlogPostInput = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  publishedAt: string;
  imageUrl: string;
  imageAlt: string;
};

function useCreateBlogPost() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: BlogPostInput) => {
      const token = await getToken();
      const res = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create post');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['/api/blog'] }),
  });
}

function useUpdateBlogPost() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: BlogPostInput }) => {
      const token = await getToken();
      const res = await fetch(`/api/blog/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update post');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['/api/blog'] }),
  });
}

function useDeleteBlogPost() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const token = await getToken();
      const res = await fetch(`/api/blog/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to delete post');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['/api/blog'] }),
  });
}

type Podcast = {
  id: number;
  title: string;
  episodeNumber: string | null;
  host: string;
  guest: string | null;
  category: string;
  duration: string | null;
  description: string | null;
  audioUrl: string;
  spotifyUrl: string | null;
  appleUrl: string | null;
  youtubeUrl: string | null;
  thumbnailUrl: string;
  thumbnailAlt: string;
  displayOrder: number;
};

type PodcastInput = {
  title: string;
  episodeNumber?: string | null;
  host?: string;
  guest?: string | null;
  category: string;
  duration?: string | null;
  description?: string | null;
  audioUrl: string;
  spotifyUrl?: string | null;
  appleUrl?: string | null;
  youtubeUrl?: string | null;
  thumbnailUrl: string;
  thumbnailAlt: string;
  displayOrder?: number;
};

function useListPodcasts() {
  return useQuery<Podcast[]>({
    queryKey: ['/api/podcasts'],
    queryFn: async () => {
      const res = await fetch('/api/podcasts');
      if (!res.ok) throw new Error(`Failed to load podcasts: ${res.status}`);
      return res.json();
    },
  });
}

function useCreatePodcast() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: PodcastInput) => {
      const token = await getToken();
      const res = await fetch('/api/podcasts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create podcast');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['/api/podcasts'] }),
  });
}

function useUpdatePodcast() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: PodcastInput }) => {
      const token = await getToken();
      const res = await fetch(`/api/podcasts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update podcast');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['/api/podcasts'] }),
  });
}

function useDeletePodcast() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const token = await getToken();
      const res = await fetch(`/api/podcasts/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to delete podcast');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['/api/podcasts'] }),
  });
}

const isLeadershipMember = (m: TeamMember) => {
  if (m.category === 'leadership') return true;
  if (m.category === 'team') return false;
  const name = (m.name || '').toLowerCase();
  const pos = (m.position || '').toLowerCase();
  return (
    name.includes('randa') ||
    name.includes('esraa') ||
    name.includes('tamim') ||
    name.includes('khaled') ||
    pos.includes('managing director') ||
    pos.includes('founder')
  );
};

const defaultLeaders: TeamMember[] = [
  {
    id: 10,
    name: 'Dr. Randa Elbanna',
    position: 'Founder & Managing Director',
    bio: "Dr. Randa Elbanna brings an operator's eye and a strategist's curiosity to every room. Her work is grounded in one belief: progress becomes possible when people can see the path clearly.",
    imageUrl: null,
    displayOrder: 1,
    category: 'leadership',
    department: 'Executive & Strategy',
    linkedinUrl: 'https://linkedin.com',
    email: 'randa@spark-hub.online',
  },
  {
    id: 11,
    name: 'Dr. Esraa Al-Sharif',
    position: 'Executive Director & HR',
    bio: 'Responsible for organizational architecture, talent development, and cultivating high-performance cultures across scaling companies.',
    imageUrl: null,
    displayOrder: 2,
    category: 'leadership',
    department: 'People & Talent Development',
    linkedinUrl: 'https://linkedin.com',
    email: 'esraa@spark-hub.online',
  },
  {
    id: 12,
    name: 'Khaled Tamim',
    position: 'Co-Founder & Business Development',
    bio: 'Leads growth strategy, strategic partnerships, and commercial pipeline development across regional and international markets.',
    imageUrl: '/khaled_tamim.png',
    displayOrder: 3,
    category: 'leadership',
    department: 'Commercial & Growth Strategy',
    linkedinUrl: 'https://linkedin.com',
    email: 'khaled@spark-hub.online',
  },
];

const defaultStudioTeams: TeamMember[] = [
  {
    id: 17,
    name: 'Sales & Commercial Strategy',
    position: 'Commercial Directors & Pipeline Strategists',
    department: 'Sales & Commercial',
    category: 'team',
    bio: 'Designing high-converting sales funnels, SPIN negotiation frameworks, and commercial pipeline strategies for B2B and consumer brands.',
    imageUrl: '/media/spark-main-banner.png',
    displayOrder: 1,
  },
  {
    id: 18,
    name: 'Performance Media Buying',
    position: 'Senior Media Buyers & Growth Marketers',
    department: 'Marketing & Ads',
    category: 'team',
    bio: 'Managing multi-channel ad spend across Meta, TikTok, Google, and Snapchat with rigorous conversion tracking and creative testing.',
    imageUrl: '/media/spark-cover.png',
    displayOrder: 2,
  },
  {
    id: 19,
    name: 'Cinematography & Video Production',
    position: 'Directors, Editors & Colorists',
    department: 'Video Production',
    category: 'team',
    bio: 'Full-cycle production for podcasts, commercial reels, and brand films with broadcast-grade camera rigs and sound engineering.',
    imageUrl: '/media/spark-reels.png',
    displayOrder: 3,
  },
  {
    id: 20,
    name: 'Brand Design & Visual Identity',
    position: 'Art Directors & Graphic Designers',
    department: 'Design & Identity',
    category: 'team',
    bio: 'Crafting distinct visual language, campaign assets, social media packaging, and editorial layouts built for modern brands.',
    imageUrl: '/media/spark-brand-poster.png',
    displayOrder: 4,
  },
  {
    id: 21,
    name: 'Creative Copywriting & Content',
    position: 'Content Strategists & Copywriters',
    department: 'Content & Copywriting',
    category: 'team',
    bio: 'Writing viral hooks, podcast conversation narratives, and direct-response sales copy that captures attention and drives conversions.',
    imageUrl: '/media/spark-campaign-grid.png',
    displayOrder: 5,
  },
];

function About() {
  const { t, locale, localizePath } = useLanguage();
  const overview = useGetOverview();
  const o = overview.data;

  useSEO({
    title:
      locale === 'ar'
        ? 'عن استوديو سبارك هب — الرؤية والمنهجية والقيادة المؤسسية'
        : 'About Spark Hub Studio — Strategic Vision, Methods & Leadership',
    description:
      locale === 'ar'
        ? 'سبارك هب ستوديو: شريك نمو متعدد التخصصات للمؤسسات الطموحة. نجمع الاستراتيجية والتسويق والإبداع في مسار واضح نحو النمو المستدام.'
        : 'Spark Hub Studio is a multidisciplinary growth partner for ambitious organizations. We connect strategy, marketing, operations, and creative direction into one clear path forward.',
    ogType: 'profile',
  });

  const team = useListTeam();
  const rawMembers = team.data || [];
  const leaderList = rawMembers.filter(isLeadershipMember);
  const leaders = leaderList.length > 0 ? leaderList : defaultLeaders;

  return (
    <Shell>
      <PageFrame>
        <SEOBreadcrumbs
          items={[
            { label: locale === 'ar' ? 'الرئيسية' : 'Home', href: '/' },
            { label: locale === 'ar' ? 'عن الاستوديو' : 'About', href: '/about' },
          ]}
        />

        <SectionHead
          kicker={t('about.kicker', 'The studio')}
          title={t('about.title', 'Human judgment, made useful.')}
          intro={t('about.intro', 'Spark Hub is a multidisciplinary growth partner for organizations doing work that matters. We join the dots between the plan, the people and the public expression.')}
          typingIntro
        />

        <div className="grid gap-6 md:grid-cols-[1.2fr_.8fr]">
          <div className="art-panel flex min-h-[460px] items-end p-8 md:p-12">
            <p className="relative z-10 max-w-xl display text-3xl sm:text-4xl leading-tight md:text-5xl">
              "
              {locale === 'ar'
                ? t('hero.vision')
                : (o?.vision || t('hero.vision'))}
              "
            </p>
          </div>

          <div className="flex flex-col justify-between border border-border p-7 md:p-10">
            <div>
              <p className="eyebrow text-primary">
                {t('about.north_star', 'Our north star')}
              </p>

              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                {locale === 'ar'
                  ? t('hero.mission')
                  : (o?.mission || t('hero.mission'))}
              </p>
            </div>

            <div className="mt-12 border-t border-border pt-7">
              <p className="eyebrow text-primary">
                {t('about.based_in', 'Based in')}
              </p>

              <p className="mt-3 display text-3xl">
                {t('about.location', 'Egypt / Everywhere')}
              </p>
            </div>
          </div>
        </div>

        {/* Leadership & Founders Section */}
        <div className="mt-28">
          <div className="mb-10">
            <p className="eyebrow text-primary">
              {t('about.leadership_kicker', 'Leadership & Partners')}
            </p>
            <h2 className="display text-3xl sm:text-4xl mt-2 text-foreground">
              {t('about.leadership_title', 'Vision, strategy & governance.')}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-2 max-w-xl">
              {t('about.leadership_intro', 'The senior directors, partners, and advisors shaping business trajectory, talent development, and high-stakes decisions for our clients.')}
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {leaders.map((member) => (
              <div key={member.id} className="gold-glow-card group flex flex-col justify-between border border-border/60 bg-card/40 p-6 rounded-xl transition-all duration-500 hover:bg-card/70">
                <div>
                  <div className="art-panel relative aspect-[4/5] overflow-hidden rounded-lg bg-muted border border-border/40">
                    {member.imageUrl ? (
                      <img
                        src={member.imageUrl}
                        alt={member.name}
                        className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
                        loading='lazy'
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center bg-gradient-to-br from-primary/15 via-background to-muted">
                        <span className="font-serif text-5xl text-primary font-bold">
                          {member.name
                            .split(' ')
                            .map((name) => name[0])
                            .slice(0, 2)
                            .join('')}
                        </span>
                      </div>
                    )}

                    {typeof member.displayOrder === 'number' && member.displayOrder > 0 && (
                      <span className="absolute top-3 left-3 rounded bg-background/80 px-2 py-0.5 mono text-[10px] text-primary backdrop-blur-sm border border-primary/20">
                        #{member.displayOrder}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-5 font-arabic font-bold text-xl sm:text-2xl text-foreground group-hover:text-primary transition-colors" dir="auto">
                    {member.name}
                  </h3>

                  {member.position && (
                    <p className="mt-1 font-sans text-xs font-semibold text-primary tracking-wide">
                      {member.position}
                    </p>
                  )}

                  {member.bio && (
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground font-sans" dir="auto">
                      {member.bio}
                    </p>
                  )}
                </div>

                {(member.linkedinUrl || member.email) && (
                  <div className="mt-6 flex items-center gap-3 border-t border-border/40 pt-4">
                    {member.linkedinUrl && (
                      <a
                        href={member.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition font-medium"
                      >
                        <ExternalLink size={12} />
                        LinkedIn
                      </a>
                    )}
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition font-medium"
                      >
                        <Mail size={12} />
                        Email
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Link to Dedicated Team Page */}
          <div className="mt-20 border border-primary/40 bg-card/60 p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
            <div>
              <p className="eyebrow text-primary text-xs">
                {locale === 'ar' ? 'فريق العمل والكوادر التنفيذية' : 'Studio Squad & Execution Crew'}
              </p>
              <h3 className="display text-2xl mt-1 text-foreground">
                {locale === 'ar' ? 'تعرف على فرق العمل المتخصصة' : 'Meet Our Specialized Execution Teams'}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                {locale === 'ar' ? 'استكشف فرقنا المتخصصة في الاستراتيجية، الحملات الإعلانية، الإنتاج السينمائي، وتصميم الهوية.' : 'Explore our dedicated teams across Sales Strategy, Media Buying, Video Production, Brand Design, and Content Creation.'}
              </p>
            </div>
            <Link
              href={localizePath('/team')}
              className="inline-flex items-center gap-2 border border-primary bg-primary px-6 py-3 text-xs font-bold uppercase tracking-[.14em] rtl:tracking-normal text-primary-foreground transition hover:bg-transparent hover:text-primary whitespace-nowrap"
            >
              {locale === 'ar' ? 'تعرف على الفريق بالكامل' : 'Meet The Full Team'}
              <MoveRight size={14} className="rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </PageFrame>
    </Shell>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Team (Dedicated)                              */
/* -------------------------------------------------------------------------- */

function Team() {
  const { t, locale, localizePath } = useLanguage();
  const team = useListTeam();
  const [selectedDept, setSelectedDept] = useState<string>('all');

  useSEO({
    title:
      locale === 'ar'
        ? 'فريق العمل والكوادر التنفيذية — سبارك هب ستوديو'
        : 'Meet The Team & Specialized Squads — Spark Hub Studio',
    description:
      locale === 'ar'
        ? 'تعرف على كوادر وفريق سبارك هب ستوديو المتخصصين في المبيعات الاستشارية، الحملات الإعلانية الممولة، والإنتاج السينمائي وتصميم الهوية.'
        : 'Meet the specialized teams behind Spark Hub Studio driving commercial sales, scaling performance marketing, producing cinema-grade media, and orchestrating operations.',
    ogType: 'profile',
  });

  const rawMembers = team.data || [];
  // Studio members (those strictly not in leadership)
  const allStudioList = rawMembers.filter((m) => !isLeadershipMember(m));

  // Extract unique departments
  const departments = Array.from(
    new Set(
      allStudioList
        .map((m) => m.department)
        .filter((d): d is string => Boolean(d && d.trim())),
    ),
  );

  const filteredMembers =
    selectedDept === 'all'
      ? allStudioList
      : allStudioList.filter((m) => m.department === selectedDept);

  return (
    <Shell>
      <PageFrame>
        <SEOBreadcrumbs
          items={[
            { label: locale === 'ar' ? 'الرئيسية' : 'Home', href: '/' },
            { label: locale === 'ar' ? 'فريق العمل' : 'Team', href: '/team' },
          ]}
        />

        <SectionHead
          kicker={t('team.kicker', 'The Collective')}
          title={t('team.title', 'Meet The Team.')}
          intro={t('team.intro', 'The specialized talent driving commercial sales, scaling performance marketing, producing cinema-grade media, and orchestrating operations with precision.')}
          typingIntro
        />

        {/* Department Filter Pills */}
        {departments.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedDept('all')}
              className={`rounded-full px-4 py-1.5 text-xs mono tracking-wider transition ${
                selectedDept === 'all'
                  ? 'border border-primary bg-primary text-primary-foreground font-semibold'
                  : 'border border-border bg-card/60 text-muted-foreground hover:border-primary/50 hover:text-foreground'
              }`}
            >
              {t('team.all_teams', 'ALL TEAMS')} ({allStudioList.length})
            </button>
            {departments.map((dept) => {
              const count = allStudioList.filter((m) => m.department === dept).length;
              return (
                <button
                  key={dept}
                  type="button"
                  onClick={() => setSelectedDept(dept)}
                  className={`rounded-full px-4 py-1.5 text-xs mono tracking-wider transition ${
                    selectedDept === dept
                      ? 'border border-primary bg-primary text-primary-foreground font-semibold'
                      : 'border border-border bg-card/60 text-muted-foreground hover:border-primary/50 hover:text-foreground'
                  }`}
                >
                  {dept} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Members Grid or Empty State */}
        {filteredMembers.length > 0 ? (
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="gold-glow-card group flex flex-col justify-between rounded-xl border border-border/60 bg-card/40 p-5 transition-all duration-500 hover:bg-card/70"
              >
                <div>
                  <div className="art-panel relative aspect-[4/5] overflow-hidden rounded-lg bg-muted border border-border/40">
                    {member.imageUrl ? (
                      <img
                        src={member.imageUrl}
                        alt={member.name}
                        className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center bg-gradient-to-br from-primary/15 via-background to-muted">
                        <span className="font-serif text-4xl font-bold text-primary">
                          {member.name
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')}
                        </span>
                      </div>
                    )}

                    {typeof member.displayOrder === 'number' && member.displayOrder > 0 && (
                      <span className="absolute top-3 left-3 rounded bg-background/80 px-2 py-0.5 mono text-[10px] text-primary backdrop-blur-sm border border-primary/20">
                        #{member.displayOrder}
                      </span>
                    )}

                    {member.department && (
                      <span className="absolute bottom-3 left-3 right-3 rounded bg-background/90 px-2 py-1 mono text-[10px] text-primary text-center backdrop-blur-sm border border-border/60 truncate">
                        {member.department}
                      </span>
                    )}
                  </div>

                  <h3
                    className="mt-4 font-arabic text-lg font-bold text-foreground transition-colors group-hover:text-primary"
                    dir="auto"
                  >
                    {member.name}
                  </h3>

                  {member.position && (
                    <p className="mt-1 font-sans text-xs font-semibold text-primary tracking-wide">
                      {member.position}
                    </p>
                  )}

                  {member.bio && (
                    <p
                      className="mt-2.5 font-sans text-xs leading-relaxed text-muted-foreground"
                      dir="auto"
                    >
                      {member.bio}
                    </p>
                  )}
                </div>

                {(member.linkedinUrl || member.email) && (
                  <div className="mt-5 flex items-center gap-3 border-t border-border/40 pt-3">
                    {member.linkedinUrl && (
                      <a
                        href={member.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-[11px] text-muted-foreground transition hover:text-primary"
                      >
                        <ExternalLink size={11} />
                        LinkedIn
                      </a>
                    )}
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="inline-flex items-center gap-1 font-medium text-[11px] text-muted-foreground transition hover:text-primary"
                      >
                        <Mail size={11} />
                        Email
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-16 border border-border/50 bg-card/30 p-12 text-center rounded-xl">
            <p className="mono text-xs text-primary uppercase tracking-widest">{t('team.empty_kicker', 'Studio Squads')}</p>
            <p className="text-muted-foreground mt-2 text-sm">{t('team.empty_desc', 'No studio team members added yet. Add your specialized sales, marketing, and media teams from the admin dashboard.')}</p>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-24 border border-border/60 bg-card/40 p-8 md:p-12 text-center rounded-2xl">
          <p className="eyebrow text-primary text-xs">{t('team.cta_kicker', 'Collaboration & Execution')}</p>
          <h2 className="display text-3xl sm:text-4xl mt-3 text-foreground">
            {t('team.cta_title', 'Ready to deploy this team on your business?')}
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-sm sm:text-base">
            {t('team.cta_desc', 'From comprehensive media buying to full-cycle sales systems and cinematic production, we build the team around your specific objective.')}
          </p>
          <Link
            href={localizePath('/contact')}
            className="mt-8 inline-flex items-center gap-3 border border-primary bg-primary px-7 py-3.5 text-xs font-bold uppercase tracking-[.14em] text-primary-foreground transition hover:bg-transparent hover:text-primary"
          >
            {t('team.cta_button', 'Start a project with us')}
            <MoveRight size={15} className="rtl:rotate-180" />
          </Link>
        </div>
      </PageFrame>
    </Shell>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Contact                                   */
/* -------------------------------------------------------------------------- */

const arabicWorkingRanges = [
  { id: 'advisory', title: 'استشارة استراتيجية محددة', duration: '2 - 4 أسابيع' },
  { id: 'quarterly', title: 'شراكة نمو ربع سنوية', duration: '3 أشهر' },
  { id: 'transformation', title: 'تحول مؤسسي شامل', duration: '6+ أشهر' },
];

function Contact() {
  const { t, locale, localizePath, isRTL } = useLanguage();
  const mutation = useCreateContactLead();
  const [sent, setSent] = useState(false);
  const [selectedBudgetTier, setSelectedBudgetTier] = useState<string>('شراكة نمو ربع سنوية');

  useSEO({
    title:
      locale === 'ar'
        ? 'ابدأ محادثة عمل وحجز استشارة نمو — سبارك هب ستوديو'
        : 'Start a Growth Partnership Conversation — Spark Hub Studio',
    description:
      locale === 'ar'
        ? 'تواصل مع فريق سبارك هب ستوديو لمناقشة أهداف شركتك، تقييم قنوات الاستحواذ الحالية، وتصميم شراكة نمو ربع سنوية أو تحول مؤسسي شامل.'
        : 'Schedule a strategic discovery session with Spark Hub Studio. Tell us what you are trying to build or scale across Egypt and MENA.',
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mutation.isPending) return;

    const form = new FormData(event.currentTarget);

    mutation.mutate(
      {
        data: {
          name: String(form.get('name') || ''),
          email: String(form.get('email') || ''),
          message: String(form.get('message') || ''),
          budget: String(form.get('budget') || ''),
          service: String(form.get('service') || ''),
        },
      },
      {
        onSuccess: () => setSent(true),
      },
    );
  };

  return (
    <Shell>
      <PageFrame>
        <SEOBreadcrumbs
          items={[
            { label: locale === 'ar' ? 'الرئيسية' : 'Home', href: '/' },
            { label: locale === 'ar' ? 'تواصل معنا' : 'Contact', href: '/contact' },
          ]}
        />

        <div className="grid gap-16 md:grid-cols-[.8fr_1.2fr]">
          <div className="text-start">
            <p className="eyebrow text-primary">
              {t('contact.kicker', 'Start a conversation')}
            </p>

            <h1 className="display mt-7 text-5xl leading-[1.05] sm:text-6xl md:text-7xl">
              {isRTL ? (
                <>
                  <span className="heading-ar-hero block text-3xl sm:text-5xl md:text-6xl leading-[1.28]">
                    كيف يمكننا مساعدة مؤسستك على النمو؟
                  </span>
                  <span className="body-ar block mt-4 text-base sm:text-lg text-muted-foreground font-normal leading-[1.85]">
                    جاهز لتحويل <i className="text-primary not-italic">الاستراتيجية إلى نمو؟</i> — لنبدأ محادثة عمل
                  </span>
                </>
              ) : (
                <>
                  Make the next move{' '}
                  <i className="text-primary">clear.</i>
                </>
              )}
            </h1>

            <p className="mt-8 max-w-sm text-base leading-7 text-muted-foreground">
              {t('contact.intro', 'Tell us what is changing, what is stuck, or what you are ready to build.')}
            </p>

            <div className="mt-14 space-y-3 mono text-[11px] text-muted-foreground">
              <p className="flex items-center gap-3">
                <Mail
                  size={14}
                  className="text-primary shrink-0"
                />
                hello@spark-hub.online
              </p>

              <p className="flex items-center gap-3">
                <Instagram
                  size={14}
                  className="text-primary shrink-0"
                />
                @sparkstudioo1
              </p>
            </div>
          </div>

          <div className="border border-border bg-card p-6 md:p-10">
            {sent ? (
              <div className="flex min-h-96 flex-col justify-center text-start">
                <Check
                  className="text-primary"
                  size={28}
                />

                <h2 className="display mt-6 text-4xl">
                  {t('contact.success_title', 'Message received.')}
                </h2>

                <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">
                  {t('contact.success_desc', 'We will be in touch shortly. In the meantime, explore what we have been making.')}
                </p>

                <Link
                  href={localizePath('/services')}
                  className="mt-8 eyebrow text-primary inline-flex items-center gap-2"
                  data-testid="link-contact-success-services"
                >
                  {t('contact.success_action', 'Explore our services →')}
                </Link>
              </div>
            ) : (
              <form
                onSubmit={submit}
                className="space-y-7 text-start"
              >
                <Field
                  name="name"
                  label={t('contact.name_label', 'Your name')}
                  placeholder={t('contact.name_placeholder', 'Name')}
                />

                <Field
                  name="email"
                  label={t('contact.email_label', 'Email address')}
                  placeholder={t('contact.email_placeholder', 'you@company.com')}
                  type="email"
                />

                <div className="grid gap-7 sm:grid-cols-2">
                  <Field
                    name="service"
                    label={t('contact.service_label', 'What can we help with?')}
                    placeholder={t('contact.service_placeholder', 'Strategy, marketing, systems...')}
                  />

                  {isRTL ? (
                    <div>
                      <span className="eyebrow block text-muted-foreground mb-2">
                        {t('contact.budget_label', 'Working range')}
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {arabicWorkingRanges.map((tier) => (
                          <button
                            key={tier.id}
                            type="button"
                            onClick={() => setSelectedBudgetTier(tier.title)}
                            className={`p-2.5 rounded-sm border text-right transition-all cursor-pointer ${
                              selectedBudgetTier === tier.title
                                ? 'border-primary bg-primary/10 text-primary font-bold'
                                : 'border-border bg-transparent text-muted-foreground hover:border-primary/50 text-xs'
                            }`}
                          >
                            <span className="block text-[11px] leading-tight font-sans">
                              {tier.title}
                            </span>
                            <span className="block text-[9px] opacity-75 mt-1 font-mono">
                              {tier.duration}
                            </span>
                          </button>
                        ))}
                      </div>
                      <input type="hidden" name="budget" value={selectedBudgetTier} />
                    </div>
                  ) : (
                    <Field
                      name="budget"
                      label={t('contact.budget_label', 'Working range')}
                      placeholder={t('contact.budget_placeholder', 'A useful guide, not a commitment')}
                    />
                  )}
                </div>

                <label className="block text-start">
                  <span className="eyebrow text-muted-foreground">
                    {t('contact.brief_label', 'The brief')}
                  </span>

                  <textarea
                    name="message"
                    required
                    rows={5}
                    placeholder={t('contact.brief_placeholder', 'What are you trying to make possible?')}
                    className="mt-3 w-full resize-none border-0 border-b border-border bg-transparent px-0 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary"
                    data-testid="textarea-contact-message"
                  />
                </label>

                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="inline-flex items-center gap-3 bg-primary px-5 py-3 text-xs font-bold uppercase tracking-[.15em] text-primary-foreground hover:bg-primary/85 disabled:opacity-60 cursor-pointer"
                  data-testid="button-submit-contact"
                >
                  {mutation.isPending ? (
                    <Loader2
                      className="animate-spin"
                      size={15}
                    />
                  ) : (
                    <Send size={15} className="rtl:rotate-180" />
                  )}

                  {mutation.isPending
                    ? t('contact.submitting', 'Sending...')
                    : (isRTL ? `${t('contact.submit', 'إرسال متطلبات المشروع')} ←` : `${t('contact.submit', 'Send brief')} →`)}
                </button>

                {mutation.error && (
                  <p className="text-xs text-destructive">
                    {t('contact.error', 'Something went wrong. Please try again.')}
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </PageFrame>
    </Shell>
  );
}

function Field({
  name,
  label,
  placeholder,
  type = 'text',
}: {
  name: string;
  label: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="block text-start">
      <span className="eyebrow text-muted-foreground">
        {label}
      </span>

      <input
        required
        name={name}
        type={type}
        dir={type === 'email' ? 'ltr' : undefined}
        placeholder={placeholder}
        className={`mt-3 w-full border-0 border-b border-border bg-transparent px-0 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary ${type === 'email' ? 'text-start' : ''}`}
        data-testid={`input-contact-${name}`}
      />
    </label>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    Blog                                    */
/* -------------------------------------------------------------------------- */

function Blog() {
  const { t, localizePath, locale } = useLanguage();
  const query = useListBlogPosts();

  useSEO({
    title:
      locale === 'ar'
        ? 'مدونة الرؤى والأفكار الاستراتيجية — سبارك هب ستوديو'
        : 'Strategic Notes, Field Insights & Growth Ideas — Spark Hub Studio',
    description:
      locale === 'ar'
        ? 'مقالات ورؤى استراتيجية معمقة في التسويق الرقمي، تحسين محركات البحث، بناء العلامات التجارية، وتطوير المنظومات المؤسسية في مصر والشرق الأوسط.'
        : 'Sharp observations, actionable frameworks, and strategic notes from the intersection of brand strategy, culture, performance marketing, and execution.',
  });

  return (
    <Shell>
      <PageFrame>
        <SEOBreadcrumbs
          items={[
            { label: locale === 'ar' ? 'الرئيسية' : 'Home', href: '/' },
            { label: locale === 'ar' ? 'الرؤى والأفكار' : 'Notes', href: '/blog' },
          ]}
        />

        <SectionHead
          kicker={t('blog.kicker', 'Notes / ideas in progress')}
          title={t('blog.title', 'A sharper way to look at the work.')}
          intro={t('blog.intro', 'Observations from the intersection of strategy, culture, marketing and making.')}
        />

        <QueryState
          loading={query.isLoading}
          error={!!query.error}
          empty={
            !query.isLoading &&
            !query.error &&
            !query.data?.length
          }
        >
          <div className="grid gap-x-8 gap-y-14 md:grid-cols-2">
            {(query.data || []).map((post) => (
              <Link
                href={localizePath(`/blog/${post.slug}`)}
                key={post.id}
                className="group text-start"
                data-testid={`card-blog-${post.id}`}
              >
                <div className="art-panel aspect-[1.7] relative">
                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt={post.imageAlt || post.title}
                      className="h-full w-full object-cover opacity-75 transition duration-500 group-hover:scale-105 group-hover:opacity-95"
                      loading='lazy'
                    />
                  )}

                  <span className="absolute bottom-5 start-5 eyebrow text-primary">
                    {post.category}
                  </span>
                </div>

                <div className="mt-5 flex items-start justify-between gap-5">
                  <div className="text-start">
                    <p className="mono text-[10px] text-muted-foreground">
                      {new Date(
                        post.publishedAt,
                      ).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>

                    <h2 className="mt-2 text-base sm:text-lg md:text-xl font-bold leading-snug transition-colors group-hover:text-primary">
                      {post.title}
                    </h2>

                    <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground line-clamp-2">
                      {post.excerpt}
                    </p>
                  </div>

                  <ArrowUpRight
                    size={17}
                    className="mt-1 shrink-0 text-primary rtl:-rotate-90"
                  />
                </div>
              </Link>
            ))}
          </div>
        </QueryState>
      </PageFrame>
    </Shell>
  );
}

interface FaqItem {
  question: string;
  answer: string;
}

function parseFaqFromContent(body: string): { mainBody: string; faqs: FaqItem[]; sourcesBody: string } {
  const faqHeadingRegex = /##\s*(?:الأسئلة الشائعة|الأسئلة المتكررة|FAQ|Frequently Asked Questions)/i;
  const sourcesHeadingRegex = /##\s*(?:المصادر|المراجع|Sources|References)/i;

  const faqMatch = body.match(faqHeadingRegex);
  if (!faqMatch || faqMatch.index === undefined) {
    return { mainBody: body, faqs: [], sourcesBody: '' };
  }

  const mainBody = body.slice(0, faqMatch.index).trim();
  const rest = body.slice(faqMatch.index + faqMatch[0].length);

  const sourcesMatch = rest.match(sourcesHeadingRegex);
  const faqRaw = sourcesMatch && sourcesMatch.index !== undefined ? rest.slice(0, sourcesMatch.index) : rest;
  const sourcesBody = sourcesMatch && sourcesMatch.index !== undefined ? rest.slice(sourcesMatch.index).trim() : '';

  const faqs: FaqItem[] = [];

  const lines = faqRaw.split('\n');
  let currentQ = '';
  let currentA: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed === '---') continue;

    const qMatch = trimmed.match(/^(?:###\s*|\*\*)(.+?)(?:\*\*|$)/);
    const isQ =
      trimmed.startsWith('###') ||
      (trimmed.startsWith('**') && (trimmed.endsWith('**') || trimmed.includes('؟') || trimmed.includes('?')));

    if (qMatch && isQ) {
      if (currentQ && currentA.length > 0) {
        faqs.push({ question: currentQ, answer: currentA.join(' ').trim() });
        currentA = [];
      }
      currentQ = qMatch[1].replace(/^\d+[\.\-]\s*/, '').replace(/\*\*$/, '').trim();
    } else if (currentQ) {
      currentA.push(trimmed.replace(/^\*\*/, '').replace(/\*\*$/, ''));
    }
  }

  if (currentQ && currentA.length > 0) {
    faqs.push({ question: currentQ, answer: currentA.join(' ').trim() });
  }

  return { mainBody, faqs, sourcesBody };
}

function BlogFaqAccordion({ faqs, locale }: { faqs: FaqItem[]; locale: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!faqs || faqs.length === 0) return null;

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };

  return (
    <section className="mt-14 pt-10 border-t border-border/80 text-start" aria-label="Frequently Asked Questions">
      {/* Google FAQ Schema Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <div className="flex items-center gap-2 text-primary font-mono text-xs tracking-wider uppercase mb-3">
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
        <span>{locale === 'ar' ? 'الأسئلة الشائعة' : 'FAQ & Knowledge'}</span>
      </div>

      <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-6">
        {locale === 'ar' ? 'الأسئلة الشائعة وإجاباتها' : 'Frequently Asked Questions'}
      </h2>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'border-primary/50 bg-card/90 shadow-[0_4px_24px_rgba(233,190,88,0.08)]'
                  : 'border-border/60 bg-card/40 hover:border-border hover:bg-card/70'
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full flex items-center justify-between gap-4 p-5 text-start font-bold text-base sm:text-lg text-foreground transition-colors hover:text-primary"
                aria-expanded={isOpen}
              >
                <span>{faq.question}</span>
                <ChevronDown
                  size={18}
                  className={`shrink-0 text-primary transition-transform duration-300 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-2 text-sm sm:text-base leading-relaxed text-muted-foreground border-t border-border/40 animate-fade">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function BlogDetail() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { t, localizePath, locale } = useLanguage();
  const query = useGetBlogPost(slug);
  const post = query.data;

  useSEO({
    title: post
      ? `${post.title} — Spark Hub Studio`
      : 'Field Note — Spark Hub Studio',
    description:
      post?.excerpt ||
      (locale === 'ar'
        ? 'ملاحظات وتحليلات استراتيجية من سبارك هب ستوديو في التسويق وبناء العلامات التجارية.'
        : 'Strategic observations and tactical analysis on growth, marketing, and brand building from Spark Hub Studio.'),
    canonical: post ? `/blog/${post.slug}` : undefined,
    ogType: 'article',
    ogImage: post?.imageUrl || undefined,
    ogImageAlt: post?.imageAlt || post?.title,
    publishedTime: post?.publishedAt,
    articleSection: post?.category,
    schema: post
      ? {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.title,
          description: post.excerpt,
          image: post.imageUrl ? [post.imageUrl] : undefined,
          datePublished: post.publishedAt,
          articleSection: post.category,
          author: {
            '@type': 'Organization',
            name: 'Spark Hub Studio',
            url: 'https://spark-hub.online',
          },
          publisher: {
            '@type': 'Organization',
            name: 'Spark Hub Studio',
            logo: {
              '@type': 'ImageObject',
              url: 'https://spark-hub.online/logo.png',
            },
          },
        }
      : undefined,
  });

  const parsedContent = post ? parseFaqFromContent(post.body) : null;

  return (
    <Shell>
      <PageFrame>
        <SEOBreadcrumbs
          items={[
            { label: locale === 'ar' ? 'الرئيسية' : 'Home', href: '/' },
            { label: locale === 'ar' ? 'الرؤى والأفكار' : 'Notes', href: '/blog' },
            { label: post?.title || slug, href: `/blog/${slug}` },
          ]}
        />

        <Link
          href={localizePath('/blog')}
          className="eyebrow text-primary inline-flex items-center gap-2 mb-8"
          data-testid="link-back-blog"
        >
          {t('blog.back', '← Back to field notes')}
        </Link>

        <QueryState
          loading={query.isLoading}
          error={!!query.error}
          empty={
            !query.isLoading &&
            !query.error &&
            !post
          }
          label="note"
        >
          {post && parsedContent && (
            <article className="mx-auto mt-8 max-w-4xl text-start">
              <p className="eyebrow text-primary">
                {post.category} /{' '}
                {new Date(
                  post.publishedAt,
                ).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>

              <h1 className="mt-5 text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-extrabold leading-snug sm:leading-tight text-foreground max-w-3xl">
                {post.title}
              </h1>

              <p className="mt-5 text-base sm:text-lg md:text-xl leading-relaxed text-muted-foreground max-w-3xl">
                {post.excerpt}
              </p>

              {post.imageUrl && (
                <div className="mt-10 overflow-hidden rounded-2xl border border-border/60 bg-card">
                  <img
                    src={post.imageUrl}
                    alt={post.imageAlt || post.title}
                    className="max-h-[480px] w-full object-cover"
                    loading='lazy'
                  />
                </div>
              )}

              <div className="prose prose-invert prose-headings:font-bold prose-headings:text-foreground prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4 prose-h3:text-xl sm:prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3 prose-p:text-muted-foreground prose-p:leading-8 prose-p:text-base sm:prose-p:text-[17px] prose-strong:text-foreground prose-strong:font-bold prose-li:text-muted-foreground prose-li:leading-8 prose-li:text-base sm:prose-li:text-[17px] prose-ul:my-4 prose-ol:my-4 prose-blockquote:border-s-4 prose-blockquote:border-primary prose-blockquote:bg-card prose-blockquote:rounded-md prose-blockquote:px-5 prose-blockquote:py-3.5 prose-blockquote:my-6 prose-blockquote:text-muted-foreground prose-blockquote:not-italic prose-blockquote:text-base sm:prose-blockquote:text-[17px] prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-hr:border-border prose-table:text-sm sm:prose-table:text-base prose-th:text-foreground prose-td:text-muted-foreground mt-12 max-w-3xl">
                <ReactMarkdown>
                  {parsedContent.mainBody}
                </ReactMarkdown>
              </div>

              {parsedContent.faqs.length > 0 && (
                <div className="max-w-3xl">
                  <BlogFaqAccordion faqs={parsedContent.faqs} locale={locale} />
                </div>
              )}

              {parsedContent.sourcesBody && (
                <div className="prose prose-invert prose-headings:font-bold prose-headings:text-foreground prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-p:text-muted-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline mt-12 max-w-3xl">
                  <ReactMarkdown>
                    {parsedContent.sourcesBody}
                  </ReactMarkdown>
                </div>
              )}

              {/* Contextual Internal Linking */}
              <RelatedBlogPosts currentSlug={slug} category={post.category} />
            </article>
          )}
        </QueryState>
      </PageFrame>
    </Shell>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Admin / Auth                                  */
/* -------------------------------------------------------------------------- */

function AdminSignIn() {
  return (
    <div className="min-h-[100dvh] bg-background p-5 md:p-10">
      <div className="mx-auto flex min-h-[calc(100dvh-40px)] max-w-[540px] flex-col items-center justify-center">
        <p className="eyebrow mb-8 text-primary">
          Spark Hub / content desk
        </p>

        <SignIn routing="hash" />
      </div>
    </div>
  );
}

type AdminKind =
  | 'services'
  | 'work'
  | 'reels'
  | 'podcasts'
  | 'posts'
  | 'team'
  | 'blog'
  | 'logos'
  | 'messages';

function AdminField({
  name,
  label,
  placeholder,
  defaultValue = '',
  required = true,
  type = 'text',
}: {
  name: string;
  label: string;
  placeholder: string;
  defaultValue?: string | number;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="eyebrow text-muted-foreground">
        {label}
      </span>

      <input
        required={required}
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="mt-2 w-full border-b border-border bg-transparent px-0 py-3 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}

function AdminWorkspace() {
  const { localizePath } = useLanguage();
  const [tab, setTab] =
    useState<AdminKind>('services');

  const [editing, setEditing] =
    useState<any>(null);

  const [showForm, setShowForm] =
    useState(false);

  const queryClient = useQueryClient();

  const services = useListServices();
  const caseStudies = useListCaseStudies();
  const reels = useListReels();
  const podcasts = useListPodcasts();
  const posts = useListPosts();
  const team = useListTeam();
  const blog = useListBlogPosts();
  const logos = useListClientLogos();
  const messages = useListMessages();
  const deleteMessage = useDeleteMessage();
  const createTeamMember = useCreateTeamMember();
  const updateTeamMember = useUpdateTeamMember();
  const deleteTeamMember = useDeleteTeamMember();
  const createBlogPost = useCreateBlogPost();
  const updateBlogPost = useUpdateBlogPost();
  const deleteBlogPost = useDeleteBlogPost();
  const createClientLogo = useCreateClientLogo();
  const updateClientLogo = useUpdateClientLogo();
  const deleteClientLogo = useDeleteClientLogo();

  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();

  const createCaseStudy = useCreateCaseStudy();
  const updateCaseStudy = useUpdateCaseStudy();
  const deleteCaseStudy = useDeleteCaseStudy();

  const createReel = useCreateReel();
  const updateReel = useUpdateReel();
  const deleteReel = useDeleteReel();

  const createPodcast = useCreatePodcast();
  const updatePodcast = useUpdatePodcast();
  const deletePodcast = useDeletePodcast();

  const createPost = useCreatePost();
  const updatePost = useUpdatePost();
  const deletePost = useDeletePost();

  const tabs: Array<
    [AdminKind, string, LucideIcon]
  > = [
    ['services', 'Services', Settings2],
    ['work', 'Case studies', Grid2X2],
    ['reels', 'Reels', Film],
    ['podcasts', 'Podcasts', Headphones],
    ['posts', 'Posts', Instagram],
    ['team', 'Team', Users],
    ['blog', 'Blog', FileText],
    ['logos', 'Client logos', Image],
    ['messages', 'Messages', Mail],
  ];

  const config = {
    services: {
      label: 'Services',
      query: services,
      rows: services.data || [],
      emptyLabel: 'services',
    },
    work: {
      label: 'Case studies',
      query: caseStudies,
      rows: caseStudies.data || [],
      emptyLabel: 'case studies',
    },
    reels: {
      label: 'Reels',
      query: reels,
      rows: reels.data || [],
      emptyLabel: 'reels',
    },
    podcasts: {
      label: 'Podcasts',
      query: podcasts,
      rows: podcasts.data || [],
      emptyLabel: 'podcasts',
    },
    posts: {
      label: 'Posts',
      query: posts,
      rows: posts.data || [],
      emptyLabel: 'posts',
    },
    team: {
      label: 'Team',
      query: team,
      rows: team.data || [],
      emptyLabel: 'team',
    },
    blog: {
      label: 'Blog',
      query: blog,
      rows: blog.data || [],
      emptyLabel: 'posts',
    },
    logos: {
      label: 'Client logos',
      query: logos,
      rows: logos.data || [],
      emptyLabel: 'logos',
    },
    messages: {
      label: 'Messages',
      query: messages,
      rows: messages.data || [],
      emptyLabel: 'messages',
    },
  }[tab];

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  const done = () => {
    queryClient.invalidateQueries();
    closeForm();
  };

  const save = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const number = (name: string) => {
      const value = Number(form.get(name) || 0);

      return Number.isFinite(value)
        ? value
        : 0;
    };

    if (tab === 'services') {
      const data = {
        title: String(
          form.get('title') || '',
        ),
        category: String(
          form.get('category') || '',
        ) as ServiceInputCategory,
        summary: String(
          form.get('summary') || '',
        ),
        details: String(
          form.get('details') || '',
        )
          .split('\n')
          .map((value) => value.trim())
          .filter(Boolean),
        displayOrder: number(
          'displayOrder',
        ),
      };

      if (editing) {
        updateService.mutate(
          {
            id: editing.id,
            data,
          },
          {
            onSuccess: done,
          },
        );
      } else {
        createService.mutate(
          { data },
          {
            onSuccess: done,
          },
        );
      }

      return;
    }

    if (tab === 'work') {
      const data = {
        slug: String(
          form.get('slug') || '',
        ),
        title: String(
          form.get('title') || '',
        ),
        client: String(
          form.get('client') || '',
        ),
        category: String(
          form.get('category') || '',
        ),
        summary: String(
          form.get('summary') || '',
        ),
        problem: String(
          form.get('problem') || '',
        ),
        solution: String(
          form.get('solution') || '',
        ),
        result: String(
          form.get('result') || '',
        ),
        metric: String(
          form.get('metric') || '',
        ),
        imageUrl: String(
          form.get('imageUrl') || '',
        ),
        imageAlt: String(
          form.get('imageAlt') || '',
        ),
        displayOrder: number(
          'displayOrder',
        ),
      };

      if (editing) {
        updateCaseStudy.mutate(
          {
            id: editing.id,
            data,
          },
          {
            onSuccess: done,
          },
        );
      } else {
        createCaseStudy.mutate(
          { data },
          {
            onSuccess: done,
          },
        );
      }

      return;
    }

    if (tab === 'reels') {
      const rawThumb = String(form.get('thumbnailUrl') || '');
      const videoUrl = String(form.get('videoUrl') || '');
      const data = {
        videoUrl,
        thumbnailUrl: resolveThumbnail(rawThumb, videoUrl),
        thumbnailAlt: String(form.get('thumbnailAlt') || form.get('title') || ''),
        title: String(form.get('title') || ''),
        client: String(form.get('client') || ''),
        category: String(form.get('category') || ''),
        displayOrder: number('displayOrder'),
      };

      if (editing) {
        updateReel.mutate(
          {
            id: editing.id,
            data,
          },
          {
            onSuccess: done,
          },
        );
      } else {
        createReel.mutate(
          { data },
          {
            onSuccess: done,
          },
        );
      }

      return;
    }

    if (tab === 'podcasts') {
      const rawThumb = String(form.get('thumbnailUrl') || '');
      const audioUrl = String(form.get('audioUrl') || '');
      const youtubeUrl = String(form.get('youtubeUrl') || '') || null;
      const data: PodcastInput = {
        title: String(form.get('title') || ''),
        episodeNumber: String(form.get('episodeNumber') || '') || null,
        host: String(form.get('host') || 'Spark Hub'),
        guest: String(form.get('guest') || '') || null,
        category: String(form.get('category') || ''),
        duration: String(form.get('duration') || '') || null,
        description: String(form.get('description') || '') || null,
        audioUrl,
        spotifyUrl: String(form.get('spotifyUrl') || '') || null,
        appleUrl: String(form.get('appleUrl') || '') || null,
        youtubeUrl,
        thumbnailUrl: resolveThumbnail(rawThumb, audioUrl, youtubeUrl),
        thumbnailAlt: String(form.get('thumbnailAlt') || form.get('title') || ''),
        displayOrder: number('displayOrder'),
      };

      if (editing) {
        updatePodcast.mutate(
          { id: editing.id, data },
          { onSuccess: done },
        );
      } else {
        createPodcast.mutate(data, { onSuccess: done });
      }

      return;
    }

    if (tab === 'team') {
      const data: TeamMemberInput = {
        name: String(form.get('name') || ''),
        position: String(form.get('position') || '') || null,
        bio: String(form.get('bio') || '') || null,
        imageUrl: String(form.get('imageUrl') || '') || null,
        displayOrder: Number(form.get('displayOrder') || 0),
        category: String(form.get('category') || 'team'),
        department: String(form.get('department') || '') || null,
        linkedinUrl: String(form.get('linkedinUrl') || '') || null,
        email: String(form.get('email') || '') || null,
      };

      if (editing) {
        updateTeamMember.mutate(
          { id: editing.id, data },
          { onSuccess: done },
        );
      } else {
        createTeamMember.mutate(data, { onSuccess: done });
      }

      return;
    }

    if (tab === 'blog') {
      const data: BlogPostInput = {
        slug: String(form.get('slug') || ''),
        title: String(form.get('title') || ''),
        excerpt: String(form.get('excerpt') || ''),
        body: String(form.get('body') || ''),
        category: String(form.get('category') || ''),
        publishedAt: String(form.get('publishedAt') || ''),
        imageUrl: String(form.get('imageUrl') || ''),
        imageAlt: String(form.get('imageAlt') || ''),
      };

      if (editing) {
        updateBlogPost.mutate(
          { id: editing.id, data },
          { onSuccess: done },
        );
      } else {
        createBlogPost.mutate(data, { onSuccess: done });
      }

      return;
    }

    if (tab === 'logos') {
      const data: ClientLogoInput = {
        name: String(form.get('name') || ''),
        imageUrl: String(form.get('imageUrl') || ''),
        displayOrder: Number(form.get('displayOrder') || 0),
      };

      if (editing) {
        updateClientLogo.mutate(
          { id: editing.id, data },
          { onSuccess: done },
        );
      } else {
        createClientLogo.mutate(data, { onSuccess: done });
      }

      return;
    }

    const data = {
      imageUrls: String(
        form.get('imageUrls') || '',
      )
        .split('\n')
        .map((value) => value.trim())
        .filter(Boolean),
      imageAlt: String(
        form.get('imageAlt') || '',
      ),
      caption: String(
        form.get('caption') || '',
      ),
      client: String(
        form.get('client') || '',
      ),
      category: String(
        form.get('category') || '',
      ),
      displayOrder: number(
        'displayOrder',
      ),
    };

    if (editing) {
      updatePost.mutate(
        {
          id: editing.id,
          data,
        },
        {
          onSuccess: done,
        },
      );
    } else {
      createPost.mutate(
        { data },
        {
          onSuccess: done,
        },
      );
    }
  };

  const remove = (id: number) => {
    const name =
      tab === 'work'
        ? 'case study'
        : tab === 'services'
          ? 'service'
          : tab === 'reels'
            ? 'reel'
            : tab === 'podcasts'
              ? 'podcast'
              : tab === 'team'
                ? 'team member'
                : tab === 'blog'
                  ? 'post'
                  : tab === 'logos'
                    ? 'logo'
                    : 'post';

    if (
      !window.confirm(
        `Delete this ${name}?`,
      )
    ) {
      return;
    }

    const options = {
      onSuccess: () => {
        queryClient.invalidateQueries();
      },
    };

    if (tab === 'services') {
      deleteService.mutate(
        { id },
        options,
      );
    }

    if (tab === 'work') {
      deleteCaseStudy.mutate(
        { id },
        options,
      );
    }

    if (tab === 'reels') {
      deleteReel.mutate(
        { id },
        options,
      );
    }

    if (tab === 'podcasts') {
      deletePodcast.mutate(id, options);
    }

    if (tab === 'team') {
      deleteTeamMember.mutate(id, options);
    }

    if (tab === 'blog') {
      deleteBlogPost.mutate(id, options);
    }

    if (tab === 'logos') {
      deleteClientLogo.mutate(id, options);
    }

    if (tab === 'posts') {
      deletePost.mutate(
        { id },
        options,
      );
    }
  };

  const saving =
    createService.isPending ||
    updateService.isPending ||
    createCaseStudy.isPending ||
    updateCaseStudy.isPending ||
    createReel.isPending ||
    updateReel.isPending ||
    createPodcast.isPending ||
    updatePodcast.isPending ||
    createPost.isPending ||
    updatePost.isPending ||
    createTeamMember.isPending ||
    updateTeamMember.isPending ||
    createBlogPost.isPending ||
    updateBlogPost.isPending ||
    createClientLogo.isPending ||
    updateClientLogo.isPending;

  const openNew = () => {
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (row: any) => {
    setEditing(row);
    setShowForm(true);
  };

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="border-b border-border bg-sidebar px-5 md:px-10">
        <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between">
          <Logo />

          <Link
            href={localizePath('/')}
            className="eyebrow text-muted-foreground hover:text-primary"
            data-testid="link-admin-view-site"
          >
            View site
            <ExternalLink
              size={13}
              className="ms-1 inline"
            />
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] md:grid-cols-[240px_1fr]">
        <aside className="border-e border-border p-5 md:min-h-[calc(100dvh-80px)]">
          <p className="eyebrow mb-6 text-primary">
            Content desk
          </p>

          <nav className="flex gap-2 overflow-auto md:flex-col">
            {tabs.map(
              ([id, label, Icon]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setTab(id);
                    closeForm();
                  }}
                  className={`flex shrink-0 items-center gap-3 px-3 py-3 text-start text-sm ${
                    tab === id
                      ? 'bg-secondary text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  data-testid={`button-admin-tab-${id}`}
                >
                  <Icon size={15} />
                  {label}
                </button>
              ),
            )}
          </nav>
        </aside>

        <section className="p-5 md:p-10">
          <div className="flex items-end justify-between border-b border-border pb-7">
            <div>
              <p className="eyebrow text-primary">
                Workspace / {tab}
              </p>

              <h1 className="display mt-3 text-5xl">
                {config.label}
              </h1>
            </div>

            {tab !== 'messages' && (
              <button
                type="button"
                onClick={openNew}
                className="flex items-center gap-2 bg-primary px-4 py-3 text-xs font-bold uppercase tracking-[.12em] text-primary-foreground"
                data-testid={`button-admin-add-${tab}`}
              >
                <Plus size={15} />

                Add{' '}
                {tab === 'work'
                  ? 'case study'
                  : tab === 'services'
                    ? 'service'
                    : tab === 'reels'
                      ? 'reel'
                      : tab === 'podcasts'
                        ? 'podcast'
                        : tab === 'team'
                          ? 'team member'
                          : tab === 'blog'
                            ? 'post'
                            : tab === 'logos'
                              ? 'logo'
                              : 'post'}
              </button>
            )}
          </div>

          <QueryState
            loading={config.query.isLoading}
            error={!!config.query.error}
            empty={
              !config.query.isLoading &&
              !config.query.error &&
              !config.rows.length
            }
            label={config.emptyLabel}
          >
            {tab === 'messages' ? (
              <div className="mt-8 space-y-4">
                {messages.data!.map((m: ContactMessage) => (
                  <div
                    key={m.id}
                    className="border border-border p-6"
                    data-testid={`row-admin-messages-${m.id}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="display text-xl">{m.name}</h3>
                        <p className="mono text-[11px] text-muted-foreground">
                          {m.email}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <p className="mono text-[10px] text-muted-foreground">
                          {new Date(m.createdAt).toLocaleString()}
                        </p>

                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Delete this message?'))
                              deleteMessage.mutate(m.id);
                          }}
                          className="text-muted-foreground hover:text-destructive"
                          aria-label={`Delete message from ${m.name}`}
                          data-testid={`button-delete-messages-${m.id}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 flex gap-3 text-xs text-muted-foreground">
                      <span>{m.service}</span>
                      <span>·</span>
                      <span>{m.budget}</span>
                    </div>

                    <p className="mt-4 text-sm leading-6">{m.message}</p>
                  </div>
                ))}
              </div>
            ) : (
            <div className="mt-8 overflow-x-auto">
              <table className="w-full min-w-[680px] text-start">
                <thead className="border-b border-border mono text-[10px] text-muted-foreground">
                  <tr>
                    <th className="pb-4">
                      TITLE
                    </th>

                    <th className="pb-4">
                      CATEGORY
                    </th>

                    <th className="pb-4">
                      ORDER
                    </th>

                    <th className="pb-4 text-end">
                      ACTIONS
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border">
                  {config.rows.map(
                    (row: any) => (
                      <tr
                        key={row.id}
                        data-testid={`row-admin-${tab}-${row.id}`}
                      >
                        <td className="py-5 font-semibold">
                          {row.title ||
                            row.caption ||
                            row.name}
                        </td>

                        <td className="py-5 text-sm text-muted-foreground">
                          {tab === 'team' ? (
                            <div className="flex items-center gap-2">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] mono uppercase font-medium ${isLeadershipMember(row) ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-muted text-muted-foreground border border-border/40'}`}>
                                {isLeadershipMember(row) ? 'Leadership' : 'Studio Team'}
                              </span>
                              <span>{row.position}</span>
                            </div>
                          ) : (
                            row.category || row.position
                          )}
                        </td>

                        <td className="py-5 mono text-xs text-muted-foreground">
                          {row.displayOrder ?? '—'}
                        </td>

                        <td className="py-5 text-end">
                          <button
                            type="button"
                            onClick={() =>
                              openEdit(row)
                            }
                            className="me-4 text-muted-foreground hover:text-primary"
                            aria-label={`Edit ${
                              row.title ||
                              row.caption ||
                              row.name
                            }`}
                            data-testid={`button-edit-${tab}-${row.id}`}
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              remove(row.id)
                            }
                            className="text-muted-foreground hover:text-destructive"
                            aria-label={`Delete ${
                              row.title ||
                              row.caption ||
                              row.name
                            }`}
                            data-testid={`button-delete-${tab}-${row.id}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
            )}
          </QueryState>
        </section>
      </div>

      {showForm && (
        <AdminForm
          kind={tab}
          editing={editing}
          saving={saving}
          onClose={closeForm}
          onSubmit={save}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Admin Form                                  */
/* -------------------------------------------------------------------------- */

function AdminForm({
  kind,
  editing,
  saving,
  onClose,
  onSubmit,
}: {
  kind: AdminKind;
  editing: any;
  saving: boolean;
  onClose: () => void;
  onSubmit: (
    event: FormEvent<HTMLFormElement>,
  ) => void;
}) {
  const title =
    kind === 'work'
      ? 'case study'
      : kind === 'services'
        ? 'service'
        : kind === 'reels'
          ? 'reel'
          : kind === 'podcasts'
            ? 'podcast'
            : kind === 'team'
              ? 'team member'
              : kind === 'logos'
                ? 'client logo'
                : 'post';

  const field = (
    name: string,
    label: string,
    placeholder: string,
    required = true,
    type = 'text',
  ) => (
    <AdminField
      key={name}
      name={name}
      label={label}
      placeholder={placeholder}
      required={required}
      type={type}
      defaultValue={editing?.[name] ?? ''}
    />
  );

  const area = (
    name: string,
    label: string,
    placeholder: string,
    defaultValue = '',
    required = true,
  ) => (
    <label
      key={name}
      className="block"
    >
      <span className="eyebrow text-muted-foreground">
        {label}
      </span>

      <textarea
        name={name}
        required={required}
        rows={
          name === 'summary' ||
          name === 'caption'
            ? 3
            : 4
        }
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="mt-2 w-full resize-y border-b border-border bg-transparent p-2 text-sm outline-none focus:border-primary"
      />
    </label>
  );

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-5 backdrop-blur-sm">
      <div className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto border border-border bg-card p-7 md:p-10">
        <div className="flex justify-between">
          <div>
            <p className="eyebrow text-primary">
              {editing
                ? 'Edit record'
                : 'New record'}
            </p>

            <h2 className="display mt-2 text-4xl">
              {editing
                ? `Edit ${title}`
                : `Add a ${title}`}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            data-testid={`button-close-${kind}-form`}
          >
            <X />
          </button>
        </div>

        <form
          key={`${kind}-${editing?.id ?? 'new'}`}
          onSubmit={onSubmit}
          className="mt-8 space-y-5"
        >
          {kind === 'services' && (
            <>
              {field(
                'title',
                'Title',
                'Strategic clarity',
              )}

              <label className="block">
  <span className="eyebrow text-muted-foreground">
    Category
  </span>

  <select
    name="category"
    required
    defaultValue={editing?.category ?? ''}
    className="mt-2 w-full border-b border-border bg-background px-0 py-3 text-sm outline-none focus:border-primary"
  >
    <option value="" disabled>
      Select category
    </option>

    <option value="strategy">Strategy & clarity</option>
    <option value="marketing">Marketing & demand</option>
    <option value="creative">Creative direction</option>
    <option value="business">Business development</option>
    <option value="media">Media production</option>
    <option value="training">People development</option>
    <option value="software">Software solutions</option>
  </select>
</label>

              {area(
                'summary',
                'Summary',
                'A concise description',
                editing?.summary ?? '',
              )}

              {area(
                'details',
                'Details / one per line',
                'One capability per line',
                editing?.details?.join('\n') ??
                  '',
                false,
              )}
            </>
          )}

          {kind === 'work' && (
            <>
              {field(
                'slug',
                'Slug',
                'brand-and-growth',
              )}

              {field(
                'title',
                'Title',
                'A clearer story',
              )}

              {field(
                'client',
                'Client',
                'Partner brand',
              )}

              {field(
                'category',
                'Category',
                'Strategy / positioning',
              )}

              {area(
                'summary',
                'Summary',
                'A concise description',
                editing?.summary ?? '',
              )}

              {area(
                'problem',
                'The question',
                'What was stuck?',
                editing?.problem ?? '',
              )}

              {area(
                'solution',
                'The move',
                'What changed?',
                editing?.solution ?? '',
              )}

              {area(
                'result',
                'The result',
                'What became possible?',
                editing?.result ?? '',
              )}

              {field(
                'metric',
                'Metric / shift',
                'A campaign with room to move',
              )}

              {field(
                'imageUrl',
                'Image URL',
                '/media/spark-campaign-grid.png',
              )}

              {field(
                'imageAlt',
                'Image alt text',
                'Describe the image',
              )}
            </>
          )}

          {kind === 'reels' && (
            <>
              {field(
                'title',
                'Title',
                'A campaign with a pulse',
              )}

              {field(
                'client',
                'Client',
                'Partner brand',
              )}

              {field(
                'category',
                'Category',
                'Campaign film',
              )}

              {field(
                'videoUrl',
                'Video URL (YouTube or MP4)',
                'https://www.youtube.com/watch?v=...',
              )}

              {field(
                'thumbnailUrl',
                'Cover Image URL (Optional — auto-fetched from YouTube)',
                '/media/spark-reels.png or leave empty',
                false,
              )}

              {field(
                'thumbnailAlt',
                'Thumbnail alt text',
                'Describe the thumbnail',
                false,
              )}
            </>
          )}

          {kind === 'podcasts' && (
            <>
              {field(
                'title',
                'Episode Title',
                'The Future of Brand Momentum',
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                {field(
                  'episodeNumber',
                  'Episode Number',
                  'EP 01',
                  false,
                )}

                {field(
                  'category',
                  'Category',
                  'Brand Strategy',
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {field(
                  'host',
                  'Host',
                  'Spark Hub',
                  false,
                )}

                {field(
                  'guest',
                  'Guest Speaker',
                  'Guest Name',
                  false,
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {field(
                  'duration',
                  'Duration',
                  '45 mins',
                  false,
                )}

                {field(
                  'displayOrder',
                  'Display Order',
                  '0',
                  false,
                  'number',
                )}
              </div>

              {field(
                'audioUrl',
                'Audio / Video Stream URL (Spotify, YouTube, or MP3/MP4)',
                'https://open.spotify.com/episode/... or YouTube URL',
              )}

              {field(
                'thumbnailUrl',
                'Cover Image URL (Optional — auto-fetched from YouTube)',
                '/media/spark-reels.png or leave empty',
                false,
              )}

              {field(
                'thumbnailAlt',
                'Cover Alt Text',
                'Episode cover thumbnail',
                false,
              )}

              {area(
                'description',
                'Episode Summary / Description',
                'A deep conversation exploring...',
                editing?.description ?? '',
                false,
              )}

              <div className="pt-2">
                <p className="eyebrow text-primary mb-3 text-xs">External Streaming Links (Optional)</p>
                <div className="space-y-3">
                  {field(
                    'spotifyUrl',
                    'Spotify Link',
                    'https://open.spotify.com/episode/...',
                    false,
                  )}

                  {field(
                    'appleUrl',
                    'Apple Podcasts Link',
                    'https://podcasts.apple.com/...',
                    false,
                  )}

                  {field(
                    'youtubeUrl',
                    'YouTube Watch Link',
                    'https://youtube.com/watch?v=...',
                    false,
                  )}
                </div>
              </div>
            </>
          )}

          {kind === 'posts' && (
            <>
              {area(
                'imageUrls',
                'Image URLs / one per line',
                '/media/spark-social-media.png',
                editing?.imageUrls?.join(
                  '\n',
                ) ?? '',
              )}

              {field(
                'imageAlt',
                'Image alt text',
                'Describe the image',
              )}

              {area(
                'caption',
                'Caption',
                'A short field note',
                editing?.caption ?? '',
              )}

              {field(
                'client',
                'Client',
                'Spark Hub',
              )}

              {field(
                'category',
                'Category',
                'Point of view',
              )}
            </>
          )}

          {kind === 'team' && (
            <>
              <div className="space-y-2">
                <label className="eyebrow block text-primary text-[10px]">
                  Team Tier / Category
                </label>
                <select
                  name="category"
                  defaultValue={editing ? (isLeadershipMember(editing) ? 'leadership' : 'team') : 'team'}
                  className="w-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                >
                  <option value="leadership">Leadership & Partners</option>
                  <option value="team">Studio Team</option>
                </select>
              </div>

              {field(
                'name',
                'Name',
                'Dr. Randa Elbanna',
              )}

              {field(
                'position',
                'Position / Role',
                'Founder & Managing Director',
                false,
              )}

              {field(
                'department',
                'Department / Specialization',
                'Executive & Strategy',
                false,
              )}

              <div className="space-y-2">
                <label className="eyebrow block text-primary text-[10px]">
                  Display Order
                </label>
                <input
                  type="number"
                  name="displayOrder"
                  defaultValue={editing?.displayOrder ?? 0}
                  className="w-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                  placeholder="1, 2, 3..."
                />
              </div>

              {field(
                'imageUrl',
                'Image URL',
                '/khaled_tamim.png',
                false,
              )}

              {/* Quick Image Suggestions */}
              <div className="space-y-1.5">
                <span className="mono text-[10px] text-muted-foreground uppercase">
                  Available Media Assets:
                </span>
                <div className="flex flex-wrap gap-2 text-xs">
                  {[
                    '/khaled_tamim.png',
                    '/media/spark-cover.png',
                    '/media/spark-brand-poster.png',
                    '/media/spark-main-banner.png',
                    '/media/spark-reels.png',
                    '/media/spark-campaign-grid.png',
                  ].map((path) => (
                    <button
                      key={path}
                      type="button"
                      onClick={() => {
                        const input = document.querySelector('input[name="imageUrl"]') as HTMLInputElement;
                        if (input) input.value = path;
                      }}
                      className="rounded border border-border bg-muted/30 px-2 py-1 mono text-[10px] text-muted-foreground hover:border-primary hover:text-primary transition"
                    >
                      {path}
                    </button>
                  ))}
                </div>
              </div>

              {field(
                'linkedinUrl',
                'LinkedIn URL',
                'https://linkedin.com/in/...',
                false,
              )}

              {field(
                'email',
                'Email Address',
                'team@spark-hub.online',
                false,
              )}

              {area(
                'bio',
                'Bio / Description',
                'A short bio highlighting their expertise and focus...',
                editing?.bio ?? '',
                false,
              )}
            </>
          )}

          {kind === 'blog' && (
            <>
              {field(
                'title',
                'Title',
                'How we think about growth',
              )}

              {field(
                'slug',
                'Slug',
                'how-we-think-about-growth',
              )}

              {area(
                'excerpt',
                'Excerpt',
                'A one or two sentence summary',
                editing?.excerpt ?? '',
              )}

              {area(
                'body',
                'Body',
                'The full post (blank lines separate paragraphs)',
                editing?.body ?? '',
              )}

              {field(
                'category',
                'Category',
                'Strategy',
              )}

              {field(
                'publishedAt',
                'Published date',
                '2026-08-14',
              )}

              {field(
                'imageUrl',
                'Image URL',
                '/media/blog/cover.jpg',
              )}

              {field(
                'imageAlt',
                'Image alt text',
                'Describe the image',
              )}
            </>
          )}

          {kind === 'logos' && (
            <>
              {field(
                'name',
                'Client name',
                'Acme Corp',
              )}

              {field(
                'imageUrl',
                'Logo image URL',
                'https://res.cloudinary.com/.../logo.png',
              )}
            </>
          )}

          {kind !== 'team' &&
            kind !== 'blog' &&
            field(
              'displayOrder',
              'Display order',
              '0',
              true,
              'number',
            )}

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 text-xs uppercase tracking-[.12em] text-muted-foreground"
              data-testid={`button-cancel-${kind}`}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="bg-primary px-4 py-3 text-xs font-bold uppercase tracking-[.12em] text-primary-foreground disabled:opacity-60"
              data-testid={`button-save-${kind}`}
            >
              {saving
                ? 'Saving'
                : `Save ${title}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    Admin                                   */
/* -------------------------------------------------------------------------- */

function Admin() {
  const {
    isLoaded,
    isSignedIn,
    userId,
  } = useAuth();
  const { user } = useUser();

  if (!isLoaded) {
    return (
      <div className="grid min-h-[100dvh] place-items-center bg-background">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  if (!isSignedIn) {
    return <AdminSignIn />;
  }

  const role =
    (user?.publicMetadata as Record<string, unknown> | undefined)?.role ||
    (user?.unsafeMetadata as Record<string, unknown> | undefined)?.role;

  const isAdmin =
    role === 'admin' ||
    (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'));

  if (!isAdmin) {
    return (
      <div className="grid min-h-[100dvh] place-items-center bg-background p-6 text-center">
        <div className="max-w-md space-y-4">
          <p className="eyebrow text-destructive">Access Restricted</p>
          <h1 className="text-2xl font-bold text-foreground">Administrator Privileges Required</h1>
          <p className="text-sm text-muted-foreground">
            Your account ({user?.primaryEmailAddress?.emailAddress || userId}) does not have administrative access. Please contact system administrators if you believe this is an error.
          </p>
          <div className="pt-4 flex justify-center">
            <UserButton />
          </div>
        </div>
      </div>
    );
  }

  return <AdminWorkspace />;
}

/* -------------------------------------------------------------------------- */
/*                                   Router                                   */
/* -------------------------------------------------------------------------- */


function Router() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <ErrorBoundary resetKey={location}>
      <Switch>
        {/* Home */}
        <Route
          path="/"
          component={Home}
        />
        <Route
          path="/ar"
          component={Home}
        />
        <Route
          path="/en"
          component={Home}
        />

        {/* Work / Case Studies */}
        <Route
          path="/work"
          component={Work}
        />
        <Route
          path="/ar/work"
          component={Work}
        />
        <Route
          path="/en/work"
          component={Work}
        />
        <Route
          path="/work/:id"
          component={WorkDetail}
        />
        <Route
          path="/ar/work/:id"
          component={WorkDetail}
        />
        <Route
          path="/en/work/:id"
          component={WorkDetail}
        />

        {/* Services */}
        <Route
          path="/services"
          component={Services}
        />
        <Route
          path="/ar/services"
          component={Services}
        />
        <Route
          path="/en/services"
          component={Services}
        />

        {/* Service Pillars / Detail */}
        <Route
          path="/services/:slug"
          component={ServiceDetail}
        />
        <Route
          path="/ar/services/:slug"
          component={ServiceDetail}
        />
        <Route
          path="/en/services/:slug"
          component={ServiceDetail}
        />

        {/* Team */}
        <Route
          path="/team"
          component={Team}
        />
        <Route
          path="/ar/team"
          component={Team}
        />
        <Route
          path="/en/team"
          component={Team}
        />

        {/* Reels */}
        <Route
          path="/reels"
          component={Reels}
        />
        <Route
          path="/ar/reels"
          component={Reels}
        />
        <Route
          path="/en/reels"
          component={Reels}
        />

        {/* Podcasts */}
        <Route
          path="/podcasts"
          component={Podcasts}
        />
        <Route
          path="/ar/podcasts"
          component={Podcasts}
        />
        <Route
          path="/en/podcasts"
          component={Podcasts}
        />

        {/* Posts */}
        <Route
          path="/posts"
          component={Posts}
        />
        <Route
          path="/ar/posts"
          component={Posts}
        />
        <Route
          path="/en/posts"
          component={Posts}
        />

        {/* About */}
        <Route
          path="/about"
          component={About}
        />
        <Route
          path="/ar/about"
          component={About}
        />
        <Route
          path="/en/about"
          component={About}
        />

        {/* Contact */}
        <Route
          path="/contact"
          component={Contact}
        />
        <Route
          path="/ar/contact"
          component={Contact}
        />
        <Route
          path="/en/contact"
          component={Contact}
        />

        {/* Blog */}
        <Route
          path="/blog"
          component={Blog}
        />
        <Route
          path="/ar/blog"
          component={Blog}
        />
        <Route
          path="/en/blog"
          component={Blog}
        />

        <Route
          path="/blog/:slug"
          component={BlogDetail}
        />
        <Route
          path="/ar/blog/:slug"
          component={BlogDetail}
        />
        <Route
          path="/en/blog/:slug"
          component={BlogDetail}
        />

        {/* Admin */}
        <Route
          path="/admin"
          component={Admin}
        />
        <Route
          path="/ar/admin"
          component={Admin}
        />
        <Route
          path="/en/admin"
          component={Admin}
        />

        <Route component={NotFound} />
      </Switch>
    </ErrorBoundary>
  );
}

/* -------------------------------------------------------------------------- */
/*                                     App                                    */
/* -------------------------------------------------------------------------- */

const clerkPubKey =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
  'pk_live_Y2xlcmsuc3BhcmstaHViLm9ubGluZSQ';

const clerkProxyUrl =
  import.meta.env.VITE_CLERK_PROXY_URL;

function App() {
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      appearance={{
        theme: dark,
        variables: {
          colorPrimary: 'hsl(42 78% 63%)',
          colorBackground: 'hsl(220 39% 12%)',
          colorForeground: 'hsl(42 33% 92%)',
          colorInput: 'hsl(218 24% 17%)',
          colorInputForeground: 'hsl(42 33% 92%)',
          borderRadius: '0.15rem',
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <LanguageProvider>
            <GoldenDust />
            <Router />
            <Toaster />
          </LanguageProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default App;