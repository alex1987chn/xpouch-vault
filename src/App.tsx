import { NavLink, Outlet } from "react-router";
import { KeyRound, Shell } from "lucide-react";
import { getVersion } from "@tauri-apps/api/app";
import { useState, useEffect } from "react";
import Toast from "./components/Toast";
import VaultLogo from "./components/VaultLogo";
import LanguageSwitcher from "./components/LanguageSwitcher";
import { useI18n } from "./i18n";

const navKeys = [
  { to: "/", labelKey: "nav.vault" as const, icon: KeyRound, end: true },
  { to: "/lobster", labelKey: "nav.lobster" as const, icon: Shell, end: false },
];

export default function App() {
  const { t } = useI18n();
  const [appVersion, setAppVersion] = useState("");

  useEffect(() => {
    getVersion().then((v) => setAppVersion(v)).catch(() => setAppVersion(""));
  }, []);

  return (
    <div className="flex h-screen" style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>
      {/* Sidebar */}
      <aside className="flex w-60 flex-shrink-0 flex-col border-r" style={{ borderColor: "var(--border-default)", background: "var(--bg-surface)" }}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5">
          <VaultLogo />
          <div className="flex flex-col justify-center">
            <h1 className="text-sm font-bold leading-none flex items-center tracking-tight">
              <span style={{ color: "var(--text-tertiary)" }}>[</span>
              <span style={{ color: "var(--accent)" }}>X</span>
              <span style={{ color: "var(--text-primary)" }}>POUCH</span>
              <span style={{ color: "var(--text-tertiary)" }}>]</span>
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1 h-1 rounded-full animate-pulse" style={{ background: "var(--accent)" }} />
              <span className="font-mono text-[9px] tracking-widest" style={{ color: "var(--text-tertiary)" }}>
                VAULT
              </span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 px-3 py-2">
          {navKeys.map(({ to, labelKey, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "text-[var(--accent)]"
                    : "hover:bg-[var(--bg-muted)]",
                ].join(" ")
              }
              style={({ isActive }) => ({
                background: isActive ? "var(--accent-light)" : undefined,
              })}
            >
              <Icon size={18} />
              {t(labelKey)}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t px-5 py-3 flex items-center justify-between" style={{ borderColor: "var(--border-subtle)" }}>
          <p className="text-[10px] tracking-wide" style={{ color: "var(--text-tertiary)" }}>
            {appVersion ? `v${appVersion}` : ""}
          </p>
          <LanguageSwitcher />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>

      <Toast />
    </div>
  );
}
