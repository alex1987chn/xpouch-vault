use tauri::State;

use crate::db::{self, AddKeyRequest, DbState, UpdateKeyRequest, VaultEntry};
use crate::node::{self, AddNodeRequest, OpenClawNode, UpdateNodeRequest};

// ── Vault Key Commands ──

#[tauri::command]
pub fn list_vault_entries(state: State<DbState>) -> Result<Vec<VaultEntry>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    db::list_entries(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn add_api_key(state: State<DbState>, request: AddKeyRequest) -> Result<VaultEntry, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    db::add_entry(&conn, &request)
}

#[tauri::command]
pub fn delete_api_key(state: State<DbState>, id: String) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    db::delete_entry(&conn, &id)
}

#[tauri::command]
pub fn update_api_key(
    state: State<DbState>,
    request: UpdateKeyRequest,
) -> Result<VaultEntry, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    db::update_entry(&conn, &request)
}

#[tauri::command]
pub fn reveal_api_key(state: State<DbState>, id: String) -> Result<String, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    db::decrypt_entry_key(&conn, &id)
}

/// 探活测试结果
#[derive(Debug, serde::Serialize)]
pub struct PingResult {
    pub success: bool,
    pub latency_ms: u64,
    pub message: String,
}

/// Provider 探活配置（支持多 header + 多种探活方式）
struct PingEndpoint {
    url: String,
    headers: Vec<(String, String)>,
    /// 探活方式：GET 请求或 POST 最小 chat 请求
    method: PingMethod,
    /// POST body（仅 method == Chat 时使用）
    body: Option<String>,
}

/// 探活方式
enum PingMethod {
    /// GET /v1/models — 标准 OpenAI 兼容端点
    ModelsList,
    /// POST /v1/chat/completions — 发送最小 chat 请求验证 key
    ChatCompletions,
}

