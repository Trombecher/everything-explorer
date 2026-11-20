use serde::Deserialize;

use super::{JsonAtom, JsonObject};

/// The JSON representation of a request to change the statements of one atom.
///
/// The removed objects are applied before the added objects. If the same
/// canonical object occurs in both lists, it is added, so it remains a value of
/// the atom.
#[derive(Debug, Clone, PartialEq, Eq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct JsonChangeStatementsRequest {
    pub atom: JsonAtom,
    #[serde(default)]
    pub remove: Vec<JsonObject>,
    #[serde(default)]
    pub add: Vec<JsonObject>,
}
