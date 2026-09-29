import { useLang, type Lang } from '../i18n/lang';

const OPTIONS: Array<{ lang: Lang; short: string; name: string }> = [
  { lang: 'es', short: 'ES', name: 'Español' },
  { lang: 'en', short: 'EN', name: 'English' },
];

/** Two-button ES / EN toggle shown in the form header. */
export function LanguageSwitcher() {
  const { lang, setLang, t } = useLang();
  return (
    <div
      role="group"
      aria-label={t.languageLabel}
      className="inline-flex overflow-hidden rounded border border-border text-xs"
    >
      {OPTIONS.map((o) => {
        const active = o.lang === lang;
        return (
          <button
            key={o.lang}
            type="button"
            lang={o.lang}
            title={o.name}
            aria-pressed={active}
            onClick={() => setLang(o.lang)}
            className={`px-2 py-0.5 font-semibold transition ${
              active ? 'bg-primary text-white' : 'bg-white text-text-muted hover:text-primary'
            }`}
          >
            {o.short}
          </button>
        );
      })}
    </div>
  );
}
