import type { LucideIcon } from "lucide-react";

interface ActionButtonProps {
  icon: LucideIcon;
  onClick: (e: React.MouseEvent) => void;
  title: string;
  disabled?: boolean;
  variant?: "default" | "danger" | "warning";
  loading?: boolean;
}

export default function ActionButton({ icon: Icon, onClick, title, disabled, variant = "default", loading }: ActionButtonProps) {
  const getColor = () => {
    if (variant === "danger") return { color: "var(--text-tertiary)", hoverBg: "var(--error-light)", hoverColor: "var(--error)" };
    if (variant === "warning") return { color: "var(--text-tertiary)", hoverBg: "var(--warning-light)", hoverColor: "var(--warning)" };
    return { color: "var(--text-tertiary)", hoverBg: "var(--bg-muted)", hoverColor: "var(--text-secondary)" };
  };

  const colors = getColor();

  return (
    <button
      onClick={onClick}
      className="rounded-lg p-1.5 transition-all disabled:cursor-not-allowed disabled:opacity-40"
      style={{ color: colors.color }}
      title={title}
      disabled={disabled}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = colors.hoverBg;
          e.currentTarget.style.color = colors.hoverColor;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = colors.color;
      }}
    >
      {loading ? (
        <span className="inline-block h-[13px] w-[13px] animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <Icon size={13} />
      )}
    </button>
  );
}
