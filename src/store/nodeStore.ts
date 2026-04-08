import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import type { OpenClawNode, NodeStatus, AddNodeFormData, UpdateNodeFormData, RawOpenClawNode, RawNodeStatus } from "../types/node";

import { toOpenClawNode, toNodeStatus } from "../types/node";
import { useToastStore } from "./toastStore";

interface NodeState {
  nodes: OpenClawNode[];
  statuses: NodeStatus[];
  loading: boolean;
  refreshing: boolean;
  selectedNodeId: string | null;
  editingNode: OpenClawNode | null;
  error: string | null;

  fetchNodes: () => Promise<void>;
  refreshStatus: () => Promise<void>;
  addNode: (data: AddNodeFormData) => Promise<OpenClawNode | null>;
  updateNode: (data: UpdateNodeFormData) => Promise<void>;
  removeNode: (id: string) => Promise<void>;
  selectNode: (id: string | null) => void;
  setEditingNode: (node: OpenClawNode | null) => void;
}

export const useNodeStore = create<NodeState>((set, get) => ({
  nodes: [],
  statuses: [],
  loading: false,
  refreshing: false,
  selectedNodeId: null,
  editingNode: null,
  error: null,

  fetchNodes: async () => {
    set({ loading: true, error: null });
    try {
      const raw = await invoke<RawOpenClawNode[]>("list_nodes");
      set({ nodes: raw.map(toOpenClawNode), loading: false });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  refreshStatus: async () => {
    set({ refreshing: true });
    try {
      const raw = await invoke<RawNodeStatus[]>("fetch_nodes_status");
      const nodes = get().nodes;

      // 把 node_name 从 nodes 列表补上（Rust 侧返回空字符串）
      const statuses = raw.map((r) => {
        const mapped = toNodeStatus(r);
        if (!mapped.nodeName) {
          const node = nodes.find((n) => n.id === mapped.nodeId);
          mapped.nodeName = node?.name ?? "未知节点";
        }
        return mapped;
      });

      set({ statuses, refreshing: false });
    } catch (e) {
      useToastStore.getState().addToast(`刷新状态失败: ${e}`, "error");
      set({ refreshing: false });
    }
  },

  addNode: async (data) => {
    try {
      const raw = await invoke<RawOpenClawNode>("add_node", {
        request: {
          name: data.name,
          endpoint_url: data.endpointUrl,
          token: data.token,
        },
      });
      const node = toOpenClawNode(raw);
      set((s) => ({ nodes: [...s.nodes, node] }));
      useToastStore.getState().addToast(`节点「${data.name}」添加成功`, "success");
      return node;
    } catch (e) {
      useToastStore.getState().addToast(`添加失败: ${e}`, "error");
      return null;
    }
  },

  updateNode: async (data) => {
    try {
      const raw = await invoke<RawOpenClawNode>("update_node", {
        request: {
          id: data.id,
          name: data.name,
          endpoint_url: data.endpointUrl,
          token: data.token,
        },
      });
      const updated = toOpenClawNode(raw);
      set((s) => ({
        nodes: s.nodes.map((n) => (n.id === updated.id ? updated : n)),
        statuses: s.statuses.filter((st) => st.nodeId !== updated.id),
      }));
      useToastStore.getState().addToast(`节点「${updated.name}」已更新`, "success");
    } catch (e) {
      useToastStore.getState().addToast(`更新失败: ${e}`, "error");
    }
  },

  removeNode: async (id) => {
    try {
      await invoke("delete_node", { id });
      set((s) => ({
        nodes: s.nodes.filter((n) => n.id !== id),
        statuses: s.statuses.filter((st) => st.nodeId !== id),
        selectedNodeId: s.selectedNodeId === id ? null : s.selectedNodeId,
      }));
      useToastStore.getState().addToast("节点已删除", "info");
    } catch (e) {
      useToastStore.getState().addToast(`删除失败: ${e}`, "error");
    }
  },

  selectNode: (id) => {
    set({ selectedNodeId: id });
  },

  setEditingNode: (node) => {
    set({ editingNode: node });
  },
}));
