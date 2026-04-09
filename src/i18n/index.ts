import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getTranslation, type Locale, type TranslationKeys } from "./translations";

interface I18nState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set) => ({
      locale: "zh",
      setLocale: (locale) => set({ locale }),
    }),
    { name: "xpouch-vault-locale" }
  )
);

export function useI18n() {
  const locale = useI18nStore((s) => s.locale);
  const setLocale = useI18nStore((s) => s.setLocale);

  const t = (key: TranslationKeys, params?: Record<string, string | number>): string => {
    return getTranslation(locale, key, params);
  };

  return { locale, setLocale, t };
}

export type { Locale, TranslationKeys };
