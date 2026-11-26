use std::sync::Arc;

use axum::{Json, extract::State, http::StatusCode, response::IntoResponse};
use everything::model::{Atom, AtomOrComposite, Object};

use crate::server::{
    WebServerState,
    evaluate::Evaluation,
    wire::{
        JsonChangeStatementsRequest, JsonConstructionValuesRequest, JsonEvaluateResponse,
        JsonIteratorPage, JsonIteratorRequest, JsonIteratorToken, JsonObject,
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

pub async fn properties_of_object(
    State(state): State<Arc<WebServerState>>,
    Json(json): Json<JsonObject>,
) -> Result<Json<Vec<JsonObject>>, (StatusCode, String)> {
    let object = Object::from(json);
    let object = AtomOrComposite::try_from(object).map_err(|_| {
        (
            StatusCode::BAD_REQUEST,
            "cannot query the properties of a construction".to_owned(),
        )
    })?;
    let knowledge = state.knowledge().await;
    let properties = knowledge.properties_of(&object).map(From::from).collect();

    Ok(Json(properties))
}

pub async fn construction_values_of_object(
    State(state): State<Arc<WebServerState>>,
    Json(request): Json<JsonConstructionValuesRequest>,
) -> Result<Json<Vec<JsonObject>>, (StatusCode, String)> {
    let object = Object::from(request.object);
    let constructor = Object::from(request.constructor);
    let knowledge = state.knowledge().await;
    let values = knowledge
        .query_construction_values(&object, constructor)
        .ok_or_else(|| {
            (
                StatusCode::BAD_REQUEST,
                "cannot query the construction values of a construction".to_owned(),
            )
        })?
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
) -> Json<JsonEvaluateResponse> {
    let object = Object::from(json);
    let knowledge = state.knowledge().await;

    let response = match crate::server::evaluate::evaluate_lazy(&object, &knowledge) {
        Evaluation::Object(object) => JsonEvaluateResponse::Object {
            object: object.into(),
        },
        Evaluation::Iterator(iterator) => JsonEvaluateResponse::Iterator {
            token: state.insert_lazy_iterator(iterator).await,
        },
    };

    Json(response)
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

/// Changes the values of one atom in a single batch.
///
/// Removals are applied before additions, so an object that occurs in both
/// lists remains a value of the atom. This also makes the request idempotent.
pub async fn change_statements(
    State(state): State<Arc<WebServerState>>,
    Json(request): Json<JsonChangeStatementsRequest>,
) -> Result<StatusCode, (StatusCode, String)> {
    let add = request.add.into_iter().map(Object::from).collect();
    let remove = request.remove.into_iter().map(Object::from).collect();

    state
        .change_statements(Atom(request.atom.0), add, remove)
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
