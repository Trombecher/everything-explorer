import {createEffect, createMemo, Match, Switch} from "solid-js";

import {defaultObject, ObjectType, type Object} from "@/model";
import {Atom} from "@/model/atoms";
import {nodeChildCount, nodeToObject, objectToNode} from "@/model/nodes";
import type {DeepReadonly} from "@/util";
import {variant} from "@/util";

import ConstructionView from "./ConstructionView";
import IntegerView from "./IntegerView";
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
            objectSelection.selectNextSibling(siblingCount);
        } else if (childCount > 0) {
            objectSelection.selectChild("previous");
        }
    } else if (e.key === "ArrowLeft") {
        if (e.shiftKey) {
            objectSelection.selectPreviousSibling();
        } else {
            objectSelection.selectParent();
        }
    } else if (e.key === "Enter") {
        if (!setObject) return;

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
    } else if (e.key === "Backspace" || e.key === "Delete") {
        setObject?.(undefined);
    } else if (e.key === "+") {
        setObject?.({
            type: ObjectType.Set,
            elements: [
                {
                    type: ObjectType.Construction,
                    constructor: Atom.NodeAddFirst,
                    value: object,
                },
                {
                    type: ObjectType.Construction,
                    constructor: Atom.NodeAddSecond,
                    value: defaultObject,
                },
            ],
        });
    } else if (e.key === " ") {
        objectSelection.selectChild(1);

        setObject?.({
            type: ObjectType.Construction,
            constructor: object,
            value: defaultObject,
        });
    }
};

export const ObjectView = (props: {
    object: Object;
    setObject: ((newObject: Object | undefined) => void) | undefined;
    path: DeepReadonly<ObjectSelectionPath>;
    siblingCount: number;
}) => {
    const objectSelection = useObjectSelection();

    const maybeNode = createMemo(() => objectToNode(props.object));

    const childCount = createMemo((): number => {
        const node = maybeNode();
        if (node) return nodeChildCount(node.type);

        return objectChildCount(props.object);
    });

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
            class={`data-selected:text-always-white flex items-center gap-1 rounded-lg border border-neutral-400 bg-neutral-100 p-1 text-neutral-800 data-selected:border-blue-700 data-selected:bg-blue-500`}
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
                            setNode={
                                props.setObject &&
                                (node => {
                                    props.setObject?.(nodeToObject(node));
                                })
                            }
                            path={props.path}
                            childCount={childCount()}
                        />
                    )}
                </Match>
                <Match when={variant(props.object, ObjectType.Set)}>
                    {set => (
                        <SetObjectView
                            set={set()}
                            setSet={props.setObject}
                            path={props.path}
                        />
                    )}
                </Match>
                <Match when={variant(props.object, ObjectType.Construction)}>
                    {construction => (
                        <ConstructionView
                            construction={construction()}
                            path={props.path}
                            setObject={props.setObject}
                        />
                    )}
                </Match>
            </Switch>
        </div>
    );
};

export default ObjectView;
