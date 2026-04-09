# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- **Lobster Detail Panel** — Changed from flex-shrink side-by-side layout to overlay drawer (absolute positioned), card grid no longer compresses when detail is open
- **Detail Panel Responsiveness** — Panel width now uses `max-w-[420px]` with `w-full`, adapting to smaller screens; `h-full` prevents bottom whitespace on large screens; added left shadow for depth
- **Empty State Copy** — Replaced "开始监控你的 OpenClaw 网关" with "接入你的 OpenClaw"; removed "网关" jargon from step descriptions (zh/en/ja)
- **App Version** — Left sidebar version now reads dynamically from `tauri.conf.json` via `getVersion()` API instead of hardcoded string

### Added

- **Card Info Enhancement** — Sessions now shows `active/total`; Tasks shows `active 进行中` count when > 0; Latency gets a Wifi icon label
- **Detail Panel Fields** — Added `updatedAt` (shown only when different from `createdAt`); heartbeat now has Timer icon; latency displayed inline with online status

### Fixed

- Card grid shrinking when detail panel opens — panel now overlays instead of pushing content
- Hardcoded `v0.1.0` in sidebar footer — now auto-syncs with `tauri.conf.json` version

## [0.3.0] - 2026-04-09

### Added

- **9 AI Provider Support** — Added MiniMax, Kimi, Qwen, Doubao, GLM providers alongside existing OpenAI, Anthropic, Google AI, DeepSeek, Custom
- **Provider Brand Icons** — Integrated `@lobehub/icons` for authentic brand logos on each provider's key card
- **Ping Result Persistence** — Health ping results (`is_valid` + `last_tested`) are now written back to SQLite; card validity badge reflects real status after testing
- **i18n Provider Names** — All 9 providers have trilingual translations (zh/en/ja)
- **GitHub Actions CI** — Cross-platform build workflow for Windows (.msi/.exe) and macOS (.dmg) on tag push

### Changed

- **Claude-Inspired Design** — Complete UI redesign from dark cyberpunk to Claude's warm, elegant aesthetic:
  - Color system: slate dark → stone warm white, emerald → tawny orange (#c96442) accent
  - Rounded corners: `rounded-xl` (12px) → `rounded-2xl` (16px)
  - Cards: dark glass → white with subtle shadows and accent borders
  - Buttons: emerald solid → tawny orange
  - Scrollbars: slim 5px stone-tinted
  - Typography: slate-100/500/600 → stone-900/600/400
  - CSS custom properties for consistent theming across all components
- **Sidebar** — Simplified logo area with original vault door animation in warm tones
- **Search Bar** — Fixed width (w-52) instead of flex-1, no longer monopolizes header space
- **Provider Filters** — Flex-wrap layout with better spacing and accent-tinted selected state
- **Key Card** — Shows `createdAt` instead of `updatedAt`; ping/edit no longer change sort order
- **List Sorting** — Changed from `ORDER BY updated_at DESC` to `ORDER BY created_at DESC` — cards stay in creation order
- **Ping Side Effect** — `update_ping_result()` no longer updates `updated_at` column
- **Package Name** — Cargo package renamed from `tauri-app` to `xpouch-vault`, lib renamed to `xpouch_vault_lib`

### Fixed

- Ping result not persisted — `is_valid` was never written to DB, cards always showed "Untested" after refresh
- Card position jumping after ping/edit — `updated_at` was being updated, causing sort order changes

## [0.2.0] - 2026-04-09

### Added

- OpenClaw gateway node monitoring (Lobster page) — full implementation from placeholder to working feature
- Node CRUD: add, edit, delete gateway nodes with encrypted token storage
- WebSocket real-time status probe via OpenClaw WS-first protocol
- Node card component with online/offline indicator, channels, and task stats
- Node detail sidebar: gateway version, uptime, sessions, skills, connections, channels (running/configured/error), agents (name/model/sessions/heartbeat), cron jobs (name/schedule/enabled), presence devices, tasks, heartbeat
- AddNodeDialog with name/URL/token form and edit support
- 30-second auto-refresh for all node statuses
- `nodeStore` (Zustand) with CRUD actions + `refreshStatus` + `selectNode` + `setEditingNode`
- Rust backend: `openclaw_nodes` SQLite table, `node.rs` module with CRUD + decrypt
- Rust backend: `fetch_nodes_status` async Tauri command — concurrent WS probe for all nodes
- WS protocol implementation in `commands.rs`:
  - `sanitize_url()` — clean whitespace, zero-width chars, fullwidth punctuation
  - `http_to_ws()` — convert HTTP URL to WS URL with `/ws` path
  - `extract_origin()` — extract `scheme://host:port` for Origin header
  - `ws_probe_status()` — full WS handshake: connect → challenge → hello-ok → health → cron.list → status
  - `read_ws_response()` — match response by request ID, skip interleaved event pushes
- Fallback strategy: health failure falls back to hello-ok snapshot data, status failure uses empty object
- Node types: `OpenClawNode`, `NodeStatus`, `ChannelInfo`, `TasksInfo`, `GatewayInfo`, etc. with snake_case → camelCase mapping
- Key rename: edit dialog on KeyCard to change key name without re-creating
- Expanded node detail sidebar (w-[420px]) to show full channel/agent/cron/presence info
- Key card timestamp now shows hour and minute (was date-only)

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
