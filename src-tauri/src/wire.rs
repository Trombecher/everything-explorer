use everything::{
    model::{Atom, Object},
    num_bigint::BigInt,
};
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
pub struct JsonAtom(pub u128);

impl From<JsonAtom> for Atom {
    fn from(value: JsonAtom) -> Self {
        Self(value.0)
    }
}

#[derive(Deserialize, Serialize)]
pub enum JsonObject {
    Atom(JsonAtom),
    Integer(JsonInteger),
    Construction(JsonConstruction),
    Set(JsonSet),
}

#[derive(Deserialize, Serialize)]
pub struct JsonConstruction {
    constructor: Box<JsonObject>,
    value: Box<JsonObject>,
}

#[derive(Deserialize, Serialize)]
pub struct JsonSet {
    pub items: Vec<JsonObject>,
}

pub struct JsonInteger(BigInt);

impl<'de> Deserialize<'de> for JsonInteger {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        todo!()
    }
}

impl Serialize for JsonInteger {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        todo!()
    }
}

impl From<JsonObject> for Object {
    fn from(value: JsonObject) -> Self {
        todo!()
    }
}

impl From<Object> for JsonObject {
    fn from(value: Object) -> Self {
        todo!()
    }
}
