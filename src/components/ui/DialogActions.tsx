import { useI18n } from "../../i18n";

interface DialogActionsProps {
  onCancel: () => void;
  cancelLabel?: string;
  onConfirm?: () => void;
  confirmLabel?: string;
  confirmDisabled?: boolean;
  confirmVariant?: "primary" | "danger" | "warning";
  type?: "button" | "submit";
}

export default function DialogActions({
  onCancel,
  cancelLabel,
  onConfirm,
  confirmLabel,
  confirmDisabled = false,
  confirmVariant = "primary",
  type = "button",
}: DialogActionsProps) {
  const { t } = useI18n();

  const confirmBg = confirmVariant === "danger"
    ? "var(--error)"
    : confirmVariant === "warning"
    ? "var(--warning)"
    : "var(--accent)";

  const confirmHoverBg = confirmVariant === "danger"
    ? "#b91c1c"
    : confirmVariant === "warning"
    ? "#a16207"
    : "var(--accent-hover)";

  return (
    <div className="flex justify-end gap-3 pt-2">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
        style={{ color: "var(--text-secondary)", background: "var(--bg-muted)" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-muted)")}
      >
        {cancelLabel ?? t("common.cancel")}
      </button>
      <button
        type={type}
        onClick={onConfirm}
        disabled={confirmDisabled}
        className="rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40"
        style={{ background: confirmBg }}
        onMouseEnter={(e) => {
          if (!confirmDisabled) e.currentTarget.style.background = confirmHoverBg;
        }}
        onMouseLeave={(e) => (e.currentTarget.style.background = confirmBg)}
      >
        {confirmLabel ?? t("common.confirm")}
      </button>
    </div>
  );
}
