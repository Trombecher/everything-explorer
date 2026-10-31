use std::path::PathBuf;

use rfd::AsyncFileDialog;
use tauri::{Manager, State, Theme, WebviewWindow};

use crate::state::AppState;

mod server;
mod state;
mod wire;

#[derive(Copy, Clone, PartialEq, Eq, Debug, serde::Deserialize)]
#[serde(rename_all = "lowercase")]
enum FrontendThemeSetting {
    System,
    Dark,
    Light,
}

#[tauri::command]
fn apply_theme_setting(theme_setting: FrontendThemeSetting, webview_window: WebviewWindow) {
    let _ = webview_window.set_theme(match theme_setting {
        FrontendThemeSetting::Dark => Some(Theme::Dark),
        FrontendThemeSetting::Light => Some(Theme::Light),
        FrontendThemeSetting::System => None,
    });
}

#[tauri::command]
async fn pick_knowledge_base_file(window: WebviewWindow) -> Option<String> {
    AsyncFileDialog::new()
        .add_filter("Everything Knowledge Base", &["everythingkb"])
        .set_directory("/")
        .set_parent(&window)
        .set_title("Select Everything Knowledge Base")
        .pick_file()
        .await
        .and_then(|x| PathBuf::from(x.path()).into_string().ok())
}

#[tauri::command]
async fn pick_new_knowledge_base_file(window: WebviewWindow) -> Option<String> {
    AsyncFileDialog::new()
        .add_filter("Everything Knowledge Base", &["everythingkb"])
        .set_directory("/")
        .set_parent(&window)
        .set_title("Select location of new Everything Knowledge Base")
        .save_file()
        .await
        .and_then(|x| PathBuf::from(x.path()).into_string().ok())
}

#[tauri::command]
async fn serve_knowledge_base(path: String, state: State<'_, AppState>) -> Result<u16, String> {
    state.serve_knowledge_base(path.into()).await
}

#[tauri::command]
async fn server_is_running_on_port(state: State<'_, AppState>) -> Result<Option<u16>, ()> {
    Ok(state.server.lock().await.as_ref().map(|server| server.port))
}

#[tauri::command]
async fn stop_serving_knowledge_base(state: State<'_, AppState>) -> Result<(), ()> {
    let maybe_server = state.server.lock().await.take();

    if let Some(server) = maybe_server {
        server.shutdown().await.map_err(|_| ())?;
    }

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            app.manage(AppState::new());
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            apply_theme_setting,
            pick_new_knowledge_base_file,
            pick_knowledge_base_file,
            serve_knowledge_base,
            server_is_running_on_port,
            stop_serving_knowledge_base
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
