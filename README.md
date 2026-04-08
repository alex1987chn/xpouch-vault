# XPouch Vault

A secure desktop vault for managing AI API keys. Built with Tauri 2.x, React 19, and Rust.

## Features

- **AES-256-GCM Encryption** — API keys are encrypted at rest with field-level encryption; keys never touch the frontend in plaintext
- **Local-First** — All data stored in a local SQLite database (WAL mode); no cloud sync, no telemetry
- **Multi-Provider** — Supports OpenAI, Anthropic, Google AI, DeepSeek, and custom providers
- **Categorized Management** — Organize keys by environment (production, dev/test, personal, backup)
- **Masked Display** — Keys are shown as masked strings (e.g., `sk-...7xYz`) in the UI
- **Dark Theme** — Built-in dark UI optimized for developers

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop Runtime | Tauri 2.x |
| Frontend | React 19 + TypeScript + TailwindCSS v4 |
| State Management | Zustand 5 |
| Backend | Rust (native Tauri commands) |
| Database | SQLite (via rusqlite, bundled) |
| Encryption | AES-256-GCM (field-level) |
| Build | Vite 8 + pnpm |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) 8+
- [Rust](https://www.rust-lang.org/tools/install) (stable)
- [Tauri CLI](https://v2.tauri.app/start/prerequisites/)

### Install Dependencies

```bash
# Frontend
pnpm install

# Rust (handled automatically by Tauri)
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
│   ├── components/           # UI components
│   ├── pages/                # Route pages
│   ├── store/                # Zustand stores
│   ├── types/                # TypeScript type definitions
│   ├── App.tsx               # Root layout + sidebar
│   └── main.tsx              # Entry point (HashRouter + lazy loading)
├── src-tauri/                # Backend (Rust)
│   ├── src/
│   │   ├── commands.rs       # Tauri commands (CRUD API)
│   │   ├── crypto.rs         # AES-256-GCM encrypt/decrypt
│   │   ├── db.rs             # SQLite schema + queries
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
```

- Encryption key is derived from machine characteristics (hostname + username) as an interim solution
- **TODO**: Integrate OS Keychain (Keychain on macOS, Credential Manager on Windows, Secret Service on Linux)
- Database file is stored in the Tauri app data directory

## License

MIT
