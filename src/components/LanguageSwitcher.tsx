import { useI18n, type Locale } from "../i18n";
import { localeNames, localeFlags } from "../i18n/translations";
import { Globe } from "lucide-react";

const locales: Locale[] = ["zh", "en", "ja"];

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="flex items-center gap-1">
      <Globe size={11} style={{ color: "var(--text-tertiary)" }} className="shrink-0" />
      {locales.map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          className={`text-[10px] font-medium transition-all px-1.5 py-0.5 rounded-md ${
            locale === l ? "" : "hover:bg-[var(--bg-muted)]"
          }`}
          style={{
            color: locale === l ? "var(--accent)" : "var(--text-tertiary)",
            background: locale === l ? "var(--accent-light)" : undefined,
          }}
          title={localeNames[l]}
        >
          {localeFlags[l]}
        </button>
      ))}
    </div>
  );
}
