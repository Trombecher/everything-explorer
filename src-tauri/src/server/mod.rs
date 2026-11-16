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
use tower_http::cors::{AllowOrigin, CorsLayer};

const TAURI_DEV_URL: &str = "http://localhost:1420";

/// The port the knowledge server listens on in development, so that a UI running
/// in a regular browser (e.g. the Vite dev server) can connect to a known URL.
const DEV_SERVER_PORT: u16 = 3000;

/// Whether an `Origin` header value points at a localhost origin, on any port.
fn is_localhost_origin(origin: &HeaderValue) -> bool {
    let Ok(origin) = origin.to_str() else {
        return false;
    };

    let Some((scheme, authority)) = origin.split_once("://") else {
        return false;
    };

    if !scheme.eq_ignore_ascii_case("http") && !scheme.eq_ignore_ascii_case("https") {
        return false;
    }

    let authority = authority.split('/').next().unwrap_or_default();

    // Strip the (optional) port, taking care of IPv6 literals such as `[::1]:5173`.
    let host = match authority.strip_prefix('[') {
        Some(rest) => rest.split(']').next().unwrap_or_default(),
        None => authority.split(':').next().unwrap_or_default(),
    };

    matches!(
        host.to_ascii_lowercase().as_str(),
        "localhost" | "127.0.0.1" | "::1"
    )
}

/// The address the knowledge server binds to: a fixed localhost port in
/// development, an OS-assigned one otherwise.
fn bind_address() -> String {
    if cfg!(debug_assertions) {
        format!("127.0.0.1:{DEV_SERVER_PORT}")
    } else {
        "127.0.0.1:0".to_owned()
    }
}

fn cors_layer() -> CorsLayer {
    let cors = CorsLayer::new()
        .allow_methods([Method::GET, Method::POST])
        .allow_headers([header::CONTENT_TYPE, header::CONTENT_LENGTH]);

    if cfg!(debug_assertions) {
        // In development the UI can also be served from a regular browser on an
        // arbitrary local port, so accept every localhost origin.
        cors.allow_origin(AllowOrigin::predicate(|origin, _request_parts| {
            is_localhost_origin(origin)
        }))
    } else {
        cors.allow_origin(TAURI_DEV_URL.parse::<HeaderValue>().unwrap())
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

#[cfg(test)]
mod tests {
    use axum::http::HeaderValue;

    use super::is_localhost_origin;

    #[test]
    fn accepts_localhost_origins_on_any_port() {
        for origin in [
            "http://localhost",
            "http://localhost:1420",
            "http://localhost:5173",
            "https://localhost:8443",
            "http://127.0.0.1:3000",
            "http://[::1]:5173",
            "HTTP://LOCALHOST:1234",
        ] {
            let origin = HeaderValue::from_str(origin).unwrap();
            assert!(is_localhost_origin(&origin), "{origin:?}");
        }
    }

    #[test]
    fn rejects_non_localhost_origins() {
        for origin in [
            "https://example.com",
            "http://localhost.example.com:1420",
            "http://127.0.0.1.example.com",
            "http://192.168.0.2:5173",
            "https://tauri.localhost",
            "tauri://localhost",
            "null",
            "not an origin",
        ] {
            let origin = HeaderValue::from_str(origin).unwrap();
            assert!(!is_localhost_origin(&origin), "{origin:?}");
        }
    }
}
