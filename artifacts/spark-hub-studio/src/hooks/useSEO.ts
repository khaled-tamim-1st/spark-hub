import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/context/language-context';

export interface SEOConfig {
  title: string;
  description: string;
  canonical?: string;
  ogType?: 'website' | 'article' | 'profile';
  ogImage?: string;
  ogImageAlt?: string;
  publishedTime?: string;
  modifiedTime?: string;
  articleSection?: string;
  keywords?: string | string[];
  schema?: object | object[];
  noIndex?: boolean;
}

const BASE_URL = 'https://spark-hub.online';
const DEFAULT_OG_IMAGE = 'https://spark-hub.online/og-image.png';

function setMetaTag(name: string, content: string, isProperty = false) {
  const attr = isProperty ? 'property' : 'name';
  let element = document.head.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attr, name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function setLinkTag(rel: string, href: string, extraAttrs: Record<string, string> = {}) {
  let selector = `link[rel="${rel}"]`;
  if (extraAttrs.hreflang) {
    selector += `[hreflang="${extraAttrs.hreflang}"]`;
  }
  let element = document.head.querySelector(selector) as HTMLLinkElement | null;
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    for (const [key, val] of Object.entries(extraAttrs)) {
      element.setAttribute(key, val);
    }
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

export function useSEO({
  title,
  description,
  canonical,
  ogType = 'website',
  ogImage = DEFAULT_OG_IMAGE,
  ogImageAlt,
  publishedTime,
  modifiedTime,
  articleSection,
  keywords,
  schema,
  noIndex = false,
}: SEOConfig): void {
  const [location] = useLocation();
  const { locale } = useLanguage();

  useEffect(() => {
    if (typeof document === 'undefined') return;

    // 1. Document Title
    document.title = title;

    // 2. Meta Description
    setMetaTag('description', description);

    // 3. Keywords
    if (keywords) {
      const kwString = Array.isArray(keywords) ? keywords.join(', ') : keywords;
      setMetaTag('keywords', kwString);
    }

    // 4. Robots Directives
    if (noIndex) {
      setMetaTag('robots', 'noindex, nofollow');
    } else {
      setMetaTag(
        'robots',
        'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
      );
    }

    // 5. Normalized Paths for Canonical & hreflang
    const rawPath = canonical || location || '/';
    let cleanPath = rawPath;
    if (cleanPath === '/ar' || cleanPath === '/en') {
      cleanPath = '/';
    } else if (cleanPath.startsWith('/ar/')) {
      cleanPath = cleanPath.slice(3);
    } else if (cleanPath.startsWith('/en/')) {
      cleanPath = cleanPath.slice(3);
    }
    if (!cleanPath.startsWith('/')) {
      cleanPath = `/${cleanPath}`;
    }

    const currentUrl = `${BASE_URL}${locale === 'ar' ? (cleanPath === '/' ? '/ar' : `/ar${cleanPath}`) : cleanPath}`;
    const canonicalUrl = `${BASE_URL}${cleanPath === '/' ? (locale === 'ar' ? '/ar' : '/') : (locale === 'ar' ? `/ar${cleanPath}` : cleanPath)}`;
    const enUrl = `${BASE_URL}${cleanPath === '/' ? '/' : cleanPath}`;
    const arUrl = `${BASE_URL}${cleanPath === '/' ? '/ar' : `/ar${cleanPath}`}`;

    // Set Canonical URL
    setLinkTag('canonical', canonicalUrl);

    // Set hreflang Alternates
    setLinkTag('alternate', enUrl, { hreflang: 'en' });
    setLinkTag('alternate', arUrl, { hreflang: 'ar' });
    setLinkTag('alternate', enUrl, { hreflang: 'x-default' });

    // 6. Open Graph Tags
    setMetaTag('og:site_name', 'Spark Hub Studio', true);
    setMetaTag('og:title', title, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:url', currentUrl, true);
    setMetaTag('og:type', ogType, true);
    setMetaTag('og:locale', locale === 'ar' ? 'ar_AR' : 'en_US', true);
    setMetaTag('og:image', ogImage, true);
    setMetaTag('og:image:secure_url', ogImage, true);
    setMetaTag('og:image:alt', ogImageAlt || title, true);

    if (ogType === 'article') {
      if (publishedTime) setMetaTag('article:published_time', publishedTime, true);
      if (modifiedTime) setMetaTag('article:modified_time', modifiedTime, true);
      if (articleSection) setMetaTag('article:section', articleSection, true);
    }

    // 7. Twitter Card Tags
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:url', currentUrl);
    setMetaTag('twitter:image', ogImage);
    setMetaTag('twitter:image:alt', ogImageAlt || title);

    // 8. Dynamic Page-Level Structured Data (JSON-LD)
    const SCRIPT_ID = 'route-dynamic-schema';
    let scriptEl = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (schema) {
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.id = SCRIPT_ID;
        scriptEl.type = 'application/ld+json';
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(schema);
    } else if (scriptEl) {
      scriptEl.remove();
    }
  }, [
    title,
    description,
    canonical,
    ogType,
    ogImage,
    ogImageAlt,
    publishedTime,
    modifiedTime,
    articleSection,
    keywords,
    schema,
    noIndex,
    location,
    locale,
  ]);
}
