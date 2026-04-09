import { useState, useEffect, useMemo, useCallback } from "react";
import { Plus, RefreshCw, Loader2, Shell } from "lucide-react";
import { useNodeStore } from "../store/nodeStore";
import NodeCard from "../components/NodeCard";
import AddNodeDialog from "../components/AddNodeDialog";
import NodeDetailPanel from "../components/NodeDetailPanel";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import { useI18n } from "../i18n";

const REFRESH_INTERVAL_MS = 30_000;

export default function LobsterPage() {
  const { t } = useI18n();
  const nodes = useNodeStore((s) => s.nodes);
  const statuses = useNodeStore((s) => s.statuses);
  const loading = useNodeStore((s) => s.loading);
  const refreshing = useNodeStore((s) => s.refreshing);
  const selectedNodeId = useNodeStore((s) => s.selectedNodeId);
  const editingNode = useNodeStore((s) => s.editingNode);
  const fetchNodes = useNodeStore((s) => s.fetchNodes);
  const refreshStatus = useNodeStore((s) => s.refreshStatus);
  const addNode = useNodeStore((s) => s.addNode);
  const selectNode = useNodeStore((s) => s.selectNode);
  const setEditingNode = useNodeStore((s) => s.setEditingNode);

  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchNodes();
  }, [fetchNodes]);

  useEffect(() => {
    if (nodes.length > 0 && statuses.length === 0) {
      refreshStatus();
    }
  }, [nodes.length, statuses.length, refreshStatus]);

  useEffect(() => {
    if (nodes.length === 0) return;
    const timer = setInterval(() => { refreshStatus(); }, REFRESH_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [nodes.length, refreshStatus]);

  const handleRefresh = useCallback(() => { refreshStatus(); }, [refreshStatus]);

  const handleAddNode = useCallback(async (data: Parameters<typeof addNode>[0]) => {
    const node = await addNode(data);
    if (node) { refreshStatus(); }
  }, [addNode, refreshStatus]);

  const handleDialogClose = useCallback(() => {
    setDialogOpen(false);
    setEditingNode(null);
  }, [setEditingNode]);

  const nodeStatusMap = useMemo(() => {
    const map = new Map<string, typeof statuses[0]>();
    for (const s of statuses) { map.set(s.nodeId, s); }
    return map;
  }, [statuses]);

  const selectedNode = useMemo(() => nodes.find((n) => n.id === selectedNodeId), [nodes, selectedNodeId]);
  const selectedStatus = useMemo(() => selectedNodeId ? nodeStatusMap.get(selectedNodeId) : undefined, [selectedNodeId, nodeStatusMap]);
  const onlineCount = useMemo(() => statuses.filter((s) => s.online).length, [statuses]);

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        icon={Shell}
        title={t("lobster.title")}
        description={t("lobster.description")}
        action={
          <div className="flex items-center gap-3">
            {statuses.length > 0 && (
              <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>{t("lobster.online", { online: onlineCount, total: statuses.length })}</span>
            )}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50"
              style={{ background: "var(--bg-muted)", color: "var(--text-secondary)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-muted)")}
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              {t("lobster.refresh")}
            </button>
            <button
              onClick={() => { setEditingNode(null); setDialogOpen(true); }}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition-colors"
              style={{ background: "var(--accent)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
            >
              <Plus size={16} />
              {t("lobster.addNode")}
            </button>
          </div>
        }
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto p-8" style={{ background: "var(--bg-base)" }}>
          {loading ? (
            <EmptyState icon={Loader2} title={t("lobster.loading")} iconClassName="animate-spin" />
          ) : nodes.length === 0 ? (
            <EmptyState icon={Shell} title={t("lobster.empty")} />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {nodes.map((node) => (
                <NodeCard key={node.id} node={node} status={nodeStatusMap.get(node.id)} isSelected={selectedNodeId === node.id} onEdit={(n) => { setEditingNode(n); setDialogOpen(true); }} />
              ))}
            </div>
          )}
        </div>

        {selectedNode && (
          <NodeDetailPanel
            node={selectedNode}
            status={selectedStatus}
            onClose={() => selectNode(null)}
          />
        )}
      </div>

      <AddNodeDialog key={editingNode?.id ?? "new"} open={dialogOpen} onClose={handleDialogClose} editingNode={editingNode} onSubmit={handleAddNode} />
    </div>
  );
}
