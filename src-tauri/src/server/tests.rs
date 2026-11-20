use everything::{
    knowledge::{Statement, Values},
    model::{Atom, Object, Set},
};

use super::{pending_statement_changes, wire::JsonObject};

#[test]
fn empty_text_and_empty_set_are_the_same_statement() {
    let atom = Atom(1);
    let empty_text = Object::from(JsonObject::Text {
        text: String::new(),
    });
    let empty_set = Object::Set(Set::empty());

    assert_eq!(empty_text, empty_set);

    let (adds, removes) =
        pending_statement_changes(atom, vec![empty_text], vec![empty_set], &Values::empty());

    assert_eq!(
        adds,
        vec![Statement {
            atom,
            object: Object::Set(Set::empty()),
        }]
    );
    assert!(removes.is_empty());
}

#[test]
fn an_alias_of_an_existing_statement_is_not_written() {
    let atom = Atom(1);
    let empty_text = Object::from(JsonObject::Text {
        text: String::new(),
    });
    let current = Values::from([Object::Set(Set::empty())]);

    let (adds, removes) = pending_statement_changes(
        atom,
        vec![empty_text],
        vec![Object::Set(Set::empty())],
        &current,
    );

    assert!(adds.is_empty());
    assert!(removes.is_empty());
}

#[test]
fn changes_are_deduplicated_and_filtered_by_the_current_values() {
    let atom = Atom(1);
    let existing = Object::Atom(Atom(1));
    let added = Object::Atom(Atom(2));
    let current = Values::from([existing.clone()]);

    let (adds, removes) = pending_statement_changes(
        atom,
        vec![added.clone(), added.clone()],
        vec![existing.clone(), existing.clone()],
        &current,
    );

    assert_eq!(
        adds,
        vec![Statement {
            atom,
            object: added,
        }]
    );
    assert_eq!(
        removes,
        vec![Statement {
            atom,
            object: existing,
        }]
    );
}
