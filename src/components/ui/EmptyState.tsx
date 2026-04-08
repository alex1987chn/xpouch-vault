import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title?: string;
  action?: { label: string; onClick: () => void };
  iconClassName?: string;
}

export default function EmptyState({ icon: Icon, title, action, iconClassName = "text-gray-700" }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Icon size={48} className={`mb-4 ${iconClassName}`} />
      {title && <p className="text-gray-500">{title}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-3 rounded-lg bg-gray-800 px-3 py-1.5 text-xs text-gray-300 transition-colors hover:bg-gray-700"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
