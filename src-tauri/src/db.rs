use rusqlite::{params, Connection, Result as SqlResult};
use serde::{Deserialize, Serialize};
use std::path::Path;
use std::sync::Mutex;

use crate::crypto;

// ── Data Models ──

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VaultEntry {
    pub id: String,
    pub provider: String,
    pub encrypted_key: String,
    pub masked_key: String,
    pub name: String,
    pub category: String,
    pub created_at: String,
    pub updated_at: String,
    pub last_tested: Option<String>,
    pub is_valid: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct AddKeyRequest {
    pub provider: String,
    pub api_key: String,
    pub name: String,
    pub category: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateKeyRequest {
    pub id: String,
    pub name: Option<String>,
    pub category: Option<String>,
}

// ── Database ──

pub struct DbState {
    pub conn: Mutex<Connection>,
}

impl DbState {
    pub fn new(db_path: &Path) -> SqlResult<Self> {
        let conn = Connection::open(db_path)?;
        conn.execute_batch("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;")?;
        Ok(Self {
            conn: Mutex::new(conn),
        })
    }
}

pub fn init_schema(conn: &Connection) -> SqlResult<()> {
    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS vault_entries (
            id            TEXT PRIMARY KEY,
            provider      TEXT NOT NULL,
            encrypted_key TEXT NOT NULL,
            masked_key    TEXT NOT NULL,
            name          TEXT NOT NULL,
            category      TEXT NOT NULL DEFAULT '未分类',
            created_at    TEXT NOT NULL,
            updated_at    TEXT NOT NULL,
            last_tested   TEXT,
            is_valid      BOOLEAN
        );

        CREATE INDEX IF NOT EXISTS idx_vault_provider ON vault_entries(provider);
        CREATE INDEX IF NOT EXISTS idx_vault_category ON vault_entries(category);",
    )?;
    Ok(())
}

// ── CRUD Operations ──

fn mask_api_key(key: &str) -> String {
    if key.len() <= 8 {
        return "sk-***".to_string();
    }
    format!("sk-...{}", &key[key.len() - 4..])
}

fn now_iso() -> String {
    chrono::Utc::now().to_rfc3339()
}

pub fn list_entries(conn: &Connection) -> SqlResult<Vec<VaultEntry>> {
    let mut stmt = conn.prepare(
        "SELECT id, provider, encrypted_key, masked_key, name, category,
                created_at, updated_at, last_tested, is_valid
         FROM vault_entries ORDER BY updated_at DESC",
    )?;

    let entries = stmt
        .query_map([], |row| {
            Ok(VaultEntry {
                id: row.get(0)?,
                provider: row.get(1)?,
                encrypted_key: row.get(2)?,
                masked_key: row.get(3)?,
                name: row.get(4)?,
                category: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
                last_tested: row.get(8)?,
                is_valid: row.get(9)?,
            })
        })?
        .collect::<SqlResult<Vec<_>>>()?;

    Ok(entries)
}

pub fn add_entry(conn: &Connection, req: &AddKeyRequest) -> Result<VaultEntry, String> {
    let id = uuid::Uuid::new_v4().to_string();
    let masked = mask_api_key(&req.api_key);
    let encrypted = crypto::encrypt(&req.api_key)?;
    let now = now_iso();

    conn.execute(
        "INSERT INTO vault_entries (id, provider, encrypted_key, masked_key, name, category, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        params![id, req.provider, encrypted, masked, req.name, req.category, now, now],
    )
    .map_err(|e| e.to_string())?;

    Ok(VaultEntry {
        id,
        provider: req.provider.clone(),
        encrypted_key: encrypted,
        masked_key: masked,
        name: req.name.clone(),
        category: req.category.clone(),
        created_at: now.clone(),
        updated_at: now,
        last_tested: None,
        is_valid: None,
    })
}

pub fn delete_entry(conn: &Connection, id: &str) -> Result<(), String> {
    conn.execute("DELETE FROM vault_entries WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

pub fn update_entry(
    conn: &Connection,
    req: &UpdateKeyRequest,
) -> Result<VaultEntry, String> {
    let now = now_iso();

    // 先获取现有记录
    let existing: VaultEntry = conn
        .query_row(
            "SELECT id, provider, encrypted_key, masked_key, name, category,
                    created_at, updated_at, last_tested, is_valid
             FROM vault_entries WHERE id = ?1",
            params![req.id],
            |row| {
                Ok(VaultEntry {
                    id: row.get(0)?,
                    provider: row.get(1)?,
                    encrypted_key: row.get(2)?,
                    masked_key: row.get(3)?,
                    name: row.get(4)?,
                    category: row.get(5)?,
                    created_at: row.get(6)?,
                    updated_at: row.get(7)?,
                    last_tested: row.get(8)?,
                    is_valid: row.get(9)?,
                })
            },
        )
        .map_err(|e| e.to_string())?;

    let new_name = req.name.as_deref().unwrap_or(&existing.name);
    let new_category = req.category.as_deref().unwrap_or(&existing.category);

    conn.execute(
        "UPDATE vault_entries SET name = ?1, category = ?2, updated_at = ?3 WHERE id = ?4",
        params![new_name, new_category, now, req.id],
    )
    .map_err(|e| e.to_string())?;

    Ok(VaultEntry {
        id: existing.id,
        provider: existing.provider,
        encrypted_key: existing.encrypted_key,
        masked_key: existing.masked_key,
        name: new_name.to_string(),
        category: new_category.to_string(),
        created_at: existing.created_at,
        updated_at: now,
        last_tested: existing.last_tested,
        is_valid: existing.is_valid,
    })
}

/// 解密指定条目的 API Key（用于沙盒调用等场景，不返回给前端列表）
pub fn decrypt_entry_key(conn: &Connection, id: &str) -> Result<String, String> {
    let encrypted: String = conn
        .query_row(
            "SELECT encrypted_key FROM vault_entries WHERE id = ?1",
            params![id],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    crypto::decrypt(&encrypted)
}
