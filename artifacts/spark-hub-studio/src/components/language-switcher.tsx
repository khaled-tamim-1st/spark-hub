import { Globe } from 'lucide-react';
import { useLanguage } from '../context/language-context';

export function LanguageSwitcher({
  variant = 'segmented',
  className = '',
}: {
  variant?: 'segmented' | 'button';
  className?: string;
}) {
  const { locale, setLocale, toggleLocale } = useLanguage();

  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={toggleLocale}
        className={`group inline-flex items-center gap-2 rounded-full border border-primary/40 bg-card/40 px-3.5 py-1.5 text-xs font-semibold backdrop-blur-md transition-all duration-300 hover:border-primary hover:bg-card/70 hover:shadow-[0_0_15px_rgba(233,190,88,0.25)] ${className}`}
        aria-label={locale === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
        data-testid="button-language-toggle"
      >
        <Globe
          size={14}
          className="text-primary transition-transform duration-300 group-hover:rotate-45"
        />
        <span className="font-mono text-[11px] text-foreground transition-colors group-hover:text-primary">
          {locale === 'ar' ? 'English (EN)' : 'العربية (AR)'}
        </span>
      </button>
    );
  }

  return (
    <div
      className={`inline-flex items-center rounded-full border border-primary/30 bg-card/50 p-0.5 backdrop-blur-md shadow-[0_0_15px_rgba(233,190,88,0.08)] ${className}`}
      dir="ltr"
      role="group"
      aria-label="Language selector"
      data-testid="language-switcher"
    >
      <button
        type="button"
        onClick={() => setLocale('en')}
        className={`rounded-full px-2.5 py-1 text-[11px] font-bold font-mono transition-all duration-300 ${
          locale === 'en'
            ? 'bg-primary text-primary-foreground shadow-[0_0_12px_rgba(233,190,88,0.5)]'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        aria-label="Switch to English"
        data-testid="button-lang-en"
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLocale('ar')}
        className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition-all duration-300 ${
          locale === 'ar'
            ? 'bg-primary text-primary-foreground shadow-[0_0_12px_rgba(233,190,88,0.5)]'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        style={{ fontFamily: "'Alexandria', 'Tajawal', sans-serif" }}
        aria-label="التبديل إلى اللغة العربية"
        data-testid="button-lang-ar"
      >
        عربي
      </button>
    </div>
  );
}