fn get_ping_endpoint(provider: &str, key: &str) -> PingEndpoint {
    match provider {
        "openai" => PingEndpoint {
            url: "https://api.openai.com/v1/models".to_string(),
            headers: vec![("Authorization".to_string(), format!("Bearer {key}"))],
            method: PingMethod::ModelsList,
            body: None,
        },
        "anthropic" => PingEndpoint {
            url: "https://api.anthropic.com/v1/models".to_string(),
            headers: vec![
                ("x-api-key".to_string(), key.to_string()),
                ("anthropic-version".to_string(), "2023-06-01".to_string()),
            ],
            method: PingMethod::ModelsList,
            body: None,
        },
        "google" => PingEndpoint {
            url: format!("https://generativelanguage.googleapis.com/v1beta/models?key={key}"),
            headers: vec![],
            method: PingMethod::ModelsList,
            body: None,
        },
        "deepseek" => PingEndpoint {
            url: "https://api.deepseek.com/v1/models".to_string(),
            headers: vec![("Authorization".to_string(), format!("Bearer {key}"))],
            method: PingMethod::ModelsList,
            body: None,
        },
        // MiniMax 不提供 /v1/models 端点，用最小 chat 请求验证
        "minimax" => PingEndpoint {
            url: "https://api.minimaxi.com/v1/chat/completions".to_string(),
            headers: vec![
                ("Authorization".to_string(), format!("Bearer {key}")),
                ("Content-Type".to_string(), "application/json".to_string()),
            ],
            method: PingMethod::ChatCompletions,
            body: Some(r#"{"model":"MiniMax-M2.7","messages":[{"role":"user","content":"hi"}],"max_tokens":1}"#.to_string()),
        },
        "kimi" => PingEndpoint {
            url: "https://api.moonshot.cn/v1/models".to_string(),
            headers: vec![("Authorization".to_string(), format!("Bearer {key}"))],
            method: PingMethod::ModelsList,
            body: None,
        },
        "qwen" => PingEndpoint {
            url: "https://dashscope.aliyuncs.com/compatible-mode/v1/models".to_string(),
            headers: vec![("Authorization".to_string(), format!("Bearer {key}"))],
            method: PingMethod::ModelsList,
            body: None,
        },
        // 豆包/火山方舟 /api/v3/models 端点可能不可用，用最小 chat 请求验证
        "doubao" => PingEndpoint {
            url: "https://ark.cn-beijing.volces.com/api/v3/chat/completions".to_string(),
            headers: vec![
                ("Authorization".to_string(), format!("Bearer {key}")),
                ("Content-Type".to_string(), "application/json".to_string()),
            ],
            method: PingMethod::ChatCompletions,
            body: Some(r#"{"model":"doubao-1.5-pro-32k","messages":[{"role":"user","content":"hi"}],"max_tokens":1}"#.to_string()),
        },
        "glm" => PingEndpoint {
            url: "https://open.bigmodel.cn/api/paas/v4/models".to_string(),
            headers: vec![("Authorization".to_string(), format!("Bearer {key}"))],
            method: PingMethod::ModelsList,
            body: None,
        },
        _ => PingEndpoint {
            url: "https://api.openai.com/v1/models".to_string(),
            headers: vec![("Authorization".to_string(), format!("Bearer {key}"))],
            method: PingMethod::ModelsList,
            body: None,
        },
    }
}

#[tauri::command]
pub async fn ping_api_key(state: State<'_, DbState>, id: String) -> Result<PingResult, String> {
    let (provider, key) = {
        let conn = state.conn.lock().map_err(|e: std::sync::PoisonError<_>| e.to_string())?;
        let entry = db::get_entry(&conn, &id)?;
        let decrypted = db::decrypt_entry_key(&conn, &id)?;
        (entry.provider, decrypted)
    };

    let endpoint = get_ping_endpoint(&provider, &key);
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(10))
        .build()
        .map_err(|e| e.to_string())?;

    let start = std::time::Instant::now();

    let response = match endpoint.method {
        PingMethod::ModelsList => {
            let mut req = client.get(&endpoint.url);
            for (name, value) in &endpoint.headers {
                req = req.header(name.as_str(), value.as_str());
            }
            req.send().await
        }
        PingMethod::ChatCompletions => {
            let body = endpoint.body.as_deref().unwrap_or("{}");
            let mut req = client.post(&endpoint.url).body(body.to_string());
            for (name, value) in &endpoint.headers {
                req = req.header(name.as_str(), value.as_str());
            }
            req.send().await
        }
    };
    let latency_ms = start.elapsed().as_millis() as u64;

    let result = match response {
        Ok(resp) => {
            let status = resp.status();
            let status_code = status.as_u16();

            // ChatCompletions 模式：200 成功；400/404/422 等说明认证通过但请求参数问题
            // 关键判断：401/403 = key 无效，其他非 5xx = key 有效（至少认证通过）
            let is_auth_ok = match &endpoint.method {
                PingMethod::ModelsList => status.is_success(),
                PingMethod::ChatCompletions => {
                    status.is_success() || (status_code >= 400 && status_code < 500 && status_code != 401 && status_code != 403)
                }
            };

            if is_auth_ok {
                let label = match &endpoint.method {
                    PingMethod::ModelsList => "测试通过",
                    PingMethod::ChatCompletions => "认证通过",
                };
                PingResult {
                    success: true,
                    latency_ms,
                    message: format!("{} {}ms", label, latency_ms),
                }
            } else {
                let msg = match status_code {
                    401 => "密钥无效 (401 Unauthorized)".to_string(),
                    403 => "权限不足 (403 Forbidden)".to_string(),
                    429 => "请求过频 (429 Rate Limited)".to_string(),
                    _ => format!("请求失败 (HTTP {})", status_code),
                };
                PingResult {
                    success: false,
                    latency_ms,
                    message: msg,
                }
            }
        }
        Err(e) => {
            let msg = if e.is_timeout() {
                "请求超时".to_string()
            } else if e.is_connect() {
                "无法连接服务器".to_string()
            } else {
                format!("网络错误: {}", e)
            };
            PingResult {
                success: false,
                latency_ms,
                message: msg,
            }
        }
    };

    // 回写探活结果到数据库
    {
        let conn = state.conn.lock().map_err(|e: std::sync::PoisonError<_>| e.to_string())?;
        if let Err(e) = db::update_ping_result(&conn, &id, result.success) {
            eprintln!("回写探活结果失败: {}", e);
        }
    }

    Ok(result)
}

// ── OpenClaw Node Commands ──

#[tauri::command]
pub fn list_nodes(state: State<DbState>) -> Result<Vec<OpenClawNode>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    node::list_nodes(&conn)
}

#[tauri::command]
pub fn add_node(state: State<DbState>, request: AddNodeRequest) -> Result<OpenClawNode, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    node::add_node(&conn, &request)
}

#[tauri::command]
pub fn delete_node(state: State<DbState>, id: String) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    node::delete_node(&conn, &id)
}

#[tauri::command]
pub fn update_node(
    state: State<DbState>,
    request: UpdateNodeRequest,
) -> Result<OpenClawNode, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    node::update_node(&conn, &request)
}

// ── OpenClaw WebSocket Protocol Structures ──

/// WS 请求（type: "req"）
#[derive(serde::Serialize)]
struct WsRequest {
    #[serde(rename = "type")]
    msg_type: String,
    id: String,
    method: String,
    params: serde_json::Value,
}

/// WS 通用消息（可解析 challenge / hello-ok / health 等各种消息）
#[derive(serde::Deserialize)]
struct WsMessage {
    /// 消息类型：event / res / error
    #[serde(rename = "type")]
    msg_type: Option<String>,
    /// 事件名（如 "connect.challenge"、"hello-ok"）
    event: Option<String>,
    /// 请求 ID（对应 res 类型）
    id: Option<String>,
    /// 是否成功（res 类型）
    ok: Option<bool>,
    /// 响应负载
    payload: Option<serde_json::Value>,
    /// 错误信息
    error: Option<WsError>,
}

#[derive(serde::Deserialize)]
struct WsError {
    message: Option<String>,
    code: Option<String>,
}

/// 从 health + status + cron.list 方法响应中提取的关键指标
#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct GatewayInfo {
    pub version: Option<String>,
    pub uptime: Option<u64>,
    pub mode: Option<String>,
}

