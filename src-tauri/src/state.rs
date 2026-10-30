use std::sync::Mutex;

use everything_db::PersistantKnowledge;

pub struct AppState {
    pub knowledge: Mutex<Option<PersistantKnowledge>>,
}
