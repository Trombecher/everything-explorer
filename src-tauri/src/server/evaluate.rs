#[cfg(test)]
use everything::model::Composite;
use everything::{
    compute::{self, LazyObject, LazySetItems, Node},
    knowledge::Knowledge,
    model::{Atom, Object},
};

/// The result of evaluating an object.
pub(crate) enum Evaluation {
    /// The evaluation produced a materialized object.
    Object(Object),

    /// The evaluation produced a lazy set. The iterator owns a snapshot of the
    /// knowledge it was created from.
    Iterator(LazySetItems),
}

/// Evaluates the given object without materializing lazy sets.
pub(crate) fn evaluate_lazy(object: &Object, knowledge: &Knowledge) -> Evaluation {
    let Ok(node) = Node::new(object, knowledge) else {
        return Evaluation::Object(Atom::UNDEFINED.into());
    };

    let lazy_object = compute::evaluate(&node, knowledge);

    if lazy_object.is_lazy() {
        let set = lazy_object
            .into_set()
            .expect("a lazy object is a lazily computed set");

        Evaluation::Iterator(set.into_items(knowledge))
    } else {
        Evaluation::Object(materialize(lazy_object, knowledge))
    }
}

/// Evaluates the given object and materializes any lazy set.
#[cfg(test)]
pub(crate) fn evaluate(object: &Object, knowledge: &Knowledge) -> Object {
    match evaluate_lazy(object, knowledge) {
        Evaluation::Object(object) => object,
        Evaluation::Iterator(iterator) => {
            let items = iterator.collect::<Vec<_>>();

            Composite::from_set_items(&items).into()
        }
    }
}

/// Turns a non-lazy evaluation result into a concrete object.
fn materialize(lazy_object: LazyObject, knowledge: &Knowledge) -> Object {
    lazy_object.into_object(knowledge)
}

#[cfg(test)]
mod tests {
    use everything::{
        compute::Node,
        knowledge::{Knowledge, Statement},
        model::{Atom, Composite, Construction, Object},
        num_bigint::BigInt,
    };

    use super::{Evaluation, evaluate, evaluate_lazy};

    fn literal(object: Object) -> Object {
        Composite::from([Construction::new(Atom::NODE_LITERAL.into(), object).into()]).into()
    }

    fn addition(first: Object, second: Object) -> Object {
        Composite::from([
            Construction::new(Atom::NODE_ADD_FIRST.into(), first).into(),
            Construction::new(Atom::NODE_ADD_SECOND.into(), second).into(),
        ])
        .into()
    }

    fn filter(set: Object, filter_function: Object) -> Object {
        Composite::from([
            Construction::new(Atom::NODE_SET_FILTER_SET.into(), set).into(),
            Construction::new(Atom::NODE_SET_FILTER_FILTER.into(), filter_function).into(),
        ])
        .into()
    }

    fn map(set: Object, mapper_function: Object) -> Object {
        Composite::from([
            Construction::new(Atom::NODE_SET_MAP_SET.into(), set).into(),
            Construction::new(Atom::NODE_SET_MAP_MAPPER.into(), mapper_function).into(),
        ])
        .into()
    }

    fn function(body: Object) -> Object {
        Composite::from([Construction::new(Atom::NODE_FUNCTION.into(), body).into()]).into()
    }

    fn equality(first: Object, second: Object) -> Object {
        Composite::from([
            Construction::new(Atom::NODE_EQUAL_FIRST.into(), first).into(),
            Construction::new(Atom::NODE_EQUAL_SECOND.into(), second).into(),
        ])
        .into()
    }

    fn parameter(depth: u32) -> Object {
        Composite::from([Construction::new(
            Atom::NODE_PARAMETER.into(),
            Object::new_integer(BigInt::from(depth)),
        )
        .into()])
        .into()
    }

    fn canonical_set(items: &[Object]) -> Object {
        Composite::from_set_items(items).into()
    }

