import { X, Globe, KeyRound, Cpu, Clock, Wifi, WifiOff, Radio, Bot, Calendar, Users, ListChecks } from "lucide-react";
import type { OpenClawNode, NodeStatus } from "../types/node";
import { formatUptime, formatDateTime } from "../utils/format";
import { StatCard, StatSection, ChannelBadge } from "./ui/StatCard";
import { useI18n } from "../i18n";

interface NodeDetailPanelProps {
  node: OpenClawNode;
  status?: NodeStatus;
  onClose: () => void;
}

export default function NodeDetailPanel({ node, status, onClose }: NodeDetailPanelProps) {
  const { t } = useI18n();

  return (
    <div
      className="w-[420px] shrink-0 border-l overflow-auto"
      style={{
        borderColor: "var(--border-default)",
        background: "var(--bg-surface)",
      }}
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t("detail.title")}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 transition-colors"
            style={{ color: "var(--text-tertiary)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--bg-muted)";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--text-tertiary)";
            }}
          >
            <X size={14} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <span className="text-xs font-medium" style={{ color: "var(--text-tertiary)" }}>{t("detail.name")}</span>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-primary)" }}>{node.name}</p>
          </div>
          <div>
            <span className="text-xs font-medium" style={{ color: "var(--text-tertiary)" }}>{t("detail.gatewayUrl")}</span>
            <p className="flex items-center gap-1.5 text-sm break-all mt-0.5" style={{ color: "var(--text-secondary)" }}>
              <Globe size={12} className="shrink-0" style={{ color: "var(--text-tertiary)" }} />
              {node.endpointUrl}
            </p>
          </div>
          <div>
            <span className="text-xs font-medium" style={{ color: "var(--text-tertiary)" }}>{t("detail.token")}</span>
            <p className="flex items-center gap-1.5 text-sm mt-0.5" style={{ color: "var(--text-tertiary)" }}>
              <KeyRound size={12} className="shrink-0" />
              {node.maskedToken}
            </p>
          </div>
          <div>
            <span className="text-xs font-medium" style={{ color: "var(--text-tertiary)" }}>{t("detail.createdAt")}</span>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{formatDateTime(node.createdAt)}</p>
          </div>
        </div>

        {status && (
          <div className="mt-5 pt-4" style={{ borderTop: "1px solid var(--border-default)" }}>
            <div className="flex items-center gap-2 mb-4">
              {status.online ? (
                <Wifi size={14} style={{ color: "var(--success)" }} />
              ) : (
                <WifiOff size={14} style={{ color: "var(--error)" }} />
              )}
              <span className={`text-xs font-medium`} style={{ color: status.online ? "var(--success)" : "var(--error)" }}>
                {status.online ? t("detail.online") : t("detail.offlineStatus")}
              </span>
              {status.latencyMs > 0 && (
                <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>{status.latencyMs}ms</span>
              )}
            </div>

            {status.online && status.gateway ? (
              <div className="space-y-3">
                {status.gateway.version && (
                  <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <Cpu size={12} style={{ color: "var(--text-tertiary)" }} />
                    {t("detail.version", { version: status.gateway.version })}
                  </div>
                )}
                {status.gateway.uptime != null && (
                  <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <Clock size={12} style={{ color: "var(--text-tertiary)" }} />
                    {t("detail.uptime", { uptime: formatUptime(status.gateway.uptime) })}
                  </div>
                )}
                {status.gateway.mode && (
                  <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                    {t("detail.mode", { mode: status.gateway.mode })}
                  </div>
                )}
                {(status.heartbeatSeconds != null || status.heartbeatInterval != null) && (
                  <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                    {t("detail.heartbeat", { seconds: status.heartbeatSeconds ?? (status.heartbeatInterval! / 1000) })}
                  </div>
                )}

                {status.channels.length > 0 && (
                  <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                    <div className="mb-2 flex items-center gap-1.5 text-xs" style={{ color: "var(--text-tertiary)" }}>
                      <Radio size={11} />
                      {t("detail.channels", { count: status.channels.length })}
                    </div>
                    <div className="space-y-1.5">
                      {status.channels.map((ch) => (
                        <div key={ch.name} className="flex items-center justify-between rounded-xl px-2.5 py-2" style={{ background: "var(--bg-muted)" }}>
                          <ChannelBadge name={ch.name} running={ch.running} configured={ch.configured} />
                          <div className="flex items-center gap-1.5">
                            {ch.configured === false && (
                              <span className="text-[10px]" style={{ color: "var(--warning)" }}>{t("detail.unconfigured")}</span>
                            )}
                            {ch.lastError && (
                              <span className="text-[10px] truncate max-w-[80px]" style={{ color: "var(--error)" }} title={ch.lastError}>
                                {ch.lastError}
                              </span>
                            )}
                            {ch.status && (
                              <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{ch.status}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {status.agents.length > 0 && (
                  <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                    <div className="mb-2 flex items-center gap-1.5 text-xs" style={{ color: "var(--text-tertiary)" }}>
                      <Bot size={11} />
                      {t("detail.agents", { count: status.agents.length })}
                    </div>
                    <div className="space-y-1.5">
                      {status.agents.map((agent, i) => (
                        <div key={agent.id ?? i} className="rounded-xl px-2.5 py-2" style={{ background: "var(--bg-muted)" }}>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{agent.name ?? agent.id ?? `Agent ${i + 1}`}</span>
                            {agent.status && (
                              <span className="text-[10px] font-medium" style={{ color: agent.status === "running" || agent.status === "active" ? "var(--success)" : "var(--text-tertiary)" }}>
                                {agent.status}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            {agent.model && (
                              <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{agent.model}</span>
                            )}
                            {agent.sessionsCount != null && (
                              <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{agent.sessionsCount} {t("detail.sessions").toLowerCase()}</span>
                            )}
                            {agent.heartbeatSeconds != null && (
                              <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>♥{agent.heartbeatSeconds}s</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {status.sessions && (status.sessions.active != null || status.sessions.total != null) && (
                  <StatSection title={t("detail.sessions")}>
                    {status.sessions.active != null && <StatCard label={t("detail.active")} value={status.sessions.active} />}
                    {status.sessions.total != null && <StatCard label={t("detail.total")} value={status.sessions.total} />}
                  </StatSection>
                )}

                {status.skills && (status.skills.enabled != null || status.skills.total != null) && (
                  <StatSection title={t("detail.skills")}>
                    {status.skills.enabled != null && <StatCard label={t("detail.enabled")} value={status.skills.enabled} />}
                    {status.skills.total != null && <StatCard label={t("detail.total")} value={status.skills.total} />}
                  </StatSection>
                )}

                {status.tasks && status.tasks.total != null && (
                  <StatSection title={t("detail.tasks")} icon={ListChecks}>
                    <StatCard label={t("detail.total")} value={status.tasks.total} />
                    {status.tasks.active != null && <StatCard label={t("detail.inProgress")} value={status.tasks.active} valueClassName="text-[var(--success)]" />}
                    <StatCard label={t("detail.succeeded")} value={status.tasks.succeeded ?? 0} valueClassName="text-[var(--success)]" />
                    {status.tasks.failed != null && status.tasks.failed > 0 && (
                      <StatCard label={t("detail.failed")} value={status.tasks.failed} valueClassName="text-[var(--error)]" />
                    )}
                    {status.tasks.pending != null && status.tasks.pending > 0 && (
                      <StatCard label={t("detail.pending")} value={status.tasks.pending} valueClassName="text-[var(--warning)]" />
                    )}
                  </StatSection>
                )}

                {status.cronJobs.length > 0 && (
                  <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                    <div className="mb-2 flex items-center gap-1.5 text-xs" style={{ color: "var(--text-tertiary)" }}>
                      <Calendar size={11} />
                      {t("detail.cronJobs", { count: status.cronJobs.length })}
                    </div>
                    <div className="space-y-1.5">
                      {status.cronJobs.map((job, i) => (
                        <div key={i} className="rounded-xl px-2.5 py-2" style={{ background: "var(--bg-muted)" }}>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{job.name ?? `Job ${i + 1}`}</span>
                            {job.enabled != null && (
                              <span className="text-[10px] font-medium" style={{ color: job.enabled ? "var(--success)" : "var(--text-tertiary)" }}>
                                {job.enabled ? t("detail.cronEnabled") : t("detail.cronDisabled")}
                              </span>
                            )}
                          </div>
                          {job.cron && (
                            <div className="text-[10px] font-mono mt-0.5" style={{ color: "var(--text-tertiary)" }}>{job.cron}</div>
                          )}
                          {job.nextRun && (
                            <div className="text-[10px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>{t("detail.nextRun", { time: formatDateTime(job.nextRun) })}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {status.presence.length > 0 && (
                  <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                    <div className="mb-2 flex items-center gap-1.5 text-xs" style={{ color: "var(--text-tertiary)" }}>
                      <Users size={11} />
                      {t("detail.onlineDevices", { count: status.presence.length })}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {status.presence.map((device, i) => (
                        <span key={i} className="inline-flex items-center gap-1 rounded-xl px-2 py-1 text-xs" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--accent)" }} />
                          {device.name ?? device.id ?? `Device ${i + 1}`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {((status.tokens && (status.tokens.activeConnections != null || status.tokens.deviceTokens != null)) ||
                  (status.nodes && (status.nodes.connected != null || status.nodes.paired != null))) && (
                  <StatSection title={t("detail.connectionsAndNodes")}>
                    {status.tokens?.activeConnections != null && <StatCard label={t("detail.activeConnections")} value={status.tokens.activeConnections} />}
                    {status.tokens?.deviceTokens != null && <StatCard label={t("detail.deviceTokens")} value={status.tokens.deviceTokens} />}
                    {status.nodes?.connected != null && <StatCard label={t("detail.connected")} value={status.nodes.connected} />}
                    {status.nodes?.paired != null && <StatCard label={t("detail.paired")} value={status.nodes.paired} />}
                  </StatSection>
                )}
              </div>
            ) : (
              <p className="text-xs" style={{ color: "var(--error)" }}>{status.error ?? t("detail.connectFailed")}</p>
            )}
          </div>
        )}

        {!status && (
          <div className="mt-5 pt-4" style={{ borderTop: "1px solid var(--border-default)" }}>
            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{t("detail.fetching")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
