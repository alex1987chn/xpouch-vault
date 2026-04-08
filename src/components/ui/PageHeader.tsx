import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  icon: LucideIcon;
  iconClassName?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function PageHeader({ icon: Icon, iconClassName = "text-cyan-400", title, description, action }: PageHeaderProps) {
  return (
    <div className="border-b border-gray-800 px-8 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-gray-100">
            <Icon className={iconClassName} size={28} />
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>
        {action}
      </div>
    </div>
  );
}
