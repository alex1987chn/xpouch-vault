import { useState } from "react";
import type { VaultEntry, KeyProvider } from "../types/vault";
import { PROVIDER_LABELS, PROVIDER_COLORS } from "../types/vault";
import { useVaultStore } from "../store/vaultStore";
import { KeyRound, CheckCircle2, XCircle, HelpCircle, Copy, Eye, EyeOff, Zap, Trash2, Pencil } from "lucide-react";
import OpenAI from "@lobehub/icons/es/OpenAI";
import Anthropic from "@lobehub/icons/es/Anthropic";
import Google from "@lobehub/icons/es/Google";
import DeepSeek from "@lobehub/icons/es/DeepSeek";
import Minimax from "@lobehub/icons/es/Minimax";
import Kimi from "@lobehub/icons/es/Kimi";
import Qwen from "@lobehub/icons/es/Qwen";
import Doubao from "@lobehub/icons/es/Doubao";
import ChatGLM from "@lobehub/icons/es/ChatGLM";
import ActionButton from "./ui/ActionButton";
import ConfirmDialog from "./ui/ConfirmDialog";
import Dialog from "./ui/Dialog";
import DialogActions from "./ui/DialogActions";
import { Input } from "./ui/Form";
import { formatDateTime } from "../utils/format";
import { useI18n } from "../i18n";

interface KeyCardProps {
  entry: VaultEntry;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function ValidityBadge({ isValid }: { isValid?: boolean }) {
  const { t } = useI18n();
  if (isValid === true) {
    return (
      <span className="flex items-center gap-1 text-xs" style={{ color: "var(--success)" }}>
        <CheckCircle2 size={12} />
        {t("key.valid")}
      </span>
    );
  }
  if (isValid === false) {
    return (
      <span className="flex items-center gap-1 text-xs" style={{ color: "var(--error)" }}>
        <XCircle size={12} />
        {t("key.invalid")}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-tertiary)" }}>
      <HelpCircle size={12} />
      {t("key.untested")}
    </span>
  );
}

function ProviderIcon({ provider }: { provider: KeyProvider }) {
  const size = 24;
  const iconProps = { size };

  switch (provider) {
    case "openai":
      return <OpenAI.Avatar {...iconProps} />;
    case "anthropic":
      return <Anthropic.Avatar {...iconProps} />;
    case "google":
      return <Google.Avatar {...iconProps} />;
    case "deepseek":
      return <DeepSeek.Avatar {...iconProps} />;
    case "minimax":
      return <Minimax.Avatar {...iconProps} />;
    case "kimi":
      return <Kimi.Avatar {...iconProps} />;
    case "qwen":
      return <Qwen.Avatar {...iconProps} />;
    case "doubao":
      return <Doubao.Avatar {...iconProps} />;
    case "glm":
      return <ChatGLM.Avatar {...iconProps} />;
    default:
      return (
        <div
          className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-medium"
          style={{ background: "var(--bg-muted)", color: "var(--text-tertiary)" }}
        >
          ?
        </div>
      );
  }
}

export default function KeyCard({ entry, isSelected, onSelect, onDelete }: KeyCardProps) {
  const { t } = useI18n();
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
        className={`group cursor-pointer rounded-2xl border p-5 transition-all ${
          isSelected ? "" : "hover:shadow-sm"
        }`}
        style={{
          background: "var(--bg-surface)",
          borderColor: isSelected ? "var(--accent)" : "var(--border-default)",
          boxShadow: isSelected
            ? "0 0 0 1px var(--accent), 0 1px 3px rgba(0,0,0,0.04)"
            : "0 1px 2px rgba(0,0,0,0.03)",
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <ProviderIcon provider={entry.provider} />
            <div>
              <h3 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {entry.name}
              </h3>
              <p className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-tertiary)" }}>
                <span className={PROVIDER_COLORS[entry.provider]}>
                  {PROVIDER_LABELS[entry.provider]}
                </span>
                <span>·</span>
                <KeyRound size={10} className="inline flex-shrink-0" />
                <span className="font-mono">{displayedKey}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-0.5 opacity-0 transition-all group-hover:opacity-100">
            <ActionButton
              icon={Pencil}
              onClick={(e) => { e.stopPropagation(); setEditName(entry.name); setEditOpen(true); }}
              title={t("key.editName")}
            />
            <ActionButton
              icon={Copy}
              onClick={(e) => { e.stopPropagation(); copyKey(entry.id); }}
              title={t("key.copyKey")}
            />
            <ActionButton
              icon={revealed ? EyeOff : Eye}
              onClick={(e) => { e.stopPropagation(); handleToggleReveal(); }}
              title={revealed ? t("key.hideKey") : t("key.showKey")}
              disabled={revealingKey}
              loading={revealingKey}
            />
            <ActionButton
              icon={Zap}
              onClick={(e) => { e.stopPropagation(); pingKey(entry.id); }}
              title={t("key.testKey")}
              disabled={isPinging}
              loading={isPinging}
              variant="warning"
            />
            <ActionButton
              icon={Trash2}
              onClick={(e) => { e.stopPropagation(); setConfirmOpen(true); }}
              title={t("key.delete")}
              variant="danger"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between pt-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <div className="flex items-center gap-3">
            <span
              className="rounded-md px-2 py-0.5 text-[10px] font-medium"
              style={{ background: "var(--bg-muted)", color: "var(--text-secondary)" }}
            >
              {entry.category}
            </span>
            <ValidityBadge isValid={entry.isValid} />
          </div>
          <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
            {formatDateTime(entry.createdAt)}
          </span>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={onDelete}
        title={t("key.deleteTitle")}
        description={t("key.deleteDesc", { name: entry.name })}
        confirmLabel={t("common.delete")}
      />

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} title={t("key.editTitle")}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const trimmed = editName.trim();
            if (trimmed && trimmed !== entry.name) {
              updateEntry(entry.id, { name: trimmed });
            }
            setEditOpen(false);
          }}
          className="space-y-4"
        >
          <Input
            label={t("key.nameLabel")}
            autoFocus
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder={t("key.namePlaceholder")}
          />
          <DialogActions
            onCancel={() => setEditOpen(false)}
            confirmLabel={t("key.save")}
            confirmDisabled={!editName.trim()}
            type="submit"
          />
        </form>
      </Dialog>
    </>
  );
}
