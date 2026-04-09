import type { OpenClawNode, NodeStatus } from "../types/node";
import { useNodeStore } from "../store/nodeStore";
import { Globe, Trash2, Pencil, ChevronRight, Clock, Cpu, Zap, Users, Activity, ListChecks, Bot, Calendar } from "lucide-react";
import ActionButton from "./ui/ActionButton";
import ConfirmDialog from "./ui/ConfirmDialog";
import { ChannelBadge } from "./ui/StatCard";
import { formatUptime } from "../utils/format";
import { useState } from "react";
import { useI18n } from "../i18n";

interface NodeCardProps {
  node: OpenClawNode;
  status?: NodeStatus;
  isSelected: boolean;
  onEdit?: (node: OpenClawNode) => void;
}

export default function NodeCard({ node, status, isSelected, onEdit }: NodeCardProps) {
  const { t } = useI18n();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const removeNode = useNodeStore((s) => s.removeNode);
  const selectNode = useNodeStore((s) => s.selectNode);

  const online = status?.online ?? false;
  const hasError = status?.error != null;
  const hasWsData = status?.gateway != null;

  const getBorderStyle = () => {
    if (isSelected) return "var(--accent)";
    if (online) return "var(--success)";
    if (hasError) return "var(--error)";
    return "var(--border-default)";
  };

  return (
    <>
      <div
        onClick={() => selectNode(node.id)}
        className="group cursor-pointer rounded-2xl border p-5 transition-all hover:shadow-sm"
        style={{
          background: "var(--bg-surface)",
          borderColor: getBorderStyle(),
          boxShadow: isSelected
            ? `0 0 0 1px ${getBorderStyle()}, 0 1px 3px rgba(0,0,0,0.04)`
            : "0 1px 2px rgba(0,0,0,0.03)",
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
              style={{ background: "var(--bg-muted)" }}
            >
              {online ? (
                <span className="relative flex h-3 w-3">
                  <span
                    className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                    style={{ background: "var(--success)" }}
                  />
                  <span className="relative inline-flex h-3 w-3 rounded-full" style={{ background: "var(--success)" }} />
                </span>
              ) : (
                <span className="inline-flex h-3 w-3 rounded-full" style={{ background: "var(--error)" }} />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{node.name}</h3>
              <p
                className="flex items-center gap-1 text-xs truncate"
                style={{ color: "var(--text-tertiary)" }}
                title={node.endpointUrl}
              >
                <Globe size={10} className="shrink-0" />
                <span className="truncate">{node.endpointUrl}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-0.5 opacity-0 transition-all group-hover:opacity-100 shrink-0 ml-2">
            <ActionButton
              icon={Pencil}
              onClick={(e) => { e.stopPropagation(); onEdit?.(node); }}
              title={t("node.editNode")}
            />
            <ActionButton
              icon={Trash2}
              onClick={(e) => { e.stopPropagation(); setConfirmOpen(true); }}
              title={t("node.deleteNode")}
              variant="danger"
            />
          </div>
        </div>

        {status && (
          <div className="mt-4 pt-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
            {online && hasWsData ? (
              <div className="grid grid-cols-2 gap-1.5">
                {status.gateway?.version && (
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <Cpu size={11} style={{ color: "var(--text-tertiary)" }} />
                    v{status.gateway.version}
                  </div>
                )}
                {status.gateway?.uptime != null && (
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <Clock size={11} style={{ color: "var(--text-tertiary)" }} />
                    {formatUptime(status.gateway.uptime)}
                  </div>
                )}
                {status.sessions?.active != null && (
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <Activity size={11} style={{ color: "var(--text-tertiary)" }} />
                    {t("node.sessions", { count: status.sessions.active })}
                  </div>
                )}
                {status.agents.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <Bot size={11} style={{ color: "var(--text-tertiary)" }} />
                    {status.agents.length} Agent{status.agents.length > 1 ? "s" : ""}
                  </div>
                )}
                {status.skills?.enabled != null && (
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <Zap size={11} style={{ color: "var(--text-tertiary)" }} />
                    {t("node.skills", { enabled: status.skills.enabled, total: status.skills.total ?? "?" })}
                  </div>
                )}
                {status.tokens?.activeConnections != null && (
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <Users size={11} style={{ color: "var(--text-tertiary)" }} />
                    {t("node.connections", { count: status.tokens.activeConnections })}
                  </div>
                )}
                {status.tasks && status.tasks.total != null && (
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <ListChecks size={11} style={{ color: "var(--text-tertiary)" }} />
                    {t("node.tasks", { succeeded: status.tasks.succeeded ?? 0, total: status.tasks.total })}
                  </div>
                )}
                {status.cronJobs.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <Calendar size={11} style={{ color: "var(--text-tertiary)" }} />
                    {t("node.cronJobs", { count: status.cronJobs.length })}
                  </div>
                )}
                {status.channels.length > 0 && (
                  <div className="col-span-2 flex flex-wrap gap-1 mt-0.5">
                    {status.channels.map((ch) => (
                      <ChannelBadge key={ch.name} name={ch.name} running={ch.running} configured={ch.configured} />
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-tertiary)" }}>
                  {status.latencyMs}ms
                </div>
              </div>
            ) : (
              <p className="text-xs" style={{ color: "var(--error)" }}>
                {status.error ?? t("node.offline")}
              </p>
            )}
          </div>
        )}

        {!status && (
          <div className="mt-4 pt-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{t("node.noStatus")}</p>
          </div>
        )}

        {isSelected && (
          <div className="mt-3 flex items-center justify-end">
            <span className="flex items-center gap-1 text-xs" style={{ color: "var(--accent)" }}>
              {t("node.viewDetail")} <ChevronRight size={12} />
            </span>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => removeNode(node.id)}
        title={t("node.deleteTitle")}
        description={t("node.deleteDesc", { name: node.name })}
        confirmLabel={t("common.delete")}
      />
    </>
  );
}
