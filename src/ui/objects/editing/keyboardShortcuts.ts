import {defaultObject, ObjectType, type EverythingObject} from "@/model";
import {NodeType, nodeToObject, NotANode, objectToNode} from "@/model/nodes";

import {objectToBlock} from "../blocks";
import {childCountOfBlock, LayoutMode} from "../layout";
import type {ObjectSelection} from "../selection";
import {insertObjectForShortcut, isInsertionShortcut} from "./insertObject";
import {
    isQueryNode,
    queryNodeVariants,
    retypeQueryNode,
} from "./queryNodeVariants";
import {
    NoRetainedChild,
    replaceWithRetainedChild,
} from "./replaceWithRetainedChild";

const isQueryVariantKey = (key: string): boolean =>
    key.length === 1 && key >= "1" && key <= "9";

/**
 * Focuses and selects the first input inside the object view. The input is
 * queried asynchronously because the object may have just been replaced.
 */
const focusFirstInput = (container: HTMLElement) => {
    queueMicrotask(() => {
        const input = container.querySelector("input");

        if (input) {
            input.focus();
            input.select();
        }
    });
};

const isHandledKey = (key: string): boolean =>
    key === "ArrowUp"
    || key === "ArrowDown"
    || key === "ArrowRight"
    || key === "ArrowLeft"
    || key === "Enter"
    || key === "Backspace"
    || key === "Delete"
    || isQueryVariantKey(key)
    || isInsertionShortcut(key);

export const handleKeyDown = (props: {
    event: KeyboardEvent & {currentTarget: HTMLDivElement; target: Element};
    objectSelection: ObjectSelection;
    siblingCount: number;
    object: EverythingObject;
    setObject: ((newObject: EverythingObject | undefined) => void) | undefined;
    replaceParentWithThis: (() => void) | undefined;
    parentObjectLayoutMode: LayoutMode;
    leftArrowSiblingIndex: number | undefined;
}) => {
    if (
        props.event.target.tagName === "INPUT"
        || props.event.target !== props.event.currentTarget
        // Do not consume shortcuts of the browser or the OS.
        || props.event.ctrlKey
        || props.event.metaKey
        || props.event.altKey
        // Do not consume keys we have no use for (Tab, F5, ...).
        || !isHandledKey(props.event.key)
    )
        return;

    props.event.preventDefault();

    if (props.event.key === "ArrowUp") {
        if (props.parentObjectLayoutMode === LayoutMode.Column) {
            props.objectSelection.selectPreviousSibling();
        }
    } else if (props.event.key === "ArrowDown") {
        if (props.parentObjectLayoutMode === LayoutMode.Column) {
            props.objectSelection.selectNextSibling(props.siblingCount);
        }
    } else if (props.event.key === "ArrowRight") {
        if (props.event.shiftKey) {
            const childCount = childCountOfBlock(objectToBlock(props.object));

            if (childCount > 0) props.objectSelection.selectChild("previous");
        } else if (props.parentObjectLayoutMode === LayoutMode.Row) {
            props.objectSelection.selectNextSibling(props.siblingCount);
        }
    } else if (props.event.key === "ArrowLeft") {
        if (props.event.shiftKey) {
            props.objectSelection.selectParent();
        } else if (props.leftArrowSiblingIndex !== undefined) {
            // The sibling layout of this object is not simply row or column,
            // so the block tells us which sibling the left arrow selects.
            props.objectSelection.selectSibling(props.leftArrowSiblingIndex);
        } else if (props.parentObjectLayoutMode === LayoutMode.Row) {
            // Only allow left sibling selection if the layout mode is Row.
            props.objectSelection.selectPreviousSibling();
        }
    } else if (props.event.key === "Enter") {
        if (!props.setObject) return;

        // Try to add a new default object to a collection.

        const node = objectToNode(props.object);

        if (node !== NotANode && node.type === NodeType.NewSet) {
            props.setObject(
                nodeToObject({...node, items: [...node.items, defaultObject]}),
            );

            props.objectSelection.selectChild(node.items.length);
        } else if (node !== NotANode && node.type === NodeType.NewComposite) {
            props.setObject(
                nodeToObject({
                    ...node,
                    properties: [...node.properties, defaultObject],
                }),
            );

            props.objectSelection.selectChild(node.properties.length);
        } else if (
            props.object.type === ObjectType.Composite
            || props.object.type === ObjectType.Set
        ) {
            if (props.object.type === ObjectType.Composite) {
                props.setObject({
                    type: ObjectType.Composite,
                    properties: [...props.object.properties, defaultObject],
                });

                props.objectSelection.selectChild(
                    props.object.properties.length,
                );
            } else {
                props.setObject({
                    type: ObjectType.Set,
                    items: [...props.object.items, defaultObject],
                });

                props.objectSelection.selectChild(props.object.items.length);
            }
        } else if (
            props.object.type === ObjectType.Atom
            || props.object.type === ObjectType.Integer
            || props.object.type === ObjectType.Text
            || props.object.type === ObjectType.Character
            || props.object.type === ObjectType.Byte
        ) {
            focusFirstInput(props.event.currentTarget);
        }
    } else if (props.event.key === "Backspace" && !props.event.shiftKey) {
        // Replace parent with this object.

        props.replaceParentWithThis?.();
    } else if (props.event.key === "Delete") {
        // Delete only the selected object. A collection drops the child and
        // every other parent replaces the object with the empty composite, so
        // deleting never removes the surrounding chain of nodes.

        props.setObject?.(undefined);
    } else if (props.event.key === "Backspace") {
        if (!props.setObject) return;

        // Delete object but retain a child if possible.

        const replacement = replaceWithRetainedChild(props.object);

        if (replacement !== NoRetainedChild) props.setObject(replacement);
    } else if (isQueryVariantKey(props.event.key)) {
        if (!props.setObject) return;

        const node = objectToNode(props.object);

        if (node === NotANode || !isQueryNode(node)) return;

        const variant = queryNodeVariants[Number(props.event.key) - 1];

        if (variant === undefined || variant === node.type) return;

        props.setObject(nodeToObject(retypeQueryNode(node, variant)));
    } else {
        const insertion = insertObjectForShortcut(
            props.event.key,
            props.object,
        );

        if (insertion === undefined || !props.setObject) return;

        props.setObject(insertion.object);

        if (insertion.selectChild !== undefined) {
            props.objectSelection.selectChild(insertion.selectChild);
        }

        if (insertion.focusFirstInput) {
            focusFirstInput(props.event.currentTarget);
        }
    }
};
