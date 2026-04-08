mod commands;
mod crypto;
mod db;
mod node;

use std::path::PathBuf;

use db::DbState;
use tauri::Manager;

fn get_db_path(app: &tauri::App) -> PathBuf {
    let app_dir = app
        .path()
        .app_data_dir()
        .expect("Failed to resolve app data dir");
    std::fs::create_dir_all(&app_dir).expect("Failed to create app data dir");
    app_dir.join("xpouch-vault.db")
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let db_path = get_db_path(app);
            let db_state = DbState::new(&db_path).expect("Failed to open database");

            // 初始化表结构
            {
                let conn = db_state.conn.lock().expect("Failed to lock DB connection");
                db::init_schema(&conn).expect("Failed to initialize vault schema");
                node::init_node_schema(&conn).expect("Failed to initialize node schema");
            }

            app.manage(db_state);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::list_vault_entries,
            commands::add_api_key,
            commands::delete_api_key,
            commands::update_api_key,
            commands::reveal_api_key,
            commands::ping_api_key,
            commands::list_nodes,
            commands::add_node,
            commands::delete_node,
            commands::update_node,
            commands::fetch_nodes_status,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
