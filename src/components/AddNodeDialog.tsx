import { useState, useEffect } from "react";
import { useNodeStore } from "../store/nodeStore";
import type { AddNodeFormData, OpenClawNode } from "../types/node";
import Dialog from "./ui/Dialog";
import { Input } from "./ui/Form";

interface AddNodeDialogProps {
  open: boolean;
  onClose: () => void;
  editingNode?: OpenClawNode | null;
  onSubmit?: (data: AddNodeFormData) => Promise<OpenClawNode | null | void>;
}

export default function AddNodeDialog({ open, onClose, editingNode, onSubmit }: AddNodeDialogProps) {
  const addNode = useNodeStore((s) => s.addNode);
  const updateNode = useNodeStore((s) => s.updateNode);
  const isEditing = editingNode != null;

  const [form, setForm] = useState<AddNodeFormData>({
    name: "",
    endpointUrl: "",
    token: "",
  });

  // 编辑模式：填充现有数据
  useEffect(() => {
    if (editingNode) {
      setForm({
        name: editingNode.name,
        endpointUrl: editingNode.endpointUrl,
        token: "", // Token 不回填，用户不输入则不修改
      });
    } else {
      setForm({ name: "", endpointUrl: "", token: "" });
    }
  }, [editingNode, open]);

  const canSubmit =
    form.name.trim().length > 0 &&
    form.endpointUrl.trim().length > 0 &&
    (isEditing || form.token.trim().length > 0); // 编辑时 Token 可选

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    if (isEditing && editingNode) {
      updateNode({
        id: editingNode.id,
        name: form.name,
        endpointUrl: form.endpointUrl,
        token: form.token.trim() || undefined, // 空字符串不更新 Token
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
    <Dialog open={open} onClose={onClose}>
      <h2 className="text-lg font-semibold text-gray-100">
        {isEditing ? "编辑龙虾节点" : "添加龙虾节点"}
      </h2>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <Input
          label="节点名称"
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="例：生产服务器 A"
        />

        <Input
          label="网关 URL"
          required
          value={form.endpointUrl}
          onChange={(e) => setForm((f) => ({ ...f, endpointUrl: e.target.value }))}
          placeholder="http://124.223.x.x:18789/abc123"
        />

        <Input
          label="Gateway Token"
          required={!isEditing}
          type="password"
          value={form.token}
          onChange={(e) => setForm((f) => ({ ...f, token: e.target.value }))}
          placeholder={isEditing ? "留空则不修改 Token" : "eyJhbGciOi..."}
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
            {isEditing ? "保存" : "添加"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
