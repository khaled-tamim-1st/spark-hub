import {
  type ReactNode,
  type FormEvent,
  type CSSProperties,
  useEffect,
  useRef,
  useState,
} from 'react';

import type { LucideIcon } from 'lucide-react';

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
  useAuth,
} from '@clerk/react';

import { publishableKeyFromHost } from '@clerk/react/internal';
import { dark } from '@clerk/themes';

import {
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Film,
  Grid2X2,
  Instagram,
  Loader2,
  Mail,
  Menu,
  Moon,
  MoveRight,
  Pencil,
  Plus,
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
import { SignalGame } from '@/components/signal-game';

const queryClient = new QueryClient();

const nav = [
  ['/work', 'Work'],
  ['/services', 'Services'],
  ['/reels', 'Reels'],
  ['/posts', 'Journal'],
  ['/about', 'About'],
  ['/blog', 'Notes'],
] as const;

const gold = 'text-primary';

const LOGO_SRC = '/logo.png';

/* -------------------------------------------------------------------------- */
/*                                    Logo                                    */
/* -------------------------------------------------------------------------- */

function Logo() {
  return (
    <Link
      href="/"
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
        <strong className="block text-[13px] font-800 tracking-[.18em]">
          SPARK HUB
        </strong>

        <small className="mono mt-1 block text-[9px] tracking-[.2em] text-muted-foreground">
          STUDIO / 01
        </small>
      </span>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Theme Toggle                                */
/* -------------------------------------------------------------------------- */

function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('spark-theme') as
      | 'dark'
      | 'light'
      | null;

    const initialTheme = saved || 'dark';

    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';

    setTheme(nextTheme);
    localStorage.setItem('spark-theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="group relative grid h-10 w-10 place-items-center border border-border bg-background text-primary transition-all duration-300 hover:border-primary hover:bg-primary hover:text-primary-foreground"
      aria-label={
        theme === 'dark'
          ? 'Switch to light mode'
          : 'Switch to dark mode'
      }
      data-testid="button-theme-toggle"
    >
      <span className="transition-transform duration-300 group-hover:rotate-12">
        {theme === 'dark' ? (
          <Sun size={16} strokeWidth={1.8} />
        ) : (
          <Moon size={16} strokeWidth={1.8} />
        )}
      </span>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Shell                                    */
/* -------------------------------------------------------------------------- */

function Shell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();

  return (
    <div className="grain min-h-[100dvh] bg-background">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 md:px-10">
          <Logo />

          <nav className="hidden items-center gap-7 md:flex">
            {nav.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                data-testid={`link-nav-${label.toLowerCase()}`}
                className={`eyebrow transition-colors hover:text-primary ${
                  location === href
                    ? gold
                    : 'text-muted-foreground'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 sm:flex">
            <ThemeToggle />

            <Link
              href="/contact"
              className="flex items-center gap-2 border border-primary px-4 py-2.5 text-[10px] font-bold uppercase tracking-[.16em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              data-testid="link-header-contact"
            >
              Start a conversation
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:hidden">
            <ThemeToggle />

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
              {nav.map(([href, label]) => (
                <Link
                  onClick={() => setOpen(false)}
                  key={href}
                  href={href}
                  data-testid={`link-mobile-${label.toLowerCase()}`}
                  className={`eyebrow ${
                    location === href
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  {label}
                </Link>
              ))}

              <Link
                onClick={() => setOpen(false)}
                href="/contact"
                className="eyebrow text-primary"
                data-testid="link-mobile-contact"
              >
                Start a conversation{' '}
                <ArrowUpRight
                  size={13}
                  className="inline"
                />
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main className="pt-[76px]">{children}</main>

      <Footer />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Footer                                   */
/* -------------------------------------------------------------------------- */

function Footer() {
  return (
    <footer className="border-t border-border bg-sidebar px-5 py-14 md:px-10">
      <div className="mx-auto grid max-w-[1440px] gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />

          <p className="mt-7 max-w-xs text-sm leading-7 text-muted-foreground">
            Strategy, systems and stories for organizations with somewhere
            meaningful to go.
          </p>
        </div>

        <div>
          <p className="eyebrow text-primary">Explore</p>

          <div className="mt-5 flex flex-col gap-3 text-sm text-muted-foreground">
            {nav.slice(0, 3).map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="transition-colors hover:text-foreground"
                data-testid={`link-footer-${label.toLowerCase()}`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="eyebrow text-primary">Studio</p>

          <div className="mt-5 flex flex-col gap-3 text-sm text-muted-foreground">
            <Link href="/about" data-testid="link-footer-about">
              Our point of view
            </Link>

            <Link href="/blog" data-testid="link-footer-blog">
              Field notes
            </Link>

            <Link href="/contact" data-testid="link-footer-contact">
              Work with us
            </Link>
          </div>
        </div>

        <div>
          <p className="eyebrow text-primary">Say hello</p>

          <a
            href="mailto:hello@sparkhub.co"
            className="mt-5 block text-sm text-muted-foreground hover:text-foreground"
            data-testid="link-footer-email"
          >
            hello@sparkhub.co
          </a>

          <p className="mt-7 mono text-[10px] text-muted-foreground">
            Sohag / REMOTE / EVERYWHERE
          </p>
        </div>
      </div>

      <div className="mx-auto mt-16 flex max-w-[1440px] justify-between border-t border-border pt-5 mono text-[10px] text-muted-foreground">
        <span>© {new Date().getFullYear()} SPARK HUB</span>
        <span>WHERE STRATEGY MEETS GROWTH</span>
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
    <div className="mb-12 grid gap-5 md:grid-cols-[1fr_1.7fr] md:items-end">
      <Reveal>
        <p className="eyebrow text-primary">{kicker}</p>
      </Reveal>

      <div>
        <Reveal delay={100}>
          <h2 className="display text-5xl leading-[.98] tracking-[-.04em] md:text-7xl">
            {title}
          </h2>
        </Reveal>

        <Reveal delay={180}>
          {typingIntro ? (
            <TypingParagraph
              text={intro}
              className="mt-6 max-w-xl text-base leading-7 text-muted-foreground"
              delay={300}
            />
          ) : (
            <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground">
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
      <div className="border border-destructive/50 bg-destructive/5 p-8">
        <p className="eyebrow text-destructive">
          Signal interrupted
        </p>

        <p className="mt-3 text-sm text-muted-foreground">
          We couldn't load this {label} right now.
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
          This space is taking shape. Check back soon.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

/* -------------------------------------------------------------------------- */
/*                                    Home                                    */
/* -------------------------------------------------------------------------- */

function Home() {
  const overview = useGetOverview();
  const services = useListServices();
  const work = useListCaseStudies();
  const testimonials = useListTestimonials();

  const o = overview.data;

  return (
    <Shell>
      <section className="editorial-grid relative overflow-hidden border-b border-border">
        <PageFrame className="relative min-h-[650px] pb-20 pt-28 md:grid md:grid-cols-[1.2fr_.8fr] md:items-end md:gap-12 md:pb-28 md:pt-36">
          <div className="animate-rise relative z-10">
            <p className="eyebrow mb-8 text-primary">
              {o?.eyebrow ||
                'Independent growth studio / Sohag + remote'}
            </p>

            <h1 className="display max-w-4xl text-[clamp(4rem,10vw,9.5rem)] leading-[.82] tracking-[-.065em]">
              <span className="hero-line">
                <span className="hero-word hero-word-1">
                  Where
                </span>
              </span>

              <span className="hero-line">
                <i className="strategy-gold hero-word hero-word-2">
                  strategy
                </i>
              </span>

              <span className="hero-line">
                <span className="hero-word hero-word-3">
                  meets
                </span>
              </span>

              <span className="hero-line">
                <span className="hero-word hero-word-4">
                  growth.
                </span>
              </span>
            </h1>

            <TypingParagraph
              text={
                o?.intro ||
                'Spark Hub helps ambitious organizations turn good intent into intelligent momentum.'
              }
              className="mt-10 max-w-md text-lg leading-8 text-muted-foreground"
            />

            <Link
              href="/contact"
              className="mt-10 inline-flex items-center gap-4 border border-primary bg-primary px-5 py-3 text-xs font-bold uppercase tracking-[.14em] text-primary-foreground transition-all hover:bg-transparent hover:text-primary"
              data-testid="link-hero-contact"
            >
              Bring us a challenge
              <MoveRight size={15} />
            </Link>
          </div>

          <div className="hidden animate-rise delay-2 md:absolute md:right-40 md:top-55 md:block md:opacity-100">
            <div className="relative h-72 w-72 border border-primary/45 md:h-96 md:w-96">
              <div className="absolute inset-8 rounded-full border border-primary/70" />
              <div className="absolute inset-20 rounded-full border border-primary/30" />

              <div className="absolute left-1/2 top-1/2 h-px w-[140%] -translate-x-1/2 -rotate-45 bg-primary/60" />

              <p className="absolute bottom-5 left-5 eyebrow text-primary">
                SH / 2024—25
              </p>

              <p className="absolute right-5 top-5 mono text-[10px] text-muted-foreground">
                01° / 31° N
              </p>
            </div>
          </div>
        </PageFrame>

        <div className="marquee py-3 mono text-[10px] tracking-[.18em] text-muted-foreground">
          <span>
            STRATEGY&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;
            MARKETING&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;
            OPERATIONS&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;
            PEOPLE DEVELOPMENT&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;
            MEDIA&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;
            SOFTWARE&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;
            STRATEGY&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;
            MARKETING&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;
            OPERATIONS&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;
            PEOPLE DEVELOPMENT&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;
            MEDIA&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;
            SOFTWARE&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;
          </span>
        </div>
      </section>

      <PageFrame>
        <div className="mb-12 grid gap-5 md:grid-cols-[1fr_1.7fr] md:items-end">
          <Reveal>
            <p className="eyebrow text-primary">
              The premise
            </p>
          </Reveal>

          <div>
            <Reveal delay={100}>
              <h1 className="display text-5xl leading-[.98] tracking-[-.04em] md:text-7xl">
                {o?.vision || 'Growth is not a department.'}
              </h1>
            </Reveal>

            <Reveal delay={180}>
              <TypingParagraph
                text={
                  o?.mission ||
                  'It is the result of clear thinking, aligned teams and work that earns attention. We bring the disciplines together so the whole organization can move with intent.'
                }
                className="mt-6 max-w-xl text-base leading-7 text-muted-foreground"
                delay={300}
              />
            </Reveal>
          </div>
        </div>

        <div className="mt-16 grid gap-px bg-border md:grid-cols-3">
          {(services.data || []).slice(0, 3).map((service, index) => (
            <Link
              href="/services"
              key={service.id}
              className="group bg-background p-7 md:p-9"
              data-testid={`card-home-service-${service.id}`}
            >
              <span className="mono text-xs text-primary">
                0{index + 1}
              </span>

              <h3 className="display mt-16 text-3xl">
                {service.title}
              </h3>

              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                {service.summary}
              </p>

              <ArrowUpRight
                className="mt-10 text-primary transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                size={18}
              />
            </Link>
          ))}
        </div>
      </PageFrame>

      <section className="bg-card">
        <PageFrame>
          <SectionHead
            kicker="Selected work"
            title="Proof, not promises."
            intro="A few partnerships where a sharper point of view became measurable movement."
            typingIntro
          />

          <QueryState
            loading={work.isLoading}
            error={!!work.error}
            empty={
              !work.isLoading &&
              !work.error &&
              !work.data?.length
            }
          >
            <div className="grid gap-5 md:grid-cols-2">
              {(work.data || [])
                .slice(0, 4)
                .map((item, index) => (
                  <WorkCard
                    key={item.id}
                    item={item}
                    featured={index === 0}
                  />
                ))}
            </div>
          </QueryState>

          <Link
            href="/work"
            className="mt-10 inline-flex items-center gap-2 eyebrow text-primary"
            data-testid="link-home-work"
          >
            View all work
            <ChevronRight size={14} />
          </Link>
        </PageFrame>
      </section>

      <SignalGame />

      {/* Trusted by */}
      <section className="border-t border-border bg-card">
        <PageFrame>
          <SectionHead
            kicker="Trusted by / built through partnership"
            title="Good work travels."
            intro="A few of the teams and organizations who have trusted Spark Hub with the work that matters."
          />

          <div className="mt-16 space-y-3">
            {[
              { reverse: false, start: 1, end: 10 },
              { reverse: true, start: 11, end: 20 },
              { reverse: false, start: 21, end: 30 },
            ].map((row) => (
              <div
                key={row.start}
                className="relative overflow-hidden border-y border-border/70 py-6"
              >
                <div
                  className={`trusted-marquee-track ${
                    row.reverse ? 'trusted-marquee-reverse' : ''
                  }`}
                >
                  {Array.from(
                    { length: row.end - row.start + 1 },
                    (_, index) => {
                      const clientNumber = row.start + index;

                      return (
                        <div
                          key={clientNumber}
                          className="flex min-w-[12rem] items-center justify-center px-6 md:min-w-[15rem]"
                        >
                          <img
                            src="/logo.png"
                            alt={`Client ${clientNumber}`}
                            className="block h-12 w-auto object-contain opacity-75 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0 md:h-14"
                          />
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-center gap-4">
            <span className="h-px flex-1 bg-border" />
            <span className="mono text-[10px] tracking-[.16em] text-muted-foreground">
              PARTNERS / 01—30
            </span>
            <span className="h-px flex-1 bg-border" />
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
  return (
    <Link
      href={`/work/${item.slug}`}
      className={`group art-panel block min-h-[320px] p-6 ${
        featured
          ? 'md:min-h-[480px]'
          : 'md:min-h-[360px]'
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

          <h3 className="display mt-2 max-w-lg text-4xl leading-none transition-transform group-hover:translate-x-1 md:text-5xl">
            {item.title}
          </h3>

          <div className="mt-5 flex items-center justify-between border-t border-border/70 pt-4">
            <span className="text-sm text-muted-foreground">
              {item.metric}
            </span>

            <ArrowUpRight
              size={17}
              className="text-primary transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

function Work() {
  const query = useListCaseStudies();

  return (
    <Shell>
      <PageFrame>
        <SectionHead
          kicker="Selected work / 2019—now"
          title="Work that shifts the room."
          intro="We partner at the point where a business needs more than a campaign: a new direction, a working system, or a story people can carry."
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
  const query = useGetCaseStudy(id);
  const item = query.data;

  return (
    <Shell>
      <PageFrame>
        <Link
          href="/work"
          className="eyebrow text-primary"
          data-testid="link-back-work"
        >
          ← Back to work
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
              <div className="mt-14 max-w-5xl animate-rise">
                <p className="eyebrow text-primary">
                  {item.category} / {item.client}
                </p>

                <h1 className="display mt-5 text-6xl leading-[.92] tracking-[-.05em] md:text-9xl">
                  {item.title}
                </h1>

                <p className="mt-10 max-w-2xl text-xl leading-8 text-muted-foreground">
                  {item.summary}
                </p>
              </div>

              <div className="art-panel mt-16 flex min-h-80 items-end p-7 md:min-h-[500px] md:p-12">
                <div className="relative z-10">
                  <p className="eyebrow text-primary">
                    The shift
                  </p>

                  <p className="display mt-3 max-w-xl text-4xl">
                    {item.metric}
                  </p>
                </div>
              </div>

              <div className="mt-16 grid gap-12 md:grid-cols-3">
                {[
                  ['The question', item.problem],
                  ['The move', item.solution],
                  ['The result', item.result],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="eyebrow text-primary">
                      {label}
                    </p>

                    <p className="mt-5 text-base leading-8 text-muted-foreground">
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

function Services() {
  const query = useListServices();

  return (
    <Shell>
      <PageFrame>
        <SectionHead
          kicker="Capabilities / not packages"
          title="The connective tissue of growth."
          intro="The work sits between disciplines. That is where we are most useful — translating strategy into action, and action into something that lasts."
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
            {(query.data || []).map((service, index) => (
              <details
                key={service.id}
                className="group py-7"
                data-testid={`service-${service.id}`}
              >
                <summary className="flex cursor-pointer list-none items-center gap-5">
                  <span className="mono w-9 text-xs text-primary">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <h2 className="display flex-1 text-3xl md:text-5xl">
                    {categoryLabels[service.category] ||
                      service.title}
                  </h2>

                  <span className="eyebrow hidden text-muted-foreground md:block">
                    {service.title}
                  </span>

                  <ChevronDown
                    className="text-primary transition-transform group-open:rotate-180"
                    size={19}
                  />
                </summary>

                <div className="grid gap-6 pl-14 pt-7 md:grid-cols-[1fr_1fr]">
                  <p className="max-w-lg text-sm leading-7 text-muted-foreground">
                    {service.summary}
                  </p>

                  <ul className="space-y-3">
                    {(service.details || []).map((detail) => (
                      <li
                        key={detail}
                        className="flex gap-3 text-sm"
                      >
                        <Check
                          className="mt-0.5 shrink-0 text-primary"
                          size={15}
                        />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </details>
            ))}
          </div>
        </QueryState>
      </PageFrame>
    </Shell>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Reels                                    */
/* -------------------------------------------------------------------------- */

function toEmbedUrl(
  url: string,
): { kind: 'iframe' | 'video'; src: string } {
  if (!url) {
    return {
      kind: 'video',
      src: '',
    };
  }

  try {
    const parsedUrl = new URL(url);
    const host = parsedUrl.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      const id = parsedUrl.pathname
        .replace(/^\/+/, '')
        .split('/')[0];

      if (id) {
        return {
          kind: 'iframe',
          src: `https://www.youtube.com/embed/${encodeURIComponent(
            id,
          )}?autoplay=1`,
        };
      }
    }

    if (
      host === 'youtube.com' ||
      host === 'm.youtube.com'
    ) {
      let id = parsedUrl.searchParams.get('v');

      if (!id) {
        const parts = parsedUrl.pathname
          .split('/')
          .filter(Boolean);

        const embedIndex = parts.indexOf('embed');

        if (
          embedIndex >= 0 &&
          parts[embedIndex + 1]
        ) {
          id = parts[embedIndex + 1];
        } else {
          const shortsIndex = parts.indexOf('shorts');

          if (
            shortsIndex >= 0 &&
            parts[shortsIndex + 1]
          ) {
            id = parts[shortsIndex + 1];
          }
        }
      }

      if (id) {
        return {
          kind: 'iframe',
          src: `https://www.youtube.com/embed/${encodeURIComponent(
            id,
          )}?autoplay=1`,
        };
      }
    }

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
  } catch {
    // Fall through to direct video.
  }

  return {
    kind: 'video',
    src: url,
  };
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
        <div className="flex w-full max-w-xs items-center justify-between pb-3 sm:max-w-sm">
          <div>
            <h3 className="display text-xl">
              {reel.title}
            </h3>

            <p className="mono text-[10px] text-muted-foreground">
              {reel.client}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close"
            data-testid="button-close-reel-lightbox"
          >
            <X />
          </button>
        </div>

        <div className="art-panel aspect-[9/16] h-[75dvh] max-h-[640px] w-auto overflow-hidden rounded-x1">
          {embed.kind === 'iframe' ? (
            <iframe
              src={embed.src}
              className="h-full w-full"
              allow="autoplay; fullscreen; picture-in-picture"
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
  const query = useListReels();
  const [active, setActive] = useState<any>(null);

  return (
    <Shell>
      <PageFrame>
        <SectionHead
          kicker="Moving image"
          title="Stories with a pulse."
          intro="The work between the takes: films, campaign worlds and visual systems made to hold attention."
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
                className="group text-left"
                key={reel.id}
                data-testid={`link-reel-${reel.id}`}
              >
                <div className="art-panel relative aspect-[4/5] overflow-hidden rounded-xl">
                  {reel.thumbnailUrl && (
                    <img
                      src={reel.thumbnailUrl}
                      alt={reel.thumbnailAlt || reel.title}
                      loading='lazy'
                      className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-500 group-hover:scale-105 group-hover:opacity-90"
                    />
                  )}

                  <div className="relative z-10 flex h-full items-center justify-center">
                    <span className="grid h-14 w-14 place-items-center rounded-full border border-primary text-primary">
                      <Film size={18} />
                    </span>
                  </div>

                  <span className="absolute bottom-4 left-4 eyebrow text-primary">
                    {reel.category}
                  </span>
                </div>

                <div className="mt-4 flex justify-between">
                  <div>
                    <h3 className="display text-2xl">
                      {reel.title}
                    </h3>

                    <p className="mt-1 mono text-[10px] text-muted-foreground">
                      {reel.client}
                    </p>
                  </div>

                  <ExternalLink
                    size={16}
                    className="mt-1 text-primary"
                  />
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
/*                                   Posts                                    */
/* -------------------------------------------------------------------------- */

function Posts() {
  const query = useListPosts();

  return (
    <Shell>
      <PageFrame>
        <SectionHead
          kicker="From the field"
          title="The journal, in fragments."
          intro="A visual index of work, people and questions we keep returning to."
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
          <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 rounded-xl">
            {(query.data || []).map((post) => (
              <article
                key={post.id}
                className="mb-5 break-inside-avoid bg-card rounded-xl"
                data-testid={`card-post-${post.id}`}
              >
                {post.imageUrls?.[0] && (
                  <img
                    src={post.imageUrls[0]}
                    alt={post.imageAlt || post.caption}
                    className="w-full object-cover rounded-t-xl"
                    loading='lazy'
                  />
                )}

                <div className="p-5">
                  <p className="eyebrow text-primary">
                    {post.category}
                  </p>

                  <p className="mt-4 text-sm leading-6">
                    {post.caption}
                  </p>

                  <p className="mt-5 mono text-[10px] text-muted-foreground">
                    {post.client}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </QueryState>
      </PageFrame>
    </Shell>
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

type TeamMemberInput = { name: string; position: string | null; bio: string | null; imageUrl: string | null };

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

function About() {
  const overview = useGetOverview();
  const o = overview.data;

  const team = useListTeam();

  const members =
    team.data && team.data.length
      ? team.data
      : o?.founderName
        ? [
            {
              id: -1,
              name: o.founderName,
              position: o.founderRole || 'Founder',
              bio: o.founderBio || null,
              imageUrl: null,
            },
          ]
        : [];

  return (
    <Shell>
      <PageFrame>
        <SectionHead
          kicker="The studio"
          title="Human judgment, made useful."
          intro="Spark Hub is a multidisciplinary growth partner for organizations doing work that matters. We join the dots between the plan, the people and the public expression."
          typingIntro
        />

        <div className="grid gap-6 md:grid-cols-[1.2fr_.8fr]">
          <div className="art-panel flex min-h-[460px] items-end p-8 md:p-12">
            <p className="relative z-10 max-w-xl display text-4xl leading-tight md:text-6xl">
              "
              {o?.vision ||
                'The best growth feels less like acceleration and more like alignment.'}
              "
            </p>
          </div>

          <div className="flex flex-col justify-between border border-border p-7 md:p-10">
            <div>
              <p className="eyebrow text-primary">
                Our north star
              </p>

              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                {o?.mission ||
                  'We integrate strategy, marketing, operations and people development into one clear way forward.'}
              </p>
            </div>

            <div className="mt-12 border-t border-border pt-7">
              <p className="eyebrow text-primary">
                Based in
              </p>

              <p className="mt-3 display text-3xl">
                Sohag / Everywhere
              </p>
            </div>
          </div>
        </div>

        {!!members.length && (
          <div className="mt-28">
            <p className="eyebrow text-primary">
              The team
            </p>

            <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {members.map((member) => (
                <div key={member.id}>
                  <div className="art-panel aspect-[4/5] overflow-hidden">
                    {member.imageUrl ? (
                      <img
                        src={member.imageUrl}
                        alt={member.name}
                        className="h-full w-full object-cover"
                        loading='lazy'
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center">
                        <span className="display text-6xl text-primary">
                          {member.name
                            .split(' ')
                            .map((name) => name[0])
                            .slice(0, 2)
                            .join('')}
                        </span>
                      </div>
                    )}
                  </div>

                  <h3 className="mt-5 display text-2xl">
                    {member.name}
                  </h3>

                  {member.position && (
                    <p className="mt-1 eyebrow text-primary">
                      {member.position}
                    </p>
                  )}

                  {member.bio && (
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {member.bio}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </PageFrame>
    </Shell>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Contact                                   */
/* -------------------------------------------------------------------------- */

function Contact() {
  const mutation = useCreateContactLead();
  const [sent, setSent] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

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
        <div className="grid gap-16 md:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="eyebrow text-primary">
              Start a conversation
            </p>

            <h1 className="display mt-7 text-6xl leading-[.9] md:text-8xl">
              Make the next move{' '}
              <i className="text-primary">clear.</i>
            </h1>

            <p className="mt-8 max-w-sm text-base leading-7 text-muted-foreground">
              Tell us what is changing, what is stuck, or what
              you are ready to build.
            </p>

            <div className="mt-14 space-y-3 mono text-[11px] text-muted-foreground">
              <p className="flex gap-3">
                <Mail
                  size={14}
                  className="text-primary"
                />
                hello@sparkhub.co
              </p>

              <p className="flex gap-3">
                <Instagram
                  size={14}
                  className="text-primary"
                />
                @sparkhubstudio
              </p>
            </div>
          </div>

          <div className="border border-border bg-card p-6 md:p-10">
            {sent ? (
              <div className="flex min-h-96 flex-col justify-center">
                <Check
                  className="text-primary"
                  size={28}
                />

                <h2 className="display mt-6 text-4xl">
                  Message received.
                </h2>

                <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">
                  We will be in touch shortly. In the meantime,
                  explore what we have been making.
                </p>

                <Link
                  href="/work"
                  className="mt-8 eyebrow text-primary"
                  data-testid="link-contact-success-work"
                >
                  See the work →
                </Link>
              </div>
            ) : (
              <form
                onSubmit={submit}
                className="space-y-7"
              >
                <Field
                  name="name"
                  label="Your name"
                  placeholder="Name"
                />

                <Field
                  name="email"
                  label="Email address"
                  placeholder="you@company.com"
                  type="email"
                />

                <div className="grid gap-7 sm:grid-cols-2">
                  <Field
                    name="service"
                    label="What can we help with?"
                    placeholder="Strategy, marketing, systems..."
                  />

                  <Field
                    name="budget"
                    label="Working range"
                    placeholder="A useful guide, not a commitment"
                  />
                </div>

                <label className="block">
                  <span className="eyebrow text-muted-foreground">
                    The brief
                  </span>

                  <textarea
                    name="message"
                    required
                    rows={5}
                    placeholder="What are you trying to make possible?"
                    className="mt-3 w-full resize-none border-0 border-b border-border bg-transparent px-0 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary"
                    data-testid="textarea-contact-message"
                  />
                </label>

                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="inline-flex items-center gap-3 bg-primary px-5 py-3 text-xs font-bold uppercase tracking-[.15em] text-primary-foreground hover:bg-primary/85 disabled:opacity-60"
                  data-testid="button-submit-contact"
                >
                  {mutation.isPending ? (
                    <Loader2
                      className="animate-spin"
                      size={15}
                    />
                  ) : (
                    <Send size={15} />
                  )}

                  {mutation.isPending
                    ? 'Sending'
                    : 'Send brief'}
                </button>

                {mutation.error && (
                  <p className="text-xs text-destructive">
                    Something went wrong. Please try again.
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
    <label className="block">
      <span className="eyebrow text-muted-foreground">
        {label}
      </span>

      <input
        required
        name={name}
        type={type}
        placeholder={placeholder}
        className="mt-3 w-full border-0 border-b border-border bg-transparent px-0 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary"
        data-testid={`input-contact-${name}`}
      />
    </label>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    Blog                                    */
/* -------------------------------------------------------------------------- */

function Blog() {
  const query = useListBlogPosts();

  return (
    <Shell>
      <PageFrame>
        <SectionHead
          kicker="Notes / ideas in progress"
          title="A sharper way to look at the work."
          intro="Observations from the intersection of strategy, culture, marketing and making."
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
                href={`/blog/${post.slug}`}
                key={post.id}
                className="group"
                data-testid={`card-blog-${post.id}`}
              >
                <div className="art-panel aspect-[1.7]">
                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt={post.imageAlt || post.title}
                      className="h-full w-full object-cover opacity-75 transition duration-500 group-hover:scale-105 group-hover:opacity-95"
                      loading='lazy'
                    />
                  )}

                  <span className="absolute bottom-5 left-5 eyebrow text-primary">
                    {post.category}
                  </span>
                </div>

                <div className="mt-5 flex items-start justify-between gap-5">
                  <div>
                    <p className="mono text-[10px] text-muted-foreground">
                      {new Date(
                        post.publishedAt,
                      ).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>

                    <h2 className="display mt-3 text-3xl leading-tight transition-colors group-hover:text-primary">
                      {post.title}
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {post.excerpt}
                    </p>
                  </div>

                  <ArrowUpRight
                    size={17}
                    className="mt-1 shrink-0 text-primary"
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

function BlogDetail() {
  const { slug = '' } = useParams<{ slug: string }>();
  const query = useGetBlogPost(slug);
  const post = query.data;

  return (
    <Shell>
      <PageFrame>
        <Link
          href="/blog"
          className="eyebrow text-primary"
          data-testid="link-back-blog"
        >
          ← Back to notes
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
          {post && (
            <article className="mx-auto mt-16 max-w-4xl">
              <p className="eyebrow text-primary">
                {post.category} /{' '}
                {new Date(
                  post.publishedAt,
                ).toLocaleDateString()}
              </p>

              <h1 className="display mt-6 text-6xl leading-[.92] tracking-[-.04em] md:text-8xl">
                {post.title}
              </h1>

              <p className="mt-8 text-xl leading-8 text-muted-foreground">
                {post.excerpt}
              </p>

              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt={post.imageAlt || post.title}
                  className="mt-14 max-h-[580px] w-full object-cover"
                  loading='lazy'
                />
              )}

              <div className="prose prose-invert mt-14 max-w-2xl whitespace-pre-line text-base leading-8 text-muted-foreground">
                {post.body}
              </div>
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
  | 'posts'
  | 'team'
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
  const posts = useListPosts();
  const team = useListTeam();
  const messages = useListMessages();
  const deleteMessage = useDeleteMessage();
  const createTeamMember = useCreateTeamMember();
  const updateTeamMember = useUpdateTeamMember();
  const deleteTeamMember = useDeleteTeamMember();

  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();

  const createCaseStudy = useCreateCaseStudy();
  const updateCaseStudy = useUpdateCaseStudy();
  const deleteCaseStudy = useDeleteCaseStudy();

  const createReel = useCreateReel();
  const updateReel = useUpdateReel();
  const deleteReel = useDeleteReel();

  const createPost = useCreatePost();
  const updatePost = useUpdatePost();
  const deletePost = useDeletePost();

  const tabs: Array<
    [AdminKind, string, LucideIcon]
  > = [
    ['services', 'Services', Settings2],
    ['work', 'Case studies', Grid2X2],
    ['reels', 'Reels', Film],
    ['posts', 'Posts', Instagram],
    ['team', 'Team', Users],
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
      const data = {
        videoUrl: String(
          form.get('videoUrl') || '',
        ),
        thumbnailUrl: String(
          form.get('thumbnailUrl') || '',
        ),
        thumbnailAlt: String(
          form.get('thumbnailAlt') || '',
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
        displayOrder: number(
          'displayOrder',
        ),
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

    if (tab === 'team') {
      const data: TeamMemberInput = {
        name: String(form.get('name') || ''),
        position: String(form.get('position') || '') || null,
        bio: String(form.get('bio') || '') || null,
        imageUrl: String(form.get('imageUrl') || '') || null,
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
            : tab === 'team'
              ? 'team member'
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

    if (tab === 'team') {
      deleteTeamMember.mutate(id, options);
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
    createPost.isPending ||
    updatePost.isPending ||
    createTeamMember.isPending ||
    updateTeamMember.isPending;

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
            href="/"
            className="eyebrow text-muted-foreground hover:text-primary"
            data-testid="link-admin-view-site"
          >
            View site
            <ExternalLink
              size={13}
              className="ml-1 inline"
            />
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] md:grid-cols-[240px_1fr]">
        <aside className="border-r border-border p-5 md:min-h-[calc(100dvh-80px)]">
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
                  className={`flex shrink-0 items-center gap-3 px-3 py-3 text-left text-sm ${
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
              <table className="w-full min-w-[680px] text-left">
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

                    <th className="pb-4 text-right">
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
                          {row.category || row.position}
                        </td>

                        <td className="py-5 mono text-xs text-muted-foreground">
                          {row.displayOrder ?? '—'}
                        </td>

                        <td className="py-5 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              openEdit(row)
                            }
                            className="mr-4 text-muted-foreground hover:text-primary"
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
          : kind === 'team'
            ? 'team member'
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
                'Video URL',
                'https://www.youtube.com/',
              )}

              {field(
                'thumbnailUrl',
                'Thumbnail URL',
                '/media/spark-reels.png',
              )}

              {field(
                'thumbnailAlt',
                'Thumbnail alt text',
                'Describe the thumbnail',
              )}
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
              {field(
                'name',
                'Name',
                'Dr. Randa Elbanna',
              )}

              {field(
                'position',
                'Position',
                'Founder & Managing Director',
                false,
              )}

              {area(
                'bio',
                'Bio',
                'A short bio',
                editing?.bio ?? '',
                false,
              )}

              {field(
                'imageUrl',
                'Image URL',
                '/media/team/randa.jpg',
                false,
              )}
            </>
          )}

          {kind !== 'team' &&
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
  } = useAuth();

  if (!isLoaded) {
    return (
      <div className="grid min-h-[100dvh] place-items-center bg-background">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  return isSignedIn ? (
    <AdminWorkspace />
  ) : (
    <AdminSignIn />
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Router                                   */
/* -------------------------------------------------------------------------- */

function Router() {
  const [location] = useLocation();

  return (
    <ErrorBoundary resetKey={location}>
      <Switch>
        <Route
          path="/"
          component={Home}
        />

        <Route
          path="/work"
          component={Work}
        />

        <Route
          path="/work/:id"
          component={WorkDetail}
        />

        <Route
          path="/services"
          component={Services}
        />

        <Route
          path="/reels"
          component={Reels}
        />

        <Route
          path="/posts"
          component={Posts}
        />

        <Route
          path="/about"
          component={About}
        />

        <Route
          path="/contact"
          component={Contact}
        />

        <Route
          path="/blog"
          component={Blog}
        />

        <Route
          path="/blog/:slug"
          component={BlogDetail}
        />

        <Route
          path="/admin"
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

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl =
  import.meta.env.VITE_CLERK_PROXY_URL;

function App() {
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
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
          <GoldenDust />
          <Router />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default App;