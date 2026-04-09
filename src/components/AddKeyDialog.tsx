import { useState } from "react";
import { useVaultStore } from "../store/vaultStore";
import {
  PROVIDER_LABELS,
  DEFAULT_CATEGORIES,
  type KeyProvider,
  type VaultFormData,
} from "../types/vault";
import Dialog from "./ui/Dialog";
import DialogActions from "./ui/DialogActions";
import { Input, Select } from "./ui/Form";
import { useI18n } from "../i18n";

interface AddKeyDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function AddKeyDialog({ open, onClose }: AddKeyDialogProps) {
  const { t } = useI18n();
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
    <Dialog open={open} onClose={onClose} title={t("addKey.title")}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label={t("addKey.providerLabel")}
          value={form.provider}
          onChange={(e) =>
            setForm((f) => ({ ...f, provider: e.target.value as KeyProvider }))
          }
          options={(Object.keys(PROVIDER_LABELS) as KeyProvider[]).map((p) => ({
            value: p,
            label: t(`provider.${p}`),
          }))}
        />

        <Input
          label={t("addKey.nameLabel")}
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder={t("addKey.namePlaceholder")}
        />

        <Input
          label={t("addKey.keyLabel")}
          required
          type="password"
          value={form.apiKey}
          onChange={(e) => setForm((f) => ({ ...f, apiKey: e.target.value }))}
          placeholder={t("addKey.keyPlaceholder")}
        />

        <Select
          label={t("addKey.categoryLabel")}
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          options={DEFAULT_CATEGORIES.map((c) => ({
            value: c,
            label: t(`category.${c === "生产环境" ? "production" : c === "开发测试" ? "development" : c === "个人项目" ? "personal" : "backup"}`),
          }))}
        />

        <DialogActions
          onCancel={onClose}
          confirmLabel={t("addKey.submit")}
          confirmDisabled={!canSubmit}
          type="submit"
        />
      </form>
    </Dialog>
  );
}
