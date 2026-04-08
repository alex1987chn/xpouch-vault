import { useToastStore } from "../store/toastStore";

const typeStyles: Record<string, string> = {
  success: "bg-emerald-500/90 text-white",
  error: "bg-red-500/90 text-white",
  info: "bg-gray-700/90 text-gray-100",
};

export default function Toast() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => removeToast(t.id)}
          className={`pointer-events-auto animate-in fade-in slide-in-from-bottom-2 cursor-pointer rounded-lg px-4 py-2.5 text-sm font-medium shadow-lg transition-all hover:scale-105 ${typeStyles[t.type]}`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