#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct SessionsInfo {
    pub active: Option<u64>,
    pub total: Option<u64>,
}

#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct SkillsInfo {
    pub enabled: Option<u64>,
    pub total: Option<u64>,
}

#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct TokensInfo {
    pub device_tokens: Option<u64>,
    pub active_connections: Option<u64>,
}

#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct NodesInfo {
    pub connected: Option<u64>,
    pub paired: Option<u64>,
}

/// 渠道详细信息（来自 health.channels）
#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct ChannelInfo {
    pub name: String,
    pub status: Option<String>,
    pub configured: Option<bool>,
    pub running: Option<bool>,
    pub last_error: Option<String>,
    pub probe: Option<serde_json::Value>,
}

/// Agent 信息（来自 health.agents）
#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct AgentInfo {
    pub id: Option<String>,
    pub name: Option<String>,
    pub model: Option<String>,
    pub status: Option<String>,
    pub heartbeat_seconds: Option<u64>,
    pub sessions_count: Option<u64>,
    pub recent_sessions: Option<Vec<serde_json::Value>>,
    pub raw: Option<serde_json::Value>,
}

/// 定时任务（来自 cron.list）
#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct CronJob {
    pub name: Option<String>,
    pub cron: Option<String>,
    pub enabled: Option<bool>,
    pub next_run: Option<String>,
    pub raw: Option<serde_json::Value>,
}

/// 在线设备（来自 hello-ok snapshot.presence）
#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct PresenceDevice {
    pub id: Option<String>,
    pub name: Option<String>,
    pub raw: Option<serde_json::Value>,
}

/// 任务统计（来自 status.tasks）
#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct TasksInfo {
    pub total: Option<u64>,
    pub active: Option<u64>,
    pub succeeded: Option<u64>,
    pub failed: Option<u64>,
    pub pending: Option<u64>,
}

/// 聚合后的节点状态
#[derive(Debug, serde::Serialize)]
pub struct NodeStatusResponse {
    pub node_id: String,
    pub node_name: String,
    pub endpoint_url: String,
    pub online: bool,
    pub gateway: Option<GatewayInfo>,
    pub sessions: Option<SessionsInfo>,
    pub skills: Option<SkillsInfo>,
    pub tokens: Option<TokensInfo>,
    pub nodes: Option<NodesInfo>,
    pub channels: Vec<ChannelInfo>,
    pub agents: Vec<AgentInfo>,
    pub cron_jobs: Vec<CronJob>,
    pub presence: Vec<PresenceDevice>,
    pub tasks: Option<TasksInfo>,
    pub heartbeat_interval: Option<u64>,
    pub heartbeat_seconds: Option<u64>,
    pub error: Option<String>,
    pub latency_ms: u64,
}

/// 从 WS 流中读取下一条文本消息（带超时）
async fn read_ws_text(
    ws_stream: &mut futures::stream::SplitStream<
        tokio_tungstenite::WebSocketStream<
            tokio_tungstenite::MaybeTlsStream<tokio::net::TcpStream>,
        >,
    >,
    timeout_msg: &str,
) -> Result<String, String> {
    use futures::StreamExt;

    let msg = tokio::time::timeout(std::time::Duration::from_secs(8), ws_stream.next())
        .await
        .map_err(|_| timeout_msg.to_string())?
        .ok_or_else(|| "WS 流意外结束".to_string())?
        .map_err(|e| format!("WS 接收错误: {}", e))?;

    match msg {
        tokio_tungstenite::tungstenite::Message::Text(text) => Ok(text.to_string()),
        tokio_tungstenite::tungstenite::Message::Close(_) => Err("WS 连接被关闭".to_string()),
        _ => Err("WS 收到非文本消息".to_string()),
    }
}

