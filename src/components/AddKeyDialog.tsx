import { useState } from "react";
import { X } from "lucide-react";
import { useVaultStore } from "../store/vaultStore";
import {
  PROVIDER_LABELS,
  DEFAULT_CATEGORIES,
  type KeyProvider,
  type VaultFormData,
} from "../types/vault";

interface AddKeyDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function AddKeyDialog({ open, onClose }: AddKeyDialogProps) {
  const addEntry = useVaultStore((s) => s.addEntry);
  const [form, setForm] = useState<VaultFormData>({
    provider: "openai",
    apiKey: "",
    name: "",
    category: DEFAULT_CATEGORIES[1],
  });

  if (!open) return null;

  const canSubmit = form.apiKey.trim().length > 0 && form.name.trim().length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    addEntry(form);
    setForm({ provider: "openai", apiKey: "", name: "", category: DEFAULT_CATEGORIES[1] });
    onClose();
  }

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-xl border border-gray-700 bg-gray-900 p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-100">添加 API Key</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-500 transition-colors hover:bg-gray-800 hover:text-gray-300"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Provider */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-400">
              服务商
            </label>
            <select
              value={form.provider}
              onChange={(e) =>
                setForm((f) => ({ ...f, provider: e.target.value as KeyProvider }))
              }
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 outline-none transition-colors focus:border-cyan-500/50"
            >
              {(Object.keys(PROVIDER_LABELS) as KeyProvider[]).map((p) => (
                <option key={p} value={p}>
                  {PROVIDER_LABELS[p]}
                </option>
              ))}
            </select>
          </div>

          {/* Name */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-400">
              名称 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="例：GPT-4o 主力 Key"
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 placeholder-gray-600 outline-none transition-colors focus:border-cyan-500/50"
            />
          </div>

          {/* API Key */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-400">
              API Key <span className="text-red-400">*</span>
            </label>
            <input
              type="password"
              value={form.apiKey}
              onChange={(e) => setForm((f) => ({ ...f, apiKey: e.target.value }))}
              placeholder="sk-..."
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 placeholder-gray-600 outline-none transition-colors focus:border-cyan-500/50"
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-400">
              分类
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 outline-none transition-colors focus:border-cyan-500/50"
            >
              {DEFAULT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-200"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              添加
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
