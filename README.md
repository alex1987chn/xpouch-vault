# XPouch Vault

A secure, elegant desktop vault for managing AI API keys and monitoring OpenClaw gateway nodes. Built with Tauri 2.x, React 19, and Rust.

[**中文文档**](./README_zh.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Tauri](https://img.shields.io/badge/Tauri-2.x-24C8D8?logo=tauri)](https://v2.tauri.app)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev)
[![Rust](https://img.shields.io/badge/Rust-Stable-000000?logo=rust)](https://www.rust-lang.org)

<img src="https://github.com/user-attachments/assets/21eb77a8-c6f0-4270-b054-7d6558c46e4c" alt="XPouch Vault - Key Vault" width="900">
<img src="https://github.com/user-attachments/assets/fc80092f-1a80-4c32-a799-369902519460" alt="XPouch Vault - Lobster Monitor" width="900">

> **Design Philosophy** — Inspired by Claude's warm, minimal aesthetic: stone whites, tawny orange accents, generous spacing, and subtle shadows.

## Features

### Vault — API Key Management

- **AES-256-GCM Encryption** — API keys are encrypted at rest with field-level encryption; keys never touch the frontend in plaintext
- **9 AI Providers** — OpenAI, Anthropic, Google AI, DeepSeek, MiniMax, Kimi, Qwen, Doubao, GLM + custom
- **Brand Icons** — Authentic provider logos via `@lobehub/icons`
- **Health Ping** — Async key validation via Rust backend; results persisted to database
- **Validity Badge** — Cards show Valid / Invalid / Untested based on real ping results
- **Key Reveal & Copy** — Toggle masked/plaintext display; copy to clipboard with one click
- **Rename Keys** — Inline edit dialog to rename keys without re-creating
- **Categorized Management** — Organize keys by environment (production, dev/test, personal, backup)
- **Masked Display** — Keys shown as masked strings (e.g., `sk-...7xYz`) in the UI
- **i18n** — Trilingual support: Chinese, English, Japanese

### Lobster — OpenClaw Gateway Monitoring

- **WebSocket Real-time Monitoring** — Connects to OpenClaw gateways via WS protocol (health + status methods)
- **Node CRUD** — Add, edit, delete gateway nodes with encrypted token storage
- **Dashboard** — Online/offline status, gateway version, uptime, channels, agents, cron jobs, presence, sessions, skills, tasks, heartbeat
- **Auto Refresh** — 30-second interval auto-refresh for all node statuses
- **Detail Sidebar** — Full details: channels (running/error), agents (model/sessions), cron jobs, online devices

### Shared

- **Local-First** — All data stored in local SQLite (WAL mode); no cloud sync, no telemetry
- **Claude-Inspired UI** — Warm stone whites, tawny orange accent, generous spacing, subtle shadows
- **CSS Custom Properties** — Theming via `--accent`, `--bg-base`, `--text-primary`, etc.
- **Component Library** — Dialog, ConfirmDialog, EmptyState, PageHeader, ActionButton, Form, Toast, StatCard

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop Runtime | Tauri 2.x |
| Frontend | React 19 + TypeScript + TailwindCSS v4 |
| State Management | Zustand 5 |
| Icons | @lobehub/icons (brand) + Lucide (UI) |
| Backend | Rust (native Tauri commands) |
| Database | SQLite (via rusqlite, bundled) |
| Encryption | AES-256-GCM (field-level) |
| HTTP Client | reqwest 0.12 (async, for health ping) |
| WebSocket | tokio-tungstenite 0.26 (async, for OpenClaw monitoring) |
| i18n | Custom (zh/en/ja) |
| Build | Vite 8 + pnpm |
| CI | GitHub Actions (Windows + macOS) |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) 9+
- [Rust](https://www.rust-lang.org/tools/install) (stable)
- [Tauri CLI](https://v2.tauri.app/start/prerequisites/)

### Install Dependencies

```bash
pnpm install
```

### Development

```bash
pnpm tauri dev
```

This starts the Vite dev server on `http://localhost:1420` and launches the Tauri window.

### Build

```bash
pnpm tauri build
```

Produces platform-specific installers in `src-tauri/target/release/bundle/`:

| Platform | Output Formats |
|----------|---------------|
| Windows | `.msi`, `.exe` (NSIS) |
| macOS | `.dmg`, `.app` |
| Linux | `.deb`, `.AppImage` |

> **Note:** You must build on the target platform. Use GitHub Actions CI for cross-platform releases.

### Installation Notes

This app is **not code-signed** (no paid certificate). You may encounter OS warnings on first launch:

- **Windows**: SmartScreen may show "Windows protected your PC" — click **More info** → **Run anyway**
- **macOS**: You may see "cannot be opened because it is from an unidentified developer" — **right-click** the app → **Open**, or go to **System Settings → Privacy & Security → Open Anyway**

## Project Structure

```
xpouch-vault/
├── src/                      # Frontend (React + TypeScript)
│   ├── components/           # Business components
│   │   ├── KeyCard.tsx       # Key card (copy/reveal/ping/edit/delete)
│   │   ├── AddKeyDialog.tsx  # Add key dialog
│   │   ├── NodeCard.tsx      # Node card (online status/channels/tasks)
│   │   ├── AddNodeDialog.tsx # Add/edit node dialog
│   │   ├── NodeDetailPanel.tsx # Node detail sidebar
│   │   ├── VaultLogo.tsx     # Animated vault door logo
│   │   ├── LanguageSwitcher.tsx # zh/en/ja switcher
│   │   ├── Toast.tsx         # Global toast notifications
│   │   └── ui/               # Reusable UI primitives
│   │       ├── Dialog.tsx    # Modal shell
│   │       ├── ConfirmDialog.tsx
│   │       ├── EmptyState.tsx
│   │       ├── PageHeader.tsx
│   │       ├── ActionButton.tsx
│   │       ├── DialogActions.tsx
│   │       ├── Form.tsx      # Input + Select
│   │       └── StatCard.tsx  # StatCard + StatSection + ChannelBadge
│   ├── pages/                # Route pages
│   │   ├── VaultPage.tsx     # Vault (home)
│   │   └── LobsterPage.tsx   # Lobster monitoring
│   ├── store/                # Zustand stores
│   │   ├── vaultStore.ts     # Vault state + actions
│   │   ├── nodeStore.ts      # Node monitoring state + actions
│   │   └── toastStore.ts     # Toast state
│   ├── types/                # TypeScript type definitions
│   │   ├── vault.ts          # VaultEntry, KeyProvider, PROVIDER_LABELS/COLORS
│   │   └── node.ts           # OpenClawNode, NodeStatus, ChannelInfo, TasksInfo
│   ├── i18n/                 # Internationalization
│   │   ├── index.ts          # useI18n hook
│   │   └── translations.ts   # zh/en/ja translation table
│   ├── utils/                # Utility functions
│   │   └── format.ts         # formatDateTime, formatUptime
│   ├── App.tsx               # Root layout + sidebar
│   └── main.tsx              # Entry point (HashRouter)
├── src-tauri/                # Backend (Rust)
│   ├── src/
│   │   ├── commands.rs       # Tauri commands (Vault CRUD + ping + Node CRUD + WS probe)
│   │   ├── node.rs           # Node data model + CRUD + decrypt token
│   │   ├── crypto.rs         # AES-256-GCM encrypt/decrypt
│   │   ├── db.rs             # SQLite schema + vault queries
│   │   ├── lib.rs            # Module registration + setup
│   │   └── main.rs           # Entry point
│   ├── Cargo.toml
│   └── tauri.conf.json
├── .github/
│   └── workflows/
│       └── build.yml         # CI: cross-platform build + release
└── package.json
```

## Design System

### Color Tokens (CSS Custom Properties)

```css
--bg-base: #faf9f7;        /* stone-50 warm white */
--bg-surface: #ffffff;      /* pure white cards */
--bg-muted: #f5f4f0;       /* stone-100 subtle bg */
--border-default: #e7e5e0; /* stone-200 */
--text-primary: #1c1917;   /* stone-900 */
--text-secondary: #57534e; /* stone-600 */
--text-tertiary: #a8a29e;  /* stone-400 */
--accent: #c96442;         /* tawny orange */
--accent-light: #fef3ee;   /* accent bg tint */
--success: #16a34a;
--error: #dc2626;
--warning: #ca8a04;
```

### Provider Ping Endpoints

| Provider | Method | Endpoint | Auth |
|----------|--------|----------|------|
| OpenAI | GET | `api.openai.com/v1/models` | `Bearer {key}` |
| Anthropic | GET | `api.anthropic.com/v1/models` | `x-api-key` + `anthropic-version: 2023-06-01` |
| Google AI | GET | `generativelanguage.googleapis.com/v1beta/models?key={key}` | Query param |
| DeepSeek | GET | `api.deepseek.com/v1/models` | `Bearer {key}` |
| MiniMax | POST | `api.minimaxi.com/v1/chat/completions` | `Bearer {key}` (min chat) |
| Kimi | GET | `api.moonshot.cn/v1/models` | `Bearer {key}` |
| Qwen | GET | `dashscope.aliyuncs.com/compatible-mode/v1/models` | `Bearer {key}` |
| Doubao | POST | `ark.cn-beijing.volces.com/api/v3/chat/completions` | `Bearer {key}` (min chat) |
| GLM | GET | `open.bigmodel.cn/api/paas/v4/models` | `Bearer {key}` |

> **Note:** Some providers (MiniMax, Doubao) don't support the standard `/v1/models` endpoint. For these, the ping sends a minimal `POST /chat/completions` request with `max_tokens: 1` — any non-401/403 response means the key is authenticated. This consumes at most 1 token per ping.

## Security Architecture

```
[User Input] → Frontend (plaintext in memory only)
       ↓
[Tauri Command] → Rust backend
       ↓
[AES-256-GCM Encrypt] → nonce + ciphertext → base64 → SQLite

[Health Ping] → Rust decrypts key → reqwest async HTTP → result → DB + Toast
[WS Probe]    → Rust decrypts token → tokio-tungstenite WS → status → UI
```

- Encryption key is derived from machine characteristics (hostname + username) as an interim solution
- **TODO**: Integrate OS Keychain (Keychain on macOS, Credential Manager on Windows, Secret Service on Linux)
- All external HTTP/WS requests are made from Rust, keys/tokens never pass through the frontend network stack
- Database file is stored in the Tauri app data directory

## Releasing

Push a version tag to trigger automatic cross-platform builds:

```bash
git tag v0.3.0
git push origin v0.3.0
```

GitHub Actions will build Windows (.msi/.exe) and macOS (.dmg) installers and create a Release with download links.

## OpenClaw Gateway Prerequisites

By default, OpenClaw gateway binds to `localhost` (LAN mode) and rejects external client connections. To allow XPouch Vault to connect from another machine, configure the gateway to listen on `0.0.0.0`:

**Option 1: Via OpenClaw UI** — Settings → Gateway:

```json
{
  "gateway": {
    "bind": "custom",
    "customBindHost": "0.0.0.0"
  }
}
```

**Option 2: Via `openclaw.json`**:

```json
{
  "gateway": {
    "bind": "custom",
    "customBindHost": "0.0.0.0"
  }
}
```

Then restart: `openclaw gateway restart`

## License

MIT
