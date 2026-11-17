use std::{collections::HashMap, iter::Peekable};

use everything::{compute::LazySetIterator, model::Object};

#[cfg(test)]
mod tests;

/// A page of values produced by a lazy set iterator.
pub(crate) struct LazyIteratorPage {
    pub objects: Vec<Object>,
    pub exhausted: bool,
}

/// The lazy set iterators that clients can page through by token.
///
/// Iterators are kept on the server so that the client only transfers the
/// values it actually requests. Each iterator owns a snapshot of the knowledge
/// it was created from, so changes to the served knowledge base do not affect
/// an ongoing iteration.
#[derive(Default)]
pub(crate) struct LazyIterators {
    next_token: u64,
    iterators: HashMap<u64, Peekable<LazySetIterator>>,
}

impl LazyIterators {
    /// Stores the iterator and returns the token used to address it.
    pub fn insert(&mut self, iterator: LazySetIterator) -> u64 {
        self.next_token = self
            .next_token
            .checked_add(1)
            .expect("lazy iterator token overflow");

        let token = self.next_token;

        self.iterators.insert(token, iterator.peekable());

        token
    }

    /// Returns the next page of the iterator with the given token.
    ///
    /// The first `skip` values are consumed and discarded before up to `limit`
    /// values are returned. Returns `None` if the token is unknown. When the
    /// iterator is exhausted, it is removed and the returned page reports
    /// `exhausted = true`.
    pub fn next_page(&mut self, token: u64, skip: usize, limit: usize) -> Option<LazyIteratorPage> {
        let mut objects = Vec::new();
        let mut exhausted = false;

        {
            let iterator = self.iterators.get_mut(&token)?;

            for _ in 0..skip {
                if iterator.next().is_none() {
                    exhausted = true;
                    break;
                }
            }

            if !exhausted {
                for _ in 0..limit {
                    match iterator.next() {
                        Some(object) => objects.push(object),
                        None => {
                            exhausted = true;
                            break;
                        }
                    }
                }
            }

            // Determine exhaustion without consuming a value. This also handles
            // an empty page (`limit == 0`) correctly.
            if !exhausted {
                exhausted = iterator.peek().is_none();
            }
        }

        if exhausted {
            self.iterators.remove(&token);
        }

        Some(LazyIteratorPage { objects, exhausted })
    }

    /// Deletes the iterator with the given token.
    ///
    /// Returns `true` if an iterator was deleted.
    pub fn delete(&mut self, token: u64) -> bool {
        self.iterators.remove(&token).is_some()
    }
}
