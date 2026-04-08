export interface OpenClawNode {
  id: string;
  name: string;
  endpointUrl: string;
  encryptedToken: string;
  maskedToken: string;
  createdAt: string;
  updatedAt: string;
}

// ── 从 WebSocket health + cron.list + status 方法返回的结构 ──

export interface GatewayInfo {
  version: string | null;
  uptime: number | null;
  mode: string | null;
}

export interface SessionsInfo {
  active: number | null;
  total: number | null;
}

export interface SkillsInfo {
  enabled: number | null;
  total: number | null;
}

export interface TokensInfo {
  deviceTokens: number | null;
  activeConnections: number | null;
}

export interface NodesInfo {
  connected: number | null;
  paired: number | null;
}

export interface ChannelInfo {
  name: string;
  status: string | null;
  configured: boolean | null;
  running: boolean | null;
  lastError: string | null;
  probe: unknown | null;
}

export interface AgentInfo {
  id: string | null;
  name: string | null;
  model: string | null;
  status: string | null;
  heartbeatSeconds: number | null;
  sessionsCount: number | null;
  recentSessions: unknown[] | null;
  raw: unknown | null;
}

export interface CronJob {
  name: string | null;
  cron: string | null;
  enabled: boolean | null;
  nextRun: string | null;
  raw: unknown | null;
}

export interface PresenceDevice {
  id: string | null;
  name: string | null;
  raw: unknown | null;
}

export interface TasksInfo {
  total: number | null;
  active: number | null;
  succeeded: number | null;
  failed: number | null;
  pending: number | null;
}

export interface NodeStatus {
  nodeId: string;
  nodeName: string;
  endpointUrl: string;
  online: boolean;
  gateway: GatewayInfo | null;
  sessions: SessionsInfo | null;
  skills: SkillsInfo | null;
  tokens: TokensInfo | null;
  nodes: NodesInfo | null;
  channels: ChannelInfo[];
  agents: AgentInfo[];
  cronJobs: CronJob[];
  presence: PresenceDevice[];
  tasks: TasksInfo | null;
  heartbeatInterval: number | null;
  heartbeatSeconds: number | null;
  error: string | null;
  latencyMs: number;
}

export interface AddNodeFormData {
  name: string;
  endpointUrl: string;
  token: string;
}

export interface UpdateNodeFormData {
  id: string;
  name?: string;
  endpointUrl?: string;
  token?: string;
}

// ── Rust snake_case 原始类型 ──

export interface RawOpenClawNode {
  id: string;
  name: string;
  endpoint_url: string;
  encrypted_token: string;
  masked_token: string;
  created_at: string;
  updated_at: string;
}

export interface RawGatewayInfo {
  version: string | null;
  uptime: number | null;
  mode: string | null;
}

export interface RawSessionsInfo {
  active: number | null;
  total: number | null;
}

export interface RawSkillsInfo {
  enabled: number | null;
  total: number | null;
}

export interface RawTokensInfo {
  device_tokens: number | null;
  active_connections: number | null;
}

export interface RawNodesInfo {
  connected: number | null;
  paired: number | null;
}

export interface RawChannelInfo {
  name: string;
  status: string | null;
  configured: boolean | null;
  running: boolean | null;
  last_error: string | null;
  probe: unknown | null;
}

export interface RawAgentInfo {
  id: string | null;
  name: string | null;
  model: string | null;
  status: string | null;
  heartbeat_seconds: number | null;
  sessions_count: number | null;
  recent_sessions: unknown[] | null;
  raw: unknown | null;
}

export interface RawCronJob {
  name: string | null;
  cron: string | null;
  enabled: boolean | null;
  next_run: string | null;
  raw: unknown | null;
}

export interface RawPresenceDevice {
  id: string | null;
  name: string | null;
  raw: unknown | null;
}

export interface RawTasksInfo {
  total: number | null;
  active: number | null;
  succeeded: number | null;
  failed: number | null;
  pending: number | null;
}

export interface RawNodeStatus {
  node_id: string;
  node_name: string;
  endpoint_url: string;
  online: boolean;
  gateway: RawGatewayInfo | null;
  sessions: RawSessionsInfo | null;
  skills: RawSkillsInfo | null;
  tokens: RawTokensInfo | null;
  nodes: RawNodesInfo | null;
  channels: RawChannelInfo[];
  agents: RawAgentInfo[];
  cron_jobs: RawCronJob[];
  presence: RawPresenceDevice[];
  tasks: RawTasksInfo | null;
  heartbeat_interval: number | null;
  heartbeat_seconds: number | null;
  error: string | null;
  latency_ms: number;
}

export function toOpenClawNode(raw: RawOpenClawNode): OpenClawNode {
  return {
    id: raw.id,
    name: raw.name,
    endpointUrl: raw.endpoint_url,
    encryptedToken: raw.encrypted_token,
    maskedToken: raw.masked_token,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

export function toNodeStatus(raw: RawNodeStatus): NodeStatus {
  return {
    nodeId: raw.node_id,
    nodeName: raw.node_name,
    endpointUrl: raw.endpoint_url,
    online: raw.online,
    gateway: raw.gateway
      ? {
          version: raw.gateway.version,
          uptime: raw.gateway.uptime,
          mode: raw.gateway.mode,
        }
      : null,
    sessions: raw.sessions
      ? {
          active: raw.sessions.active,
          total: raw.sessions.total,
        }
      : null,
    skills: raw.skills
      ? {
          enabled: raw.skills.enabled,
          total: raw.skills.total,
        }
      : null,
    tokens: raw.tokens
      ? {
          deviceTokens: raw.tokens.device_tokens,
          activeConnections: raw.tokens.active_connections,
        }
      : null,
    nodes: raw.nodes
      ? {
          connected: raw.nodes.connected,
          paired: raw.nodes.paired,
        }
      : null,
    channels: raw.channels.map((ch) => ({
      name: ch.name,
      status: ch.status,
      configured: ch.configured,
      running: ch.running,
      lastError: ch.last_error,
      probe: ch.probe,
    })),
    agents: raw.agents.map((a) => ({
      id: a.id,
      name: a.name,
      model: a.model,
      status: a.status,
      heartbeatSeconds: a.heartbeat_seconds,
      sessionsCount: a.sessions_count,
      recentSessions: a.recent_sessions,
      raw: a.raw,
    })),
    cronJobs: raw.cron_jobs.map((j) => ({
      name: j.name,
      cron: j.cron,
      enabled: j.enabled,
      nextRun: j.next_run,
      raw: j.raw,
    })),
    presence: raw.presence.map((d) => ({
      id: d.id,
      name: d.name,
      raw: d.raw,
    })),
    tasks: raw.tasks
      ? {
          total: raw.tasks.total,
          active: raw.tasks.active,
          succeeded: raw.tasks.succeeded,
          failed: raw.tasks.failed,
          pending: raw.tasks.pending,
        }
      : null,
    heartbeatInterval: raw.heartbeat_interval,
    heartbeatSeconds: raw.heartbeat_seconds,
    error: raw.error,
    latencyMs: raw.latency_ms,
  };
}
