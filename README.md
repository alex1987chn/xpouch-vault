# XPouch Vault

A secure desktop vault for managing AI API keys and monitoring OpenClaw gateway nodes. Built with Tauri 2.x, React 19, and Rust.

## Features

### Vault — API Key Management

- **AES-256-GCM Encryption** — API keys are encrypted at rest with field-level encryption; keys never touch the frontend in plaintext
- **Key Reveal & Copy** — Toggle masked/plaintext display; copy to clipboard with one click
- **Health Ping** — Async key validation via Rust backend (supports OpenAI, Anthropic, Google AI, DeepSeek)
- **Multi-Provider** — Supports OpenAI, Anthropic, Google AI, DeepSeek, and custom providers
- **Categorized Management** — Organize keys by environment (production, dev/test, personal, backup)
- **Masked Display** — Keys are shown as masked strings (e.g., `sk-...7xYz`) in the UI

### Lobster — OpenClaw Gateway Monitoring

- **WebSocket Real-time Monitoring** — Connects to OpenClaw gateways via WS protocol (health + status methods)
- **Node CRUD** — Add, edit, delete gateway nodes with encrypted token storage
- **Dashboard** — Online/offline status, gateway version, uptime, channels, sessions, skills, tasks, heartbeat
- **Auto Refresh** — 30-second interval auto-refresh for all node statuses
- **Detail Sidebar** — Select a node card to see full details in the sidebar

### Shared

- **Local-First** — All data stored in a local SQLite database (WAL mode); no cloud sync, no telemetry
- **Dark Theme** — Built-in dark UI optimized for developers
- **Component Library** — Reusable UI primitives: Dialog, ConfirmDialog, EmptyState, PageHeader, ActionButton, Form

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop Runtime | Tauri 2.x |
| Frontend | React 19 + TypeScript + TailwindCSS v4 |
| State Management | Zustand 5 |
| Backend | Rust (native Tauri commands) |
| Database | SQLite (via rusqlite, bundled) |
| Encryption | AES-256-GCM (field-level) |
| HTTP Client | reqwest 0.12 (async, for health ping) |
| WebSocket | tokio-tungstenite 0.26 (async, for OpenClaw monitoring) |
| Build | Vite 8 + pnpm |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) 8+
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

Produces platform-specific installers in `src-tauri/target/release/bundle/`.

## Project Structure

```
xpouch-vault/
├── src/                      # Frontend (React + TypeScript)
│   ├── components/           # Business components
│   │   ├── KeyCard.tsx       # Key card (copy/reveal/ping/delete)
│   │   ├── AddKeyDialog.tsx  # Add key dialog
│   │   ├── NodeCard.tsx      # Node card (online status/channels/tasks)
│   │   ├── AddNodeDialog.tsx # Add/edit node dialog
│   │   ├── Toast.tsx         # Global toast notifications
│   │   └── ui/               # Reusable UI primitives
│   │       ├── Dialog.tsx    # Modal shell
│   │       ├── ConfirmDialog.tsx
│   │       ├── EmptyState.tsx
│   │       ├── PageHeader.tsx
│   │       ├── ActionButton.tsx
│   │       └── Form.tsx      # Input + Select
│   ├── pages/                # Route pages (lazy loaded)
│   │   ├── VaultPage.tsx     # Vault (home)
│   │   └── LobsterPage.tsx   # Lobster monitoring
│   ├── store/                # Zustand stores
│   │   ├── vaultStore.ts     # Vault state + actions
│   │   ├── nodeStore.ts      # Node monitoring state + actions
│   │   └── toastStore.ts     # Toast state
│   ├── types/                # TypeScript type definitions
│   │   ├── vault.ts          # VaultEntry, KeyProvider
│   │   └── node.ts           # OpenClawNode, NodeStatus, ChannelInfo, TasksInfo
│   ├── App.tsx               # Root layout + sidebar
│   └── main.tsx              # Entry point (HashRouter + lazy loading)
├── src-tauri/                # Backend (Rust)
│   ├── src/
│   │   ├── commands.rs       # Tauri commands (Vault CRUD + ping + Node CRUD + WS probe)
│   │   ├── node.rs           # Node data model + CRUD + decrypt token
│   │   ├── crypto.rs         # AES-256-GCM encrypt/decrypt
│   │   ├── db.rs             # SQLite schema + vault queries
│   │   └── lib.rs            # Module registration + setup
│   ├── Cargo.toml
│   └── tauri.conf.json
└── package.json
```

## Security Architecture

```
[User Input] → Frontend (plaintext in memory only)
       ↓
[Tauri Command] → Rust backend
       ↓
[AES-256-GCM Encrypt] → nonce + ciphertext → base64 → SQLite

[Health Ping] → Rust decrypts key → reqwest async HTTP → result → Toast
[WS Probe]    → Rust decrypts token → tokio-tungstenite WS → status → UI
```

- Encryption key is derived from machine characteristics (hostname + username) as an interim solution
- **TODO**: Integrate OS Keychain (Keychain on macOS, Credential Manager on Windows, Secret Service on Linux)
- All external HTTP/WS requests are made from Rust, keys/tokens never pass through the frontend network stack
- WS handshake requires `Origin` header for CORS validation
- Database file is stored in the Tauri app data directory

## OpenClaw Gateway Prerequisites

By default, OpenClaw gateway binds to `localhost` (LAN mode) and rejects external client connections. To allow XPouch Vault to connect from another machine, you must configure the gateway to listen on `0.0.0.0`:

**Option 1: Via OpenClaw UI** — Settings → Gateway:

```json
{
  "gateway": {
    "bind": "custom",
    "customBindHost": "0.0.0.0"
  }
}
```

**Option 2: Via `openclaw.json`** — Add/modify the config file:

```json
{
  "gateway": {
    "bind": "custom",
    "customBindHost": "0.0.0.0"
  }
}
```

Then restart the gateway:

```bash
openclaw gateway restart
```

> Without this change, the gateway only accepts connections from localhost/LAN, and XPouch Vault will show the node as offline.

## OpenClaw WebSocket Protocol

```
1. Connect: ws://<IP>:<PORT>/<shareCode>/ws (with Origin header)
2. Receive: connect.challenge event
3. Send: connect request (client.id: "openclaw-control-ui", client.mode: "ui")
4. Receive: hello-ok (with snapshot.uptimeMs)
5. Send: health request → channels, sessions, skills, tokens, nodes
6. Send: status request → runtimeVersion, heartbeat, tasks
7. Responses matched by request ID (skip interleaved event pushes)
```

## License

MIT
