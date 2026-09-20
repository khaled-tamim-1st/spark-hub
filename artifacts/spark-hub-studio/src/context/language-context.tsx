import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { useLocation } from 'wouter';
import enTranslations from '../locales/en.json';
import arTranslations from '../locales/ar.json';

export type Locale = 'ar' | 'en';

export interface LanguageContextType {
  locale: Locale;
  isRTL: boolean;
  t: (key: string, fallback?: string) => string;
  tObject: <T = unknown>(key: string, fallback?: T) => T;
  setLocale: (nextLocale: Locale) => void;
  toggleLocale: () => void;
  localizePath: (path: string) => string;
  getSwitchPath: (targetLocale: Locale) => string;
  dict: typeof enTranslations;
}

const STORAGE_KEY = 'locale';

const dictionaries: Record<Locale, typeof enTranslations> = {
  en: enTranslations,
  ar: arTranslations as unknown as typeof enTranslations,
};

function getInitialLocaleFromLocation(pathname: string): Locale | null {
  if (pathname === '/ar' || pathname.startsWith('/ar/')) {
    return 'ar';
  }
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    return 'en';
  }
  return null;
}

function getStoredOrBrowserLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'ar' || saved === 'en') {
      return saved;
    }
    const navLang = navigator.language?.toLowerCase() || '';
    if (navLang.startsWith('ar')) {
      return 'ar';
    }
  } catch {
    // ignore
  }
  return 'en';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();

  // 1. Initial determination based on URL or saved preference
  const [locale, setLocaleState] = useState<Locale>(() => {
    const fromUrl = getInitialLocaleFromLocation(location);
    if (fromUrl) return fromUrl;
    return getStoredOrBrowserLocale();
  });

  // Sync DOM immediately on locale change
  const applyDomLocale = useCallback((targetLocale: Locale) => {
    if (typeof document === 'undefined') return;
    document.documentElement.dir = targetLocale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = targetLocale;
    if (targetLocale === 'ar') {
      document.documentElement.classList.add('rtl');
      document.documentElement.classList.remove('ltr');
    } else {
      document.documentElement.classList.add('ltr');
      document.documentElement.classList.remove('rtl');
    }
  }, []);

  // Compute equivalent path preserving current route
  const getSwitchPath = useCallback(
    (targetLocale: Locale): string => {
      const currentPath = location || '/';
      let cleanPath = currentPath;

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

      const search = typeof window !== 'undefined' ? window.location.search : '';

      if (targetLocale === 'ar') {
        return (cleanPath === '/' ? '/ar' : `/ar${cleanPath}`) + search;
      } else {
        return cleanPath + search;
      }
    },
    [location],
  );

  const localizePath = useCallback(
    (path: string): string => {
      if (!path) return path;
      // Do not localize external links or anchors
      if (path.startsWith('http') || path.startsWith('mailto:') || path.startsWith('tel:') || path.startsWith('#')) {
        return path;
      }

      let clean = path;
      if (clean === '/ar' || clean === '/en') {
        clean = '/';
      } else if (clean.startsWith('/ar/')) {
        clean = clean.slice(3);
      } else if (clean.startsWith('/en/')) {
        clean = clean.slice(3);
      }

      if (!clean.startsWith('/')) {
        clean = `/${clean}`;
      }

      if (locale === 'ar') {
        return clean === '/' ? '/ar' : `/ar${clean}`;
      }
      return clean;
    },
    [locale],
  );

  // Set locale programmatically
  const setLocale = useCallback(
    (newLocale: Locale) => {
      setLocaleState(newLocale);
      try {
        localStorage.setItem(STORAGE_KEY, newLocale);
      } catch {}
      applyDomLocale(newLocale);
      const targetPath = getSwitchPath(newLocale);
      if (targetPath !== location) {
        setLocation(targetPath);
      }
    },
    [applyDomLocale, getSwitchPath, location, setLocation],
  );

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'ar' ? 'en' : 'ar');
  }, [locale, setLocale]);

  // Synchronize when location changes
  useEffect(() => {
    const fromUrl = getInitialLocaleFromLocation(location);
    if (fromUrl && fromUrl !== locale) {
      setLocaleState(fromUrl);
      try {
        localStorage.setItem(STORAGE_KEY, fromUrl);
      } catch {}
      applyDomLocale(fromUrl);
    } else if (!fromUrl) {
      const stored = getStoredOrBrowserLocale();
      // Smart default: If user preference or browser is Arabic and current path lacks /ar prefix
      if (stored === 'ar') {
        const clean = location === '/' ? '' : location;
        const target = `/ar${clean}`;
        if (target !== location) {
          setLocaleState('ar');
          applyDomLocale('ar');
          setLocation(target, { replace: true });
          return;
        }
      }
      // Apply current DOM attributes
      applyDomLocale(locale);
    }
  }, [location, locale, applyDomLocale, setLocation]);

  // Translation helper
  const dict = useMemo(() => dictionaries[locale], [locale]);

  const t = useCallback(
    (key: string, fallback?: string): string => {
      const parts = key.split('.');
      let current: any = dict;
      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          return fallback !== undefined ? fallback : key;
        }
      }
      return typeof current === 'string' ? current : (fallback ?? key);
    },
    [dict],
  );

  const tObject = useCallback(
    <T = unknown>(key: string, fallback?: T): T => {
      const parts = key.split('.');
      let current: any = dict;
      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          return fallback as T;
        }
      }
      return current as T;
    },
    [dict],
  );

  const value = useMemo<LanguageContextType>(
    () => ({
      locale,
      isRTL: locale === 'ar',
      t,
      tObject,
      setLocale,
      toggleLocale,
      localizePath,
      getSwitchPath,
      dict,
    }),
    [locale, t, tObject, setLocale, toggleLocale, localizePath, getSwitchPath, dict],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
