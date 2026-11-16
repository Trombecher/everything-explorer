use everything::{
    knowledge::Statement,
    model::{Atom, Object},
};
use serde::{Deserialize, Serialize};

use super::{JsonAtom, JsonObject, JsonObjectError};

/// The JSON representation of a statement, i.e. that an atom has an object as
/// a property.
#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct JsonStatement {
    pub atom: JsonAtom,
    pub object: JsonObject,
}

impl TryFrom<JsonStatement> for Statement {
    type Error = JsonObjectError;

    fn try_from(value: JsonStatement) -> Result<Self, Self::Error> {
        Ok(Self {
            atom: Atom(value.atom.0),
            object: Object::try_from(value.object)?,
        })
    }
}

impl From<Statement> for JsonStatement {
    fn from(value: Statement) -> Self {
        Self {
            atom: JsonAtom(value.atom.0),
            object: JsonObject::from(value.object),
        }
    }
}
