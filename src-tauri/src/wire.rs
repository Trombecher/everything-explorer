use std::{fmt, str::FromStr};

use everything::{
    model::{Atom, ByteSet, CharacterSet, Construction, Object, Set, TextSet},
    num_bigint::BigInt,
};
use serde::{Deserialize, Deserializer, Serialize, Serializer};

/// An atom id.
///
/// Atom ids are `u128`s and do not fit into a JavaScript number without losing
/// precision, so they are transferred as decimal strings.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct JsonAtom(pub u128);

impl Serialize for JsonAtom {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(&self.0.to_string())
    }
}

impl<'de> Deserialize<'de> for JsonAtom {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let string = String::deserialize(deserializer)?;

        string
            .parse()
            .map(Self)
            .map_err(|error| serde::de::Error::custom(format!("invalid atom id: {error}")))
    }
}

/// An integer value of an integer set.
///
/// The value is transferred as a decimal string because it is an arbitrary
/// precision integer. Zero is normalized to [`Atom::ZERO`] by
/// [`TryFrom<JsonObject> for Object`], as an integer set never represents zero.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct JsonInteger(pub BigInt);

impl Serialize for JsonInteger {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(&self.0.to_string())
    }
}

impl<'de> Deserialize<'de> for JsonInteger {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let string = String::deserialize(deserializer)?;

        BigInt::from_str(&string)
            .map(Self)
            .map_err(|error| serde::de::Error::custom(format!("invalid integer: {error}")))
    }
}

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

/// Errors that can occur when converting a [`JsonObject`] into an [`Object`].
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum JsonObjectError {
    EmptyText,
}

impl fmt::Display for JsonObjectError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::EmptyText => write!(f, "a text set must not be empty"),
        }
    }
}

impl std::error::Error for JsonObjectError {}

impl TryFrom<JsonObject> for Object {
    type Error = JsonObjectError;

    fn try_from(value: JsonObject) -> Result<Self, Self::Error> {
        Ok(match value {
            JsonObject::Atom { value } => Self::Atom(Atom(value.0)),
            JsonObject::Integer { value } => Self::new_integer(value.0),
            JsonObject::Character {
                value: representing,
            } => Self::Set(Set::Character(CharacterSet { representing })),
            JsonObject::Byte { value } => Self::Set(Set::Byte(ByteSet(value))),
            JsonObject::Text { text } => {
                let text = TextSet::new(text.into()).ok_or(JsonObjectError::EmptyText)?;

                Self::Set(Set::Text(text))
            }
            JsonObject::Construction { constructor, value } => Self::Construction(
                Construction::new(Self::try_from(*constructor)?, Self::try_from(*value)?),
            ),
            JsonObject::Set { elements } => {
                let mut objects = elements
                    .into_iter()
                    .map(Self::try_from)
                    .collect::<Result<Vec<_>, _>>()?;

                Self::Set(Set::from(objects.as_mut_slice()))
            }
        })
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

#[cfg(test)]
mod tests {
    use super::*;
    use everything::model::{Atom, Object};

    fn assert_round_trips(object: Object) {
        let json = JsonObject::from(object.clone());
        let encoded = serde_json::to_string(&json).expect("the object serializes");
        let decoded: JsonObject = serde_json::from_str(&encoded).expect("the object deserializes");
        let decoded_object = Object::try_from(decoded.clone()).expect("the object converts");

        assert_eq!(decoded, json);
        assert_eq!(decoded_object, object);
    }

    #[test]
    fn atoms_are_decimal_strings() {
        let json = serde_json::to_value(JsonObject::from(Object::Atom(Atom(u128::MAX))))
            .expect("the atom serializes");

        assert_eq!(json["type"], "atom");
        assert_eq!(json["value"], u128::MAX.to_string());
    }

    #[test]
    fn atoms_round_trip() {
        assert_round_trips(Object::Atom(Atom::ZERO));
        assert_round_trips(Object::Atom(Atom(1)));
        assert_round_trips(Object::Atom(Atom(u128::MAX)));
    }

    #[test]
    fn integers_round_trip_and_zero_is_normalized() {
        assert_round_trips(Object::new_integer(BigInt::from(-1)));
        assert_round_trips(Object::new_integer(BigInt::from(1)));
        assert_round_trips(Object::new_integer(
            BigInt::from_str("1234567890123456789012345678901234567890")
                .expect("the integer is valid"),
        ));

        let zero = Object::try_from(JsonObject::Integer {
            value: JsonInteger(BigInt::ZERO),
        })
        .expect("zero converts");

        assert_eq!(zero, Object::Atom(Atom::ZERO));
    }

    #[test]
    fn character_sets_round_trip() {
        assert_round_trips(Object::Set(Set::Character(CharacterSet {
            representing: 'a',
        })));
        assert_round_trips(Object::Set(Set::Character(CharacterSet {
            representing: '🦀',
        })));
    }

    #[test]
    fn byte_sets_round_trip() {
        assert_round_trips(Object::Set(Set::Byte(ByteSet(0))));
        assert_round_trips(Object::Set(Set::Byte(ByteSet(0b1010_1010))));
        assert_round_trips(Object::Set(Set::Byte(ByteSet(u8::MAX))));
    }

    #[test]
    fn text_sets_round_trip_without_expanding_the_list_structure() {
        let text = "a".repeat(256);

        assert_round_trips(Object::Set(Set::Text(
            TextSet::new(text.into()).expect("the text is not empty"),
        )));

        let json = JsonObject::from(Object::Set(Set::Text(
            TextSet::new("hello 🦀".into()).expect("the text is not empty"),
        )));

        assert_eq!(
            json,
            JsonObject::Text {
                text: "hello 🦀".to_owned()
            }
        );
    }

    #[test]
    fn empty_text_is_rejected() {
        assert_eq!(
            Object::try_from(JsonObject::Text {
                text: String::new()
            }),
            Err(JsonObjectError::EmptyText)
        );
    }

    #[test]
    fn constructions_round_trip() {
        assert_round_trips(Object::Construction(Construction::new(
            Atom::SUCCESSOR_OF.into(),
            Object::Atom(Atom::ZERO),
        )));
    }

    #[test]
    fn sets_round_trip() {
        let empty = Set::empty();
        let any = Set::from([Object::Atom(Atom(1)), Object::Atom(Atom(2))]);
        let one_construction = Set::from([Object::Construction(Construction::new(
            Object::Atom(Atom(1)),
            Object::Atom(Atom(2)),
        ))]);

        assert_round_trips(Object::Set(empty));
        assert_round_trips(Object::Set(any));
        assert_round_trips(Object::Set(one_construction));
    }

    #[test]
    fn invalid_atom_ids_are_rejected() {
        assert!(
            serde_json::from_str::<JsonObject>(r#"{"type":"atom","value":"not an atom"}"#).is_err()
        );
        assert!(serde_json::from_str::<JsonObject>(r#"{"type":"atom","value":1}"#).is_err());
    }
}
