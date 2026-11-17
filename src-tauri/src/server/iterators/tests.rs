use everything::{
    compute::{LazyObject, LazySetIterator},
    knowledge::Knowledge,
    model::{Object, Set},
    num_bigint::BigInt,
};

use super::LazyIterators;

fn integer(value: i32) -> Object {
    Object::new_integer(BigInt::from(value))
}

fn iterator(values: Vec<Object>) -> LazySetIterator {
    let mut values = values;

    LazyObject::Eager(Object::Set(Set::from(values.as_mut_slice())))
        .into_set_iter(&Knowledge::empty())
}

#[test]
fn pages_until_exhausted_and_then_deletes_the_iterator() {
    let mut iterators = LazyIterators::default();
    let token = iterators.insert(iterator(vec![integer(1), integer(2), integer(3)]));

    let first = iterators
        .next_page(token, 0, 2)
        .expect("the token is known");

    assert_eq!(first.objects, vec![integer(1), integer(2)]);
    assert!(!first.exhausted);

    let second = iterators
        .next_page(token, 0, 2)
        .expect("the token is known");

    assert_eq!(second.objects, vec![integer(3)]);
    assert!(second.exhausted);

    // The iterator was deleted when it got exhausted.
    assert!(iterators.next_page(token, 0, 2).is_none());
    assert!(!iterators.delete(token));
}

#[test]
fn skips_values_before_returning_a_page() {
    let mut iterators = LazyIterators::default();
    let token = iterators.insert(iterator(vec![integer(1), integer(2), integer(3)]));

    let page = iterators
        .next_page(token, 1, 1)
        .expect("the token is known");

    assert_eq!(page.objects, vec![integer(2)]);
    assert!(!page.exhausted);

    // Skipping past the end exhausts and deletes the iterator.
    let page = iterators
        .next_page(token, 10, 10)
        .expect("the token is known");

    assert!(page.objects.is_empty());
    assert!(page.exhausted);
    assert!(iterators.next_page(token, 0, 1).is_none());
}

#[test]
fn zero_limit_pages_do_not_consume_values() {
    let mut iterators = LazyIterators::default();
    let token = iterators.insert(iterator(vec![integer(1)]));

    let empty = iterators
        .next_page(token, 0, 0)
        .expect("the token is known");

    assert!(empty.objects.is_empty());
    assert!(!empty.exhausted);

    let page = iterators
        .next_page(token, 0, 1)
        .expect("the token is known");

    assert_eq!(page.objects, vec![integer(1)]);
    assert!(page.exhausted);
}

#[test]
fn deleting_an_iterator_makes_its_token_unknown() {
    let mut iterators = LazyIterators::default();
    let token = iterators.insert(iterator(vec![integer(1)]));

    assert!(iterators.delete(token));
    assert!(!iterators.delete(token));
    assert!(iterators.next_page(token, 0, 1).is_none());
}

#[test]
fn tokens_are_distinct() {
    let mut iterators = LazyIterators::default();
    let first = iterators.insert(iterator(vec![integer(1)]));
    let second = iterators.insert(iterator(vec![integer(2)]));

    assert_ne!(first, second);
    assert_eq!(
        iterators
            .next_page(second, 0, 1)
            .expect("the token is known")
            .objects,
        vec![integer(2)]
    );
}
