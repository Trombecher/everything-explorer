#[tauri::command]
pub(crate) async fn os_user_full_name() -> Result<String, String> {
    whoami::realname().map_err(|error| error.to_string())
}
