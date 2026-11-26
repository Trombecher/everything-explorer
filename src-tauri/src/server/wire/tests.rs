use super::*;
use everything::model::{Atom, Object};

fn integer(value: i32) -> Object {
    Object::new_integer(BigInt::from(value))
}

fn contains(item: Object) -> Object {
    Construction::new(Atom::CONTAINS.into(), item).into()
}

fn assert_round_trips(object: Object) {
    let json = JsonObject::from(object.clone());
    let encoded = serde_json::to_string(&json).expect("the object serializes");
    let decoded: JsonObject = serde_json::from_str(&encoded).expect("the object deserializes");
    let decoded_object = Object::from(decoded.clone());

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
fn evaluate_responses_are_tagged() {
    let object = serde_json::to_value(JsonEvaluateResponse::Object {
        object: JsonObject::from(Object::Atom(Atom(1))),
    })
    .expect("the response serializes");

    assert_eq!(object["kind"], "object");
    assert_eq!(object["object"]["type"], "atom");

    let iterator = serde_json::to_value(JsonEvaluateResponse::Iterator { token: 7 })
        .expect("the response serializes");

    assert_eq!(iterator["kind"], "iterator");
    assert_eq!(iterator["token"], 7);
}

#[test]
fn iterator_requests_default_to_skipping_nothing() {
    let request: JsonIteratorRequest =
        serde_json::from_str(r#"{"token": 1, "limit": 10}"#).expect("the request deserializes");

    assert_eq!(
        request,
        JsonIteratorRequest {
            token: 1,
            skip: 0,
            limit: 10,
        }
    );
}

#[test]
fn atoms_round_trip() {
    assert_round_trips(Object::Atom(Atom::ZERO));
    assert_round_trips(Object::Atom(Atom(1)));
    assert_round_trips(Object::Atom(Atom(u128::MAX)));
}

#[test]
fn integers_round_trip_and_zero_is_normalized() {
    assert_round_trips(integer(-1));
    assert_round_trips(integer(1));
    assert_round_trips(Object::new_integer(
        BigInt::from_str("1234567890123456789012345678901234567890").expect("the integer is valid"),
    ));

    let zero = Object::from(JsonObject::Integer {
        value: JsonInteger(BigInt::ZERO),
    });

    assert_eq!(zero, Object::Atom(Atom::ZERO));
}

#[test]
fn character_composites_round_trip() {
    assert_round_trips(Object::Composite(Composite::Character(
        CharacterComposite { representing: 'a' },
    )));
    assert_round_trips(Object::Composite(Composite::Character(
        CharacterComposite {
            representing: '🦀'
        },
    )));
}

#[test]
fn byte_composites_round_trip() {
    assert_round_trips(Object::Composite(Composite::Byte(ByteComposite(0))));
    assert_round_trips(Object::Composite(Composite::Byte(ByteComposite(
        0b1010_1010,
    ))));
    assert_round_trips(Object::Composite(Composite::Byte(ByteComposite(u8::MAX))));
}

#[test]
fn text_composites_round_trip_without_expanding_the_list_structure() {
    let text = "a".repeat(256);

    assert_round_trips(Object::Composite(Composite::Text(
        TextComposite::new(text.into()).expect("the text is not empty"),
    )));

    let json = JsonObject::from(Object::Composite(Composite::Text(
        TextComposite::new("hello 🦀".into()).expect("the text is not empty"),
    )));

    assert_eq!(
        json,
        JsonObject::Text {
            text: "hello 🦀".to_owned()
        }
    );
}

#[test]
fn empty_text_is_the_empty_composite() {
    assert_eq!(
        Object::from(JsonObject::Text {
            text: String::new()
        }),
        Object::Composite(Composite::empty())
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
fn arbitrary_composites_round_trip_as_composites() {
    let composite = Composite::from([
        Object::Atom(Atom(1)),
        Object::Atom(Atom(2)),
        Construction::new(Atom(3).into(), Object::Atom(Atom(4))).into(),
    ]);

    let json = JsonObject::from(Object::Composite(composite.clone()));

    assert!(matches!(json, JsonObject::Composite { .. }));
    assert_round_trips(Object::Composite(composite));
}

#[test]
fn canonical_sets_round_trip_as_sets() {
    let empty = Composite::from_set_items(&[]);
    let singleton = Composite::from_set_items(&[integer(1)]);
    let set = Composite::from_set_items(&[integer(1), integer(2), integer(3)]);

    assert_eq!(
        JsonObject::from(Object::Composite(empty.clone())),
        JsonObject::Set { items: vec![] }
    );
    assert_eq!(
        JsonObject::from(Object::Composite(singleton.clone())),
        JsonObject::Set {
            items: vec![JsonObject::from(integer(1))]
        }
    );
    assert_eq!(
        JsonObject::from(Object::Composite(set.clone())),
        JsonObject::Set {
            items: vec![
                JsonObject::from(integer(1)),
                JsonObject::from(integer(2)),
                JsonObject::from(integer(3)),
            ]
        }
    );

    assert_round_trips(Object::Composite(empty));
    assert_round_trips(Object::Composite(singleton));
    assert_round_trips(Object::Composite(set));
}

#[test]
fn singleton_contains_composites_serialize_as_sets() {
    let composite = Composite::from([contains(integer(1))]);

    assert_eq!(
        JsonObject::from(Object::Composite(composite.clone())),
        JsonObject::Set {
            items: vec![JsonObject::from(integer(1))]
        }
    );
    assert_round_trips(Object::Composite(composite));
}

#[test]
fn one_construction_composites_serialize_as_composites() {
    let construction = Construction::new(Atom(1).into(), Object::Atom(Atom(2)));
    let composite = Composite::from([construction.clone().into()]);

    assert_eq!(
        JsonObject::from(Object::Composite(composite.clone())),
        JsonObject::Composite {
            properties: vec![JsonObject::from(Object::Construction(construction))]
        }
    );
    assert_round_trips(Object::Composite(composite));
}

#[test]
fn open_sets_serialize_as_composites_with_all_properties() {
    let items = [contains(integer(1)), contains(integer(2))];
    let rest = Object::Atom(Atom(5));
    let composite = Composite::from([items[0].clone(), items[1].clone(), rest.clone()]);

    let json = JsonObject::from(Object::Composite(composite.clone()));
    let JsonObject::Composite { properties } = &json else {
        panic!("an open set must serialize as a composite");
    };

    assert!(properties.contains(&JsonObject::from(items[0].clone())));
    assert!(properties.contains(&JsonObject::from(items[1].clone())));
    assert!(properties.contains(&JsonObject::from(rest)));
    assert_round_trips(Object::Composite(composite));
}

#[test]
fn construction_values_requests_deserialize() {
    let request: JsonConstructionValuesRequest = serde_json::from_str(
        r#"{
            "object": {"type": "atom", "value": "1"},
            "constructor": {"type": "construction", "constructor": {"type": "atom", "value": "2"}, "value": {"type": "atom", "value": "3"}}
        }"#,
    )
    .expect("the request deserializes");

    assert_eq!(
        request,
        JsonConstructionValuesRequest {
            object: JsonObject::Atom { value: JsonAtom(1) },
            constructor: JsonObject::Construction {
                constructor: Box::new(JsonObject::Atom { value: JsonAtom(2) }),
                value: Box::new(JsonObject::Atom { value: JsonAtom(3) }),
            },
        }
    );
}

#[test]
fn composite_and_set_requests_deserialize() {
    let composite: JsonObject = serde_json::from_str(
        r#"{"type": "composite", "properties": [
            {"type": "atom", "value": "1"},
            {"type": "construction", "constructor": {"type": "atom", "value": "2"}, "value": {"type": "atom", "value": "3"}}
        ]}"#,
    )
    .expect("the composite deserializes");

    let JsonObject::Composite { properties } = composite else {
        panic!("the object must be a composite");
    };

    assert_eq!(properties.len(), 2);

    let set: JsonObject = serde_json::from_str(
        r#"{"type": "set", "items": [
            {"type": "atom", "value": "1"},
            {"type": "atom", "value": "2"}
        ]}"#,
    )
    .expect("the set deserializes");

    assert!(matches!(set, JsonObject::Set { items } if items.len() == 2));
}

#[test]
fn change_statements_requests_deserialize() {
    let request: JsonChangeStatementsRequest = serde_json::from_str(
        r#"{
            "atom": "1",
            "remove": [{"type": "atom", "value": "2"}],
            "add": [{"type": "text", "text": ""}]
        }"#,
    )
    .expect("the request deserializes");

    assert_eq!(request.atom, JsonAtom(1));
    assert_eq!(
        request.remove,
        vec![JsonObject::Atom { value: JsonAtom(2) }]
    );
    assert_eq!(
        request.add,
        vec![JsonObject::Text {
            text: String::new()
        }]
    );
}

#[test]
fn change_statements_requests_default_to_no_changes() {
    let request: JsonChangeStatementsRequest =
        serde_json::from_str(r#"{"atom": "1"}"#).expect("the request deserializes");

    assert_eq!(request.atom, JsonAtom(1));
    assert!(request.remove.is_empty());
    assert!(request.add.is_empty());
}

#[test]
fn invalid_atom_ids_are_rejected() {
    assert!(
        serde_json::from_str::<JsonObject>(r#"{"type":"atom","value":"not an atom"}"#).is_err()
    );
    assert!(serde_json::from_str::<JsonObject>(r#"{"type":"atom","value":1}"#).is_err());
}
