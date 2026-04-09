import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { useNodeStore } from "../store/nodeStore";
import type { AddNodeFormData, OpenClawNode } from "../types/node";
import Dialog from "./ui/Dialog";
import DialogActions from "./ui/DialogActions";
import { Input } from "./ui/Form";
import { useI18n } from "../i18n";

interface AddNodeDialogProps {
  open: boolean;
  onClose: () => void;
  editingNode?: OpenClawNode | null;
  onSubmit?: (data: AddNodeFormData) => Promise<OpenClawNode | null | void>;
}

function getInitialForm(editingNode?: OpenClawNode | null): AddNodeFormData {
  if (editingNode) {
    return {
      name: editingNode.name,
      endpointUrl: editingNode.endpointUrl,
      token: "",
    };
  }
  return { name: "", endpointUrl: "", token: "" };
}

export default function AddNodeDialog({ open, onClose, editingNode, onSubmit }: AddNodeDialogProps) {
  const { t } = useI18n();
  const addNode = useNodeStore((s) => s.addNode);
  const updateNode = useNodeStore((s) => s.updateNode);
  const isEditing = editingNode != null;

  const [form, setForm] = useState<AddNodeFormData>(() => getInitialForm(editingNode));

  const canSubmit =
    form.name.trim().length > 0 &&
    form.endpointUrl.trim().length > 0 &&
    (isEditing || form.token.trim().length > 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    if (isEditing && editingNode) {
      updateNode({
        id: editingNode.id,
        name: form.name,
        endpointUrl: form.endpointUrl,
        token: form.token.trim() || undefined,
      });
    } else if (onSubmit) {
      await onSubmit(form);
    } else {
      addNode(form);
    }

    setForm({ name: "", endpointUrl: "", token: "" });
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} title={isEditing ? t("addNode.editTitle") : t("addNode.title")}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t("addNode.nameLabel")}
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder={t("addNode.namePlaceholder")}
        />

        <Input
          label={t("addNode.urlLabel")}
          required
          value={form.endpointUrl}
          onChange={(e) => setForm((f) => ({ ...f, endpointUrl: e.target.value }))}
          placeholder={t("addNode.urlPlaceholder")}
        />
        <div className="flex gap-2 -mt-2 px-0.5">
          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" style={{ color: "var(--accent)" }} />
          <p className="text-xs leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
            {t("addNode.urlTip")}
          </p>
        </div>

        <Input
          label={t("addNode.tokenLabel")}
          required={!isEditing}
          type="password"
          value={form.token}
          onChange={(e) => setForm((f) => ({ ...f, token: e.target.value }))}
          placeholder={t("addNode.tokenPlaceholder")}
        />

        <DialogActions
          onCancel={onClose}
          confirmLabel={isEditing ? t("addNode.update") : t("addNode.submit")}
          confirmDisabled={!canSubmit}
          type="submit"
        />
      </form>
    </Dialog>
  );
}
