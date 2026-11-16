use tauri::State;

use crate::state::AppState;

#[tauri::command]
pub(crate) async fn serve_knowledge_base(
    path: String,
    state: State<'_, AppState>,
) -> Result<u16, String> {
    state.serve_knowledge_base(path.into()).await
}

#[tauri::command]
pub(crate) async fn server_is_running_on_port(
    state: State<'_, AppState>,
) -> Result<Option<u16>, ()> {
    Ok(state.server.lock().await.as_ref().map(|server| server.port))
}

#[tauri::command]
pub(crate) async fn stop_serving_knowledge_base(state: State<'_, AppState>) -> Result<(), ()> {
    let maybe_server = state.server.lock().await.take();

    if let Some(server) = maybe_server {
        server.shutdown().await.map_err(|_| ())?;
    }

    Ok(())
}
