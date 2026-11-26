use everything::model::{
    Atom, ByteComposite, CharacterComposite, Composite, Construction, Object, TextComposite,
};
use serde::{Deserialize, Serialize};

use super::{JsonAtom, JsonInteger};

/// The JSON representation of an [`Object`].
///
/// This mirrors the specialized variants of [`Composite`] rather than expanding
/// every composite into its properties. In particular, a text composite is a
/// virtual composite: expanding it would nest one composite per character and
/// make the payload grow with the square of the text length.
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
    /// A composite that is not a canonical set or has no more specific
    /// representation.
    Composite {
        properties: Vec<JsonObject>,
    },
    /// A canonical set, i.e. a composite whose properties are all
    /// `contains ·· %item%` members.
    Set {
        items: Vec<JsonObject>,
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
            } => Self::Composite(Composite::Character(CharacterComposite { representing })),
            JsonObject::Byte { value } => Self::Composite(Composite::Byte(ByteComposite(value))),
            JsonObject::Text { text } => Self::Composite(
                TextComposite::new(text.into()).map_or_else(Composite::empty, Composite::Text),
            ),
            JsonObject::Construction { constructor, value } => {
                Self::Construction(Construction::new((*constructor).into(), (*value).into()))
            }
            JsonObject::Composite { properties } => {
                let mut objects = properties.into_iter().map(Self::from).collect::<Vec<_>>();

                Self::Composite(Composite::from(objects.as_mut_slice()))
            }
            JsonObject::Set { items } => {
                let objects = items.into_iter().map(Self::from).collect::<Vec<_>>();

                Self::Composite(Composite::from_set_items(&objects))
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
            Object::Composite(composite) => Self::from(composite),
        }
    }
}

impl From<Composite> for JsonObject {
    fn from(value: Composite) -> Self {
        match value {
            Composite::Integer(integer) => Self::Integer {
                value: JsonInteger(integer.representing.get()),
            },
            Composite::Character(character) => Self::Character {
                value: character.representing,
            },
            Composite::Byte(byte) => Self::Byte { value: byte.0 },
            Composite::Text(text) => Self::Text {
                text: text.as_str().to_owned(),
            },
            Composite::OneConstruction(one_construction) => {
                let properties = one_construction.into_iter().collect::<Vec<_>>();

                match properties.as_slice() {
                    [Object::Construction(Construction { constructor, value })]
                        if matches!(constructor.as_ref(), Object::Atom(Atom::CONTAINS)) =>
                    {
                        Self::Set {
                            items: vec![Self::from(value.as_ref().clone())],
                        }
                    }
                    _ => Self::Composite {
                        properties: properties.into_iter().map(Self::from).collect(),
                    },
                }
            }
            Composite::Set(set) => {
                if set.rest().is_empty() {
                    Self::Set {
                        items: set.items().iter().cloned().map(Self::from).collect(),
                    }
                } else {
                    // An open set also has members that are not items. Only
                    // the full property iteration preserves them.
                    Self::Composite {
                        properties: set.into_iter().map(Self::from).collect(),
                    }
                }
            }
            Composite::Any(any) => Self::Composite {
                properties: any.into_iter().map(Self::from).collect(),
            },
        }
    }
}
