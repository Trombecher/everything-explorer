use tauri::Manager;

use crate::state::AppState;

use commands::{
    apply_theme_setting, get_app_settings, os_user_full_name, pick_knowledge_base_file,
    pick_new_knowledge_base_file, serve_knowledge_base, server_is_running_on_port,
    set_app_settings, stop_serving_knowledge_base,
};

mod commands;
mod server;
mod state;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.unminimize();
                let _ = window.show();
                let _ = window.set_focus();
            }
        }))
        .setup(|app| {
            app.manage(AppState::new());
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            apply_theme_setting,
            get_app_settings,
            set_app_settings,
            pick_new_knowledge_base_file,
            pick_knowledge_base_file,
            serve_knowledge_base,
            server_is_running_on_port,
            stop_serving_knowledge_base,
            os_user_full_name
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
