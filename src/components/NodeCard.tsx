import type { OpenClawNode, NodeStatus } from "../types/node";
import { useNodeStore } from "../store/nodeStore";
import { Globe, Trash2, Pencil, ChevronRight, Clock, Cpu, Zap, Users, Activity, ListChecks, Bot, Calendar } from "lucide-react";
import ActionButton from "./ui/ActionButton";
import ConfirmDialog from "./ui/ConfirmDialog";
import { useState } from "react";

interface NodeCardProps {
  node: OpenClawNode;
  status?: NodeStatus;
  isSelected?: boolean;
}

function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}天 ${hours}时`;
  if (hours > 0) return `${hours}时 ${mins}分`;
  return `${mins}分`;
}

export default function NodeCard({ node, status, isSelected }: NodeCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const removeNode = useNodeStore((s) => s.removeNode);
  const selectNode = useNodeStore((s) => s.selectNode);
  const setEditingNode = useNodeStore((s) => s.setEditingNode);

  const online = status?.online ?? false;
  const hasError = status?.error != null;
  const hasWsData = status?.gateway != null;

  return (
    <>
      <div
        onClick={() => selectNode(node.id)}
        className={`group cursor-pointer rounded-xl border p-4 transition-all ${
          isSelected
            ? "border-cyan-500/50 bg-cyan-950/20 ring-1 ring-cyan-500/20"
            : online
            ? "border-emerald-500/30 bg-gray-900/40 hover:border-emerald-500/50"
            : hasError
            ? "border-red-500/30 bg-gray-900/40 hover:border-red-500/50"
            : "border-gray-800 bg-gray-900/40 hover:border-gray-700"
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {/* 状态灯 */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-800">
              {online ? (
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
                </span>
              ) : (
                <span className="inline-flex h-3 w-3 rounded-full bg-red-500" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-medium text-gray-100">{node.name}</h3>
              <p
                className="flex items-center gap-1 text-xs text-gray-500 truncate"
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
              onClick={(e) => { e.stopPropagation(); setEditingNode(node); }}
              title="编辑节点"
            />
            <ActionButton
              icon={Trash2}
              onClick={(e) => { e.stopPropagation(); setConfirmOpen(true); }}
              title="删除节点"
              variant="danger"
            />
          </div>
        </div>

        {/* 状态详情 */}
        {status && (
          <div className="mt-3 border-t border-gray-800/60 pt-2">
            {online && hasWsData ? (
              <div className="grid grid-cols-2 gap-1.5">
                {status.gateway?.version && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Cpu size={11} className="text-gray-500" />
                    v{status.gateway.version}
                  </div>
                )}
                {status.gateway?.uptime != null && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Clock size={11} className="text-gray-500" />
                    {formatUptime(status.gateway.uptime)}
                  </div>
                )}
                {status.sessions?.active != null && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Activity size={11} className="text-gray-500" />
                    {status.sessions.active} 会话
                  </div>
                )}
                {status.agents.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Bot size={11} className="text-gray-500" />
                    {status.agents.length} Agent{status.agents.length > 1 ? "s" : ""}
                  </div>
                )}
                {status.skills?.enabled != null && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Zap size={11} className="text-gray-500" />
                    {status.skills.enabled}/{status.skills.total ?? "?"} 技能
                  </div>
                )}
                {status.tokens?.activeConnections != null && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Users size={11} className="text-gray-500" />
                    {status.tokens.activeConnections} 连接
                  </div>
                )}
                {status.tasks && status.tasks.total != null && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <ListChecks size={11} className="text-gray-500" />
                    {status.tasks.succeeded ?? 0}/{status.tasks.total} 任务
                  </div>
                )}
                {status.cronJobs.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Calendar size={11} className="text-gray-500" />
                    {status.cronJobs.length} 定时任务
                  </div>
                )}
                {status.channels.length > 0 && (
                  <div className="col-span-2 flex flex-wrap gap-1 mt-0.5">
                    {status.channels.map((ch) => (
                      <span
                        key={ch.name}
                        className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] ${
                          ch.running !== false
                            ? "bg-emerald-900/30 text-emerald-400"
                            : ch.configured === false
                            ? "bg-yellow-900/30 text-yellow-500"
                            : "bg-gray-800 text-gray-500"
                        }`}
                      >
                        <span className={`h-1 w-1 rounded-full ${
                          ch.running !== false ? "bg-emerald-400" : ch.configured === false ? "bg-yellow-500" : "bg-gray-500"
                        }`} />
                        {ch.name}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  {status.latencyMs}ms
                </div>
              </div>
            ) : (
              <p className="text-xs text-red-400">
                {status.error ?? "离线"}
              </p>
            )}
          </div>
        )}

        {/* 无状态数据时显示 */}
        {!status && (
          <div className="mt-3 border-t border-gray-800/60 pt-2">
            <p className="text-xs text-gray-600">尚未获取状态</p>
          </div>
        )}

        {/* 选中提示 */}
        {isSelected && (
          <div className="mt-2 flex items-center justify-end">
            <span className="flex items-center gap-1 text-xs text-cyan-400">
              查看详情 <ChevronRight size={12} />
            </span>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => removeNode(node.id)}
        title="删除节点"
        description={`确定要删除「${node.name}」吗？此操作不可撤销。`}
        confirmLabel="删除"
      />
    </>
  );
}
