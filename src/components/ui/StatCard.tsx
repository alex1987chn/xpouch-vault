import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  valueClassName?: string;
}

export function StatCard({ label, value, valueClassName }: StatCardProps) {
  return (
    <div className="rounded-xl px-3 py-2" style={{ background: "var(--bg-muted)" }}>
      <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>{label}</div>
      <div className={`text-sm font-medium ${valueClassName ?? ""}`} style={{ color: valueClassName ? undefined : "var(--text-primary)" }}>
        {value}
      </div>
    </div>
  );
}

interface StatSectionProps {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
}

export function StatSection({ title, icon: Icon, children }: StatSectionProps) {
  return (
    <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
      {Icon ? (
        <div className="mb-2 flex items-center gap-1.5 text-xs" style={{ color: "var(--text-tertiary)" }}>
          <Icon size={11} />
          {title}
        </div>
      ) : (
        <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>{title}</span>
      )}
      <div className="mt-1 grid grid-cols-2 gap-2">
        {children}
      </div>
    </div>
  );
}

interface ChannelBadgeProps {
  name: string;
  running: boolean | null;
  configured: boolean | null;
  lastError?: string | null;
  status?: string | null;
}

export function ChannelBadge({ name, running, configured, lastError, status }: ChannelBadgeProps) {
  const isActive = running !== false;
  const isUnconfigured = configured === false;

  const getStyle = () => {
    if (isActive) return { background: "var(--success-light)", color: "var(--success)" };
    if (isUnconfigured) return { background: "var(--warning-light)", color: "var(--warning)" };
    return { background: "var(--bg-muted)", color: "var(--text-tertiary)" };
  };

  const dotColor = isActive ? "var(--success)" : isUnconfigured ? "var(--warning)" : "var(--text-tertiary)";

  return (
    <span className="inline-flex items-center gap-0.5 rounded-lg px-1.5 py-0.5 text-[10px] font-medium" style={getStyle()}>
      <span className="h-1 w-1 rounded-full" style={{ background: dotColor }} />
      {name}
      {lastError && (
        <span className="truncate max-w-[80px]" style={{ color: "var(--error)" }} title={lastError}>
          {lastError}
        </span>
      )}
      {status && (
        <span style={{ color: "var(--text-tertiary)" }}>{status}</span>
      )}
    </span>
  );
}
