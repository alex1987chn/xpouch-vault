# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-04-08

### Added

- Core vault UI with dark theme sidebar layout
- Key card component with provider badge, validity indicator, and delete action
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
