import { useTranslation } from 'react-i18next';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const current = i18n.language === 'en' ? 'en' : 'pl';

  const setLang = (lang: 'pl' | 'en') => {
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 2,
      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 8, padding: 3, flexShrink: 0,
    }}>
      {(['pl', 'en'] as const).map(lang => (
        <button
          key={lang}
          onClick={() => setLang(lang)}
          aria-pressed={current === lang}
          style={{
            padding: '5px 10px', borderRadius: 6, border: 'none',
            background: current === lang ? '#7dd3b0' : 'transparent',
            color: current === lang ? '#0f1923' : '#94a3b8',
            fontWeight: 700, fontSize: 12, cursor: 'pointer',
            fontFamily: 'inherit', transition: 'all 0.15s',
            letterSpacing: '0.02em',
          }}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
};
