import {createEffect, createMemo, Match, Switch} from "solid-js";

import {defaultObject, ObjectType, type Object} from "@/model";
import type {Node} from "@/model/nodes";
import {nodeChildCount, nodeToObject, NodeType} from "@/model/nodes";
import type {DeepReadonly} from "@/util";
import {variant} from "@/util";

import ConstructionView from "./ConstructionView";
import IntegerView from "./IntegerView";
import {CHROME_X, naturalWidth, nodeFor} from "./layout";
import NodeView from "./NodeView";
import type {ObjectSelection, ObjectSelectionPath} from "./selection";
import {useObjectSelection} from "./selection";
import SetObjectView from "./SetObjectView";

const objectChildCount = (obj: Object): number => {
    switch (obj.type) {
        case ObjectType.Atom:
            return 0;
        case ObjectType.Byte:
            return 0;
        case ObjectType.Character:
            return 0;
        case ObjectType.Construction:
            return 2;
        case ObjectType.Integer:
            return 0;
        case ObjectType.Set:
            return obj.elements.length;
        case ObjectType.Text:
            return 0;
    }
};

const handleKeyDown = (
    e: KeyboardEvent & {
        currentTarget: HTMLDivElement;
        target: Element;
    },
    objectSelection: ObjectSelection,
    siblingCount: number,
    childCount: number,
    object: Object,
    setObject: ((newObject: Object | undefined) => void) | undefined,
    node: Node | undefined,
    replaceParentWithThis: (() => void) | undefined,
) => {
    if (
        e.target.tagName === "INPUT" ||
        e.target !== e.currentTarget ||
        e.ctrlKey
    )
        return;

    e.preventDefault();

    if (e.key === "ArrowRight") {
        if (e.shiftKey) {
            if (childCount > 0) objectSelection.selectChild("previous");
        } else {
            objectSelection.selectNextSibling(siblingCount);
        }
    } else if (e.key === "ArrowLeft") {
        if (e.shiftKey) {
            objectSelection.selectParent();
        } else {
            objectSelection.selectPreviousSibling();
        }
    } else if (e.key === "Enter") {
        if (!setObject) return;

        // Try to add new empty set to object.

        if (object.type === ObjectType.Set) {
            objectSelection.selectChild(object.elements.length);

            setObject({
                type: ObjectType.Set,
                elements: [
                    ...object.elements,
                    {type: ObjectType.Set, elements: []},
                ],
            });
        }
    } else if (e.key === "Backspace" && !e.shiftKey) {
        // Replace parent with this object.

        replaceParentWithThis?.();
    } else if (e.key === "Delete") {
        // Delete whole object (or replace with empty set).

        setObject?.(undefined);
    } else if (e.key === "Backspace") {
        if (!setObject) return;

        // Delete object but retain a child if possible.

        if (node) {
            switch (node.type) {
                case NodeType.Function: {
                    // Retain body.

                    setObject(node.body);
                    break;
                }
                case NodeType.Literal: {
                    // Retain literal.

                    setObject(node.object);
                    break;
                }
                case NodeType.Plus: {
                    // Retain first operand.

                    setObject(node.first);
                    break;
                }
            }
        } else {
            // We just delete everything.

            setObject?.(undefined);
        }
    } else if (e.key === "+") {
        setObject?.(
            nodeToObject({
                type: NodeType.Plus,
                first: object,
                second: defaultObject,
                rest: [],
            }),
        );

        objectSelection.selectChild(1);
    } else if (e.key === " ") {
        setObject?.({
            type: ObjectType.Construction,
            constructor: object,
            value: defaultObject,
        });

        objectSelection.selectChild(1);
    } else if (e.key === "l") {
        if (!setObject) return;

        setObject(
            nodeToObject({
                type: NodeType.Literal,
                object: object,
                rest: [],
            }),
        );

        objectSelection.selectChild(0);
    } else if (e.key === "f") {
        if (!setObject) return;

        setObject(
            nodeToObject({
                type: NodeType.Function,
                body: object,
                rest: [],
            }),
        );

        objectSelection.selectChild(0);
    } else if ("0123456789".includes(e.key)) {
        if (!setObject) return;

        // Replace with number.

        setObject({type: ObjectType.Integer, value: BigInt(e.key)});
    } else if (e.key === "*") {
        setObject?.(
            nodeToObject({
                type: NodeType.Times,
                first: object,
                second: defaultObject,
                rest: [],
            }),
        );

        objectSelection.selectChild(1);
    }
};

