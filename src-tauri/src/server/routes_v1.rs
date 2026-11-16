use std::sync::Arc;

use axum::{Json, extract::State, http::StatusCode, response::IntoResponse};
use everything::{
    compute::{self, LazyObject, Node},
    knowledge::{Knowledge, Statement},
    model::{Atom, Object, Set},
};

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

/// Evaluates the given object in the knowledge base and returns the result.
///
/// Objects that are not nodes evaluate to [`Atom::UNDEFINED`].
pub async fn evaluate_object(
    State(state): State<Arc<WebServerState>>,
    Json(json): Json<JsonObject>,
) -> Result<Json<JsonObject>, (StatusCode, String)> {
    let object =
        Object::try_from(json).map_err(|error| (StatusCode::BAD_REQUEST, error.to_string()))?;
    let knowledge = state.knowledge().await;

    Ok(Json(evaluate(&object, &knowledge).into()))
}

fn evaluate(object: &Object, knowledge: &Knowledge) -> Object {
    let Ok(node) = Node::new(object, knowledge) else {
        return Atom::UNDEFINED.into();
    };

    materialize(compute::evaluate(&node, knowledge), knowledge)
}

/// Turns a (potentially lazy) evaluation result into a concrete object.
fn materialize(lazy_object: LazyObject, knowledge: &Knowledge) -> Object {
    match lazy_object {
        LazyObject::Eager(object) => object,
        LazyObject::Node(node) => node.into_object(),
        lazy_object => {
            let mut values = lazy_object.iter(knowledge).collect::<Vec<_>>();
            Object::Set(Set::from(values.as_mut_slice()))
        }
    }
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

#[cfg(test)]
mod tests {
    use everything::{
        knowledge::Knowledge,
        model::{Atom, Construction, Object, Set},
        num_bigint::BigInt,
    };

    use super::evaluate;

    fn literal(object: Object) -> Object {
        Set::from([Construction::new(Atom::NODE_LITERAL.into(), object).into()]).into()
    }

    fn addition(first: Object, second: Object) -> Object {
        Set::from([
            Construction::new(Atom::NODE_ADD_FIRST.into(), first).into(),
            Construction::new(Atom::NODE_ADD_SECOND.into(), second).into(),
        ])
        .into()
    }

    #[test]
    fn evaluates_addition() {
        let knowledge = Knowledge::empty();
        let one = literal(Object::new_integer(BigInt::from(1)));

        assert_eq!(
            evaluate(&addition(one.clone(), one), &knowledge),
            Object::new_integer(BigInt::from(2))
        );
    }

    #[test]
    fn non_node_evaluates_to_undefined() {
        let knowledge = Knowledge::empty();
        let object = Object::new_integer(BigInt::from(7));

        assert_eq!(evaluate(&object, &knowledge), Atom::UNDEFINED.into());
    }

    #[test]
    fn materializes_lazy_union() {
        let knowledge = Knowledge::empty();
        let union = Set::from([
            Construction::new(
                Atom::NODE_UNION_FIRST.into(),
                literal(Object::new_integer(BigInt::from(1))),
            )
            .into(),
            Construction::new(
                Atom::NODE_UNION_SECOND.into(),
                literal(Object::new_integer(BigInt::from(1))),
            )
            .into(),
        ]);

        assert_eq!(
            evaluate(&Object::Set(union), &knowledge),
            Object::new_integer(BigInt::from(1))
        );
    }
}
