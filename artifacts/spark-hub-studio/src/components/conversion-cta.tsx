import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';

export function ConversionCta() {
  return (
    <section className="relative overflow-hidden border-t border-border/60 bg-background py-16 md:py-24 lg:py-28">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <div className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-br from-[#8f6217] via-[#b88628] to-[#e5b95c] p-8 sm:p-12 md:p-16 lg:p-20 shadow-[0_25px_60px_-15px_rgba(184,134,40,0.35)] border border-[#fff3d1]/30">
          {/* Concentric growth ripple rings radiating from right edge */}
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-full sm:w-[65%] md:w-[55%] lg:w-[48%] overflow-hidden select-none"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 800 500"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="xMaxYMid meet"
              className="h-full w-full overflow-visible"
            >
              <defs>
                <radialGradient
                  id="sparkCtaGlow"
                  cx="0"
                  cy="0"
                  r="1"
                  gradientUnits="userSpaceOnUse"
                  gradientTransform="translate(620 250) rotate(90) scale(240)"
                >
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
                  <stop offset="35%" stopColor="#ffffff" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Concentric layered rings matching the reference design in champagne light */}
              <circle cx="620" cy="250" r="420" fill="white" fillOpacity="0.04" />
              <circle cx="620" cy="250" r="350" fill="white" fillOpacity="0.07" />
              <circle cx="620" cy="250" r="280" fill="white" fillOpacity="0.11" />
              <circle cx="620" cy="250" r="215" fill="white" fillOpacity="0.17" />
              <circle cx="620" cy="250" r="155" fill="white" fillOpacity="0.25" />
              <circle cx="620" cy="250" r="105" fill="white" fillOpacity="0.38" />
              <circle cx="620" cy="250" r="60" fill="white" fillOpacity="0.65" />
              <circle cx="620" cy="250" r="28" fill="white" fillOpacity="0.95" />
              <circle cx="620" cy="250" r="250" fill="url(#sparkCtaGlow)" />
            </svg>
          </div>

          {/* Core glow bloom */}
          <div
            className="pointer-events-none absolute right-16 sm:right-24 md:right-28 lg:right-32 top-1/2 -translate-y-1/2 h-48 w-48 rounded-full bg-white/30 blur-3xl"
            aria-hidden="true"
          />

          {/* Foreground content with strong visual hierarchy */}
          <div className="relative z-10 max-w-2xl">
            <h2
              style={{ fontFamily: "'Tajawal', sans-serif" }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-black tracking-[-0.03em] text-[#0c121e] leading-[1.08]"
            >
              Ready to turn strategy into growth?
            </h2>

            <p
              style={{ fontFamily: "'Tajawal', sans-serif" }}
              className="mt-4 sm:mt-5 text-base sm:text-lg md:text-xl font-medium text-[#162133] leading-relaxed max-w-xl"
            >
              Let’s build your next growth move.
            </p>

            <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/contact"
                className="group inline-flex items-center gap-3.5 rounded-full bg-[#0c121e] px-7 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-bold text-white shadow-2xl transition-all duration-300 hover:bg-black hover:scale-[1.02] hover:shadow-[0_14px_40px_rgba(12,18,30,0.55)] border border-black/20 active:scale-[0.98]"
                data-testid="button-cta-conversation"
              >
                <span style={{ fontFamily: "'Tajawal', sans-serif" }}>
                  Start a Conversation
                </span>
                <span className="grid h-7 w-7 place-items-center rounded-full bg-white/15 transition-transform duration-300 group-hover:translate-x-1 group-hover:bg-white/25">
                  <ArrowRight size={15} className="text-white" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
