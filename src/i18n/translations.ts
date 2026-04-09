export type Locale = "zh" | "en" | "ja";

export const localeNames: Record<Locale, string> = {
  zh: "中文",
  en: "English",
  ja: "日本語",
};

export const localeFlags: Record<Locale, string> = {
  zh: "🇨🇳",
  en: "🇺🇸",
  ja: "🇯🇵",
};

type TranslationKey = keyof typeof translations.zh;

const translations = {
  zh: {
    // Nav
    "nav.vault": "密钥库",
    "nav.lobster": "龙虾监控",

    // Vault Page
    "vault.title": "密钥库",
    "vault.description": "管理你的 AI 服务 API Key，安全加密存储于本地",
    "vault.addKey": "添加 Key",
    "vault.search": "搜索名称、服务商或 Key...",
    "vault.filterAll": "全部",
    "vault.loading": "加载中...",
    "vault.noMatch": "没有匹配的密钥",
    "vault.empty": "暂无密钥，点击上方按钮添加",
    "vault.retry": "重试",

    // Key Card
    "key.valid": "有效",
    "key.invalid": "失效",
    "key.untested": "未测试",
    "key.editName": "编辑名称",
    "key.copyKey": "复制密钥",
    "key.hideKey": "隐藏密钥",
    "key.showKey": "显示密钥",
    "key.testKey": "测试密钥",
    "key.delete": "删除",
    "key.deleteTitle": "删除密钥",
    "key.deleteDesc": "确定要删除「{name}」吗？此操作不可撤销。",
    "key.editTitle": "编辑名称",
    "key.nameLabel": "名称",
    "key.namePlaceholder": "输入新名称",
    "key.save": "保存",

    // Add Key Dialog
    "addKey.title": "添加 API Key",
    "addKey.providerLabel": "服务商",
    "addKey.keyLabel": "API Key",
    "addKey.keyPlaceholder": "输入 API Key",
    "addKey.nameLabel": "名称（可选）",
    "addKey.namePlaceholder": "给 Key 起个名字方便识别",
    "addKey.categoryLabel": "分类",
    "addKey.submit": "添加",

    // Provider
    "provider.openai": "OpenAI",
    "provider.anthropic": "Anthropic",
    "provider.google": "Google AI",
    "provider.deepseek": "DeepSeek",
    "provider.minimax": "MiniMax",
    "provider.kimi": "Kimi",
    "provider.qwen": "Qwen",
    "provider.doubao": "Doubao",
    "provider.glm": "GLM",
    "provider.custom": "自定义",

    // Category
    "category.production": "生产环境",
    "category.development": "开发测试",
    "category.personal": "个人项目",
    "category.backup": "备用",

    // Lobster Page
    "lobster.title": "龙虾监控",
    "lobster.description": "OpenClaw 节点状态大盘",
    "lobster.online": "{online}/{total} 在线",
    "lobster.refresh": "刷新",
    "lobster.addNode": "添加节点",
    "lobster.loading": "加载中...",
    "lobster.empty": "暂无节点，点击上方按钮添加",

    // Node Card
    "node.editNode": "编辑节点",
    "node.deleteNode": "删除节点",
    "node.deleteTitle": "删除节点",
    "node.deleteDesc": "确定要删除「{name}」吗？此操作不可撤销。",
    "node.noStatus": "尚未获取状态",
    "node.viewDetail": "查看详情",
    "node.offline": "离线",
    "node.sessions": "{count} 会话",
    "node.skills": "{enabled}/{total} 技能",
    "node.connections": "{count} 连接",
    "node.tasks": "{succeeded}/{total} 任务",
    "node.cronJobs": "{count} 定时任务",

    // Node Detail Panel
    "detail.title": "节点详情",
    "detail.name": "名称",
    "detail.gatewayUrl": "网关 URL",
    "detail.token": "Token",
    "detail.createdAt": "创建时间",
    "detail.online": "在线",
    "detail.offlineStatus": "离线",
    "detail.version": "版本：v{version}",
    "detail.uptime": "运行时间：{uptime}",
    "detail.mode": "模式：{mode}",
    "detail.heartbeat": "心跳：{seconds}s",
    "detail.channels": "渠道 ({count})",
    "detail.agents": "Agents ({count})",
    "detail.unconfigured": "未配置",
    "detail.sessions": "会话",
    "detail.active": "活跃",
    "detail.total": "总计",
    "detail.skills": "技能",
    "detail.enabled": "已启用",
    "detail.tasks": "任务",
    "detail.inProgress": "进行中",
    "detail.succeeded": "成功",
    "detail.failed": "失败",
    "detail.pending": "待处理",
    "detail.cronJobs": "定时任务 ({count})",
    "detail.cronEnabled": "启用",
    "detail.cronDisabled": "禁用",
    "detail.nextRun": "下次：{time}",
    "detail.onlineDevices": "在线设备 ({count})",
    "detail.connectionsAndNodes": "连接 & 节点",
    "detail.activeConnections": "活跃连接",
    "detail.deviceTokens": "设备令牌",
    "detail.connected": "已连接",
    "detail.paired": "已配对",
    "detail.connectFailed": "连接失败",
    "detail.fetching": "状态获取中...",

    // Add Node Dialog
    "addNode.title": "添加节点",
    "addNode.editTitle": "编辑节点",
    "addNode.nameLabel": "节点名称",
    "addNode.namePlaceholder": "输入节点名称",
    "addNode.urlLabel": "网关 URL",
    "addNode.urlPlaceholder": "例如: https://gateway.example.com",
    "addNode.tokenLabel": "访问 Token",
    "addNode.tokenPlaceholder": "输入访问令牌",
    "addNode.submit": "添加",
    "addNode.update": "更新",

    // Common
    "common.cancel": "取消",
    "common.confirm": "确认",
    "common.delete": "删除",
  },

  en: {
    // Nav
    "nav.vault": "Vault",
    "nav.lobster": "Lobster",

    // Vault Page
    "vault.title": "Key Vault",
    "vault.description": "Manage your AI service API keys, securely encrypted locally",
    "vault.addKey": "Add Key",
    "vault.search": "Search name, provider or key...",
    "vault.filterAll": "All",
    "vault.loading": "Loading...",
    "vault.noMatch": "No matching keys",
    "vault.empty": "No keys yet. Click above to add one",
    "vault.retry": "Retry",

    // Key Card
    "key.valid": "Valid",
    "key.invalid": "Invalid",
    "key.untested": "Untested",
    "key.editName": "Edit name",
    "key.copyKey": "Copy key",
    "key.hideKey": "Hide key",
    "key.showKey": "Show key",
    "key.testKey": "Test key",
    "key.delete": "Delete",
    "key.deleteTitle": "Delete Key",
    "key.deleteDesc": "Are you sure you want to delete \"{name}\"? This action cannot be undone.",
    "key.editTitle": "Edit Name",
    "key.nameLabel": "Name",
    "key.namePlaceholder": "Enter new name",
    "key.save": "Save",

    // Add Key Dialog
    "addKey.title": "Add API Key",
    "addKey.providerLabel": "Provider",
    "addKey.keyLabel": "API Key",
    "addKey.keyPlaceholder": "Enter API Key",
    "addKey.nameLabel": "Name (optional)",
    "addKey.namePlaceholder": "Give the key a name for easy identification",
    "addKey.categoryLabel": "Category",
    "addKey.submit": "Add",

    // Provider
    "provider.openai": "OpenAI",
    "provider.anthropic": "Anthropic",
    "provider.google": "Google AI",
    "provider.deepseek": "DeepSeek",
    "provider.minimax": "MiniMax",
    "provider.kimi": "Kimi",
    "provider.qwen": "Qwen",
    "provider.doubao": "Doubao",
    "provider.glm": "GLM",
    "provider.custom": "Custom",

    // Category
    "category.production": "Production",
    "category.development": "Development",
    "category.personal": "Personal",
    "category.backup": "Backup",

    // Lobster Page
    "lobster.title": "Lobster Monitor",
    "lobster.description": "OpenClaw node status dashboard",
    "lobster.online": "{online}/{total} online",
    "lobster.refresh": "Refresh",
    "lobster.addNode": "Add Node",
    "lobster.loading": "Loading...",
    "lobster.empty": "No nodes yet. Click above to add one",

    // Node Card
    "node.editNode": "Edit node",
    "node.deleteNode": "Delete node",
    "node.deleteTitle": "Delete Node",
    "node.deleteDesc": "Are you sure you want to delete \"{name}\"? This action cannot be undone.",
    "node.noStatus": "Status not fetched",
    "node.viewDetail": "View details",
    "node.offline": "Offline",
    "node.sessions": "{count} sessions",
    "node.skills": "{enabled}/{total} skills",
    "node.connections": "{count} connections",
    "node.tasks": "{succeeded}/{total} tasks",
    "node.cronJobs": "{count} cron jobs",

    // Node Detail Panel
    "detail.title": "Node Details",
    "detail.name": "Name",
    "detail.gatewayUrl": "Gateway URL",
    "detail.token": "Token",
    "detail.createdAt": "Created",
    "detail.online": "Online",
    "detail.offlineStatus": "Offline",
    "detail.version": "Version: v{version}",
    "detail.uptime": "Uptime: {uptime}",
    "detail.mode": "Mode: {mode}",
    "detail.heartbeat": "Heartbeat: {seconds}s",
    "detail.channels": "Channels ({count})",
    "detail.agents": "Agents ({count})",
    "detail.unconfigured": "Unconfigured",
    "detail.sessions": "Sessions",
    "detail.active": "Active",
    "detail.total": "Total",
    "detail.skills": "Skills",
    "detail.enabled": "Enabled",
    "detail.tasks": "Tasks",
    "detail.inProgress": "In Progress",
    "detail.succeeded": "Succeeded",
    "detail.failed": "Failed",
    "detail.pending": "Pending",
    "detail.cronJobs": "Cron Jobs ({count})",
    "detail.cronEnabled": "Enabled",
    "detail.cronDisabled": "Disabled",
    "detail.nextRun": "Next: {time}",
    "detail.onlineDevices": "Online Devices ({count})",
    "detail.connectionsAndNodes": "Connections & Nodes",
    "detail.activeConnections": "Active Connections",
    "detail.deviceTokens": "Device Tokens",
    "detail.connected": "Connected",
    "detail.paired": "Paired",
    "detail.connectFailed": "Connection failed",
    "detail.fetching": "Fetching status...",

    // Add Node Dialog
    "addNode.title": "Add Node",
    "addNode.editTitle": "Edit Node",
    "addNode.nameLabel": "Node Name",
    "addNode.namePlaceholder": "Enter node name",
    "addNode.urlLabel": "Gateway URL",
    "addNode.urlPlaceholder": "e.g. https://gateway.example.com",
    "addNode.tokenLabel": "Access Token",
    "addNode.tokenPlaceholder": "Enter access token",
    "addNode.submit": "Add",
    "addNode.update": "Update",

    // Common
    "common.cancel": "Cancel",
    "common.confirm": "Confirm",
    "common.delete": "Delete",
  },

  ja: {
    // Nav
    "nav.vault": "キー保管庫",
    "nav.lobster": "ロブスター監視",

    // Vault Page
    "vault.title": "キー保管庫",
    "vault.description": "AIサービスのAPIキーを管理、ローカルで安全に暗号化保存",
    "vault.addKey": "キーを追加",
    "vault.search": "名前、プロバイダー、キーで検索...",
    "vault.filterAll": "すべて",
    "vault.loading": "読み込み中...",
    "vault.noMatch": "一致するキーがありません",
    "vault.empty": "キーがありません。上のボタンで追加",
    "vault.retry": "再試行",

    // Key Card
    "key.valid": "有効",
    "key.invalid": "無効",
    "key.untested": "未テスト",
    "key.editName": "名前を編集",
    "key.copyKey": "キーをコピー",
    "key.hideKey": "キーを非表示",
    "key.showKey": "キーを表示",
    "key.testKey": "キーをテスト",
    "key.delete": "削除",
    "key.deleteTitle": "キーを削除",
    "key.deleteDesc": "「{name}」を削除しますか？この操作は元に戻せません。",
    "key.editTitle": "名前を編集",
    "key.nameLabel": "名前",
    "key.namePlaceholder": "新しい名前を入力",
    "key.save": "保存",

    // Add Key Dialog
    "addKey.title": "APIキーを追加",
    "addKey.providerLabel": "プロバイダー",
    "addKey.keyLabel": "APIキー",
    "addKey.keyPlaceholder": "APIキーを入力",
    "addKey.nameLabel": "名前（任意）",
    "addKey.namePlaceholder": "キーに名前を付けて識別",
    "addKey.categoryLabel": "カテゴリ",
    "addKey.submit": "追加",

    // Provider
    "provider.openai": "OpenAI",
    "provider.anthropic": "Anthropic",
    "provider.google": "Google AI",
    "provider.deepseek": "DeepSeek",
    "provider.minimax": "MiniMax",
    "provider.kimi": "Kimi",
    "provider.qwen": "Qwen",
    "provider.doubao": "Doubao",
    "provider.glm": "GLM",
    "provider.custom": "カスタム",

    // Category
    "category.production": "本番環境",
    "category.development": "開発テスト",
    "category.personal": "個人プロジェクト",
    "category.backup": "バックアップ",

    // Lobster Page
    "lobster.title": "ロブスター監視",
    "lobster.description": "OpenClawノードステータスダッシュボード",
    "lobster.online": "{online}/{total} オンライン",
    "lobster.refresh": "更新",
    "lobster.addNode": "ノードを追加",
    "lobster.loading": "読み込み中...",
    "lobster.empty": "ノードがありません。上のボタンで追加",

    // Node Card
    "node.editNode": "ノードを編集",
    "node.deleteNode": "ノードを削除",
    "node.deleteTitle": "ノードを削除",
    "node.deleteDesc": "「{name}」を削除しますか？この操作は元に戻せません。",
    "node.noStatus": "ステータス未取得",
    "node.viewDetail": "詳細を見る",
    "node.offline": "オフライン",
    "node.sessions": "{count} セッション",
    "node.skills": "{enabled}/{total} スキル",
    "node.connections": "{count} 接続",
    "node.tasks": "{succeeded}/{total} タスク",
    "node.cronJobs": "{count} 定期ジョブ",

    // Node Detail Panel
    "detail.title": "ノード詳細",
    "detail.name": "名前",
    "detail.gatewayUrl": "ゲートウェイURL",
    "detail.token": "トークン",
    "detail.createdAt": "作成日時",
    "detail.online": "オンライン",
    "detail.offlineStatus": "オフライン",
    "detail.version": "バージョン：v{version}",
    "detail.uptime": "稼働時間：{uptime}",
    "detail.mode": "モード：{mode}",
    "detail.heartbeat": "ハートビート：{seconds}s",
    "detail.channels": "チャンネル ({count})",
    "detail.agents": "エージェント ({count})",
    "detail.unconfigured": "未設定",
    "detail.sessions": "セッション",
    "detail.active": "アクティブ",
    "detail.total": "合計",
    "detail.skills": "スキル",
    "detail.enabled": "有効",
    "detail.tasks": "タスク",
    "detail.inProgress": "進行中",
    "detail.succeeded": "成功",
    "detail.failed": "失敗",
    "detail.pending": "保留中",
    "detail.cronJobs": "定期ジョブ ({count})",
    "detail.cronEnabled": "有効",
    "detail.cronDisabled": "無効",
    "detail.nextRun": "次回：{time}",
    "detail.onlineDevices": "オンラインデバイス ({count})",
    "detail.connectionsAndNodes": "接続 & ノード",
    "detail.activeConnections": "アクティブ接続",
    "detail.deviceTokens": "デバイストークン",
    "detail.connected": "接続済み",
    "detail.paired": "ペアリング済み",
    "detail.connectFailed": "接続失敗",
    "detail.fetching": "ステータス取得中...",

    // Add Node Dialog
    "addNode.title": "ノードを追加",
    "addNode.editTitle": "ノードを編集",
    "addNode.nameLabel": "ノード名",
    "addNode.namePlaceholder": "ノード名を入力",
    "addNode.urlLabel": "ゲートウェイURL",
    "addNode.urlPlaceholder": "例：https://gateway.example.com",
    "addNode.tokenLabel": "アクセストークン",
    "addNode.tokenPlaceholder": "アクセストークンを入力",
    "addNode.submit": "追加",
    "addNode.update": "更新",

    // Common
    "common.cancel": "キャンセル",
    "common.confirm": "確認",
    "common.delete": "削除",
  },
} as const;

export type TranslationKeys = TranslationKey;

export function getTranslation(locale: Locale, key: TranslationKey, params?: Record<string, string | number>): string {
  let text: string = translations[locale]?.[key] ?? translations.en[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, String(v));
    }
  }
  return text;
}

export { translations };
