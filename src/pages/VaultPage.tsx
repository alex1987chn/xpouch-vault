import { useState, useMemo, useEffect } from "react";
import { KeyRound, Plus, Search, Loader2 } from "lucide-react";
import { useVaultStore } from "../store/vaultStore";
import { PROVIDER_LABELS, type KeyProvider } from "../types/vault";
import KeyCard from "../components/KeyCard";
import AddKeyDialog from "../components/AddKeyDialog";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import { useI18n } from "../i18n";

export default function VaultPage() {
  const { t } = useI18n();
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

  const providerFilters: { value: KeyProvider | "all"; label: string }[] = [
    { value: "all", label: t("vault.filterAll") },
    ...((Object.keys(PROVIDER_LABELS) as KeyProvider[]).map((p) => ({
      value: p,
      label: t(`provider.${p}`),
    }))),
  ];

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        icon={KeyRound}
        title={t("vault.title")}
        description={t("vault.description")}
        action={
          <button
            onClick={() => setDialogOpen(true)}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition-colors"
            style={{ background: "var(--accent)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
          >
            <Plus size={16} />
            {t("vault.addKey")}
          </button>
        }
      />

      {/* Filters */}
      <div className="border-b px-8 py-3" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
          <div
            className="flex w-52 items-center gap-2 rounded-xl border px-3 py-1.5"
            style={{
              borderColor: "var(--border-default)",
              background: "var(--bg-surface)",
            }}
          >
            <Search size={13} style={{ color: "var(--text-tertiary)" }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("vault.search")}
              className="flex-1 bg-transparent text-sm outline-none placeholder:opacity-50"
              style={{ color: "var(--text-primary)" }}
            />
          </div>
          <span style={{ color: "var(--border-default)" }}>|</span>
          {providerFilters.map(({ value, label }) => {
            const isActive = filterProvider === value;
            return (
              <button
                key={value}
                onClick={() => setFilterProvider(value)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  isActive ? "" : "hover:bg-[var(--bg-muted)]"
                }`}
                style={{
                  color: isActive ? "var(--accent)" : "var(--text-tertiary)",
                  background: isActive ? "var(--accent-light)" : undefined,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8" style={{ background: "var(--bg-base)" }}>
        {loading ? (
          <EmptyState
            icon={Loader2}
            title={t("vault.loading")}
            iconClassName="animate-spin"
          />
        ) : error ? (
          <EmptyState
            icon={KeyRound}
            title={error}
            iconClassName="opacity-30"
            action={{ label: t("vault.retry"), onClick: fetchEntries }}
          />
        ) : filteredEntries.length === 0 ? (
          <EmptyState
            icon={KeyRound}
            title={
              searchQuery || filterProvider !== "all"
                ? t("vault.noMatch")
                : t("vault.empty")
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
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
