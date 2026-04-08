import { useState } from "react";
import { useVaultStore } from "../store/vaultStore";
import {
  PROVIDER_LABELS,
  DEFAULT_CATEGORIES,
  type KeyProvider,
  type VaultFormData,
} from "../types/vault";
import Dialog from "./ui/Dialog";
import { Input, Select } from "./ui/Form";

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

  const canSubmit = form.apiKey.trim().length > 0 && form.name.trim().length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    addEntry(form);
    setForm({ provider: "openai", apiKey: "", name: "", category: DEFAULT_CATEGORIES[1] });
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <h2 className="text-lg font-semibold text-gray-100">添加 API Key</h2>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <Select
          label="服务商"
          value={form.provider}
          onChange={(e) =>
            setForm((f) => ({ ...f, provider: e.target.value as KeyProvider }))
          }
          options={(Object.keys(PROVIDER_LABELS) as KeyProvider[]).map((p) => ({
            value: p,
            label: PROVIDER_LABELS[p],
          }))}
        />

        <Input
          label="名称"
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="例：GPT-4o 主力 Key"
        />

        <Input
          label="API Key"
          required
          type="password"
          value={form.apiKey}
          onChange={(e) => setForm((f) => ({ ...f, apiKey: e.target.value }))}
          placeholder="sk-..."
        />

        <Select
          label="分类"
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          options={DEFAULT_CATEGORIES.map((c) => ({ value: c, label: c }))}
        />

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
    </Dialog>
  );
}
