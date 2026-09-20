import { Link } from 'wouter';
import { useLanguage } from '@/context/language-context';
import { Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';

export default function NotFound() {
  const { t, localizePath, isRTL } = useLanguage();

  return (
    <div className="grain min-h-[100dvh] flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-md border border-border bg-card/60 backdrop-blur-md p-8 text-center rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <p className="eyebrow text-primary inline-flex items-center gap-2">
          <Sparkles size={14} />
          404 // NOT FOUND
        </p>

        <h1 className="display mt-4 text-3xl font-extrabold text-foreground">
          {t('common.not_found_title', '404 — Page Not Found')}
        </h1>

        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          {t('common.not_found_desc', "The page you are looking for doesn't exist or has moved.")}
        </p>

        <div className="mt-8 flex justify-center">
          <Link
            href={localizePath('/')}
            className="btn-shimmer inline-flex items-center gap-2 border border-primary/80 bg-primary/10 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-primary transition-all duration-300 hover:bg-primary hover:text-primary-foreground"
            data-testid="link-notfound-home"
          >
            {isRTL ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
            {t('common.back_home', 'Back to studio')}
          </Link>
        </div>
      </div>
    </div>
  );
}
