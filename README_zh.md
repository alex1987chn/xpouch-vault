# XPouch Vault

安全、优雅的桌面密钥保险箱，管理 AI API Key 并监控 OpenClaw 节点。基于 Tauri 2.x、React 19 和 Rust 构建。

[**English**](./README.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Tauri](https://img.shields.io/badge/Tauri-2.x-24C8D8?logo=tauri)](https://v2.tauri.app)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev)
[![Rust](https://img.shields.io/badge/Rust-Stable-000000?logo=rust)](https://www.rust-lang.org)

> **设计理念** — 源自 Claude 的温暖极简美学：石白底色、赤陶橙点缀、留白呼吸感、细腻阴影。

## 功能特性

### 保险箱 — API Key 管理

- **AES-256-GCM 加密** — API Key 字段级加密存储，密钥永不经过前端明文
- **9 家 AI 服务商** — OpenAI、Anthropic、Google AI、DeepSeek、MiniMax、Kimi、Qwen、Doubao、GLM + 自定义
- **品牌图标** — 通过 `@lobehub/icons` 展示服务商真实 Logo
- **连通性测试** — Rust 后端异步验证 Key 有效性，结果持久化到数据库
- **状态徽章** — 卡片显示 有效 / 失效 / 未测试 三种状态
- **显示与复制** — 一键切换脱敏/明文显示，一键复制到剪贴板
- **重命名** — 内联编辑弹窗，无需重建即可修改名称
- **分类管理** — 按环境分类：生产环境、开发测试、个人项目、备用
- **脱敏展示** — Key 以脱敏形式展示（如 `sk-...7xYz`）
- **多语言** — 支持中文、英文、日文

### 龙虾 — OpenClaw 节点监控

- **WebSocket 实时监控** — 通过 WS 协议连接 OpenClaw（health + status 方法）
- **节点增删改** — 添加、编辑、删除网关节点，Token 加密存储
- **仪表盘** — 在线/离线状态、版本、运行时间、渠道、Agent、定时任务、在线设备、会话、技能、任务、心跳
- **自动刷新** — 30 秒间隔自动刷新所有节点状态
- **详情面板** — 完整信息：渠道（运行/错误）、Agent（模型/会话）、定时任务、在线设备

### 通用

- **本地优先** — 所有数据存储在本地 SQLite（WAL 模式），无云同步、无遥测
- **Claude 风格 UI** — 温暖石白、赤陶橙点缀、留白呼吸感、细腻阴影
- **CSS 变量主题** — 通过 `--accent`、`--bg-base`、`--text-primary` 等控制主题
- **组件库** — Dialog、ConfirmDialog、EmptyState、PageHeader、ActionButton、Form、Toast、StatCard

## 技术栈

| 层级 | 技术 |
|------|------|
| 桌面运行时 | Tauri 2.x |
| 前端 | React 19 + TypeScript + TailwindCSS v4 |
| 状态管理 | Zustand 5 |
| 图标 | @lobehub/icons（品牌）+ Lucide（UI） |
| 后端 | Rust（Tauri 原生命令） |
| 数据库 | SQLite（rusqlite，内嵌） |
| 加密 | AES-256-GCM（字段级） |
| HTTP 客户端 | reqwest 0.12（异步，用于连通性测试） |
| WebSocket | tokio-tungstenite 0.26（异步，用于 OpenClaw 监控） |
| 国际化 | 自研（zh/en/ja） |
| 构建 | Vite 8 + pnpm |
| CI | GitHub Actions（Windows + macOS） |

## 快速开始

### 环境要求

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) 9+
- [Rust](https://www.rust-lang.org/tools/install)（stable）
- [Tauri CLI](https://v2.tauri.app/start/prerequisites/)

### 安装依赖

```bash
pnpm install
```

### 开发

```bash
pnpm tauri dev
```

启动 Vite 开发服务器（`http://localhost:1420`）并打开 Tauri 窗口。

### 构建

```bash
pnpm tauri build
```

在 `src-tauri/target/release/bundle/` 生成平台安装包：

| 平台 | 输出格式 |
|------|---------|
| Windows | `.msi`、`.exe`（NSIS） |
| macOS | `.dmg`、`.app` |
| Linux | `.deb`、`.AppImage` |

> **注意：** 需在目标平台上构建。跨平台发布请使用 GitHub Actions CI。

### 安装须知

本应用**未做代码签名**（无付费证书），首次启动可能会遇到系统警告：

- **Windows**：SmartScreen 可能提示"Windows 已保护你的电脑" — 点击**更多信息** → **仍要运行**
- **macOS**：可能提示"无法验证开发者" — **右键点击**应用 → **打开**，或前往**系统设置 → 隐私与安全性 → 仍要打开**

## 项目结构

```
xpouch-vault/
├── src/                      # 前端（React + TypeScript）
│   ├── components/           # 业务组件
│   │   ├── KeyCard.tsx       # Key 卡片（复制/显示/测试/编辑/删除）
│   │   ├── AddKeyDialog.tsx  # 添加 Key 弹窗
│   │   ├── NodeCard.tsx      # 节点卡片（在线状态/渠道/任务）
│   │   ├── AddNodeDialog.tsx # 添加/编辑节点弹窗
│   │   ├── NodeDetailPanel.tsx # 节点详情面板
│   │   ├── VaultLogo.tsx     # 动画金库门 Logo
│   │   ├── LanguageSwitcher.tsx # zh/en/ja 切换器
│   │   ├── Toast.tsx         # 全局 Toast 通知
│   │   └── ui/               # 可复用 UI 原子组件
│   │       ├── Dialog.tsx    # 弹窗壳
│   │       ├── ConfirmDialog.tsx
│   │       ├── EmptyState.tsx
│   │       ├── PageHeader.tsx
│   │       ├── ActionButton.tsx
│   │       ├── DialogActions.tsx
│   │       ├── Form.tsx      # Input + Select
│   │       └── StatCard.tsx  # StatCard + StatSection + ChannelBadge
│   ├── pages/                # 路由页面
│   │   ├── VaultPage.tsx     # 保险箱（首页）
│   │   └── LobsterPage.tsx   # 龙虾监控
│   ├── store/                # Zustand 状态
│   │   ├── vaultStore.ts     # 保险箱状态 + 操作
│   │   ├── nodeStore.ts      # 节点监控状态 + 操作
│   │   └── toastStore.ts     # Toast 状态
│   ├── types/                # TypeScript 类型定义
│   │   ├── vault.ts          # VaultEntry、KeyProvider、PROVIDER_LABELS/COLORS
│   │   └── node.ts           # OpenClawNode、NodeStatus、ChannelInfo、TasksInfo
│   ├── i18n/                 # 国际化
│   │   ├── index.ts          # useI18n Hook
│   │   └── translations.ts   # zh/en/ja 翻译表
│   ├── utils/                # 工具函数
│   │   └── format.ts         # formatDateTime、formatUptime
│   ├── App.tsx               # 根布局 + 侧边栏
│   └── main.tsx              # 入口（HashRouter）
├── src-tauri/                # 后端（Rust）
│   ├── src/
│   │   ├── commands.rs       # Tauri 命令（保险箱 CRUD + 测试 + 节点 CRUD + WS 探测）
│   │   ├── node.rs           # 节点数据模型 + CRUD + 解密 Token
│   │   ├── crypto.rs         # AES-256-GCM 加密/解密
│   │   ├── db.rs             # SQLite Schema + 保险箱查询
│   │   ├── lib.rs            # 模块注册 + 初始化
│   │   └── main.rs           # 入口
│   ├── Cargo.toml
│   └── tauri.conf.json
├── .github/
│   └── workflows/
│       └── build.yml         # CI：跨平台构建 + 发布
└── package.json
```

## 设计系统

### 色彩变量（CSS 自定义属性）

```css
--bg-base: #faf9f7;        /* 石白暖底 */
--bg-surface: #ffffff;      /* 纯白卡片 */
--bg-muted: #f5f4f0;       /* 石色微底 */
--border-default: #e7e5e0; /* 石色边框 */
--text-primary: #1c1917;   /* 主文字 */
--text-secondary: #57534e; /* 次文字 */
--text-tertiary: #a8a29e;  /* 辅助文字 */
--accent: #c96442;         /* 赤陶橙 */
--accent-light: #fef3ee;   /* 橙色淡底 */
--success: #16a34a;
--error: #dc2626;
--warning: #ca8a04;
```

### 服务商连通性测试端点

| 服务商 | 方法 | 端点 | 认证方式 |
|--------|------|------|----------|
| OpenAI | GET | `api.openai.com/v1/models` | `Bearer {key}` |
| Anthropic | GET | `api.anthropic.com/v1/models` | `x-api-key` + `anthropic-version: 2023-06-01` |
| Google AI | GET | `generativelanguage.googleapis.com/v1beta/models?key={key}` | Query 参数 |
| DeepSeek | GET | `api.deepseek.com/v1/models` | `Bearer {key}` |
| MiniMax | POST | `api.minimaxi.com/v1/chat/completions` | `Bearer {key}`（最小对话） |
| Kimi | GET | `api.moonshot.cn/v1/models` | `Bearer {key}` |
| Qwen | GET | `dashscope.aliyuncs.com/compatible-mode/v1/models` | `Bearer {key}` |
| Doubao | POST | `ark.cn-beijing.volces.com/api/v3/chat/completions` | `Bearer {key}`（最小对话） |
| GLM | GET | `open.bigmodel.cn/api/paas/v4/models` | `Bearer {key}` |

> **注意：** 部分服务商（MiniMax、Doubao）不支持标准 `/v1/models` 端点，连通性测试会发送最小化的 `POST /chat/completions` 请求（`max_tokens: 1`），非 401/403 响应即视为认证通过，每次测试最多消耗 1 token。

## 安全架构

```
[用户输入] → 前端（仅内存中明文）
       ↓
[Tauri 命令] → Rust 后端
       ↓
[AES-256-GCM 加密] → nonce + 密文 → base64 → SQLite

[连通性测试] → Rust 解密 Key → reqwest 异步 HTTP → 结果 → DB + Toast
[WS 探测]    → Rust 解密 Token → tokio-tungstenite WS → 状态 → UI
```

- 加密密钥暂由机器特征（主机名 + 用户名）派生
- **计划**：集成操作系统 Keychain（macOS Keychain、Windows Credential Manager、Linux Secret Service）
- 所有外部 HTTP/WS 请求均在 Rust 侧完成，Key/Token 不经过前端网络栈
- 数据库文件存储在 Tauri 应用数据目录

## 发布

推送版本标签触发自动跨平台构建：

```bash
git tag v0.3.0
git push origin v0.3.0
```

GitHub Actions 会构建 Windows（.msi/.exe）和 macOS（.dmg）安装包，并创建 Release 下载链接。

## OpenClaw 接入前提

默认情况下，OpenClaw 绑定 `localhost`（LAN 模式），拒绝外部客户端连接。要让 XPouch Vault 从其他机器连接，需将监听地址配置为 `0.0.0.0`：

**方式一：通过 OpenClaw 界面** — 设置 → 网关：

```json
{
  "gateway": {
    "bind": "custom",
    "customBindHost": "0.0.0.0"
  }
}
```

**方式二：通过 `openclaw.json`**：

```json
{
  "gateway": {
    "bind": "custom",
    "customBindHost": "0.0.0.0"
  }
}
```

然后重启：`openclaw gateway restart`

## 许可证

[MIT](./LICENSE)
