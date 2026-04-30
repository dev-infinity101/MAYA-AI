import { useState, useEffect, useCallback } from 'react';
import { type Lang, UI_STRINGS, type StringKey } from '../i18n/strings';

export type { Lang };

const STORAGE_KEY = 'maya_lang';
const CHANGE_EVENT = 'maya_lang_change';

export function useLanguage(): { lang: Lang; setLang: (l: Lang) => void; t: (key: StringKey) => string } {
  const [lang, setLangState] = useState<Lang>(
    () => (localStorage.getItem(STORAGE_KEY) as Lang) || 'en'
  );

  useEffect(() => {
    const handler = () => {
      setLangState((localStorage.getItem(STORAGE_KEY) as Lang) || 'en');
    };
    window.addEventListener(CHANGE_EVENT, handler);
    return () => window.removeEventListener(CHANGE_EVENT, handler);
  }, []);

  const setLang = useCallback((newLang: Lang) => {
    localStorage.setItem(STORAGE_KEY, newLang);
    setLangState(newLang);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  const t = useCallback(
    (key: StringKey) => UI_STRINGS[lang][key] as string,
    [lang]
  );

  return { lang, setLang, t };
}
