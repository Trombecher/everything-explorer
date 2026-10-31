use std::{
    path::PathBuf,
    sync::{Arc, Mutex},
};

use axum::{
    Router,
    http::{HeaderValue, Method, header},
    routing::get,
};
use everything::knowledge::Knowledge;
use everything_db::PersistantKnowledge;
use tauri::async_runtime::JoinHandle;
use tokio::sync::oneshot;
use tower_http::cors::CorsLayer;

const TAURI_DEV_URL: &str = "http://localhost:1420";

mod routes_v1 {
    use std::sync::Arc;
    use std::{io::Write, path::PathBuf};

    use axum::{body::Body, extract::State, http::header, response::IntoResponse};

    use crate::server::WebServerState;

    pub async fn serving_knowledge_base_path(
        State(state): State<Arc<WebServerState>>,
    ) -> impl IntoResponse {
        PathBuf::from(state.persistant_knowledge.lock().unwrap().path())
            .into_string()
            .expect("cannot convert pathbuf to string")
    }

    pub async fn known_atoms(State(state): State<Arc<WebServerState>>) -> impl IntoResponse {
        let knowledge = state.knowledge();

        let mut out = Vec::new();
        out.push(b'[');

        for (i, atom) in knowledge.known_atoms().enumerate() {
            if i != 0 {
                out.push(b',');
            }

            out.push(b'"');

            write!(out, "{}", atom.0).unwrap();

            out.push(b'"');
        }

        out.push(b']');

        (
            [(header::CONTENT_TYPE, "application/json")],
            Body::from(out),
        )
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
    pub fn knowledge(&self) -> Knowledge {
        self.persistant_knowledge
            .lock()
            .unwrap()
            .knowledge()
            .clone()
    }

    pub fn path(&self) -> PathBuf {
        self.persistant_knowledge.lock().unwrap().path().into()
    }

    pub fn set_knowledge(&self, knowledge: PersistantKnowledge) {
        *self.persistant_knowledge.lock().unwrap() = knowledge;
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
