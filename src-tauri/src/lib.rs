use tauri::{Manager, Theme, WebviewWindow};

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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            app.manage(AppState::new());
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![apply_theme_setting])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
