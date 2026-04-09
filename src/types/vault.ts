export type KeyProvider =
  | "openai"
  | "anthropic"
  | "google"
  | "deepseek"
  | "minimax"
  | "kimi"
  | "qwen"
  | "doubao"
  | "glm"
  | "custom";

export interface VaultEntry {
  id: string;
  provider: KeyProvider;
  /** 加密后的密钥（后端返回，前端不展示） */
  encryptedKey: string;
  /** 前端展示用掩码，如 sk-...7xYz */
  maskedKey: string;
  name: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  lastTested?: string;
  isValid?: boolean;
}

export interface VaultFormData {
  provider: KeyProvider;
  apiKey: string;
  name: string;
  category: string;
}

export const PROVIDER_LABELS: Record<KeyProvider, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  google: "Google AI",
  deepseek: "DeepSeek",
  minimax: "MiniMax",
  kimi: "Kimi",
  qwen: "Qwen",
  doubao: "Doubao",
  glm: "GLM",
  custom: "自定义",
};

export const PROVIDER_COLORS: Record<KeyProvider, string> = {
  openai: "text-green-600",
  anthropic: "text-orange-600",
  google: "text-blue-600",
  deepseek: "text-purple-600",
  minimax: "text-sky-600",
  kimi: "text-indigo-600",
  qwen: "text-violet-600",
  doubao: "text-rose-600",
  glm: "text-cyan-600",
  custom: "text-stone-500",
};

export const DEFAULT_CATEGORIES = [
  "生产环境",
  "开发测试",
  "个人项目",
  "备用",
] as const;
