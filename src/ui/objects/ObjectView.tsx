import {createEffect, Match, Switch} from "solid-js";

import {defaultObject, ObjectType, type Object} from "@/model";
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

const handleKeyDown = (options: {
    event: KeyboardEvent & {currentTarget: HTMLDivElement; target: Element};
    objectSelection: ObjectSelection;
    siblingCount: number;
    object: Object;
    setObject: ((newObject: Object | undefined) => void) | undefined;
    replaceParentWithThis: (() => void) | undefined;
}) => {
    if (
        options.event.target.tagName === "INPUT"
        || options.event.target !== options.event.currentTarget
        || options.event.ctrlKey
    )
        return;

    options.event.preventDefault();

    if (options.event.key === "ArrowRight") {
        if (options.event.shiftKey) {
            const childCount = childCountOfObject(options.object);

            if (childCount > 0) options.objectSelection.selectChild("previous");
        } else {
            options.objectSelection.selectNextSibling(options.siblingCount);
        }
    } else if (options.event.key === "ArrowLeft") {
        if (options.event.shiftKey) {
            options.objectSelection.selectParent();
        } else {
            options.objectSelection.selectPreviousSibling();
        }
    } else if (options.event.key === "Enter") {
        if (!options.setObject) return;

        // Try to add new empty set to object.

        if (options.object.type === ObjectType.Set) {
            options.objectSelection.selectChild(options.object.elements.length);

            options.setObject({
                type: ObjectType.Set,
                elements: [
                    ...options.object.elements,
                    {type: ObjectType.Set, elements: []},
                ],
            });
        } else if (
            options.object.type === ObjectType.Atom
            || options.object.type === ObjectType.Integer
        ) {
            // Focus field
            const input = options.event.currentTarget.querySelector("input");

            if (input) {
                input.focus();
                input.select();
            }
        }
    } else if (options.event.key === "Backspace" && !options.event.shiftKey) {
        // Replace parent with this object.

        options.replaceParentWithThis?.();
    } else if (options.event.key === "Delete") {
        // Delete whole object (or replace with empty set).

        options.setObject?.(undefined);
    } else if (options.event.key === "Backspace") {
        if (!options.setObject) return;

        // Delete object but retain a child if possible.

        const node = objectToNode(options.object);

        if (node !== NotANode) {
            switch (node.type) {
                case NodeType.Function: {
                    // Retain body.

                    options.setObject(node.body);
                    break;
                }
                case NodeType.Literal: {
                    // Retain literal.

                    options.setObject(node.object);
                    break;
                }
                case NodeType.Plus: {
                    // Retain first operand.

                    options.setObject(node.first);
                    break;
                }
            }
        } else {
            // We just delete everything.

            options.setObject?.(undefined);
        }
    } else if (options.event.key === "+") {
        options.setObject?.(
            nodeToObject({
                type: NodeType.Plus,
                first: options.object,
                second: defaultObject,
                rest: [],
            }),
        );

        options.objectSelection.selectChild(1);
    } else if (options.event.key === " ") {
        options.setObject?.({
            type: ObjectType.Construction,
            constructor: options.object,
            value: defaultObject,
        });

        options.objectSelection.selectChild(1);
    } else if (options.event.key === "l") {
        if (!options.setObject) return;

        options.setObject(
            nodeToObject({
                type: NodeType.Literal,
                object: options.object,
                rest: [],
            }),
        );

        options.objectSelection.selectChild(0);
    } else if (options.event.key === "f") {
        if (!options.setObject) return;

        options.setObject(
            nodeToObject({
                type: NodeType.Function,
                body: options.object,
                rest: [],
            }),
        );

        options.objectSelection.selectChild(0);
    } else if ("0123456789".includes(options.event.key)) {
        if (!options.setObject) return;

        // Replace with number.

        options.setObject({
            type: ObjectType.Integer,
            value: BigInt(options.event.key),
        });
    } else if (options.event.key === "*") {
        options.setObject?.(
            nodeToObject({
                type: NodeType.Times,
                first: options.object,
                second: defaultObject,
                rest: [],
            }),
        );

        options.objectSelection.selectChild(1);
    } else if (options.event.key === "a") {
        // Replace with atom

        options.setObject?.({type: ObjectType.Atom, value: 0n});
    } else if (options.event.key === "t") {
        // Replace with text

        options.setObject?.({type: ObjectType.Text, text: ""});
    }
};

const objectViewColorHue = (object: Object): number => {
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
    object: Object;
    setObject: ((newObject: Object | undefined) => void) | undefined;
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
                            budget={contentBudget()}
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
