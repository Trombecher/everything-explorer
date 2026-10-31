use std::path::PathBuf;

use everything_db::PersistantKnowledge;
use tokio::sync::Mutex;

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
        // Hold the guard for the whole operation so concurrent calls cannot race
        // (e.g. both deciding to start a server). `tokio::sync::Mutex` guards are
        // `Send`, so they may be held across await points, unlike `std` ones.
        let mut maybe_server = self.server.lock().await;

        if let Some(server) = maybe_server.as_ref() {
            // Server already running.
            let port = server.port;

            if path != server.state.path().await {
                // Create new db.
                let new_pk = Self::create_db(path).await?;

                server.state.set_knowledge(new_pk).await;
            }

            Ok(port)
        } else {
            // Server is not running -> start server and create db.

            let pk = Self::create_db(path).await?;

            let server = PrivateKnowledgeServer::serve(pk)
                .await
                .map_err(|error| error.to_string())?;

            let port = server.port;

            // Reuse the guard we already hold; locking again here would deadlock.
            *maybe_server = Some(server);

            Ok(port)
        }
    }
}
