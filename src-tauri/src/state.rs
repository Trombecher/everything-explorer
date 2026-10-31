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

    async fn create_db(path: PathBuf) -> Result<PersistantKnowledge, String> {
        tauri::async_runtime::spawn_blocking(|| PersistantKnowledge::load(path, true))
            .await
            .unwrap()
            .map_err(|error| error.to_string())
    }

    pub async fn serve_knowledge_base(&self, path: PathBuf) -> Result<u16, String> {
        let maybe_server = self.server.lock().unwrap();

        if let Some(server) = maybe_server.as_ref() {
            // Server already running.
            let port = server.port;

            let serving_path = server.state.path();

            if path != serving_path {
                // Create new db.

                let new_pk = Self::create_db(path).await?;

                let mut pk = server.state.persistant_knowledge.lock().unwrap();

                *pk = new_pk;
            }

            Ok(port)
        } else {
            // Server is not running -> start server and create db.

            let pk = Self::create_db(path).await?;

            let server = PrivateKnowledgeServer::serve(pk)
                .await
                .map_err(|error| error.to_string())?;

            let port = server.port;

            let mut no_server = self.server.lock().unwrap();

            *no_server = Some(server);

            Ok(port)
        }
    }
}
