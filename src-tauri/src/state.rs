use std::{path::PathBuf, sync::Mutex};

use everything_db::PersistantKnowledge;

use crate::server::PrivateKnowledgeServer;

pub struct AppState {
    pub server: Mutex<Option<PrivateKnowledgeServer>>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            server: Mutex::new(None),
        }
    }

    pub async fn serve_knowledge_base(&self, path: PathBuf) -> Result<u16, String> {
        let pk = tauri::async_runtime::spawn_blocking(|| PersistantKnowledge::load(path, true))
            .await
            .unwrap()
            .map_err(|error| error.to_string())?;

        let (server, port) = PrivateKnowledgeServer::serve(pk)
            .await
            .map_err(|error| error.to_string())?;

        let mut guard = self.server.lock().unwrap();

        if guard.is_some() {
            return Err("cannot override server".into());
        }

        *guard = Some(server);

        Ok(port)
    }
}
