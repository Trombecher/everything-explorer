import {
    createComputed,
    createContext,
    createEffect,
    createMemo,
    createSignal,
    Index,
    Match,
    Switch,
    useContext,
} from "solid-js";
import {createStore, type SetStoreFunction} from "solid-js/store";

import type {SetObject} from "@/model";
import {defaultObject, ObjectType, type Object} from "@/model";
import {Atom} from "@/model/atoms";
import {nodeChildCount, nodeToObject, objectToNode} from "@/model/nodes";
import type {DeepReadonly} from "@/util";
import {variant} from "@/util";

import NodeView from "./NodeView";
import BlackBoardZIcon from "./reuse/BlackBoardZIcon";
import LeftBraceIcon from "./reuse/LeftBraceIcon";

export type ObjectSelectionPath = number[];

export type ObjectSelectionPathInfo = {
    path: ObjectSelectionPath;

    /**
     * This is equal or smaller to the path length.
     */
    effectiveLength: number;
};

export class ObjectSelection {
    public readonly pathInfo: DeepReadonly<ObjectSelectionPathInfo>;
    private readonly setPathInfo: SetStoreFunction<ObjectSelectionPathInfo>;

    constructor() {
        const [pathInfo, setPathInfo] = createStore<ObjectSelectionPathInfo>({
            effectiveLength: 0,
            path: [],
        });

        this.pathInfo = pathInfo;
        this.setPathInfo = setPathInfo;
    }

    isSelected(path: DeepReadonly<ObjectSelectionPath>) {
        return (
            path.length === this.pathInfo.effectiveLength &&
            path.every((position, i) => position === this.pathInfo.path[i])
        );
    }

    dataSelected(path: DeepReadonly<ObjectSelectionPath>): "" | undefined {
        return this.isSelected(path) ? "" : undefined;
    }

    setPath(path: DeepReadonly<ObjectSelectionPath>) {
        this.setPathInfo(
            (pathInfo: ObjectSelectionPathInfo): ObjectSelectionPathInfo => {
                if (
                    path.every((position, i) => position === pathInfo.path[i])
                ) {
                    // Path is a prefix of existing -> reduce effective length.
                    return {path: pathInfo.path, effectiveLength: path.length};
                }

                // Path is not a prefix -> replace entire path.
                return {path: [...path], effectiveLength: path.length};
            },
        );
    }

    selectParent() {
        // Reduce effective length.
        this.setPathInfo(
            (pathInfo: ObjectSelectionPathInfo): ObjectSelectionPathInfo => ({
                path: pathInfo.path,
                effectiveLength: Math.max(pathInfo.effectiveLength - 1, 0),
            }),
        );
    }

    selectChild(childIndex: number | "previous") {
        this.setPathInfo(
            (pathInfo: ObjectSelectionPathInfo): ObjectSelectionPathInfo => {
                const newEffectiveLength = pathInfo.effectiveLength + 1;

                if (
                    pathInfo.effectiveLength < pathInfo.path.length &&
                    (childIndex === "previous" ||
                        childIndex ===
                            this.pathInfo.path[pathInfo.effectiveLength])
                )
                    return {
                        path: pathInfo.path,
                        effectiveLength: newEffectiveLength,
                    };

                return {
                    effectiveLength: newEffectiveLength,
                    path: [
                        ...pathInfo.path.slice(0, pathInfo.effectiveLength),
                        childIndex === "previous" ? 0 : childIndex,
                    ],
                };
            },
        );
    }

    selectPreviousSibling() {
        // Decrement last.
        this.setPathInfo(
            (pathInfo: ObjectSelectionPathInfo): ObjectSelectionPathInfo => {
                const current = pathInfo.path[pathInfo.effectiveLength - 1];
                if (current === undefined || current === 0) return pathInfo;

                return {
                    path: [
                        ...pathInfo.path.slice(0, pathInfo.effectiveLength - 1),
                        Math.max(current - 1, 0),
                    ],
                    effectiveLength: pathInfo.effectiveLength,
                };
            },
        );
    }

    selectNextSibling(siblingCount: number) {
        // Increment last position and discard non-effective tail.
        this.setPathInfo(
            (pathInfo: ObjectSelectionPathInfo): ObjectSelectionPathInfo => {
                const current = pathInfo.path[pathInfo.effectiveLength - 1];
                if (current === undefined || current === siblingCount - 1)
                    return pathInfo;

                return {
                    path: [
                        ...pathInfo.path.slice(0, pathInfo.effectiveLength - 1),
                        Math.min(current + 1, siblingCount - 1),
                    ],
                    effectiveLength: pathInfo.effectiveLength,
                };
            },
        );
    }
}

export const ObjectSelectionContext = createContext<
    undefined | ObjectSelection
>();

export const useObjectSelection = () => {
    const objectSelection = useContext(ObjectSelectionContext);
    if (!objectSelection) throw new Error("no object selection context");

    return objectSelection;
};

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

const ObjectView = (props: {
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
                                    props.setObject?.({
                                        ...construction(),
                                        constructor:
                                            newConstructor ?? defaultObject,
                                    });
                                }}
                                path={[...props.path, 0]}
                            />
                            <ObjectView
                                siblingCount={2}
                                object={construction().value}
                                setObject={newValue => {
                                    props.setObject?.({
                                        ...construction(),
                                        value: newValue ?? defaultObject,
                                    });
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

const SetObjectView = (props: {
    set: SetObject;
    setSet: ((newSet: SetObject | undefined) => void) | undefined;
    path: DeepReadonly<ObjectSelectionPath>;
}) => {
    const objectSelection = useObjectSelection();

    return (
        <>
            <LeftBraceIcon />
            <Index each={props.set.elements}>
                {(element, i) => (
                    <>
                        {i > 0 ? "," : ""}
                        <ObjectView
                            object={element()}
                            siblingCount={props.set.elements.length}
                            setObject={
                                props.setSet &&
                                (newElement => {
                                    if (newElement === undefined) {
                                        props.setSet?.({
                                            type: ObjectType.Set,
                                            elements: props.set.elements.filter(
                                                (_, j) => i !== j,
                                            ),
                                        });

                                        if (props.set.elements.length === 0) {
                                            // we remove the last sibling

                                            objectSelection.selectParent();
                                        } else if (
                                            props.set.elements.length === i
                                        ) {
                                            // we remove the last element of the siblings.

                                            objectSelection.selectPreviousSibling();
                                        }
                                    } else {
                                        // Change element
                                        props.setSet?.({
                                            type: ObjectType.Set,
                                            elements: props.set.elements.map(
                                                (element, j) =>
                                                    i !== j
                                                        ? element
                                                        : newElement,
                                            ),
                                        });
                                    }
                                })
                            }
                            path={[...props.path, i]}
                        />
                    </>
                )}
            </Index>
            <LeftBraceIcon class="-scale-x-100" />
        </>
    );
};

export default ObjectView;