/// 从 WS 流中等待匹配指定 request ID 的响应消息（跳过事件推送）
///
/// OpenClaw WS 协议中，请求响应格式为 `{ type: "res", id: "2", ok: true, payload: {...} }`
/// 但中间可能穿插事件推送 `{ type: "event", event: "health.update", ... }`
/// 此函数会跳过非目标 ID 的消息，只返回匹配的响应
async fn read_ws_response(
    ws_stream: &mut futures::stream::SplitStream<
        tokio_tungstenite::WebSocketStream<
            tokio_tungstenite::MaybeTlsStream<tokio::net::TcpStream>,
        >,
    >,
    expected_id: &str,
    method_name: &str,
) -> Result<WsMessage, String> {
    use futures::StreamExt;

    let deadline = std::time::Instant::now() + std::time::Duration::from_secs(10);

    loop {
        let remaining = deadline.saturating_duration_since(std::time::Instant::now());
        if remaining.is_zero() {
            return Err(format!("等待 {} 响应超时", method_name));
        }

        let msg = tokio::time::timeout(remaining, ws_stream.next())
            .await
            .map_err(|_| format!("等待 {} 响应超时", method_name))?
            .ok_or_else(|| "WS 流意外结束".to_string())?
            .map_err(|e| format!("WS 接收错误: {}", e))?;

        let text = match msg {
            tokio_tungstenite::tungstenite::Message::Text(t) => t.to_string(),
            tokio_tungstenite::tungstenite::Message::Close(_) => {
                return Err("WS 连接被关闭".to_string());
            }
            _ => continue, // 跳过非文本消息
        };

        let ws_msg: WsMessage = match serde_json::from_str(&text) {
            Ok(m) => m,
            Err(e) => {
                // 解析失败，记录日志但继续读
                eprintln!("[WS] 解析消息失败: {} (原始: {})", e, &text[..text.len().min(200)]);
                continue;
            }
        };

        // 如果是事件推送（type: "event"），跳过
        if ws_msg.msg_type.as_deref() == Some("event") {
            eprintln!("[WS] 跳过事件推送: {:?}", ws_msg.event);
            continue;
        }

        // 如果是响应，检查 ID 是否匹配
        if ws_msg.msg_type.as_deref() == Some("res") {
            if ws_msg.id.as_deref() == Some(expected_id) {
                return Ok(ws_msg);
            }
            // ID 不匹配，可能是一个延迟到达的旧响应，跳过
            eprintln!("[WS] 跳过不匹配的响应: 期望 id={}, 收到 id={:?}", expected_id, ws_msg.id);
            continue;
        }

        // 其他类型消息（如 error），检查 ID
        if ws_msg.id.as_deref() == Some(expected_id) {
            return Ok(ws_msg);
        }
    }
}

/// WS 探测的聚合结果
struct ProbeResult {
    health_payload: serde_json::Value,
    status_payload: serde_json::Value,
    cron_payload: serde_json::Value,
    hello_payload: serde_json::Value,
    uptime_ms: Option<u64>,
}

