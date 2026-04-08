import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import type { VaultEntry, VaultFormData, KeyProvider } from "../types/vault";
import { useToastStore } from "./toastStore";

// ── Tauri Command 类型映射 ──

// Rust 返回的字段是 snake_case，需要转换为 camelCase
interface RawVaultEntry {
  id: string;
  provider: string;
  encrypted_key: string;
  masked_key: string;
  name: string;
  category: string;
  created_at: string;
  updated_at: string;
  last_tested: string | null;
  is_valid: boolean | null;
}

interface RawPingResult {
  success: boolean;
  latency_ms: number;
  message: string;
}

function toVaultEntry(raw: RawVaultEntry): VaultEntry {
  return {
    id: raw.id,
    provider: raw.provider as KeyProvider,
    encryptedKey: raw.encrypted_key,
    maskedKey: raw.masked_key,
    name: raw.name,
    category: raw.category,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    lastTested: raw.last_tested ?? undefined,
    isValid: raw.is_valid ?? undefined,
  };
}

// ── Store ──

interface VaultState {
  entries: VaultEntry[];
  selectedId: string | null;
  searchQuery: string;
  filterProvider: KeyProvider | "all";
  loading: boolean;
  error: string | null;
  // 正在 ping 的 entry id 集合
  pingingIds: Set<string>;
  // 已揭示明文的缓存 id -> plaintext
  revealedKeys: Record<string, string>;

  // Actions
  fetchEntries: () => Promise<void>;
  addEntry: (data: VaultFormData) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  updateEntry: (id: string, patch: { name?: string; category?: string }) => Promise<void>;
  selectEntry: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setFilterProvider: (provider: KeyProvider | "all") => void;
  revealKey: (id: string) => Promise<string>;
  copyKey: (id: string) => Promise<void>;
  pingKey: (id: string) => Promise<void>;
}

export const useVaultStore = create<VaultState>((set, get) => ({
  entries: [],
  selectedId: null,
  searchQuery: "",
  filterProvider: "all",
  loading: false,
  error: null,
  pingingIds: new Set(),
  revealedKeys: {},

  fetchEntries: async () => {
    set({ loading: true, error: null });
    try {
      const raw = await invoke<RawVaultEntry[]>("list_vault_entries");
      set({ entries: raw.map(toVaultEntry), loading: false });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  addEntry: async (data) => {
    set({ error: null });
    try {
      const raw = await invoke<RawVaultEntry>("add_api_key", {
        request: {
          provider: data.provider,
          api_key: data.apiKey,
          name: data.name,
          category: data.category,
        },
      });
      set((state) => ({
        entries: [...state.entries, toVaultEntry(raw)],
      }));
    } catch (e) {
      set({ error: String(e) });
    }
  },

  deleteEntry: async (id) => {
    set({ error: null });
    try {
      await invoke("delete_api_key", { id });
      set((state) => ({
        entries: state.entries.filter((e) => e.id !== id),
        selectedId: state.selectedId === id ? null : state.selectedId,
      }));
    } catch (e) {
      set({ error: String(e) });
    }
  },

  updateEntry: async (id, patch) => {
    set({ error: null });
    try {
      const raw = await invoke<RawVaultEntry>("update_api_key", {
        request: { id, ...patch },
      });
      set((state) => ({
        entries: state.entries.map((e) =>
          e.id === id ? toVaultEntry(raw) : e
        ),
      }));
    } catch (e) {
      set({ error: String(e) });
    }
  },

  selectEntry: (id) => set({ selectedId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterProvider: (provider) => set({ filterProvider: provider }),

  revealKey: async (id) => {
    const cached = get().revealedKeys[id];
    if (cached) return cached;

    const plaintext = await invoke<string>("reveal_api_key", { id });
    set((s) => ({
      revealedKeys: { ...s.revealedKeys, [id]: plaintext },
    }));
    return plaintext;
  },

  copyKey: async (id) => {
    const plaintext = await get().revealKey(id);
    await navigator.clipboard.writeText(plaintext);
    useToastStore.getState().addToast("已复制到剪贴板", "success");
  },

  pingKey: async (id) => {
    set((s) => ({
      pingingIds: new Set([...s.pingingIds, id]),
    }));

    try {
      const result = await invoke<RawPingResult>("ping_api_key", { id });
      useToastStore.getState().addToast(
        result.success ? `✅ ${result.message}` : `❌ ${result.message}`,
        result.success ? "success" : "error",
      );
    } catch (e) {
      useToastStore.getState().addToast(`❌ 探活失败: ${e}`, "error");
    } finally {
      set((s) => {
        const next = new Set(s.pingingIds);
        next.delete(id);
        return { pingingIds: next };
      });
    }
  },
}));
