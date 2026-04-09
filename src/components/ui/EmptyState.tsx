import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title?: string;
  action?: { label: string; onClick: () => void };
  iconClassName?: string;
}

export default function EmptyState({ icon: Icon, title, action, iconClassName = "" }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <Icon size={48} className={`mb-4 ${iconClassName}`} style={{ color: "var(--text-tertiary)" }} />
      {title && <p style={{ color: "var(--text-tertiary)" }}>{title}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 rounded-xl px-4 py-2 text-sm font-medium transition-colors"
          style={{ background: "var(--bg-muted)", color: "var(--text-secondary)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-muted)")}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
