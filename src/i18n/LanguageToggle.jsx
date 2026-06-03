import { useTranslation } from 'react-i18next';

export default function LanguageToggle({ className = "" }) {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const toggle = () => {
    const next = isAr ? 'en' : 'ar';
    i18n.changeLanguage(next);
    localStorage.setItem('creos_lang', next);
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = next;
  };

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold tracking-wider transition-all duration-300 ${className}`}
      style={{
        border: '0.5px solid rgba(212,175,55,0.4)',
        color: '#D4AF37',
        background: 'rgba(212,175,55,0.06)',
      }}
      title={isAr ? 'Switch to English' : 'التبديل للعربية'}
    >
      <span>{isAr ? '🇬🇧 EN' : '🇸🇦 ع'}</span>
    </button>
  );
}
