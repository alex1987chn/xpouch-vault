import type { VaultEntry, KeyProvider } from "../types/vault";
import { PROVIDER_LABELS, PROVIDER_COLORS } from "../types/vault";
import {
  KeyRound,
  Trash2,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from "lucide-react";

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
  return (
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
            <p className="text-xs text-gray-500">
              <span className={PROVIDER_COLORS[entry.provider]}>
                {PROVIDER_LABELS[entry.provider]}
              </span>
              {" · "}
              <KeyRound size={10} className="inline" /> {entry.maskedKey}
            </p>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="rounded-lg p-1.5 text-gray-600 opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-gray-800/60 pt-2">
        <div className="flex items-center gap-3">
          <span className="rounded-md bg-gray-800 px-2 py-0.5 text-[10px] text-gray-400">
            {entry.category}
          </span>
          <ValidityBadge isValid={entry.isValid} />
        </div>
        <span className="text-[10px] text-gray-600">
          {new Date(entry.updatedAt).toLocaleDateString("zh-CN")}
        </span>
      </div>
    </div>
  );
}
