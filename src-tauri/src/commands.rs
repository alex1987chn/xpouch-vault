use tauri::State;

use crate::db::{self, AddKeyRequest, DbState, UpdateKeyRequest, VaultEntry};

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
