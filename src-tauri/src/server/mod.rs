mod routes_v1;
mod wire;

use std::{path::PathBuf, sync::Arc};

use axum::{
    Router,
    http::{HeaderValue, Method, header},
    routing::{get, post},
};
use everything::knowledge::{Knowledge, Statement};
use everything_db::{PersistantKnowledge, StatementChange};
use tauri::async_runtime::JoinHandle;
use tokio::sync::{Mutex, oneshot};
use tower_http::cors::CorsLayer;

const TAURI_DEV_URL: &str = "http://localhost:1420";

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
}

pub struct PrivateKnowledgeServer {
    shutdown_trigger: Option<oneshot::Sender<()>>,
    task: JoinHandle<Result<(), std::io::Error>>,
    pub state: Arc<WebServerState>,
    pub port: u16,
}

impl PrivateKnowledgeServer {
    pub async fn serve(persistant_knowledge: PersistantKnowledge) -> std::io::Result<Self> {
        let cors = CorsLayer::new()
            .allow_origin(TAURI_DEV_URL.parse::<HeaderValue>().unwrap())
            .allow_methods([Method::GET, Method::POST])
            .allow_headers([header::CONTENT_TYPE, header::CONTENT_LENGTH]);

        let state = Arc::new(WebServerState::new(persistant_knowledge));

        let app = Router::new()
            .route(
                "/api/v1/servingPath",
                get(routes_v1::serving_knowledge_base_path),
            )
            .route("/api/v1/knownAtoms", get(routes_v1::known_atoms))
            .route("/api/v1/valuesOf", post(routes_v1::values_of_object))
            .route(
                "/api/v1/constructionValues",
                post(routes_v1::construction_values_of_object),
            )
            .route("/api/v1/addStatement", post(routes_v1::add_statement))
            .route("/api/v1/removeStatement", post(routes_v1::remove_statement))
            .layer(cors)
            .with_state(Arc::clone(&state));

        let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await?;
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
