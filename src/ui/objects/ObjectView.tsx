import {
    createComputed,
    createEffect,
    createMemo,
    createSignal,
    Match,
    Switch,
} from "solid-js";

import {defaultObject, ObjectType, type Object} from "@/model";
import {Atom} from "@/model/atoms";
import {nodeChildCount, nodeToObject, objectToNode} from "@/model/nodes";
import BlackBoardZIcon from "@/ui/reuse/BlackBoardZIcon";
import type {DeepReadonly} from "@/util";
import {variant} from "@/util";

import NodeView from "./NodeView";
import type {ObjectSelectionPath} from "./selection";
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
            onKeyDown={e => {
                if (
                    e.target.tagName === "INPUT" ||
                    e.target !== e.currentTarget ||
                    e.ctrlKey
                )
                    return;

                e.preventDefault();

                if (e.key === "ArrowRight") {
                    if (e.shiftKey) {
                        objectSelection.selectNextSibling(props.siblingCount);
                    } else if (childCount() > 0) {
                        objectSelection.selectChild("previous");
                    }
                } else if (e.key === "ArrowLeft") {
                    if (e.shiftKey) {
                        objectSelection.selectPreviousSibling();
                    } else {
                        objectSelection.selectParent();
                    }
                } else if (e.key === "Enter") {
                    if (!props.setObject) return;

                    if (props.object.type === ObjectType.Set) {
                        objectSelection.selectChild(
                            props.object.elements.length,
                        );

                        props.setObject({
                            type: ObjectType.Set,
                            elements: [
                                ...props.object.elements,
                                {type: ObjectType.Set, elements: []},
                            ],
                        });
                    }
                } else if (e.key === "Backspace" || e.key === "Delete") {
                    props.setObject?.(undefined);
                } else if (e.key === "+") {
                    props.setObject?.({
                        type: ObjectType.Set,
                        elements: [
                            {
                                type: ObjectType.Construction,
                                constructor: Atom.NodeAddFirst,
                                value: props.object,
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

                    props.setObject?.({
                        type: ObjectType.Construction,
                        constructor: props.object,
                        value: defaultObject,
                    });
                }
            }}
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
                    {integer => {
                        const [text, setText] = createSignal("");
                        createComputed(() => setText(String(integer().value)));

                        return (
                            <>
                                <BlackBoardZIcon />
                                <input
                                    value={text()}
                                    readOnly={!props.setObject}
                                    onKeyDown={e => {
                                        if (e.key === "Enter") {
                                            e.currentTarget.blur();
                                        }
                                    }}
                                    onBlur={
                                        props.setObject &&
                                        (() => {
                                            try {
                                                const newBigInt =
                                                    BigInt(text());

                                                props.setObject?.({
                                                    type: ObjectType.Integer,
                                                    value: newBigInt,
                                                });
                                            } catch {}
                                        })
                                    }
                                    onInput={e => {
                                        setText(e.currentTarget.value);
                                    }}
                                    class="block field-sizing-content pr-2"
                                />
                            </>
                        );
                    }}
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
                        <>
                            <ObjectView
                                siblingCount={2}
                                object={construction().constructor}
                                setObject={newConstructor => {
                                    if (newConstructor === undefined) {
                                        // Delete constructor -> convert to value

                                        objectSelection.selectParent();

                                        props.setObject?.(construction().value);
                                    } else {
                                        props.setObject?.({
                                            ...construction(),
                                            constructor: newConstructor,
                                        });
                                    }
                                }}
                                path={[...props.path, 0]}
                            />
                            <ObjectView
                                siblingCount={2}
                                object={construction().value}
                                setObject={newValue => {
                                    if (newValue === undefined) {
                                        objectSelection.selectParent();

                                        props.setObject?.(
                                            construction().constructor,
                                        );
                                    } else {
                                        props.setObject?.({
                                            ...construction(),
                                            value: newValue,
                                        });
                                    }
                                }}
                                path={[...props.path, 1]}
                            />
                        </>
                    )}
                </Match>
            </Switch>
        </div>
    );
};

export default ObjectView;
