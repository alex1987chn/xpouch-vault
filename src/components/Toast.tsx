import { useToastStore } from "../store/toastStore";

export default function Toast() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  const getStyle = (type: string) => {
    switch (type) {
      case "success":
        return { background: "var(--success)", color: "#fff" };
      case "error":
        return { background: "var(--error)", color: "#fff" };
      default:
        return { background: "var(--text-primary)", color: "var(--bg-base)" };
    }
  };

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => removeToast(t.id)}
          className="pointer-events-auto cursor-pointer rounded-xl px-4 py-2.5 text-sm font-medium shadow-lg transition-all hover:scale-105"
          style={getStyle(t.type)}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