/// 通过 WebSocket 连接 OpenClaw Gateway，调用 health + cron.list + status 获取完整数据
///
/// 握手流程（按 OpenClaw 文档）：
/// 1. 连接 WS（带 Origin header） → 收到 `connect.challenge` 事件
/// 2. 发送 `connect` 请求 → 收到 `hello-ok`（含初始 snapshot：uptimeMs + presence）
/// 3. 发送 `health` 请求 → 收到完整健康快照（channels + agents + sessions 等）
/// 4. 发送 `cron.list` 请求 → 收到定时任务列表
/// 5. 发送 `status` 请求 → 收到版本/心跳/tasks 统计
async fn ws_probe_status(
    ws_url: &str,
    origin_url: &str,
    token: &str,
) -> Result<ProbeResult, String> {
    use futures::{SinkExt, StreamExt};
    use tokio_tungstenite::tungstenite::{client::IntoClientRequest, Message};

    // ── 构建 WS 请求（带 Origin header） ──
    let mut request = ws_url
        .into_client_request()
        .map_err(|e| format!("WS URL 解析失败: {} (URL: {})", e, ws_url))?;
    request
        .headers_mut()
        .insert("Origin", http::HeaderValue::from_str(origin_url).map_err(|e| format!("Origin 构建失败: {} (Origin: {})", e, origin_url))?);

    let (ws_stream, _) = tokio_tungstenite::connect_async(request)
        .await
        .map_err(|e| format!("WS 连接失败: {}", e))?;

    let (mut ws_sink, mut ws_stream) = ws_stream.split();

    // ── 步骤 1：等待 connect.challenge 事件 ──
    let challenge_text = read_ws_text(&mut ws_stream, "等待 challenge 超时").await?;
    let challenge_msg: WsMessage = serde_json::from_str(&challenge_text)
        .map_err(|e| format!("解析 challenge 失败: {} (原始: {})", e, &challenge_text[..challenge_text.len().min(200)]))?;

    if challenge_msg.event.as_deref() != Some("connect.challenge") {
        return Err(format!("期望 connect.challenge，收到: {:?}", challenge_msg.event));
    }

    // ── 步骤 2：发送 connect 请求 ──
    // client.id 必须用合法枚举值 "openclaw-control-ui"
    // client.mode 必须用合法枚举值 "ui"
    // scopes 需包含 operator.write
    let connect_req = WsRequest {
        msg_type: "req".to_string(),
        id: "1".to_string(),
        method: "connect".to_string(),
        params: serde_json::json!({
            "minProtocol": 3,
            "maxProtocol": 3,
            "client": {
                "id": "openclaw-control-ui",
                "version": "1.0.0",
                "platform": "web",
                "mode": "ui"
            },
            "role": "operator",
            "scopes": ["operator.read", "operator.write"],
            "auth": {
                "token": token
            }
        }),
    };

    let connect_json = serde_json::to_string(&connect_req).map_err(|e| format!("序列化失败: {}", e))?;
    ws_sink
        .send(Message::Text(connect_json.into()))
        .await
        .map_err(|e| format!("WS 发送 connect 失败: {}", e))?;

    // ── 步骤 3：等待 hello-ok 响应 ──
    let hello_text = read_ws_text(&mut ws_stream, "等待 hello-ok 超时").await?;
    let hello_msg: WsMessage = serde_json::from_str(&hello_text)
        .map_err(|e| format!("解析 hello-ok 失败: {} (原始: {})", e, &hello_text[..hello_text.len().min(200)]))?;

    // hello-ok 可能以 event: "hello-ok" 形式到来，也可能是 type: "res" + ok: true
    let is_hello_ok = hello_msg.event.as_deref() == Some("hello-ok")
        || (hello_msg.msg_type.as_deref() == Some("res") && hello_msg.id.as_deref() == Some("1") && hello_msg.ok == Some(true));

    if !is_hello_ok {
        let err_msg = hello_msg.error
            .and_then(|e| e.message)
            .unwrap_or_else(|| format!("期望 hello-ok，收到: {:?}", hello_msg.event));
        return Err(format!("WS 认证失败: {}", err_msg));
    }

    // 从 hello-ok 的 snapshot 中提取 uptimeMs
    let uptime_ms = hello_msg.payload
        .as_ref()
        .and_then(|p| p.get("uptimeMs"))
        .and_then(|v| v.as_u64());

    // 保存 hello-ok 完整 payload（含 presence 等）
    let hello_payload = hello_msg.payload.clone().unwrap_or(serde_json::json!({}));

    // ── 步骤 4：发送 health 请求（获取渠道、agent、会话数等） ──
    let health_req = WsRequest {
        msg_type: "req".to_string(),
        id: "2".to_string(),
        method: "health".to_string(),
        params: serde_json::json!({}),
    };

    let health_json = serde_json::to_string(&health_req).map_err(|e| format!("序列化失败: {}", e))?;
    ws_sink
        .send(Message::Text(health_json.into()))
        .await
        .map_err(|e| format!("WS 发送 health 失败: {}", e))?;

    // ── 步骤 5：等待 health 响应（跳过中间的事件推送） ──
    let health_msg = read_ws_response(&mut ws_stream, "2", "health").await?;

    let health_payload = if health_msg.ok == Some(true) {
        health_msg.payload.unwrap_or(serde_json::json!({}))
    } else {
        // health 失败时，尝试从 hello-ok snapshot 中提取部分数据作为 fallback
        let err_detail = health_msg.error
            .as_ref()
            .and_then(|e| e.message.as_deref())
            .unwrap_or("unknown");
        let err_code = health_msg.error
            .as_ref()
            .and_then(|e| e.code.as_deref())
            .unwrap_or("");
        eprintln!("[WS] health 请求失败: {} (code: {}), 尝试从 hello-ok snapshot 恢复", err_detail, err_code);
        // 用 hello-ok 的 snapshot 作为 fallback
        hello_payload.clone()
    };

    // ── 步骤 6：发送 cron.list 请求（获取定时任务列表） ──
    let cron_req = WsRequest {
        msg_type: "req".to_string(),
        id: "3".to_string(),
        method: "cron.list".to_string(),
        params: serde_json::json!({}),
    };

    let cron_json = serde_json::to_string(&cron_req).map_err(|e| format!("序列化失败: {}", e))?;
    ws_sink
        .send(Message::Text(cron_json.into()))
        .await
        .map_err(|e| format!("WS 发送 cron.list 失败: {}", e))?;

    // ── 步骤 7：等待 cron.list 响应 ──
    let cron_msg = read_ws_response(&mut ws_stream, "3", "cron.list").await?;

    let cron_payload = if cron_msg.ok == Some(true) {
        cron_msg.payload.unwrap_or(serde_json::json!({}))
    } else {
        // cron.list 可能不被所有版本支持，失败时不影响其他数据
        if cron_msg.ok == Some(false) {
            let err_detail = cron_msg.error
                .as_ref()
                .and_then(|e| e.message.as_deref())
                .unwrap_or("unknown");
            eprintln!("[WS] cron.list 请求失败: {} (可能网关版本不支持)", err_detail);
        }
        serde_json::json!({})
    };

    // ── 步骤 8：发送 status 请求（获取版本、心跳、tasks 统计） ──
    let status_req = WsRequest {
        msg_type: "req".to_string(),
        id: "4".to_string(),
        method: "status".to_string(),
        params: serde_json::json!({}),
    };

    let status_json = serde_json::to_string(&status_req).map_err(|e| format!("序列化失败: {}", e))?;
    ws_sink
        .send(Message::Text(status_json.into()))
        .await
        .map_err(|e| format!("WS 发送 status 失败: {}", e))?;

    // ── 步骤 9：等待 status 响应 ──
    let status_msg = read_ws_response(&mut ws_stream, "4", "status").await?;

    let status_payload = if status_msg.ok == Some(true) {
        status_msg.payload.unwrap_or(serde_json::json!({}))
    } else {
        let err_detail = status_msg.error
            .as_ref()
            .and_then(|e| e.message.as_deref())
            .unwrap_or("unknown");
        let err_code = status_msg.error
            .as_ref()
            .and_then(|e| e.code.as_deref())
            .unwrap_or("");
        eprintln!("[WS] status 请求失败: {} (code: {}), 使用空数据", err_detail, err_code);
        serde_json::json!({})
    };

    // 关闭连接
    let _ = ws_sink.close().await;

    Ok(ProbeResult {
        health_payload,
        status_payload,
        cron_payload,
        hello_payload,
        uptime_ms,
    })
}

