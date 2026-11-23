import type {Accessor} from "solid-js";
import {createEffect} from "solid-js";

import type {ObjectSelection} from "./selection";

/**
 * Serializes a selection path for use as the value of the `data-object-path`
 * attribute.
 *
 * Path components are non-negative integers, so joining them with `.` is
 * unambiguous.
 */
export const objectPathKey = (path: readonly number[]): string =>
    path.join(".");

/**
 * Focuses the object view that a focus request of `selection` points at.
 *
 * There is exactly one of these per rendered object view tree, rooted at the
 * element that contains the tree. A focus request therefore runs one effect per
 * tree instead of one effect per object view.
 *
 * `container` is read when a request arrives. It may be `undefined` while the
 * tree is not rendered; the request then expires through its own microtask
 * cleanup.
 */
export const createObjectSelectionFocus = (
    selection: ObjectSelection,
    container: Accessor<HTMLElement | undefined>,
) => {
    createEffect(() => {
        const request = selection.focusRequest();
        if (request === undefined) return;

        const root = container();
        if (root === undefined) return;

        selection.clearFocusRequest(request);

        const target = root.querySelector<HTMLElement>(
            `[data-object-path="${objectPathKey(request)}"]`,
        );
        if (target === null) return;

        // Focusing a view that contains a focused input would steal focus from
        // that input. A focused descendant object view, on the other hand, must
        // lose focus when the cursor moves to this ancestor.
        const active = document.activeElement;
        const activeIsView =
            active instanceof Element && active.matches("[data-object-view]");

        if (activeIsView || !target.contains(active)) target.focus();
    });
};