    #[test]
    fn evaluates_filter() {
        let knowledge = Knowledge::empty();
        let set = canonical_set(&[
            Object::new_integer(BigInt::from(1)),
            Object::new_integer(BigInt::from(2)),
            Object::new_integer(BigInt::from(3)),
        ]);
        let predicate = function(equality(
            parameter(0),
            literal(Object::new_integer(BigInt::from(2))),
        ));

        assert_eq!(
            evaluate(&filter(literal(set), predicate), &knowledge),
            canonical_set(&[Object::new_integer(BigInt::from(2))])
        );
    }

    #[test]
    fn evaluates_map() {
        let knowledge = Knowledge::empty();
        let set = canonical_set(&[
            Object::new_integer(BigInt::from(1)),
            Object::new_integer(BigInt::from(2)),
        ]);
        let identity = function(parameter(0));

        assert_eq!(
            evaluate(&map(literal(set.clone()), identity), &knowledge),
            set
        );
    }

    #[test]
    fn evaluates_addition() {
        let knowledge = Knowledge::empty();
        let one = literal(Object::new_integer(BigInt::from(1)));

        assert_eq!(
            evaluate(&addition(one.clone(), one), &knowledge),
            Object::new_integer(BigInt::from(2))
        );
    }

    #[test]
    fn non_node_evaluates_to_undefined() {
        let knowledge = Knowledge::empty();
        let object = Object::new_integer(BigInt::from(7));

        assert_eq!(evaluate(&object, &knowledge), Atom::UNDEFINED.into());
    }

    #[test]
    fn materializes_lazy_union_as_a_canonical_set() {
        let knowledge = Knowledge::empty();
        let first = canonical_set(&[
            Object::new_integer(BigInt::from(1)),
            Object::new_integer(BigInt::from(2)),
        ]);
        let second = canonical_set(&[
            Object::new_integer(BigInt::from(2)),
            Object::new_integer(BigInt::from(3)),
        ]);
        let union = Composite::from([
            Construction::new(Atom::NODE_SET_UNION_FIRST.into(), literal(first)).into(),
            Construction::new(Atom::NODE_SET_UNION_SECOND.into(), literal(second)).into(),
        ]);

        assert_eq!(
            evaluate(&Object::Composite(union), &knowledge),
            canonical_set(&[
                Object::new_integer(BigInt::from(1)),
                Object::new_integer(BigInt::from(2)),
                Object::new_integer(BigInt::from(3)),
            ])
        );
    }

    #[test]
    fn eager_results_are_returned_directly() {
        let set = canonical_set(&[Object::new_integer(BigInt::from(1))]);

        assert!(matches!(
            evaluate_lazy(&literal(set.clone()), &Knowledge::empty()),
            Evaluation::Object(object) if object == set
        ));

        // Non-nodes evaluate to `undefined` instead of a lazy set.
        assert!(matches!(
            evaluate_lazy(&Object::new_integer(BigInt::from(7)), &Knowledge::empty()),
            Evaluation::Object(object) if object == Atom::UNDEFINED.into()
        ));
    }

    #[test]
    fn lazy_properties_are_not_materialized() {
        let knowledge = Knowledge::empty();
        let node = Node::PropertiesOf(Node::Literal(Object::Atom(Atom(42))).into());

        assert!(matches!(
            evaluate_lazy(&node.into(), &knowledge),
            Evaluation::Iterator(_)
        ));
    }

    #[test]
    fn lazy_iterator_captures_the_knowledge_snapshot() {
        let atom = Atom(42);
        let first = Object::new_integer(BigInt::from(1));
        let second = Object::new_integer(BigInt::from(2));

        let mut knowledge = Knowledge::empty();
        knowledge.add_statement(Statement {
            atom,
            object: first.clone(),
        });

        let node = Node::PropertiesOf(Node::Literal(Object::Atom(atom)).into());
        let Evaluation::Iterator(iterator) = evaluate_lazy(&node.into(), &knowledge) else {
            panic!("atom properties should iterate lazily");
        };

        // The iterator owns the knowledge it was created from.
        knowledge.add_statement(Statement {
            atom,
            object: second,
        });

        assert_eq!(iterator.collect::<Vec<_>>(), vec![first]);
    }
}
