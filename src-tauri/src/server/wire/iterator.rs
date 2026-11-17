use serde::{Deserialize, Serialize};

use super::JsonObject;

/// The response of an evaluation.
///
/// If the evaluation result is a lazily computed set, the server stores a lazy
/// iterator for it and returns a token instead of materializing the whole set.
#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize)]
#[serde(tag = "kind", rename_all = "camelCase")]
pub enum JsonEvaluateResponse {
    Object { object: JsonObject },
    Iterator { token: u64 },
}

/// A request for the next page of a lazy set iterator.
#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct JsonIteratorRequest {
    pub token: u64,

    /// The number of values to consume and discard before collecting values.
    #[serde(default)]
    pub skip: usize,

    /// The maximum number of values to return.
    pub limit: usize,
}

/// A page of values of a lazy set iterator.
#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct JsonIteratorPage {
    pub objects: Vec<JsonObject>,

    /// Whether the iterator has no more values and was deleted on the server.
    pub exhausted: bool,
}

/// Identifies a lazy set iterator on the server.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct JsonIteratorToken {
    pub token: u64,
}
