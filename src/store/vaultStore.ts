import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import type { VaultEntry, VaultFormData, KeyProvider } from "../types/vault";

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

  // Actions
  fetchEntries: () => Promise<void>;
  addEntry: (data: VaultFormData) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  updateEntry: (id: string, patch: { name?: string; category?: string }) => Promise<void>;
  selectEntry: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setFilterProvider: (provider: KeyProvider | "all") => void;
}

export const useVaultStore = create<VaultState>((set, get) => ({
  entries: [],
  selectedId: null,
  searchQuery: "",
  filterProvider: "all",
  loading: false,
  error: null,

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
}));
