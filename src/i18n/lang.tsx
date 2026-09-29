import { createContext, useContext, useEffect, useState } from 'react';
import { STRINGS, type Strings } from './strings';

export type Lang = 'es' | 'en';

const LANG_KEY = 'spi-asociados-lang';

function isLang(v: unknown): v is Lang {
  return v === 'es' || v === 'en';
}

/**
 * Initial language: `?lang=en` in the URL wins (so SPI can send an English
 * link), then the associate's last choice, then Spanish.
 */
function initialLang(): Lang {
  if (typeof window === 'undefined') return 'es';
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('lang');
    if (isLang(fromUrl)) return fromUrl;
    const stored = window.localStorage.getItem(LANG_KEY);
    if (isLang(stored)) return stored;
  } catch {
    // Storage blocked — fall through to the default.
  }
  return 'es';
}

type LangContextValue = { lang: Lang; setLang: (lang: Lang) => void; t: Strings };

const LangContext = createContext<LangContextValue>({
  lang: 'es',
  setLang: () => {},
  t: STRINGS.es,
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = STRINGS[lang].documentTitle;
    try {
      window.localStorage.setItem(LANG_KEY, lang);
    } catch {
      // Ignore — the choice just won't survive a reload.
    }
  }, [lang]);

  return (
    <LangContext.Provider value={{ lang, setLang, t: STRINGS[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang(): LangContextValue {
  return useContext(LangContext);
}
