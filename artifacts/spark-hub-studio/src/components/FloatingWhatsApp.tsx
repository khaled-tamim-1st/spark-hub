import { useState } from 'react';
import { useLanguage } from '@/context/language-context';

export function FloatingWhatsApp() {
  const { locale, isRTL } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);

  const phoneNumber = '201559646676';
  const defaultMessage =
    locale === 'ar'
      ? 'مرحباً، أود الاستفسار عن خدمات واستشارات استوديو سبارك هب.'
      : 'Hello, I would like to inquire about Spark Hub Studio services.';

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    defaultMessage
  )}`;

  return (
    <div
      className={`fixed bottom-6 md:bottom-8 z-50 flex flex-col items-center select-none transition-all duration-300 ${
        isRTL ? 'left-6 md:left-8' : 'right-6 md:right-8'
      }`}
      style={{ pointerEvents: 'none' }}
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={locale === 'ar' ? 'تواصل معنا عبر واتساب' : 'Chat with us on WhatsApp'}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative flex flex-col items-center pointer-events-auto cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        {/* Outer Animated Golden Radar / Aura Waves */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Continuous Ambient Golden Halo */}
          <div
            className="absolute -inset-6 rounded-full bg-[radial-gradient(circle,rgba(233,190,88,0.35)_0%,rgba(214,164,77,0.15)_45%,transparent_70%)] animate-pulse"
            style={{ animationDuration: '3s' }}
          />

          {/* Concentric Golden Ripple 1 */}
          <div
            className="absolute h-20 w-20 md:h-24 md:w-24 rounded-full border border-[#e9be58]/60 animate-gold-wave-1"
          />

          {/* Concentric Golden Ripple 2 */}
          <div
            className="absolute h-20 w-20 md:h-24 md:w-24 rounded-full border border-[#e9be58]/50 animate-gold-wave-2"
          />

          {/* Concentric Golden Ripple 3 */}
          <div
            className="absolute h-20 w-20 md:h-24 md:w-24 rounded-full border border-[#c8963e]/40 animate-gold-wave-3"
          />

          {/* Concentric Static Outer Ambient Ring */}
          <div className="absolute h-24 w-24 md:h-28 md:w-28 rounded-full border border-primary/20 scale-100 opacity-60 transition-transform duration-500 group-hover:scale-110 group-hover:border-primary/40" />
        </div>

        {/* Central Luxury Golden Button */}
        <div
          className={`relative z-10 flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full shadow-[0_0_25px_rgba(233,190,88,0.5),0_8px_20px_rgba(0,0,0,0.6)] border-2 border-[#fff3b8]/60 transition-all duration-300 ${
            isHovered
              ? 'scale-110 shadow-[0_0_40px_rgba(233,190,88,0.8),0_10px_25px_rgba(0,0,0,0.8)] border-[#fff9d6]'
              : 'hover:scale-105'
          }`}
          style={{
            background:
              'radial-gradient(circle at 35% 30%, #fdf0cd 0%, #f3cb6d 25%, #d89932 60%, #a26b15 100%)',
          }}
        >
          {/* Subtle Metallic Inner Rim Highlight */}
          <div className="absolute inset-1 rounded-full border border-white/40 pointer-events-none opacity-80" />

          {/* Official Crisp Black WhatsApp Vector Icon */}
          <svg
            viewBox="0 0 24 24"
            width="28"
            height="28"
            className="relative z-10 text-[#0a0e17] transition-transform duration-300 group-hover:scale-105"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12.031 2c-5.508 0-9.986 4.478-9.986 9.986 0 1.761.458 3.479 1.328 5.003L2 22l5.176-1.357c1.47.801 3.125 1.229 4.855 1.229 5.508 0 9.986-4.478 9.986-9.986 0-5.508-4.478-9.986-9.986-9.986zm5.834 14.168c-.244.686-1.42 1.309-1.97 1.385-.512.071-1.18.102-1.905-.13-.44-.141-1.008-.334-1.74-.652-3.07-1.334-5.078-4.46-5.231-4.664-.153-.204-1.246-1.658-1.246-3.163 0-1.505.787-2.247 1.066-2.552.279-.305.61-.381.814-.381.203 0 .407.002.585.011.188.01.44-.071.687.523.254.61.864 2.108.939 2.261.076.153.127.33.025.534-.101.203-.152.33-.305.508-.152.178-.321.397-.458.533-.153.153-.313.32-.134.628.178.307.794 1.31 1.704 2.122 1.171 1.044 2.158 1.368 2.464 1.52.305.153.483.127.661-.076.178-.204.763-.889.966-1.194.203-.305.407-.254.686-.153.279.102 1.765.833 2.07 1.01.305.178.508.267.584.394.076.127.076.737-.168 1.423z" />
          </svg>
        </div>
      </a>
    </div>
  );
}