/// 从 health + status 聚合数据中提取 GatewayInfo
fn extract_gateway(probe: &ProbeResult) -> GatewayInfo {
    // 版本来自 status.runtimeVersion
    let version = probe.status_payload
        .get("runtimeVersion")
        .and_then(|v| v.as_str())
        .map(|s| s.to_string())
        .or_else(|| probe.health_payload.get("version").and_then(|v| v.as_str()).map(|s| s.to_string()));

    // uptime 优先用 hello-ok 的 uptimeMs
    let uptime = probe.uptime_ms
        .or_else(|| probe.health_payload.get("uptime").and_then(|v| v.as_u64()))
        .or_else(|| probe.health_payload.get("uptimeMs").and_then(|v| v.as_u64()));

    // mode 来自 health
    let mode = probe.health_payload
        .get("mode")
        .and_then(|v| v.as_str())
        .map(|s| s.to_string());

    GatewayInfo { version, uptime, mode }
}

/// 从 health payload 中提取渠道详细信息
fn extract_channels(health: &serde_json::Value) -> Vec<ChannelInfo> {
    health
        .get("channels")
        .and_then(|v| v.as_array())
        .map(|arr| {
            arr.iter()
                .filter_map(|ch| {
                    // channels 可能是 ["feishu", "weixin"] 简单字符串数组
                    if let Some(name) = ch.as_str() {
                        Some(ChannelInfo {
                            name: name.to_string(),
                            status: Some("active".to_string()),
                            configured: None,
                            running: None,
                            last_error: None,
                            probe: None,
                        })
                    } else {
                        // 也可能是 [{name, status, configured, running, lastError, probe}] 对象数组
                        let name = ch.get("name").and_then(|n| n.as_str()).map(|s| s.to_string())?;
                        let status = ch.get("status").and_then(|s| s.as_str()).map(|s| s.to_string());
                        let configured = ch.get("configured").and_then(|v| v.as_bool());
                        let running = ch.get("running").and_then(|v| v.as_bool());
                        let last_error = ch.get("lastError").and_then(|v| v.as_str()).map(|s| s.to_string());
                        let probe = ch.get("probe").cloned();
                        Some(ChannelInfo { name, status, configured, running, last_error, probe })
                    }
                })
                .collect()
        })
        .unwrap_or_default()
}

/// 从 health payload 中提取 agent 列表
fn extract_agents(health: &serde_json::Value) -> Vec<AgentInfo> {
    health
        .get("agents")
        .and_then(|v| v.as_array())
        .map(|arr| {
            arr.iter()
                .filter_map(|agent| {
                    // agents 可能是字符串数组（简单 ID 列表）
                    if let Some(id) = agent.as_str() {
                        Some(AgentInfo {
                            id: Some(id.to_string()),
                            name: None,
                            model: None,
                            status: None,
                            heartbeat_seconds: None,
                            sessions_count: None,
                            recent_sessions: None,
                            raw: None,
                        })
                    } else {
                        // 对象格式：{id, name, model, status, heartbeat, sessions, ...}
                        let id = agent.get("id").and_then(|v| v.as_str()).map(|s| s.to_string());
                        let name = agent.get("name").and_then(|v| v.as_str()).map(|s| s.to_string())
                            .or_else(|| id.clone());
                        let model = agent.get("model").and_then(|v| v.as_str()).map(|s| s.to_string());
                        let status = agent.get("status").and_then(|v| v.as_str()).map(|s| s.to_string());
                        let heartbeat_seconds = agent.get("heartbeatSeconds").and_then(|v| v.as_u64())
                            .or_else(|| agent.get("heartbeat").and_then(|v| v.as_u64()));
                        let sessions_count = agent.get("sessions")
                            .and_then(|s| s.get("count")).and_then(|v| v.as_u64())
                            .or_else(|| agent.get("sessionsCount").and_then(|v| v.as_u64()));
                        let recent_sessions = agent.get("recentSessions")
                            .and_then(|v| v.as_array())
                            .map(|arr| arr.clone());
                        Some(AgentInfo {
                            id,
                            name,
                            model,
                            status,
                            heartbeat_seconds,
                            sessions_count,
                            recent_sessions,
                            raw: Some(agent.clone()),
                        })
                    }
                })
                .collect()
        })
        .unwrap_or_default()
}

/// 从 cron.list payload 中提取定时任务
fn extract_cron_jobs(cron: &serde_json::Value) -> Vec<CronJob> {
    cron
        .get("jobs")
        .and_then(|v| v.as_array())
        .or_else(|| cron.as_array()) // 有些版本直接返回数组
        .map(|arr| {
            arr.iter()
                .filter_map(|job| {
                    let name = job.get("name").and_then(|v| v.as_str()).map(|s| s.to_string());
                    let cron_expr = job.get("cron").and_then(|v| v.as_str()).map(|s| s.to_string())
                        .or_else(|| job.get("schedule").and_then(|v| v.as_str()).map(|s| s.to_string()));
                    let enabled = job.get("enabled").and_then(|v| v.as_bool());
                    let next_run = job.get("nextRun").and_then(|v| v.as_str()).map(|s| s.to_string())
                        .or_else(|| job.get("nextExecution").and_then(|v| v.as_str()).map(|s| s.to_string()));
                    Some(CronJob {
                        name,
                        cron: cron_expr,
                        enabled,
                        next_run,
                        raw: Some(job.clone()),
                    })
                })
                .collect()
        })
        .unwrap_or_default()
}

