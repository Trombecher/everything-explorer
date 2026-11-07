import {createEffect, Match, Switch} from "solid-js";

import {defaultObject, ObjectType, type EverythingObject} from "@/model";
import type {Node} from "@/model/nodes";
import {nodeToObject, NodeType, NotANode, objectToNode} from "@/model/nodes";
import type {DeepReadonly} from "@/util";
import {variant} from "@/util";

import AtomView from "./AtomView";
import ConstructionView from "./ConstructionView";
import IntegerView from "./IntegerView";
import {
    CHROME_X,
    LayoutMode,
    calculateLayoutModeOfObject,
    childCountOfObject,
} from "./layout";
import NodeView from "./NodeView";
import type {ObjectSelection, ObjectSelectionPath} from "./selection";
import {useObjectSelection} from "./selection";
import SetObjectView from "./SetObjectView";
import TextView from "./TextView";

const handleKeyDown = (props: {
    event: KeyboardEvent & {currentTarget: HTMLDivElement; target: Element};
    objectSelection: ObjectSelection;
    siblingCount: number;
    object: EverythingObject;
    setObject: ((newObject: EverythingObject | undefined) => void) | undefined;
    replaceParentWithThis: (() => void) | undefined;
    parentObjectLayoutMode: LayoutMode;
}) => {
    if (
        props.event.target.tagName === "INPUT"
        || props.event.target !== props.event.currentTarget
        || props.event.ctrlKey
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
            const childCount = childCountOfObject(props.object);

            if (childCount > 0) props.objectSelection.selectChild("previous");
        } else if (props.parentObjectLayoutMode === LayoutMode.Row) {
            props.objectSelection.selectNextSibling(props.siblingCount);
        }
    } else if (props.event.key === "ArrowLeft") {
        if (props.event.shiftKey) {
            props.objectSelection.selectParent();
        } else if (props.parentObjectLayoutMode === LayoutMode.Row) {
            // Only allow left sibling selection if the layout mode is Row.
            props.objectSelection.selectPreviousSibling();
        }
    } else if (props.event.key === "Enter") {
        if (!props.setObject) return;

        // Try to add new empty set to object.

        if (props.object.type === ObjectType.Set) {
            props.objectSelection.selectChild(props.object.elements.length);

            props.setObject({
                type: ObjectType.Set,
                elements: [
                    ...props.object.elements,
                    {type: ObjectType.Set, elements: []},
                ],
            });
        } else if (
            props.object.type === ObjectType.Atom
            || props.object.type === ObjectType.Integer
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
            }
        } else {
            // We just delete everything.

            props.setObject?.(undefined);
        }
    } else if (props.event.key === "+") {
        props.setObject?.(
            nodeToObject({
                type: NodeType.Plus,
                first: props.object,
                second: defaultObject,
                rest: [],
            }),
        );

        props.objectSelection.selectChild(1);
    } else if (props.event.key === " ") {
        props.setObject?.({
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
                rest: [],
            }),
        );

        props.objectSelection.selectChild(0);
    } else if ("0123456789".includes(props.event.key)) {
        if (!props.setObject) return;

        // Replace with number.

        props.setObject({
            type: ObjectType.Integer,
            value: BigInt(props.event.key),
        });
    } else if (props.event.key === "*") {
        props.setObject?.(
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

const objectViewColorHue = (object: EverythingObject): number => {
    const node = objectToNode(object);

    if (node !== NotANode) {
        switch (node.type) {
            case NodeType.Function:
                return 54;
            case NodeType.Literal:
                return 23;
            case NodeType.Plus:
                return 100;
            case NodeType.Times:
                return 340;
        }
    }

    switch (object.type) {
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
};

export const ObjectView = (props: {
    object: EverythingObject;
    setObject: ((newObject: EverythingObject | undefined) => void) | undefined;
    path: DeepReadonly<ObjectSelectionPath>;

    /**
     * How many siblings this object view has **INCLUDING ITSELF**.
     */
    siblingCount: number;

    /**
     * Available width for this view's border box in px.
     */
    widthBudgetInPixels: number;

    /**
     * Tries to replace the parent with this object. Selection is handled by
     * this function.
     *
     * The object view calling this function is selected.
     */
    replaceParentWithThis: (() => void) | undefined;

    /**
     * The layout mode of the parent object.
     */
    parentObjectLayoutMode: LayoutMode;
}) => {
    const objectSelection = useObjectSelection();

    const contentBudget = () => props.widthBudgetInPixels - CHROME_X;
    const layoutMode = () =>
        calculateLayoutModeOfObject(props.object, props.widthBudgetInPixels);
    const isNode = () => objectToNode(props.object) !== NotANode;

    return (
        <div
            onKeyDown={event =>
                handleKeyDown({
                    event,
                    object: props.object,
                    siblingCount: props.siblingCount,
                    objectSelection: objectSelection,
                    replaceParentWithThis: props.replaceParentWithThis,
                    setObject: props.setObject,
                    parentObjectLayoutMode: props.parentObjectLayoutMode,
                })
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
                "background-color": `light-dark(oklch(0.92 0.07 ${objectViewColorHue(props.object)}), oklch(0.3 0.07 ${objectViewColorHue(props.object)}))`,
            }}
            class={`data-selected:text-always-white flex gap-1 rounded-xl border border-neutral-400 bg-neutral-100 p-1 text-neutral-800 select-none data-selected:border-blue-500 data-selected:bg-blue-500! ${layoutMode() === LayoutMode.Column ? `flex-col ${isNode() ? "items-center" : "items-start"}` : "items-center"}`}
        >
            <Switch>
                <Match when={variant(props.object, ObjectType.Atom)}>
                    {atom => (
                        <AtomView atom={atom()} setAtom={props.setObject} />
                    )}
                </Match>
                <Match when={variant(props.object, ObjectType.Integer)}>
                    {integer => (
                        <IntegerView
                            integer={integer()}
                            setInteger={props.setObject}
                        />
                    )}
                </Match>
                <Match when={filterIsANode(objectToNode(props.object))}>
                    {node => (
                        <NodeView
                            node={node()}
                            setObject={
                                props.setObject
                                && (object => {
                                    props.setObject?.(object);
                                })
                            }
                            path={props.path}
                            childCount={childCountOfObject(props.object)}
                            widthBudgetInPixels={contentBudget()}
                            layoutModeOfEnclosingObjectView={layoutMode()}
                        />
                    )}
                </Match>
                <Match when={variant(props.object, ObjectType.Set)}>
                    {set => (
                        <SetObjectView
                            set={set()}
                            setSet={props.setObject}
                            path={props.path}
                            widthBudgetInPixels={contentBudget()}
                            layoutModeOfEnclosingObjectView={layoutMode()}
                        />
                    )}
                </Match>
                <Match when={variant(props.object, ObjectType.Construction)}>
                    {construction => (
                        <ConstructionView
                            construction={construction()}
                            path={props.path}
                            setObject={props.setObject}
                            widthBudgetInPixels={contentBudget()}
                        />
                    )}
                </Match>
                <Match when={variant(props.object, ObjectType.Text)}>
                    {text => (
                        <TextView text={text()} setText={props.setObject} />
                    )}
                </Match>
                <Match when={true}>NOT IMPL</Match>
            </Switch>
        </div>
    );
};

const filterIsANode = (maybeNode: Node | typeof NotANode): Node | undefined =>
    maybeNode === NotANode ? undefined : maybeNode;

export default ObjectView;
