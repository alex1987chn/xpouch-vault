import { AlertTriangle } from "lucide-react";
import Dialog from "./Dialog";
import { useI18n } from "../../i18n";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant = "danger",
}: ConfirmDialogProps) {
  const { t } = useI18n();

  const confirmBg = variant === "danger" ? "var(--error)" : "var(--warning)";
  const confirmHoverBg = variant === "danger" ? "#b91c1c" : "#a16207";
  const iconBg = variant === "danger" ? "var(--error-light)" : "var(--warning-light)";
  const iconColor = variant === "danger" ? "var(--error)" : "var(--warning)";

  function handleConfirm() {
    onConfirm();
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <div className="flex flex-col items-center text-center">
        <div
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-full"
          style={{ background: iconBg }}
        >
          <AlertTriangle size={24} style={{ color: iconColor }} />
        </div>
        <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>{title}</h3>
        <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>{description}</p>
      </div>
      <div className="mt-6 flex justify-center gap-3">
        <button
          onClick={onClose}
          className="rounded-xl px-4 py-2 text-sm font-medium transition-colors"
          style={{ color: "var(--text-secondary)", background: "var(--bg-muted)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-muted)")}
        >
          {cancelLabel ?? t("common.cancel")}
        </button>
        <button
          onClick={handleConfirm}
          className="rounded-xl px-4 py-2 text-sm font-medium text-white transition-colors"
          style={{ background: confirmBg }}
          onMouseEnter={(e) => (e.currentTarget.style.background = confirmHoverBg)}
          onMouseLeave={(e) => (e.currentTarget.style.background = confirmBg)}
        >
          {confirmLabel ?? t("common.confirm")}
        </button>
      </div>
    </Dialog>
  );
}
