use everything::{
    compute::{self, LazyObject, LazySetIterator, Node},
    knowledge::Knowledge,
    model::{Atom, Object, Set},
};

/// The result of evaluating an object.
pub(crate) enum Evaluation {
    /// The evaluation produced a materialized object.
    Object(Object),

    /// The evaluation produced a lazy set. The iterator owns a snapshot of the
    /// knowledge it was created from.
    Iterator(LazySetIterator),
}

/// Evaluates the given object without materializing lazy sets.
pub(crate) fn evaluate_lazy(object: &Object, knowledge: &Knowledge) -> Evaluation {
    let Ok(node) = Node::new(object, knowledge) else {
        return Evaluation::Object(Atom::UNDEFINED.into());
    };

    let lazy_object = compute::evaluate(&node, knowledge);

    if lazy_object.is_lazy() {
        Evaluation::Iterator(lazy_object.into_set_iter(knowledge))
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
            let mut values = iterator.collect::<Vec<_>>();

            Object::Set(Set::from(values.as_mut_slice()))
        }
    }
}

/// Turns a non-lazy evaluation result into a concrete object.
fn materialize(lazy_object: LazyObject, knowledge: &Knowledge) -> Object {
    match lazy_object {
        LazyObject::Eager(object) => object,
        LazyObject::Node(node) => node.into_object(),
        lazy_object => {
            let mut values = lazy_object.iter(knowledge).collect::<Vec<_>>();
            Object::Set(Set::from(values.as_mut_slice()))
        }
    }
}

#[cfg(test)]
mod tests {
    use everything::{
        compute::Node,
        knowledge::{Knowledge, Statement},
        model::{Atom, Construction, Object, Set},
        num_bigint::BigInt,
    };

    use super::{Evaluation, evaluate, evaluate_lazy};

    fn literal(object: Object) -> Object {
        Set::from([Construction::new(Atom::NODE_LITERAL.into(), object).into()]).into()
    }

    fn addition(first: Object, second: Object) -> Object {
        Set::from([
            Construction::new(Atom::NODE_ADD_FIRST.into(), first).into(),
            Construction::new(Atom::NODE_ADD_SECOND.into(), second).into(),
        ])
        .into()
    }

    fn filter(set: Object, filter_function: Object) -> Object {
        Set::from([
            Construction::new(Atom::NODE_FILTER_SET.into(), set).into(),
            Construction::new(Atom::NODE_FILTER_FILTER.into(), filter_function).into(),
        ])
        .into()
    }

    fn map(set: Object, mapper_function: Object) -> Object {
        Set::from([
            Construction::new(Atom::NODE_MAP_SET.into(), set).into(),
            Construction::new(Atom::NODE_MAP_MAPPER.into(), mapper_function).into(),
        ])
        .into()
    }

    fn function(body: Object) -> Object {
        Set::from([Construction::new(Atom::NODE_FUNCTION.into(), body).into()]).into()
    }

    fn equality(first: Object, second: Object) -> Object {
        Set::from([
            Construction::new(Atom::NODE_EQUAL_FIRST.into(), first).into(),
            Construction::new(Atom::NODE_EQUAL_SECOND.into(), second).into(),
        ])
        .into()
    }

    fn parameter(depth: u32) -> Object {
        Set::from([Construction::new(
            Atom::NODE_PARAMETER.into(),
            Object::new_integer(BigInt::from(depth)),
        )
        .into()])
        .into()
    }

    #[test]
    fn evaluates_filter() {
        let knowledge = Knowledge::empty();
        let set: Object = Set::from([
            Object::new_integer(BigInt::from(1)),
            Object::new_integer(BigInt::from(2)),
            Object::new_integer(BigInt::from(3)),
        ])
        .into();
        let predicate = function(equality(
            parameter(0),
            literal(Object::new_integer(BigInt::from(2))),
        ));

        assert_eq!(
            evaluate(&filter(literal(set), predicate), &knowledge),
            Set::from([Object::new_integer(BigInt::from(2))]).into()
        );
    }

    #[test]
    fn evaluates_map() {
        let knowledge = Knowledge::empty();
        let set: Object = Set::from([
            Object::new_integer(BigInt::from(1)),
            Object::new_integer(BigInt::from(2)),
        ])
        .into();
        let identity = function(parameter(0));

        assert_eq!(
            evaluate(&map(literal(set.clone()), identity), &knowledge),
            Set::from([
                Object::new_integer(BigInt::from(1)),
                Object::new_integer(BigInt::from(2)),
            ])
            .into()
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
    fn materializes_lazy_union() {
        let knowledge = Knowledge::empty();
        let union = Set::from([
            Construction::new(
                Atom::NODE_UNION_FIRST.into(),
                literal(Object::new_integer(BigInt::from(1))),
            )
            .into(),
            Construction::new(
                Atom::NODE_UNION_SECOND.into(),
                literal(Object::new_integer(BigInt::from(1))),
            )
            .into(),
        ]);

        assert_eq!(
            evaluate(&Object::Set(union), &knowledge),
            Object::new_integer(BigInt::from(1))
        );
    }

    #[test]
    fn eager_results_are_returned_directly() {
        let set = Object::Set(Set::from([Object::new_integer(BigInt::from(1))]));

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
    fn lazy_atom_values_are_not_materialized() {
        let knowledge = Knowledge::empty();
        let node = Node::ValuesOf(Node::Literal(Object::Atom(Atom(42))).into());

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

        let node = Node::ValuesOf(Node::Literal(Object::Atom(atom)).into());
        let Evaluation::Iterator(iterator) = evaluate_lazy(&node.into(), &knowledge) else {
            panic!("atom values should iterate lazily");
        };

        // The iterator owns the knowledge it was created from.
        knowledge.add_statement(Statement {
            atom,
            object: second,
        });

        assert_eq!(iterator.collect::<Vec<_>>(), vec![first]);
    }
}
