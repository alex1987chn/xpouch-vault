use rusqlite::{params, Connection, Result as SqlResult};
use serde::{Deserialize, Serialize};

use crate::crypto;

// ── Data Models ──

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct OpenClawNode {
    pub id: String,
    pub name: String,
    pub endpoint_url: String,
    pub encrypted_token: String,
    pub masked_token: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct AddNodeRequest {
    pub name: String,
    pub endpoint_url: String,
    pub token: String,
}

// ── Schema ──

pub fn init_node_schema(conn: &Connection) -> SqlResult<()> {
    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS openclaw_nodes (
            id               TEXT PRIMARY KEY,
            name             TEXT NOT NULL,
            endpoint_url     TEXT NOT NULL,
            encrypted_token  TEXT NOT NULL,
            masked_token     TEXT NOT NULL,
            created_at       TEXT NOT NULL,
            updated_at       TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_node_name ON openclaw_nodes(name);",
    )?;
    Ok(())
}

// ── Helpers ──

fn mask_token(token: &str) -> String {
    if token.len() <= 8 {
        return "eyJ***".to_string();
    }
    format!("{}...{}", &token[..4], &token[token.len() - 3..])
}

fn now_iso() -> String {
    chrono::Utc::now().to_rfc3339()
}

// ── CRUD ──

pub fn list_nodes(conn: &Connection) -> Result<Vec<OpenClawNode>, String> {
    let mut stmt = conn
        .prepare(
            "SELECT id, name, endpoint_url, encrypted_token, masked_token, created_at, updated_at
             FROM openclaw_nodes ORDER BY updated_at DESC",
        )
        .map_err(|e| e.to_string())?;

    let nodes = stmt
        .query_map([], |row| {
            Ok(OpenClawNode {
                id: row.get(0)?,
                name: row.get(1)?,
                endpoint_url: row.get(2)?,
                encrypted_token: row.get(3)?,
                masked_token: row.get(4)?,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<SqlResult<Vec<_>>>()
        .map_err(|e| e.to_string())?;

    Ok(nodes)
}

pub fn add_node(conn: &Connection, req: &AddNodeRequest) -> Result<OpenClawNode, String> {
    let id = uuid::Uuid::new_v4().to_string();
    let masked = mask_token(&req.token);
    let encrypted = crypto::encrypt(&req.token)?;
    let now = now_iso();

    conn.execute(
        "INSERT INTO openclaw_nodes (id, name, endpoint_url, encrypted_token, masked_token, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        params![id, req.name, req.endpoint_url, encrypted, masked, now, now],
    )
    .map_err(|e| e.to_string())?;

    Ok(OpenClawNode {
        id,
        name: req.name.clone(),
        endpoint_url: req.endpoint_url.clone(),
        encrypted_token: encrypted,
        masked_token: masked,
        created_at: now.clone(),
        updated_at: now,
    })
}

pub fn delete_node(conn: &Connection, id: &str) -> Result<(), String> {
    conn.execute("DELETE FROM openclaw_nodes WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[derive(Debug, Deserialize)]
pub struct UpdateNodeRequest {
    pub id: String,
    pub name: Option<String>,
    pub endpoint_url: Option<String>,
    pub token: Option<String>,
}

pub fn update_node(conn: &Connection, req: &UpdateNodeRequest) -> Result<OpenClawNode, String> {
    let existing = conn
        .query_row(
            "SELECT id, name, endpoint_url, encrypted_token, masked_token, created_at, updated_at
             FROM openclaw_nodes WHERE id = ?1",
            params![req.id],
            |row| {
                Ok(OpenClawNode {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    endpoint_url: row.get(2)?,
                    encrypted_token: row.get(3)?,
                    masked_token: row.get(4)?,
                    created_at: row.get(5)?,
                    updated_at: row.get(6)?,
                })
            },
        )
        .map_err(|e| e.to_string())?;

    let new_name = req.name.as_deref().unwrap_or(&existing.name);
    let new_url = req.endpoint_url.as_deref().unwrap_or(&existing.endpoint_url);
    let (new_encrypted, new_masked) = match &req.token {
        Some(token) => (crypto::encrypt(token)?, mask_token(token)),
        None => (existing.encrypted_token.clone(), existing.masked_token.clone()),
    };
    let now = now_iso();

    conn.execute(
        "UPDATE openclaw_nodes SET name = ?1, endpoint_url = ?2, encrypted_token = ?3, masked_token = ?4, updated_at = ?5
         WHERE id = ?6",
        params![new_name, new_url, new_encrypted, new_masked, now, req.id],
    )
    .map_err(|e| e.to_string())?;

    Ok(OpenClawNode {
        id: existing.id,
        name: new_name.to_string(),
        endpoint_url: new_url.to_string(),
        encrypted_token: new_encrypted,
        masked_token: new_masked,
        created_at: existing.created_at,
        updated_at: now,
    })
}

/// 解密节点 Token（用于发起状态请求）
pub fn decrypt_node_token(conn: &Connection, id: &str) -> Result<String, String> {
    let encrypted: String = conn
        .query_row(
            "SELECT encrypted_token FROM openclaw_nodes WHERE id = ?1",
            params![id],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    crypto::decrypt(&encrypted)
}

/// 获取所有节点的 id + endpoint_url + 解密后的 token（用于并发探活）
pub fn get_all_nodes_with_token(
    conn: &Connection,
) -> Result<Vec<(String, String, String)>, String> {
    let nodes = list_nodes(conn)?;
    let mut result = Vec::with_capacity(nodes.len());
    for node in nodes {
        let token = crypto::decrypt(&node.encrypted_token)?;
        result.push((node.id, node.endpoint_url, token));
    }
    Ok(result)
}
