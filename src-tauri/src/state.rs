use std::sync::Mutex;

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
}
