use everything::model::{Atom, ByteSet, CharacterSet, Construction, Object, Set, TextSet};
use serde::{Deserialize, Serialize};

use super::{JsonAtom, JsonInteger};

/// The JSON representation of an [`Object`].
///
/// This mirrors the specialized variants of [`Set`] rather than expanding
/// every set into its values. In particular, a text set is a virtual set:
/// expanding it would nest one set per character and make the payload grow
/// with the square of the text length.
#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum JsonObject {
    Atom {
        value: JsonAtom,
    },
    Integer {
        value: JsonInteger,
    },
    Character {
        value: char,
    },
    Byte {
        value: u8,
    },
    Text {
        text: String,
    },
    Construction {
        constructor: Box<JsonObject>,
        value: Box<JsonObject>,
    },
    /// A set that has no more specific representation.
    Set {
        elements: Vec<JsonObject>,
    },
}

/// The JSON representation of a request to query construction values.
#[derive(Debug, Clone, PartialEq, Eq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct JsonConstructionValuesRequest {
    pub object: JsonObject,
    pub constructor: JsonObject,
}

impl From<JsonObject> for Object {
    fn from(value: JsonObject) -> Self {
        match value {
            JsonObject::Atom { value } => Self::Atom(Atom(value.0)),
            JsonObject::Integer { value } => Self::new_integer(value.0),
            JsonObject::Character {
                value: representing,
            } => Self::Set(Set::Character(CharacterSet { representing })),
            JsonObject::Byte { value } => Self::Set(Set::Byte(ByteSet(value))),
            JsonObject::Text { text } => {
                Self::Set(TextSet::new(text.into()).map_or_else(Set::empty, Set::Text))
            }
            JsonObject::Construction { constructor, value } => {
                Self::Construction(Construction::new((*constructor).into(), (*value).into()))
            }
            JsonObject::Set { elements } => {
                let mut objects = elements.into_iter().map(Self::from).collect::<Vec<_>>();

                Self::Set(Set::from(objects.as_mut_slice()))
            }
        }
    }
}

impl From<Object> for JsonObject {
    fn from(value: Object) -> Self {
        match value {
            Object::Atom(atom) => Self::Atom {
                value: JsonAtom(atom.0),
            },
            Object::Construction(construction) => Self::Construction {
                constructor: Box::new(Self::from(*construction.constructor)),
                value: Box::new(Self::from(*construction.value)),
            },
            Object::Set(set) => Self::from(set),
        }
    }
}

impl From<Set> for JsonObject {
    fn from(value: Set) -> Self {
        match value {
            Set::Integer(integer) => Self::Integer {
                value: JsonInteger(integer.representing.get()),
            },
            Set::Character(character) => Self::Character {
                value: character.representing,
            },
            Set::Byte(byte) => Self::Byte { value: byte.0 },
            Set::Text(text) => Self::Text {
                text: text.as_str().to_owned(),
            },
            Set::OneConstruction(one_construction) => Self::Set {
                elements: one_construction.into_iter().map(Self::from).collect(),
            },
            Set::Any(any) => Self::Set {
                elements: any.into_iter().map(Self::from).collect(),
            },
        }
    }
}
