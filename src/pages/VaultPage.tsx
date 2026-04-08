import { useState, useMemo, useEffect } from "react";
import { KeyRound, Plus, Search, Filter, Loader2 } from "lucide-react";
import { useVaultStore } from "../store/vaultStore";
import { PROVIDER_LABELS, type KeyProvider } from "../types/vault";
import KeyCard from "../components/KeyCard";
import AddKeyDialog from "../components/AddKeyDialog";

const providerFilters: { value: KeyProvider | "all"; label: string }[] = [
  { value: "all", label: "全部" },
  ...((Object.keys(PROVIDER_LABELS) as KeyProvider[]).map((p) => ({
    value: p,
    label: PROVIDER_LABELS[p],
  }))),
];

export default function VaultPage() {
  const entries = useVaultStore((s) => s.entries);
  const loading = useVaultStore((s) => s.loading);
  const error = useVaultStore((s) => s.error);
  const selectedId = useVaultStore((s) => s.selectedId);
  const searchQuery = useVaultStore((s) => s.searchQuery);
  const filterProvider = useVaultStore((s) => s.filterProvider);
  const fetchEntries = useVaultStore((s) => s.fetchEntries);
  const selectEntry = useVaultStore((s) => s.selectEntry);
  const deleteEntry = useVaultStore((s) => s.deleteEntry);
  const setSearchQuery = useVaultStore((s) => s.setSearchQuery);
  const setFilterProvider = useVaultStore((s) => s.setFilterProvider);

  // 首次挂载时从后端加载数据
  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const filteredEntries = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return entries.filter((e) => {
      const matchProvider = filterProvider === "all" || e.provider === filterProvider;
      const matchSearch =
        !q ||
        e.name.toLowerCase().includes(q) ||
        e.provider.toLowerCase().includes(q) ||
        e.maskedKey.toLowerCase().includes(q);
      return matchProvider && matchSearch;
    });
  }, [entries, searchQuery, filterProvider]);

  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-gray-800 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-bold text-gray-100">
              <KeyRound className="text-cyan-400" size={28} />
              密钥库
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              管理你的 AI 服务 API Key，安全加密存储于本地
            </p>
          </div>
          <button
            onClick={() => setDialogOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-500"
          >
            <Plus size={16} />
            添加 Key
          </button>
        </div>

        {/* Filters */}
        <div className="mt-4 flex items-center gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-gray-800 bg-gray-900/50 px-3 py-2">
            <Search size={14} className="text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索名称、服务商或 Key..."
              className="flex-1 bg-transparent text-sm text-gray-200 placeholder-gray-600 outline-none"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Filter size={14} className="text-gray-500" />
            {providerFilters.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setFilterProvider(value)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  filterProvider === value
                    ? "bg-cyan-500/15 text-cyan-400"
                    : "text-gray-500 hover:bg-gray-800 hover:text-gray-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={32} className="mb-3 animate-spin text-cyan-400" />
            <p className="text-sm text-gray-500">加载中...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <KeyRound size={48} className="mb-4 text-red-500/50" />
            <p className="text-sm text-red-400">{error}</p>
            <button
              onClick={fetchEntries}
              className="mt-3 rounded-lg bg-gray-800 px-3 py-1.5 text-xs text-gray-300 transition-colors hover:bg-gray-700"
            >
              重试
            </button>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <KeyRound size={48} className="mb-4 text-gray-700" />
            <p className="text-gray-500">
              {searchQuery || filterProvider !== "all"
                ? "没有匹配的密钥"
                : "暂无密钥，点击上方按钮添加"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            {filteredEntries.map((entry) => (
              <KeyCard
                key={entry.id}
                entry={entry}
                isSelected={selectedId === entry.id}
                onSelect={() => selectEntry(entry.id)}
                onDelete={() => deleteEntry(entry.id)}
              />
            ))}
          </div>
        )}
      </div>

      <AddKeyDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}
