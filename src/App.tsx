import { NavLink, Outlet } from "react-router";
import { KeyRound, Shell } from "lucide-react";
import Toast from "./components/Toast";

const navItems = [
  { to: "/", label: "密钥库", icon: KeyRound, end: true },
  { to: "/lobster", label: "龙虾监控", icon: Shell, end: false },
] as const;

export default function App() {
  return (
    <div className="flex h-screen bg-gray-950 text-gray-100">
      {/* Sidebar */}
      <aside className="flex w-56 flex-shrink-0 flex-col border-r border-gray-800 bg-gray-900">
        {/* Logo */}
        <div className="flex items-center gap-2 border-b border-gray-800 px-5 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
            <KeyRound size={18} />
          </div>
          <span className="text-sm font-bold tracking-wide text-cyan-400">
            XPouch Vault
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-cyan-500/10 text-cyan-400 shadow-[inset_0_0_0_1px_rgba(6,182,212,0.2)]"
                    : "text-gray-400 hover:bg-gray-800 hover:text-gray-200",
                ].join(" ")
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-800 px-5 py-3">
          <p className="text-[10px] tracking-widest text-gray-600 uppercase">
            v0.1.0
          </p>
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
