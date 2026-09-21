import { Link } from 'wouter';
import { useLanguage } from '@/context/language-context';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href: string;
}

export function SEOBreadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const { localizePath, isRTL } = useLanguage();
  const baseUrl = 'https://spark-hub.online';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `${baseUrl}${item.href}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <nav aria-label="Breadcrumbs" className="mb-8">
        <ol className="flex flex-wrap items-center gap-2 font-mono text-[11px] rtl:text-xs text-muted-foreground">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={item.href} className="inline-flex items-center gap-2">
                {index > 0 && (
                  <ChevronRight
                    size={12}
                    className={`text-muted-foreground/40 shrink-0 ${isRTL ? 'rotate-180' : ''}`}
                  />
                )}
                {isLast ? (
                  <span className="font-semibold text-primary" aria-current="page">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={localizePath(item.href)}
                    className="hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
