use std::path::PathBuf;

use rfd::AsyncFileDialog;
use tauri::{Manager, State, Theme, WebviewWindow};

use crate::state::AppState;

mod server;
mod state;

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

fn app_settings_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    app.path()
        .app_config_dir()
        .map(|dir| dir.join("settings.json"))
        .map_err(|error| error.to_string())
}

/// Returns the stored app settings as a JSON string, or `None` if nothing has been stored yet.
#[tauri::command]
async fn get_app_settings(app: tauri::AppHandle) -> Result<Option<String>, String> {
    let path = app_settings_path(&app)?;

    match tokio::fs::read_to_string(path).await {
        Ok(settings) => Ok(Some(settings)),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(None),
        Err(error) => Err(error.to_string()),
    }
}

/// Stores app settings, which must be a JSON object, as a JSON string.
#[tauri::command]
async fn set_app_settings(app: tauri::AppHandle, settings: String) -> Result<(), String> {
    let parsed: serde_json::Value = serde_json::from_str(&settings)
        .map_err(|error| format!("app settings must be valid JSON: {error}"))?;

    if !parsed.is_object() {
        return Err("app settings must be a JSON object".to_owned());
    }

    let path = app_settings_path(&app)?;

    if let Some(parent) = path.parent() {
        tokio::fs::create_dir_all(parent)
            .await
            .map_err(|error| error.to_string())?;
    }

    tokio::fs::write(path, settings)
        .await
        .map_err(|error| error.to_string())
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
            stop_serving_knowledge_base
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