const viewToColorHue = (
    nodeType: NodeType | undefined,
    objectType: ObjectType,
): number => {
    switch (nodeType) {
        case NodeType.Function:
            return 54;
        case NodeType.Literal:
            return 23;
        case NodeType.Plus:
            return 100;
        case NodeType.Times:
            return 340;
        case undefined:
            switch (objectType) {
                case ObjectType.Atom:
                    return 190;
                case ObjectType.Byte:
                    return 200;
                case ObjectType.Integer:
                    return 300;
                case ObjectType.Construction:
                    return 80;
                case ObjectType.Character:
                    return 160;
                case ObjectType.Set:
                    return 220;
                case ObjectType.Text:
                    return 250;
            }
    }
};

export const ObjectView = (props: {
    object: Object;
    setObject: ((newObject: Object | undefined) => void) | undefined;
    path: DeepReadonly<ObjectSelectionPath>;
    siblingCount: number;

    /** Available width for this view's border box in px. */
    budget: number;

    /**
     * Tries to replace the parent with this object.
     * Selection is handled by this function.
     *
     * The object view calling this function is selected.
     */
    replaceParentWithThis: (() => void) | undefined;
}) => {
    const objectSelection = useObjectSelection();

    const maybeNode = createMemo(() => nodeFor(props.object));

    const childCount = createMemo((): number => {
        const node = maybeNode();
        if (node) return nodeChildCount(node.type);

        return objectChildCount(props.object);
    });

    const natural = createMemo(() => naturalWidth(props.object));
    const column = createMemo(
        () => childCount() >= 2 && natural() > props.budget,
    );
    const contentBudget = () => props.budget - CHROME_X;

    return (
        <div
            onKeyDown={e =>
                handleKeyDown(
                    e,
                    objectSelection,
                    props.siblingCount,
                    childCount(),
                    props.object,
                    props.setObject,
                    maybeNode(),
                    props.replaceParentWithThis,
                )
            }
            ref={div => {
                createEffect(() => {
                    if (objectSelection.isSelected(props.path)) {
                        div.focus();
                    }
                });
            }}
            onFocus={() => {
                objectSelection.setPath(props.path);
            }}
            tabIndex={objectSelection.isSelected(props.path) ? 0 : -1}
            data-selected={objectSelection.dataSelected(props.path)}
            style={{
                "background-color": `light-dark(oklch(0.92 0.07 ${viewToColorHue(maybeNode()?.type, props.object.type)}), oklch(0.3 0.07 ${viewToColorHue(maybeNode()?.type, props.object.type)}))`,
            }}
            class={`data-selected:text-always-white flex gap-1 rounded-lg border border-neutral-400 bg-neutral-100 p-1 text-neutral-800 select-none data-selected:border-blue-500 data-selected:bg-blue-500! ${column() ? "flex-col items-start" : "items-center"}`}
        >
            <Switch>
                <Match when={variant(props.object, ObjectType.Atom)}>
                    {atom => <>@{String(atom().value)}</>}
                </Match>
                <Match when={variant(props.object, ObjectType.Integer)}>
                    {integer => (
                        <IntegerView
                            integer={integer()}
                            setInteger={props.setObject}
                        />
                    )}
                </Match>
                <Match when={maybeNode()}>
                    {node => (
                        <NodeView
                            node={node()}
                            setObject={
                                props.setObject &&
                                (object => {
                                    props.setObject?.(object);
                                })
                            }
                            path={props.path}
                            childCount={childCount()}
                            budget={contentBudget()}
                        />
                    )}
                </Match>
                <Match when={variant(props.object, ObjectType.Set)}>
                    {set => (
                        <SetObjectView
                            set={set()}
                            setSet={props.setObject}
                            path={props.path}
                            budget={contentBudget()}
                            column={column()}
                        />
                    )}
                </Match>
                <Match when={variant(props.object, ObjectType.Construction)}>
                    {construction => (
                        <ConstructionView
                            construction={construction()}
                            path={props.path}
                            setObject={props.setObject}
                            budget={contentBudget()}
                        />
                    )}
                </Match>
                <Match when={true}>NOT IMPL</Match>
            </Switch>
        </div>
    );
};

export default ObjectView;
