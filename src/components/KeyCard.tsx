import { useState } from "react";
import type { VaultEntry, KeyProvider } from "../types/vault";
import { PROVIDER_LABELS, PROVIDER_COLORS } from "../types/vault";
import { useVaultStore } from "../store/vaultStore";
import { KeyRound, CheckCircle2, XCircle, HelpCircle, Copy, Eye, EyeOff, Zap, Trash2, Pencil } from "lucide-react";
import ActionButton from "./ui/ActionButton";
import ConfirmDialog from "./ui/ConfirmDialog";
import Dialog from "./ui/Dialog";

interface KeyCardProps {
  entry: VaultEntry;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function ValidityBadge({ isValid }: { isValid?: boolean }) {
  if (isValid === true) {
    return (
      <span className="flex items-center gap-1 text-xs text-emerald-400">
        <CheckCircle2 size={12} />
        有效
      </span>
    );
  }
  if (isValid === false) {
    return (
      <span className="flex items-center gap-1 text-xs text-red-400">
        <XCircle size={12} />
        失效
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs text-gray-500">
      <HelpCircle size={12} />
      未测试
    </span>
  );
}

const providerIcons: Record<KeyProvider, string> = {
  openai: "🟢",
  anthropic: "🟠",
  google: "🔵",
  deepseek: "🟣",
  custom: "⚪",
};

export default function KeyCard({ entry, isSelected, onSelect, onDelete }: KeyCardProps) {
  const [revealed, setRevealed] = useState(false);
  const [revealingKey, setRevealingKey] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");

  const revealedKeys = useVaultStore((s) => s.revealedKeys);
  const pingingIds = useVaultStore((s) => s.pingingIds);
  const revealKey = useVaultStore((s) => s.revealKey);
  const copyKey = useVaultStore((s) => s.copyKey);
  const pingKey = useVaultStore((s) => s.pingKey);
  const updateEntry = useVaultStore((s) => s.updateEntry);

  const isPinging = pingingIds.has(entry.id);
  const displayedKey = revealed ? (revealedKeys[entry.id] ?? entry.maskedKey) : entry.maskedKey;

  const handleToggleReveal = async () => {
    if (!revealed && !revealedKeys[entry.id]) {
      setRevealingKey(true);
      try {
        await revealKey(entry.id);
      } finally {
        setRevealingKey(false);
      }
    }
    setRevealed(!revealed);
  };

  return (
    <>
      <div
        onClick={onSelect}
        className={`group cursor-pointer rounded-xl border p-4 transition-all ${
          isSelected
            ? "border-cyan-500/40 bg-cyan-500/5 shadow-[0_0_0_1px_rgba(6,182,212,0.15)]"
            : "border-gray-800 bg-gray-900/40 hover:border-gray-700 hover:bg-gray-900/60"
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-800 text-sm">
              {providerIcons[entry.provider]}
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-100">{entry.name}</h3>
              <p className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className={PROVIDER_COLORS[entry.provider]}>
                  {PROVIDER_LABELS[entry.provider]}
                </span>
                <span>·</span>
                <KeyRound size={10} className="inline flex-shrink-0" />
                <span className="font-mono">{displayedKey}</span>
              </p>
            </div>
          </div>

          {/* 操作按钮组 */}
          <div className="flex items-center gap-0.5 opacity-0 transition-all group-hover:opacity-100">
            <ActionButton
              icon={Pencil}
              onClick={(e) => { e.stopPropagation(); setEditName(entry.name); setEditOpen(true); }}
              title="编辑名称"
            />
            <ActionButton
              icon={Copy}
              onClick={(e) => { e.stopPropagation(); copyKey(entry.id); }}
              title="复制密钥"
            />
            <ActionButton
              icon={revealed ? EyeOff : Eye}
              onClick={(e) => { e.stopPropagation(); handleToggleReveal(); }}
              title={revealed ? "隐藏密钥" : "显示密钥"}
              disabled={revealingKey}
              loading={revealingKey}
            />
            <ActionButton
              icon={Zap}
              onClick={(e) => { e.stopPropagation(); pingKey(entry.id); }}
              title="测试密钥"
              disabled={isPinging}
              loading={isPinging}
              variant="warning"
            />
            <ActionButton
              icon={Trash2}
              onClick={(e) => { e.stopPropagation(); setConfirmOpen(true); }}
              title="删除"
              variant="danger"
            />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-gray-800/60 pt-2">
          <div className="flex items-center gap-3">
            <span className="rounded-md bg-gray-800 px-2 py-0.5 text-[10px] text-gray-400">
              {entry.category}
            </span>
            <ValidityBadge isValid={entry.isValid} />
          </div>
          <span className="text-[10px] text-gray-600">
            {new Date(entry.updatedAt).toLocaleString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={onDelete}
        title="删除密钥"
        description={`确定要删除「${entry.name}」吗？此操作不可撤销。`}
        confirmLabel="删除"
      />

      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <h2 className="text-lg font-semibold text-gray-100">编辑名称</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const trimmed = editName.trim();
            if (trimmed && trimmed !== entry.name) {
              updateEntry(entry.id, { name: trimmed });
            }
            setEditOpen(false);
          }}
          className="mt-5 space-y-4"
        >
          <div>
            <label className="mb-1.5 block text-xs text-gray-400">名称</label>
            <input
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800/80 px-3 py-2 text-sm text-gray-200 outline-none transition-colors focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
              placeholder="输入新名称"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setEditOpen(false)}
              className="rounded-lg px-4 py-2 text-sm text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-200"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!editName.trim()}
              className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              保存
            </button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
