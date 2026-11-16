use std::path::PathBuf;

use rfd::AsyncFileDialog;
use tauri::WebviewWindow;

#[tauri::command]
pub(crate) async fn pick_knowledge_base_file(window: WebviewWindow) -> Option<String> {
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
pub(crate) async fn pick_new_knowledge_base_file(window: WebviewWindow) -> Option<String> {
    AsyncFileDialog::new()
        .add_filter("Everything Knowledge Base", &["everythingkb"])
        .set_directory("/")
        .set_parent(&window)
        .set_title("Select location of new Everything Knowledge Base")
        .save_file()
        .await
        .and_then(|x| PathBuf::from(x.path()).into_string().ok())
}
