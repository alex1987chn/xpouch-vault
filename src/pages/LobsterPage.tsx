import { useState, useEffect, useMemo, useCallback } from "react";
import { Plus, RefreshCw, Loader2, Shell, X, Globe, KeyRound, Cpu, Clock, Wifi, WifiOff, ListChecks, Radio, Bot, Calendar, Users } from "lucide-react";
import { useNodeStore } from "../store/nodeStore";
import NodeCard from "../components/NodeCard";
import AddNodeDialog from "../components/AddNodeDialog";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";

const REFRESH_INTERVAL_MS = 30_000;

function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}天 ${hours}时`;
  if (hours > 0) return `${hours}时 ${mins}分`;
  return `${mins}分`;
}

export default function LobsterPage() {
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

  useEffect(() => {
    if (editingNode) { setDialogOpen(true); }
  }, [editingNode]);

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
        iconClassName="text-cyan-400"
        title="龙虾监控"
        description="OpenClaw 节点状态大盘"
        action={
          <div className="flex items-center gap-2">
            {statuses.length > 0 && (
              <span className="text-xs text-gray-500">{onlineCount}/{statuses.length} 在线</span>
            )}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-700 disabled:opacity-50"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              刷新
            </button>
            <button
              onClick={() => { setEditingNode(null); setDialogOpen(true); }}
              className="flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-500"
            >
              <Plus size={16} />
              添加节点
            </button>
          </div>
        }
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto p-8">
          {loading ? (
            <EmptyState icon={Loader2} title="加载中..." iconClassName="text-cyan-400 animate-spin" />
          ) : nodes.length === 0 ? (
            <EmptyState icon={Loader2} title="暂无节点，点击上方按钮添加" />
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {nodes.map((node) => (
                <NodeCard key={node.id} node={node} status={nodeStatusMap.get(node.id)} isSelected={selectedNodeId === node.id} />
              ))}
            </div>
          )}
        </div>

        {/* 详情侧栏 */}
        {selectedNode && (
          <div className="w-[420px] shrink-0 border-l border-gray-800 bg-gray-900/60 overflow-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-100">节点详情</h3>
                <button onClick={() => selectNode(null)} className="rounded-lg p-1 text-gray-500 hover:bg-gray-800 hover:text-gray-300">
                  <X size={14} />
                </button>
              </div>

              {/* 基础信息 */}
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-gray-500">名称</span>
                  <p className="text-sm text-gray-200">{selectedNode.name}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">网关 URL</span>
                  <p className="flex items-center gap-1.5 text-sm text-gray-300 break-all">
                    <Globe size={12} className="shrink-0 text-gray-500" />
                    {selectedNode.endpointUrl}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Token</span>
                  <p className="flex items-center gap-1.5 text-sm text-gray-400">
                    <KeyRound size={12} className="shrink-0 text-gray-500" />
                    {selectedNode.maskedToken}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">创建时间</span>
                  <p className="text-xs text-gray-400">{new Date(selectedNode.createdAt).toLocaleString("zh-CN")}</p>
                </div>
              </div>

              {/* 实时状态 */}
              {selectedStatus && (
                <div className="mt-4 border-t border-gray-800 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    {selectedStatus.online ? (
                      <Wifi size={14} className="text-emerald-400" />
                    ) : (
                      <WifiOff size={14} className="text-red-400" />
                    )}
                    <span className={`text-xs font-medium ${selectedStatus.online ? "text-emerald-400" : "text-red-400"}`}>
                      {selectedStatus.online ? "在线" : "离线"}
                    </span>
                    {selectedStatus.latencyMs > 0 && (
                      <span className="text-xs text-gray-500">{selectedStatus.latencyMs}ms</span>
                    )}
                  </div>

                  {selectedStatus.online && selectedStatus.gateway ? (
                    <div className="space-y-3">
                      {/* Gateway 信息 */}
                      {selectedStatus.gateway.version && (
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Cpu size={12} className="text-gray-500" />
                          版本：v{selectedStatus.gateway.version}
                        </div>
                      )}
                      {selectedStatus.gateway.uptime != null && (
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Clock size={12} className="text-gray-500" />
                          运行时间：{formatUptime(selectedStatus.gateway.uptime)}
                        </div>
                      )}
                      {selectedStatus.gateway.mode && (
                        <div className="text-xs text-gray-500">
                          模式：{selectedStatus.gateway.mode}
                        </div>
                      )}
                      {(selectedStatus.heartbeatSeconds != null || selectedStatus.heartbeatInterval != null) && (
                        <div className="text-xs text-gray-500">
                          心跳：{selectedStatus.heartbeatSeconds ?? (selectedStatus.heartbeatInterval! / 1000)}s
                        </div>
                      )}

                      {/* 渠道 */}
                      {selectedStatus.channels.length > 0 && (
                        <div className="mt-2 border-t border-gray-800/60 pt-2">
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
                            <Radio size={11} />
                            渠道 ({selectedStatus.channels.length})
                          </div>
                          <div className="space-y-1">
                            {selectedStatus.channels.map((ch) => (
                              <div key={ch.name} className="flex items-center justify-between rounded bg-gray-800/60 px-2 py-1.5">
                                <div className="flex items-center gap-1.5">
                                  <span className={`h-1.5 w-1.5 rounded-full ${ch.running !== false ? "bg-emerald-400" : "bg-gray-500"}`} />
                                  <span className="text-xs text-gray-300">{ch.name}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  {ch.configured === false && (
                                    <span className="text-[10px] text-yellow-500">未配置</span>
                                  )}
                                  {ch.lastError && (
                                    <span className="text-[10px] text-red-400 truncate max-w-[80px]" title={ch.lastError}>
                                      {ch.lastError}
                                    </span>
                                  )}
                                  {ch.status && (
                                    <span className="text-[10px] text-gray-500">{ch.status}</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Agents */}
                      {selectedStatus.agents.length > 0 && (
                        <div className="mt-2 border-t border-gray-800/60 pt-2">
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
                            <Bot size={11} />
                            Agents ({selectedStatus.agents.length})
                          </div>
                          <div className="space-y-1">
                            {selectedStatus.agents.map((agent, i) => (
                              <div key={agent.id ?? i} className="rounded bg-gray-800/60 px-2 py-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-300">{agent.name ?? agent.id ?? `Agent ${i + 1}`}</span>
                                  {agent.status && (
                                    <span className={`text-[10px] ${agent.status === "running" || agent.status === "active" ? "text-emerald-400" : "text-gray-500"}`}>
                                      {agent.status}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 mt-0.5">
                                  {agent.model && (
                                    <span className="text-[10px] text-gray-500">{agent.model}</span>
                                  )}
                                  {agent.sessionsCount != null && (
                                    <span className="text-[10px] text-gray-500">{agent.sessionsCount} 会话</span>
                                  )}
                                  {agent.heartbeatSeconds != null && (
                                    <span className="text-[10px] text-gray-600">♥{agent.heartbeatSeconds}s</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 会话 */}
                      {selectedStatus.sessions && (selectedStatus.sessions.active != null || selectedStatus.sessions.total != null) && (
                        <div className="mt-2 border-t border-gray-800/60 pt-2">
                          <span className="text-xs text-gray-500">会话</span>
                          <div className="mt-1 grid grid-cols-2 gap-2">
                            {selectedStatus.sessions.active != null && (
                              <div className="rounded bg-gray-800/60 px-2 py-1.5">
                                <div className="text-xs text-gray-500">活跃</div>
                                <div className="text-sm font-medium text-gray-200">{selectedStatus.sessions.active}</div>
                              </div>
                            )}
                            {selectedStatus.sessions.total != null && (
                              <div className="rounded bg-gray-800/60 px-2 py-1.5">
                                <div className="text-xs text-gray-500">总计</div>
                                <div className="text-sm font-medium text-gray-200">{selectedStatus.sessions.total}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 技能 */}
                      {selectedStatus.skills && (selectedStatus.skills.enabled != null || selectedStatus.skills.total != null) && (
                        <div className="mt-2 border-t border-gray-800/60 pt-2">
                          <span className="text-xs text-gray-500">技能</span>
                          <div className="mt-1 grid grid-cols-2 gap-2">
                            {selectedStatus.skills.enabled != null && (
                              <div className="rounded bg-gray-800/60 px-2 py-1.5">
                                <div className="text-xs text-gray-500">已启用</div>
                                <div className="text-sm font-medium text-gray-200">{selectedStatus.skills.enabled}</div>
                              </div>
                            )}
                            {selectedStatus.skills.total != null && (
                              <div className="rounded bg-gray-800/60 px-2 py-1.5">
                                <div className="text-xs text-gray-500">总计</div>
                                <div className="text-sm font-medium text-gray-200">{selectedStatus.skills.total}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 任务统计 */}
                      {selectedStatus.tasks && selectedStatus.tasks.total != null && (
                        <div className="mt-2 border-t border-gray-800/60 pt-2">
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
                            <ListChecks size={11} />
                            任务
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="rounded bg-gray-800/60 px-2 py-1.5">
                              <div className="text-xs text-gray-500">总计</div>
                              <div className="text-sm font-medium text-gray-200">{selectedStatus.tasks.total}</div>
                            </div>
                            {selectedStatus.tasks.active != null && (
                              <div className="rounded bg-gray-800/60 px-2 py-1.5">
                                <div className="text-xs text-gray-500">进行中</div>
                                <div className="text-sm font-medium text-cyan-400">{selectedStatus.tasks.active}</div>
                              </div>
                            )}
                            <div className="rounded bg-gray-800/60 px-2 py-1.5">
                              <div className="text-xs text-gray-500">成功</div>
                              <div className="text-sm font-medium text-emerald-400">{selectedStatus.tasks.succeeded ?? 0}</div>
                            </div>
                            {selectedStatus.tasks.failed != null && selectedStatus.tasks.failed > 0 && (
                              <div className="rounded bg-gray-800/60 px-2 py-1.5">
                                <div className="text-xs text-gray-500">失败</div>
                                <div className="text-sm font-medium text-red-400">{selectedStatus.tasks.failed}</div>
                              </div>
                            )}
                            {selectedStatus.tasks.pending != null && selectedStatus.tasks.pending > 0 && (
                              <div className="rounded bg-gray-800/60 px-2 py-1.5">
                                <div className="text-xs text-gray-500">待处理</div>
                                <div className="text-sm font-medium text-yellow-400">{selectedStatus.tasks.pending}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 定时任务 */}
                      {selectedStatus.cronJobs.length > 0 && (
                        <div className="mt-2 border-t border-gray-800/60 pt-2">
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
                            <Calendar size={11} />
                            定时任务 ({selectedStatus.cronJobs.length})
                          </div>
                          <div className="space-y-1">
                            {selectedStatus.cronJobs.map((job, i) => (
                              <div key={i} className="rounded bg-gray-800/60 px-2 py-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-300">{job.name ?? `Job ${i + 1}`}</span>
                                  {job.enabled != null && (
                                    <span className={`text-[10px] ${job.enabled ? "text-emerald-400" : "text-gray-500"}`}>
                                      {job.enabled ? "启用" : "禁用"}
                                    </span>
                                  )}
                                </div>
                                {job.cron && (
                                  <div className="text-[10px] text-gray-500 font-mono mt-0.5">{job.cron}</div>
                                )}
                                {job.nextRun && (
                                  <div className="text-[10px] text-gray-600 mt-0.5">下次：{new Date(job.nextRun).toLocaleString("zh-CN")}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 在线设备 */}
                      {selectedStatus.presence.length > 0 && (
                        <div className="mt-2 border-t border-gray-800/60 pt-2">
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
                            <Users size={11} />
                            在线设备 ({selectedStatus.presence.length})
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedStatus.presence.map((device, i) => (
                              <span key={i} className="inline-flex items-center gap-1 rounded bg-blue-900/30 px-2 py-1 text-xs text-blue-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                                {device.name ?? device.id ?? `Device ${i + 1}`}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 连接 & 节点（次要信息，折叠展示） */}
                      {((selectedStatus.tokens && (selectedStatus.tokens.activeConnections != null || selectedStatus.tokens.deviceTokens != null)) ||
                        (selectedStatus.nodes && (selectedStatus.nodes.connected != null || selectedStatus.nodes.paired != null))) && (
                        <div className="mt-2 border-t border-gray-800/60 pt-2">
                          <span className="text-xs text-gray-500">连接 & 节点</span>
                          <div className="mt-1 grid grid-cols-2 gap-2">
                            {selectedStatus.tokens?.activeConnections != null && (
                              <div className="rounded bg-gray-800/60 px-2 py-1.5">
                                <div className="text-xs text-gray-500">活跃连接</div>
                                <div className="text-sm font-medium text-gray-200">{selectedStatus.tokens.activeConnections}</div>
                              </div>
                            )}
                            {selectedStatus.tokens?.deviceTokens != null && (
                              <div className="rounded bg-gray-800/60 px-2 py-1.5">
                                <div className="text-xs text-gray-500">设备令牌</div>
                                <div className="text-sm font-medium text-gray-200">{selectedStatus.tokens.deviceTokens}</div>
                              </div>
                            )}
                            {selectedStatus.nodes?.connected != null && (
                              <div className="rounded bg-gray-800/60 px-2 py-1.5">
                                <div className="text-xs text-gray-500">已连接</div>
                                <div className="text-sm font-medium text-gray-200">{selectedStatus.nodes.connected}</div>
                              </div>
                            )}
                            {selectedStatus.nodes?.paired != null && (
                              <div className="rounded bg-gray-800/60 px-2 py-1.5">
                                <div className="text-xs text-gray-500">已配对</div>
                                <div className="text-sm font-medium text-gray-200">{selectedStatus.nodes.paired}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-red-400">{selectedStatus.error ?? "连接失败"}</p>
                  )}
                </div>
              )}

              {!selectedStatus && (
                <div className="mt-4 border-t border-gray-800 pt-4">
                  <p className="text-xs text-gray-600">状态获取中...</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <AddNodeDialog open={dialogOpen} onClose={handleDialogClose} editingNode={editingNode} onSubmit={handleAddNode} />
    </div>
  );
}