/// 从 hello-ok snapshot 中提取在线设备列表
fn extract_presence(hello: &serde_json::Value) -> Vec<PresenceDevice> {
    hello
        .get("presence")
        .and_then(|v| v.as_array())
        .map(|arr| {
            arr.iter()
                .filter_map(|device| {
                    if let Some(id) = device.as_str() {
                        Some(PresenceDevice {
                            id: Some(id.to_string()),
                            name: None,
                            raw: None,
                        })
                    } else {
                        let id = device.get("id").and_then(|v| v.as_str()).map(|s| s.to_string())
                            .or_else(|| device.get("clientId").and_then(|v| v.as_str()).map(|s| s.to_string()));
                        let name = device.get("name").and_then(|v| v.as_str()).map(|s| s.to_string())
                            .or_else(|| device.get("clientName").and_then(|v| v.as_str()).map(|s| s.to_string()));
                        Some(PresenceDevice {
                            id,
                            name,
                            raw: Some(device.clone()),
                        })
                    }
                })
                .collect()
        })
        .unwrap_or_default()
}

/// 从 health payload 中提取会话信息
fn extract_sessions(health: &serde_json::Value) -> SessionsInfo {
    // health.agents[].sessions.count 可能是数组结构
    let active = health.get("sessions")
        .and_then(|v| v.get("active"))
        .and_then(|v| v.as_u64())
        .or_else(|| health.get("sessions").and_then(|v| v.get("count")).and_then(|v| v.as_u64()));

    let total = health.get("sessions")
        .and_then(|v| v.get("total"))
        .and_then(|v| v.as_u64());

    SessionsInfo { active, total }
}

fn extract_skills(health: &serde_json::Value) -> SkillsInfo {
    let s = health.get("skills");
    SkillsInfo {
        enabled: s.and_then(|v| v.get("enabled")).and_then(|v| v.as_u64()),
        total: s.and_then(|v| v.get("total")).and_then(|v| v.as_u64()),
    }
}

fn extract_tokens(health: &serde_json::Value) -> TokensInfo {
    let t = health.get("tokens");
    TokensInfo {
        device_tokens: t.and_then(|v| v.get("deviceTokens")).and_then(|v| v.as_u64()),
        active_connections: t.and_then(|v| v.get("activeConnections")).and_then(|v| v.as_u64()),
    }
}

fn extract_nodes(health: &serde_json::Value) -> NodesInfo {
    let n = health.get("nodes");
    NodesInfo {
        connected: n.and_then(|v| v.get("connected")).and_then(|v| v.as_u64()),
        paired: n.and_then(|v| v.get("paired")).and_then(|v| v.as_u64()),
    }
}

/// 从 status payload 中提取 tasks 统计
fn extract_tasks(status: &serde_json::Value) -> TasksInfo {
    let t = status.get("tasks");
    TasksInfo {
        total: t.and_then(|v| v.get("total")).and_then(|v| v.as_u64()),
        active: t.and_then(|v| v.get("active")).and_then(|v| v.as_u64()),
        succeeded: t.and_then(|v| v.get("succeeded")).and_then(|v| v.as_u64()),
        failed: t.and_then(|v| v.get("failed")).and_then(|v| v.as_u64()),
        pending: t.and_then(|v| v.get("pending")).and_then(|v| v.as_u64()),
    }
}

/// 从 status payload 中提取心跳间隔（毫秒）
fn extract_heartbeat(status: &serde_json::Value) -> Option<u64> {
    status.get("heartbeat").and_then(|v| v.as_u64())
}

/// 从 health payload 中提取心跳秒数
fn extract_heartbeat_seconds(health: &serde_json::Value) -> Option<u64> {
    health.get("heartbeatSeconds").and_then(|v| v.as_u64())
}

/// 清理用户输入的 URL：去除空白、修复常见格式问题
fn sanitize_url(url: &str) -> String {
    let trimmed = url.trim();
    // 去除所有空白字符（空格、制表符、零宽空格等）
    let no_spaces: String = trimmed
        .chars()
        .filter(|c| !c.is_whitespace() && *c != '\u{200B}' && *c != '\u{FEFF}')
        .collect();
    // 替换中文全角字符为半角
    let cleaned: String = no_spaces
        .chars()
        .map(|c| match c {
            '：' => ':',
            '％' => '%',
            '／' => '/',
            '＠' => '@',
            _ => c,
        })
        .collect();
    cleaned
}

