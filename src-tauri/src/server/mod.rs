mod cors;
mod evaluate;
mod routes_v1;
mod wire;

use std::{path::PathBuf, sync::Arc};

use axum::{
    Router,
    routing::{get, post},
};
use cors::cors_layer;
use everything::knowledge::{Knowledge, Statement};
use everything_db::{PersistantKnowledge, StatementChange};
use tauri::async_runtime::JoinHandle;
use tokio::sync::{Mutex, oneshot};

/// The port the knowledge server listens on in development, so that a UI running
/// in a regular browser (e.g. the Vite dev server) can connect to a known URL.
const DEV_SERVER_PORT: u16 = 3000;

/// The address the knowledge server binds to: a fixed localhost port in
/// development, an OS-assigned one otherwise.
fn bind_address() -> String {
    if cfg!(debug_assertions) {
        format!("127.0.0.1:{DEV_SERVER_PORT}")
    } else {
        "127.0.0.1:0".to_owned()
    }
}

pub(crate) struct WebServerState {
    pub persistant_knowledge: Mutex<PersistantKnowledge>,
}

impl WebServerState {
    pub fn new(knowledge: PersistantKnowledge) -> Self {
        Self {
            persistant_knowledge: Mutex::new(knowledge),
        }
    }
}

impl WebServerState {
    pub async fn knowledge(&self) -> Knowledge {
        self.persistant_knowledge.lock().await.knowledge().clone()
    }

    pub async fn path(&self) -> PathBuf {
        self.persistant_knowledge.lock().await.path().to_path_buf()
    }

    pub async fn set_knowledge(&self, knowledge: PersistantKnowledge) {
        *self.persistant_knowledge.lock().await = knowledge;
    }

    pub async fn add_statement(&self, statement: Statement) -> Result<(), everything_db::Error> {
        self.persistant_knowledge
            .lock()
            .await
            .store(std::iter::once(StatementChange::Add(&statement)))
    }

    pub async fn remove_statement(&self, statement: Statement) -> Result<(), everything_db::Error> {
        self.persistant_knowledge
            .lock()
            .await
            .store(std::iter::once(StatementChange::Remove(&statement)))
    }

    pub async fn compact(&self) -> Result<(), everything_db::Error> {
        self.persistant_knowledge.lock().await.compact()
    }
}

pub struct PrivateKnowledgeServer {
    shutdown_trigger: Option<oneshot::Sender<()>>,
    task: JoinHandle<Result<(), std::io::Error>>,
    pub state: Arc<WebServerState>,
    pub port: u16,
}

impl PrivateKnowledgeServer {
    pub async fn serve(persistant_knowledge: PersistantKnowledge) -> std::io::Result<Self> {
        let cors = cors_layer();

        let state = Arc::new(WebServerState::new(persistant_knowledge));

        let app = Router::new()
            .route(
                "/api/v1/servingPath",
                get(routes_v1::serving_knowledge_base_path),
            )
            .route("/api/v1/knownAtoms", get(routes_v1::known_atoms))
            .route("/api/v1/evaluate", post(routes_v1::evaluate_object))
            .route("/api/v1/valuesOf", post(routes_v1::values_of_object))
            .route(
                "/api/v1/constructionValues",
                post(routes_v1::construction_values_of_object),
            )
            .route("/api/v1/addStatement", post(routes_v1::add_statement))
            .route("/api/v1/removeStatement", post(routes_v1::remove_statement))
            .route("/api/v1/compact", post(routes_v1::compact))
            .layer(cors)
            .with_state(Arc::clone(&state));

        let listener = tokio::net::TcpListener::bind(bind_address()).await?;
        let bound_to_port = listener.local_addr()?.port();

        let (shutdown_trigger, shutdown_reader) = oneshot::channel();

        let task = tauri::async_runtime::spawn(async move {
            axum::serve(listener, app)
                .with_graceful_shutdown(async {
                    let _ = shutdown_reader.await;
                })
                .await
        });

        Ok(Self {
            shutdown_trigger: Some(shutdown_trigger),
            task,
            state,
            port: bound_to_port,
        })
    }

    pub async fn shutdown(mut self) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        if let Some(tx) = self.shutdown_trigger.take() {
            let _ = tx.send(());
        }

        self.task.await??;
        Ok(())
    }
}
