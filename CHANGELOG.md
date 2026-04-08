# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-04-09

### Added

- OpenClaw gateway node monitoring (Lobster page) — full implementation from placeholder to working feature
- Node CRUD: add, edit, delete gateway nodes with encrypted token storage
- WebSocket real-time status probe via OpenClaw WS-first protocol
- Node card component with online/offline indicator, channels, and task stats
- Node detail sidebar: gateway version, uptime, sessions, skills, connections, channels, tasks, heartbeat
- AddNodeDialog with name/URL/token form and edit support
- 30-second auto-refresh for all node statuses
- `nodeStore` (Zustand) with CRUD actions + `refreshStatus` + `selectNode` + `setEditingNode`
- Rust backend: `openclaw_nodes` SQLite table, `node.rs` module with CRUD + decrypt
- Rust backend: `fetch_nodes_status` async Tauri command — concurrent WS probe for all nodes
- WS protocol implementation in `commands.rs`:
  - `sanitize_url()` — clean whitespace, zero-width chars, fullwidth punctuation
  - `http_to_ws()` — convert HTTP URL to WS URL with `/ws` path
  - `extract_origin()` — extract `scheme://host:port` for Origin header
  - `ws_probe_status()` — full WS handshake: connect → challenge → hello-ok → health → status
  - `read_ws_response()` — match response by request ID, skip interleaved event pushes
- Fallback strategy: health failure falls back to hello-ok snapshot data, status failure uses empty object
- Node types: `OpenClawNode`, `NodeStatus`, `ChannelInfo`, `TasksInfo`, `GatewayInfo`, etc. with snake_case → camelCase mapping

### Changed

- Lobster page upgraded from placeholder to fully functional monitoring dashboard
- WS URL parsing now includes detailed error messages with actual URL values
- `WsError` struct now includes `code` field for better error diagnostics
- Sidebar layout in LobsterPage: node cards grid + detail sidebar

### Fixed

- WS URL missing `/ws` path caused `invalid uri character` error — `http_to_ws()` now appends `/ws`
- WS connection rejected with `CONTROL_UI_ORIGIN_NOT_ALLOWED` — added `Origin` header via `http::Request`
- WS connect request rejected with `INVALID_REQUEST` — changed `client.id` to `"openclaw-control-ui"`, `client.mode` to `"ui"`
- Health response parsing failed when interleaved with event pushes — `read_ws_response()` now matches by request ID
- URL with whitespace/fullwidth characters caused WS parse failure — `sanitize_url()` cleans all special chars

## [0.1.0] - 2026-04-08

### Added

- Core vault UI with dark theme sidebar layout
- Key card component with provider badge, validity indicator, and action buttons
- Add key dialog with provider/name/key/category form
- Provider filter tabs (OpenAI, Anthropic, Google AI, DeepSeek, Custom)
- Search functionality across key names
- Zustand store with CRUD actions connected to Tauri backend
- Rust backend with SQLite database (WAL mode)
- AES-256-GCM field-level encryption for API keys
- Machine-derived encryption key (hostname + username)
- Masked key display in UI (e.g., `sk-...7xYz`)
- Multi-provider support: OpenAI, Anthropic, Google AI, DeepSeek, Custom
- Category organization: production, dev/test, personal, backup
- Lazy loading for route pages
- HashRouter for Tauri webview compatibility
- Key reveal/hide toggle (Eye/EyeOff) with backend decryption
- Copy key to clipboard with toast notification
- Async health ping (Rust-side HTTP request) for OpenAI, Anthropic, Google, DeepSeek
- Toast notification system (success/error/info, auto-dismiss 3s)
- Lobster monitoring page (placeholder)
- Reusable UI component library:
  - `Dialog` — Modal shell with overlay and close button
  - `ConfirmDialog` — Confirmation dialog with danger/warning variants
  - `EmptyState` — Empty/loading/error state placeholder
  - `PageHeader` — Page title bar with icon, description, and action slot
  - `ActionButton` — Icon button with loading state and variants
  - `Form` — Styled Input and Select components

### Changed

- Delete confirmation changed from two-step click to ConfirmDialog modal
- CSP policy updated from `null` to explicit allowlist for localhost development
- Package name changed from `tauri-app` to `xpouch-vault`

### Removed

- Sandbox page removed (feature paused, no longer an independent module)