/// 从用户输入的 URL 提取 Origin（http://IP:PORT）
fn extract_origin(url: &str) -> String {
    let trimmed = url.trim().trim_end_matches('/');
    // 去掉路径部分，只保留 scheme + host + port
    if let Some(scheme_end) = trimmed.find("://") {
        let scheme = &trimmed[..scheme_end];
        let rest = &trimmed[scheme_end + 3..];
        // 取到第一个 / 之前的部分
        let host_port = rest.split('/').next().unwrap_or(rest);
        format!("{}://{}", scheme, host_port)
    } else {
        // 没有 scheme，假设 http
        let host_port = trimmed.split('/').next().unwrap_or(trimmed);
        format!("http://{}", host_port)
    }
}

/// 将 HTTP URL 转换为 OpenClaw WebSocket URL
///
/// OpenClaw 网关的 WS 端点格式为 `ws://ip:port/{shareCode}/ws`
/// 用户可能输入：
///   - http://ip:port           → ws://ip:port/ws（无 share code）
///   - http://ip:port/abc123    → ws://ip:port/abc123/ws（有 share code）
///   - http://ip:port/abc123/ws → ws://ip:port/abc123/ws（已包含 /ws）
///   - ws://ip:port/abc123/ws   → 直接使用（已是完整 WS URL）
///   - 124.223.x.x:18789/abc123 → ws://124.223.x.x:18789/abc123/ws（纯 IP:PORT）
fn http_to_ws(url: &str) -> String {
    // 清理输入：去首尾空白、去尾部斜杠
    let trimmed = url.trim().trim_end_matches('/');

    // 已经是 ws:// 或 wss:// 开头，直接使用
    if trimmed.starts_with("ws://") || trimmed.starts_with("wss://") {
        // 确保 ws URL 以 /ws 结尾
        if trimmed.ends_with("/ws") {
            return trimmed.to_string();
        }
        return format!("{}/ws", trimmed);
    }

    // 替换协议头
    let with_ws_protocol = if trimmed.starts_with("https://") {
        trimmed.replacen("https://", "wss://", 1)
    } else if trimmed.starts_with("http://") {
        trimmed.replacen("http://", "ws://", 1)
    } else {
        // 纯 IP:PORT/path 格式，加 ws:// 前缀
        format!("ws://{}", trimmed)
    };

    // 如果路径已经以 /ws 结尾，直接返回
    if with_ws_protocol.ends_with("/ws") {
        return with_ws_protocol;
    }

    // 否则追加 /ws
    format!("{}/ws", with_ws_protocol)
}

/// 并发拉取所有节点的状态（WebSocket health + status 方法）
#[tauri::command]
pub async fn fetch_nodes_status(state: State<'_, DbState>) -> Result<Vec<NodeStatusResponse>, String> {
    let nodes_info = {
        let conn = state.conn.lock().map_err(|e: std::sync::PoisonError<_>| e.to_string())?;
        node::get_all_nodes_with_token(&conn)?
    };

    if nodes_info.is_empty() {
        return Ok(vec![]);
    }

    let futures: Vec<_> = nodes_info
        .into_iter()
        .map(|(id, url, token)| {
            async move {
                let start = std::time::Instant::now();
                let clean_url = sanitize_url(&url);
                let ws_url = http_to_ws(&clean_url);
                let origin_url = extract_origin(&clean_url);

                match ws_probe_status(&ws_url, &origin_url, &token).await {
                    Ok(probe) => {
                        let latency_ms = start.elapsed().as_millis() as u64;
                        NodeStatusResponse {
                            node_id: id,
                            node_name: String::new(),
                            endpoint_url: url,
                            online: true,
                            gateway: Some(extract_gateway(&probe)),
                            sessions: Some(extract_sessions(&probe.health_payload)),
                            skills: Some(extract_skills(&probe.health_payload)),
                            tokens: Some(extract_tokens(&probe.health_payload)),
                            nodes: Some(extract_nodes(&probe.health_payload)),
                            channels: extract_channels(&probe.health_payload),
                            agents: extract_agents(&probe.health_payload),
                            cron_jobs: extract_cron_jobs(&probe.cron_payload),
                            presence: extract_presence(&probe.hello_payload),
                            tasks: Some(extract_tasks(&probe.status_payload)),
                            heartbeat_interval: extract_heartbeat(&probe.status_payload),
                            heartbeat_seconds: extract_heartbeat_seconds(&probe.health_payload),
                            error: None,
                            latency_ms,
                        }
                    }
                    Err(err) => {
                        let latency_ms = start.elapsed().as_millis() as u64;
                        NodeStatusResponse {
                            node_id: id,
                            node_name: String::new(),
                            endpoint_url: url,
                            online: false,
                            gateway: None,
                            sessions: None,
                            skills: None,
                            tokens: None,
                            nodes: None,
                            channels: vec![],
                            agents: vec![],
                            cron_jobs: vec![],
                            presence: vec![],
                            tasks: None,
                            heartbeat_interval: None,
                            heartbeat_seconds: None,
                            error: Some(err),
                            latency_ms,
                        }
                    }
                }
            }
        })
        .collect();

    let results = futures::future::join_all(futures).await;
    Ok(results)
}
