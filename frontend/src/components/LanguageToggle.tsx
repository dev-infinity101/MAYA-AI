import { useLanguage } from '../hooks/useLanguage';

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  const isHindi = lang === 'hi';

  return (
    <button
      onClick={() => setLang(isHindi ? 'en' : 'hi')}
      title={isHindi ? 'Switch to English' : 'हिंदी में बदलें'}
      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium border border-[rgba(196,97,10,0.15)] text-text-secondary hover:text-primary hover:border-primary/30 transition-colors select-none"
    >
      <span className={isHindi ? 'opacity-40' : 'text-primary font-semibold'}>EN</span>
      <span className="opacity-25 mx-0.5">|</span>
      <span className={isHindi ? 'text-primary font-semibold hindi-text' : 'opacity-40 hindi-text'}>हिं</span>
    </button>
  );
}
