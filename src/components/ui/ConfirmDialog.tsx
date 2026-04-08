import { AlertTriangle } from "lucide-react";
import Dialog from "./Dialog";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  variant?: "danger" | "warning";
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "确认",
  variant = "danger",
}: ConfirmDialogProps) {
  const variantStyles = {
    danger: "bg-red-600 hover:bg-red-500",
    warning: "bg-yellow-600 hover:bg-yellow-500",
  };

  function handleConfirm() {
    onConfirm();
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <div className="flex flex-col items-center text-center">
        <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
          variant === "danger" ? "bg-red-500/10" : "bg-yellow-500/10"
        }`}>
          <AlertTriangle size={24} className={variant === "danger" ? "text-red-400" : "text-yellow-400"} />
        </div>
        <h3 className="text-lg font-semibold text-gray-100">{title}</h3>
        <p className="mt-2 text-sm text-gray-400">{description}</p>
      </div>
      <div className="mt-6 flex justify-center gap-3">
        <button
          onClick={onClose}
          className="rounded-lg px-4 py-2 text-sm text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-200"
        >
          取消
        </button>
        <button
          onClick={handleConfirm}
          className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${variantStyles[variant]}`}
        >
          {confirmLabel}
        </button>
      </div>
    </Dialog>
  );
}
