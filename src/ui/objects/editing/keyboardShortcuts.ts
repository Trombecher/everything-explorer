import {defaultObject, ObjectType, type EverythingObject} from "@/model";
import {nodeToObject, NodeType, NotANode, objectToNode} from "@/model/nodes";

import {objectToBlock} from "../blocks";
import {childCountOfBlock, LayoutMode} from "../layout";
import type {ObjectSelection} from "../selection";

const isHandledKey = (key: string): boolean =>
    key === "ArrowUp"
    || key === "ArrowDown"
    || key === "ArrowRight"
    || key === "ArrowLeft"
    || key === "Enter"
    || key === "Backspace"
    || key === "Delete"
    || key === "+"
    || key === "="
    || key === "<"
    || key === "&"
    || key === "|"
    || key === "u"
    || key === "n"
    || key === "i"
    || key === "!"
    || key === "q"
    || key === "v"
    || key === "U"
    || key === "F"
    || key === " "
    || key === "*"
    || key === "l"
    || key === "f"
    || key === "m"
    || key === "e"
    || key === "a"
    || key === "t"
    || key === "p"
    || key === "s"
    || key === "c"
    || key === "z";

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

        // Try to add new empty set to object.

        if (props.object.type === ObjectType.Set) {
            props.setObject({
                type: ObjectType.Set,
                elements: [
                    ...props.object.elements,
                    {type: ObjectType.Set, elements: []},
                ],
            });

            props.objectSelection.selectChild(
                Math.max(0, props.object.elements.length - 1),
            );
        } else if (
            props.object.type === ObjectType.Atom
            || props.object.type === ObjectType.Integer
            || props.object.type === ObjectType.Text
        ) {
            // Focus field
            const input = props.event.currentTarget.querySelector("input");

            if (input) {
                input.focus();
                input.select();
            }
        }
    } else if (props.event.key === "Backspace" && !props.event.shiftKey) {
        // Replace parent with this object.

        props.replaceParentWithThis?.();
    } else if (props.event.key === "Delete") {
        // Delete whole object (or replace with empty set).

        props.setObject?.(undefined);
    } else if (props.event.key === "Backspace") {
        if (!props.setObject) return;

        // Delete object but retain a child if possible.

        const node = objectToNode(props.object);

        if (node !== NotANode) {
            switch (node.type) {
                case NodeType.Function: {
                    // Retain body.

                    props.setObject(node.body);
                    break;
                }
                case NodeType.Literal: {
                    // Retain literal.

                    props.setObject(node.object);
                    break;
                }
                case NodeType.Plus: {
                    // Retain first operand.

                    props.setObject(node.first);
                    break;
                }
                case NodeType.Equal: {
                    // Retain first operand.

                    props.setObject(node.first);
                    break;
                }
                case NodeType.Less: {
                    // Retain first operand.

                    props.setObject(node.first);
                    break;
                }
                case NodeType.And: {
                    // Retain first operand.

                    props.setObject(node.first);
                    break;
                }
                case NodeType.Or: {
                    // Retain first operand.

                    props.setObject(node.first);
                    break;
                }
                case NodeType.Not: {
                    // Retain operand.

                    props.setObject(node.operand);
                    break;
                }
                case NodeType.QueryAtomsWithProperty: {
                    // Retain property.

                    props.setObject(node.property);
                    break;
                }
                case NodeType.ValuesOf: {
                    // Retain inner object.

                    props.setObject(node.inner);
                    break;
                }
                case NodeType.Unwrap: {
                    // Retain set.

                    props.setObject(node.set);
                    break;
                }
                case NodeType.Union: {
                    // Retain first operand.

                    props.setObject(node.first);
                    break;
                }
                case NodeType.Filter:
                case NodeType.Map: {
                    // Retain set.

                    props.setObject(node.set);
                    break;
                }
                case NodeType.If: {
                    // Retain condition.

                    props.setObject(node.condition);
                    break;
                }
                case NodeType.Contains: {
                    // Retain element.

                    props.setObject(node.element);
                    break;
                }
                case NodeType.Call: {
                    // Retain callee.

                    props.setObject(node.callee);
                    break;
                }
            }
        } else {
            // We just delete everything.

            props.setObject?.(undefined);
        }
    } else if (props.event.key === "+") {
        if (!props.setObject) return;

        props.setObject(
            nodeToObject({
                type: NodeType.Plus,
                first: props.object,
                second: defaultObject,
                rest: [],
            }),
        );

        props.objectSelection.selectChild(1);
    } else if (props.event.key === "=") {
        if (!props.setObject) return;

        props.setObject(
            nodeToObject({
                type: NodeType.Equal,
                first: props.object,
                second: defaultObject,
                rest: [],
            }),
        );

        props.objectSelection.selectChild(1);
    } else if (props.event.key === "<") {
        if (!props.setObject) return;

        props.setObject(
            nodeToObject({
                type: NodeType.Less,
                first: props.object,
                second: defaultObject,
                rest: [],
            }),
        );

        props.objectSelection.selectChild(1);
    } else if (props.event.key === "&") {
        if (!props.setObject) return;

        props.setObject(
            nodeToObject({
                type: NodeType.And,
                first: props.object,
                second: defaultObject,
                rest: [],
            }),
        );

        props.objectSelection.selectChild(1);
    } else if (props.event.key === "|") {
        if (!props.setObject) return;

        props.setObject(
            nodeToObject({
                type: NodeType.Or,
                first: props.object,
                second: defaultObject,
                rest: [],
            }),
        );

        props.objectSelection.selectChild(1);
    } else if (props.event.key === "u") {
        if (!props.setObject) return;

        props.setObject(
            nodeToObject({
                type: NodeType.Union,
                first: props.object,
                second: defaultObject,
                rest: [],
            }),
        );

        props.objectSelection.selectChild(1);
    } else if (props.event.key === "n" || props.event.key === "!") {
        if (!props.setObject) return;

        props.setObject(
            nodeToObject({type: NodeType.Not, operand: props.object, rest: []}),
        );

        props.objectSelection.selectChild(0);
    } else if (props.event.key === "q") {
        if (!props.setObject) return;

        props.setObject(
            nodeToObject({
                type: NodeType.QueryAtomsWithProperty,
                property: props.object,
                rest: [],
            }),
        );

        props.objectSelection.selectChild(0);
    } else if (props.event.key === "v") {
        if (!props.setObject) return;

        props.setObject(
            nodeToObject({
                type: NodeType.ValuesOf,
                inner: props.object,
                rest: [],
            }),
        );

        props.objectSelection.selectChild(0);
    } else if (props.event.key === "U") {
        if (!props.setObject) return;

        props.setObject(
            nodeToObject({type: NodeType.Unwrap, set: props.object, rest: []}),
        );

        props.objectSelection.selectChild(0);
    } else if (props.event.key === "i") {
        if (!props.setObject) return;

        props.setObject(
            nodeToObject({
                type: NodeType.If,
                condition: props.object,
                thenBranch: defaultObject,
                otherwiseBranch: defaultObject,
                rest: [],
            }),
        );

        props.objectSelection.selectChild(1);
    } else if (props.event.key === "F") {
        if (!props.setObject) return;

        props.setObject(
            nodeToObject({
                type: NodeType.Filter,
                set: props.object,
                filterFunction: defaultObject,
                rest: [],
            }),
        );

        props.objectSelection.selectChild(1);
    } else if (props.event.key === "m") {
        if (!props.setObject) return;

        props.setObject(
            nodeToObject({
                type: NodeType.Map,
                set: props.object,
                mapperFunction: defaultObject,
                rest: [],
            }),
        );

        props.objectSelection.selectChild(1);
    } else if (props.event.key === " ") {
        if (!props.setObject) return;

        props.setObject({
            type: ObjectType.Construction,
            constructor: props.object,
            value: defaultObject,
        });

        props.objectSelection.selectChild(1);
    } else if (props.event.key === "l") {
        if (!props.setObject) return;

        props.setObject(
            nodeToObject({
                type: NodeType.Literal,
                object: props.object,
                rest: [],
            }),
        );

        props.objectSelection.selectChild(0);
    } else if (props.event.key === "f") {
        if (!props.setObject) return;

        props.setObject(
            nodeToObject({
                type: NodeType.Function,
                body: props.object,
                parameterName: undefined,
                rest: [],
            }),
        );

        props.objectSelection.selectChild(0);
    } else if (props.event.key === "p") {
        if (!props.setObject) return;

        props.setObject(
            nodeToObject({type: NodeType.Parameter, depth: 0n, rest: []}),
        );
    } else if (props.event.key === "s") {
        if (!props.setObject) return;

        props.setObject(
            nodeToObject({type: NodeType.FunctionSelf, depth: 0n, rest: []}),
        );
    } else if (props.event.key === "e") {
        if (!props.setObject) return;

        props.setObject(
            nodeToObject({
                type: NodeType.Contains,
                element: props.object,
                set: defaultObject,
                rest: [],
            }),
        );

        props.objectSelection.selectChild(1);
    } else if (props.event.key === "c") {
        if (!props.setObject) return;

        props.setObject(
            nodeToObject({
                type: NodeType.Call,
                callee: props.object,
                with: defaultObject,
                rest: [],
            }),
        );

        props.objectSelection.selectChild(1);
    } else if (props.event.key === "z") {
        if (!props.setObject) return;

        // Replace with number.

        props.setObject({type: ObjectType.Integer, value: 0n});

        // Focus the input once the new object has been rendered. Capture the
        // container because `event.currentTarget` is cleared after dispatch.

        const container = props.event.currentTarget;

        queueMicrotask(() => {
            const input = container.querySelector("input");

            if (input) {
                input.focus();
                input.select();
            }
        });
    } else if (props.event.key === "*") {
        if (!props.setObject) return;

        props.setObject(
            nodeToObject({
                type: NodeType.Times,
                first: props.object,
                second: defaultObject,
                rest: [],
            }),
        );

        props.objectSelection.selectChild(1);
    } else if (props.event.key === "a") {
        // Replace with atom

        props.setObject?.({type: ObjectType.Atom, value: 0n});
    } else if (props.event.key === "t") {
        // Replace with text

        props.setObject?.({type: ObjectType.Text, text: ""});
    }
};
