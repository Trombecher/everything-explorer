use std::str::FromStr;

use everything::num_bigint::BigInt;
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
/// precision integer. Zero is normalized to [`everything::model::Atom::ZERO`] by
/// [`From<JsonObject> for Object`], as an integer set never represents zero.
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
