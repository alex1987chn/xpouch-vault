import type { LucideIcon } from "lucide-react";

interface ActionButtonProps {
  icon: LucideIcon;
  onClick: (e: React.MouseEvent) => void;
  title: string;
  disabled?: boolean;
  variant?: "default" | "danger" | "warning";
  loading?: boolean;
}

const variantStyles = {
  default: "text-gray-500 hover:bg-gray-700 hover:text-gray-300",
  danger: "text-gray-600 hover:bg-red-500/10 hover:text-red-400",
  warning: "text-gray-500 hover:bg-yellow-500/10 hover:text-yellow-400",
};

export default function ActionButton({ icon: Icon, onClick, title, disabled, variant = "default", loading }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg p-1.5 transition-all ${variantStyles[variant]} disabled:opacity-40 disabled:cursor-not-allowed`}
      title={title}
      disabled={disabled}
    >
      {loading ? <span className="inline-block h-[13px] w-[13px] animate-spin rounded-full border-2 border-current border-t-transparent" /> : <Icon size={13} />}
    </button>
  );
}
