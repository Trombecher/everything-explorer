use std::sync::Arc;

use axum::{Json, extract::State, http::StatusCode, response::IntoResponse};
use everything::{knowledge::Statement, model::Object};

use crate::server::{
    WebServerState,
    evaluate::Evaluation,
    wire::{
        JsonConstructionValuesRequest, JsonEvaluateResponse, JsonIteratorPage, JsonIteratorRequest,
        JsonIteratorToken, JsonObject, JsonStatement,
    },
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

/// Evaluates the given object in the knowledge base and returns the result.
///
/// Objects that are not nodes evaluate to [`everything::model::Atom::UNDEFINED`].
/// If the result is a lazily computed set, the server stores an iterator for it
/// and returns a token instead of materializing the whole set.
pub async fn evaluate_object(
    State(state): State<Arc<WebServerState>>,
    Json(json): Json<JsonObject>,
) -> Result<Json<JsonEvaluateResponse>, (StatusCode, String)> {
    let object =
        Object::try_from(json).map_err(|error| (StatusCode::BAD_REQUEST, error.to_string()))?;
    let knowledge = state.knowledge().await;

    let response = match crate::server::evaluate::evaluate_lazy(&object, &knowledge) {
        Evaluation::Object(object) => JsonEvaluateResponse::Object {
            object: object.into(),
        },
        Evaluation::Iterator(iterator) => JsonEvaluateResponse::Iterator {
            token: state.insert_lazy_iterator(iterator).await,
        },
    };

    Ok(Json(response))
}

/// Returns the next page of a lazy set iterator.
pub async fn iterator_values(
    State(state): State<Arc<WebServerState>>,
    Json(request): Json<JsonIteratorRequest>,
) -> Result<Json<JsonIteratorPage>, (StatusCode, String)> {
    let page = state
        .next_lazy_iterator_page(request.token, request.skip, request.limit)
        .await
        .ok_or_else(|| {
            (
                StatusCode::NOT_FOUND,
                "unknown lazy iterator token".to_owned(),
            )
        })?;

    Ok(Json(JsonIteratorPage {
        objects: page.objects.into_iter().map(From::from).collect(),
        exhausted: page.exhausted,
    }))
}

/// Deletes a lazy set iterator.
///
/// Deleting an unknown iterator is not an error, so that clients can
/// unconditionally clean up iterators.
pub async fn delete_iterator(
    State(state): State<Arc<WebServerState>>,
    Json(request): Json<JsonIteratorToken>,
) -> StatusCode {
    state.delete_lazy_iterator(request.token).await;

    StatusCode::NO_CONTENT
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
