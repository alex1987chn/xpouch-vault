import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  icon: LucideIcon;
  iconClassName?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function PageHeader({ icon: Icon, iconClassName, title, description, action }: PageHeaderProps) {
  return (
    <div className="border-b px-8 py-6" style={{ borderColor: "var(--border-default)", background: "var(--bg-surface)" }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            <Icon size={24} className={iconClassName} style={{ color: iconClassName ? undefined : "var(--accent)" }} />
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm" style={{ color: "var(--text-tertiary)" }}>{description}</p>
          )}
        </div>
        {action}
      </div>
    </div>
  );
}
