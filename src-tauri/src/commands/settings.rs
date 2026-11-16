use std::path::PathBuf;

use tauri::{Manager, Theme, WebviewWindow};

#[derive(Copy, Clone, PartialEq, Eq, Debug, serde::Deserialize)]
#[serde(rename_all = "lowercase")]
pub(crate) enum FrontendThemeSetting {
    System,
    Dark,
    Light,
}

#[tauri::command]
pub(crate) fn apply_theme_setting(
    theme_setting: FrontendThemeSetting,
    webview_window: WebviewWindow,
) {
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
pub(crate) async fn get_app_settings(app: tauri::AppHandle) -> Result<Option<String>, String> {
    let path = app_settings_path(&app)?;

    match tokio::fs::read_to_string(path).await {
        Ok(settings) => Ok(Some(settings)),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(None),
        Err(error) => Err(error.to_string()),
    }
}

/// Stores app settings, which must be a JSON object, as a JSON string.
#[tauri::command]
pub(crate) async fn set_app_settings(
    app: tauri::AppHandle,
    settings: String,
) -> Result<(), String> {
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
