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
        BigInt::from_str("1234567890123456789012345678901234567890").expect("the integer is valid"),
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
