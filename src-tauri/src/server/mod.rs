mod cors;
mod evaluate;
mod iterators;
mod routes_v1;
#[cfg(test)]
mod tests;
mod wire;

use std::{collections::BTreeSet, path::PathBuf, sync::Arc};

use axum::{
    Router,
    routing::{get, post},
};
use cors::cors_layer;
use everything::{
    compute::LazySetIterator,
    knowledge::{Knowledge, Statement, Values},
    model::{Atom, Object},
};
use everything_db::{PersistentKnowledge, StatementChange};
use iterators::{LazyIteratorPage, LazyIterators};
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
    pub persistant_knowledge: Mutex<PersistentKnowledge>,
    lazy_iterators: Mutex<LazyIterators>,
}

impl WebServerState {
    pub fn new(knowledge: PersistentKnowledge) -> Self {
        Self {
            persistant_knowledge: Mutex::new(knowledge),
            lazy_iterators: Mutex::new(LazyIterators::default()),
        }
    }
}

impl WebServerState {
    pub async fn knowledge(&self) -> Knowledge {
        self.persistant_knowledge.lock().await.knowledge().clone()
    }

    /// Stores a lazy set iterator and returns its token.
    pub async fn insert_lazy_iterator(&self, iterator: LazySetIterator) -> u64 {
        self.lazy_iterators.lock().await.insert(iterator)
    }

    /// Returns the next page of the lazy set iterator with the given token.
    pub async fn next_lazy_iterator_page(
        &self,
        token: u64,
        skip: usize,
        limit: usize,
    ) -> Option<LazyIteratorPage> {
        self.lazy_iterators
            .lock()
            .await
            .next_page(token, skip, limit)
    }

    /// Deletes the lazy set iterator with the given token.
    pub async fn delete_lazy_iterator(&self, token: u64) -> bool {
        self.lazy_iterators.lock().await.delete(token)
    }

    pub async fn path(&self) -> PathBuf {
        self.persistant_knowledge.lock().await.path().to_path_buf()
    }

    pub async fn set_knowledge(&self, knowledge: PersistentKnowledge) {
        *self.persistant_knowledge.lock().await = knowledge;
    }

    /// Changes the values of the given atom in one batch.
    ///
    /// All objects are canonicalized before they are compared with the current
    /// values, so aliases such as the empty text and the empty set refer to the
    /// same statement. Removals are applied before additions, so an object that
    /// occurs in both lists remains a value of the atom.
    pub async fn change_statements(
        &self,
        atom: Atom,
        add: Vec<Object>,
        remove: Vec<Object>,
    ) -> Result<(), everything_db::Error> {
        let mut persistant_knowledge = self.persistant_knowledge.lock().await;
        let current = persistant_knowledge.knowledge().values_of_atom(&atom);
        let (adds, removes) = pending_statement_changes(atom, add, remove, &current);

        if adds.is_empty() && removes.is_empty() {
            return Ok(());
        }

        let mut changes = Vec::with_capacity(adds.len() + removes.len());
        for statement in &removes {
            changes.push(StatementChange::Remove(statement));
        }
        for statement in &adds {
            changes.push(StatementChange::Add(statement));
        }

        persistant_knowledge.store(changes.into_iter())
    }

    pub async fn compact(&self) -> Result<(), everything_db::Error> {
        self.persistant_knowledge.lock().await.compact()
    }
}

/// Computes the statements to add and remove for a batch change.
///
/// This is where the non-canonical frontend objects meet the canonical model:
/// both lists are reduced to canonical objects first, and an object that occurs
/// in both lists is treated as added. The returned additions and removals are
/// disjoint, so applying them in any order yields the same result.
fn pending_statement_changes(
    atom: Atom,
    add: Vec<Object>,
    remove: Vec<Object>,
    current: &Values,
) -> (Vec<Statement>, Vec<Statement>) {
    let add = add.into_iter().collect::<BTreeSet<_>>();
    let mut remove = remove.into_iter().collect::<BTreeSet<_>>();
    remove.retain(|object| !add.contains(object));

    let adds = add
        .into_iter()
        .filter(|object| !current.has(object))
        .map(|object| Statement { atom, object })
        .collect();
    let removes = remove
        .into_iter()
        .filter(|object| current.has(object))
        .map(|object| Statement { atom, object })
        .collect();

    (adds, removes)
}

pub struct PrivateKnowledgeServer {
    shutdown_trigger: Option<oneshot::Sender<()>>,
    task: JoinHandle<Result<(), std::io::Error>>,
    pub state: Arc<WebServerState>,
    pub port: u16,
}

impl PrivateKnowledgeServer {
    pub async fn serve(persistant_knowledge: PersistentKnowledge) -> std::io::Result<Self> {
        let cors = cors_layer();

        let state = Arc::new(WebServerState::new(persistant_knowledge));

        let app = Router::new()
            .route(
                "/api/v1/servingPath",
                get(routes_v1::serving_knowledge_base_path),
            )
            .route("/api/v1/knownAtoms", get(routes_v1::known_atoms))
            .route("/api/v1/evaluate", post(routes_v1::evaluate_object))
            .route("/api/v1/iteratorValues", post(routes_v1::iterator_values))
            .route("/api/v1/deleteIterator", post(routes_v1::delete_iterator))
            .route("/api/v1/valuesOf", post(routes_v1::values_of_object))
            .route(
                "/api/v1/constructionValues",
                post(routes_v1::construction_values_of_object),
            )
            .route(
                "/api/v1/changeStatements",
                post(routes_v1::change_statements),
            )
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
