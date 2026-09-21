import { Link } from 'wouter';
import { useLanguage } from '@/context/language-context';
import { useListBlogPosts } from '@workspace/api-client-react';
import { ArrowUpRight } from 'lucide-react';

interface RelatedBlogPostsProps {
  currentSlug: string;
  category?: string;
  limit?: number;
}

export function RelatedBlogPosts({
  currentSlug,
  category,
  limit = 3,
}: RelatedBlogPostsProps) {
  const { locale, localizePath } = useLanguage();
  const query = useListBlogPosts();

  const allPosts = query.data || [];
  const related = allPosts
    .filter((post) => post.slug !== currentSlug && (!category || post.category === category))
    .slice(0, limit);

  // Fallback to recent posts if no direct category match
  const displayPosts =
    related.length > 0
      ? related
      : allPosts.filter((post) => post.slug !== currentSlug).slice(0, limit);

  if (displayPosts.length === 0) return null;

  return (
    <section className="mt-16 border-t border-border/80 pt-10 text-start" aria-label="Related Articles">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="eyebrow text-primary text-xs font-mono">
            {locale === 'ar' ? 'رؤى متصلة' : 'Connected Insights'}
          </p>
          <h3 className="display text-xl sm:text-2xl font-bold text-foreground mt-1">
            {locale === 'ar' ? 'مقالات ذات صلة بمسار النمو' : 'Further Reading on Strategy & Growth'}
          </h3>
        </div>
        <Link
          href={localizePath('/blog')}
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono text-primary hover:underline"
        >
          {locale === 'ar' ? 'استكشف كافة المقالات' : 'Explore all field notes'}
          <ArrowUpRight size={13} className="rtl:-rotate-90" />
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {displayPosts.map((post) => (
          <Link
            key={post.id}
            href={localizePath(`/blog/${post.slug}`)}
            className="group flex flex-col justify-between rounded-xl border border-border/60 bg-card/40 p-5 transition-all hover:border-primary/50 hover:bg-card/70"
          >
            <div>
              <div className="art-panel relative aspect-[16/10] overflow-hidden rounded-lg bg-card border border-border/40 mb-4">
                {post.imageUrl ? (
                  <img
                    src={post.imageUrl}
                    alt={post.imageAlt || post.title}
                    className="h-full w-full object-cover opacity-75 transition duration-500 group-hover:scale-105 group-hover:opacity-95"
                    loading="lazy"
                  />
                ) : (
                  <div className="grid h-full place-items-center bg-primary/5 text-primary text-xs font-mono">
                    SPARK HUB
                  </div>
                )}
                <span className="absolute bottom-2.5 start-2.5 rounded bg-background/80 px-2 py-0.5 font-mono text-[9px] text-primary backdrop-blur-sm">
                  {post.category}
                </span>
              </div>

              <h4 className="font-bold text-sm sm:text-base leading-snug text-foreground transition-colors group-hover:text-primary line-clamp-2">
                {post.title}
              </h4>

              <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                {post.excerpt}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3 text-[11px] font-mono text-primary">
              <span>{locale === 'ar' ? 'قراءة التحليل' : 'Read Note'}</span>
              <ArrowUpRight size={13} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:-rotate-90 rtl:group-hover:-translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
