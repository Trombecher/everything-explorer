use std::sync::Arc;

use axum::{Json, extract::State, http::StatusCode, response::IntoResponse};
use everything::{knowledge::Statement, model::Object};

use crate::server::{
    WebServerState,
    wire::{JsonConstructionValuesRequest, JsonObject, JsonStatement},
};

pub async fn serving_knowledge_base_path(
    State(state): State<Arc<WebServerState>>,
) -> impl IntoResponse {
    state
        .path()
        .await
        .into_string()
        .expect("cannot convert pathbuf to string")
}

pub async fn values_of_object(
    State(state): State<Arc<WebServerState>>,
    Json(json): Json<JsonObject>,
) -> Result<Json<Vec<JsonObject>>, (StatusCode, String)> {
    let object =
        Object::try_from(json).map_err(|error| (StatusCode::BAD_REQUEST, error.to_string()))?;
    let knowledge = state.knowledge().await;
    let values = knowledge.values_of(&object).map(From::from).collect();

    Ok(Json(values))
}

pub async fn construction_values_of_object(
    State(state): State<Arc<WebServerState>>,
    Json(request): Json<JsonConstructionValuesRequest>,
) -> Result<Json<Vec<JsonObject>>, (StatusCode, String)> {
    let object = Object::try_from(request.object)
        .map_err(|error| (StatusCode::BAD_REQUEST, format!("invalid object: {error}")))?;
    let constructor = Object::try_from(request.constructor).map_err(|error| {
        (
            StatusCode::BAD_REQUEST,
            format!("invalid constructor: {error}"),
        )
    })?;
    let knowledge = state.knowledge().await;
    let values = knowledge
        .query_construction_values(&object, constructor)
        .map(From::from)
        .collect();

    Ok(Json(values))
}

pub async fn known_atoms(State(state): State<Arc<WebServerState>>) -> Json<Vec<String>> {
    let knowledge = state.knowledge().await;

    Json(
        knowledge
            .known_atoms()
            .map(|atom| atom.0.to_string())
            .collect(),
    )
}

pub async fn add_statement(
    State(state): State<Arc<WebServerState>>,
    Json(json): Json<JsonStatement>,
) -> Result<StatusCode, (StatusCode, String)> {
    let statement =
        Statement::try_from(json).map_err(|error| (StatusCode::BAD_REQUEST, error.to_string()))?;

    state
        .add_statement(statement)
        .await
        .map_err(|error| (StatusCode::INTERNAL_SERVER_ERROR, error.to_string()))?;

    Ok(StatusCode::NO_CONTENT)
}

pub async fn remove_statement(
    State(state): State<Arc<WebServerState>>,
    Json(json): Json<JsonStatement>,
) -> Result<StatusCode, (StatusCode, String)> {
    let statement =
        Statement::try_from(json).map_err(|error| (StatusCode::BAD_REQUEST, error.to_string()))?;

    state
        .remove_statement(statement)
        .await
        .map_err(|error| (StatusCode::INTERNAL_SERVER_ERROR, error.to_string()))?;

    Ok(StatusCode::NO_CONTENT)
}

pub async fn compact(
    State(state): State<Arc<WebServerState>>,
) -> Result<StatusCode, (StatusCode, String)> {
    state
        .compact()
        .await
        .map_err(|error| (StatusCode::INTERNAL_SERVER_ERROR, error.to_string()))?;

    Ok(StatusCode::NO_CONTENT)
}
