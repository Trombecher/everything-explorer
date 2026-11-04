import {createSignal, onCleanup, onMount} from "solid-js";

import type {Object} from "@/model";
import {defaultObject, ObjectType} from "@/model";
import {nodeToObject, NodeType} from "@/model/nodes";

import ObjectView from "../objects/ObjectView";
import type {ObjectSelectionPathInfo} from "../objects/selection";
import {ObjectSelection, ObjectSelectionContext} from "../objects/selection";
import Swatch from "../Swatch";

const createInitialObject2 = (): Object => ({
    type: ObjectType.Set,
    elements: [
        nodeToObject({
            type: NodeType.Function,
            body: nodeToObject({
                type: NodeType.Literal,
                object: {
                    type: ObjectType.Integer,
                    value: 42n,
                },
                rest: [],
            }),
            rest: [],
        }),
        nodeToObject({
            type: NodeType.Plus,
            first: {type: ObjectType.Atom, value: 34534598n},
            second: nodeToObject({
                type: NodeType.Times,
                first: defaultObject,
                second: defaultObject,
                rest: [],
            }),
            rest: [],
        }),
        {
            type: ObjectType.Construction,
            constructor: {type: ObjectType.Character, value: "a"},
            value: {type: ObjectType.Text, text: "this is some text"},
        },
    ],
});

type HistoryEntry = {
    readonly object: Object;
    readonly selectionPathInfo: ObjectSelectionPathInfo;
};

export default () => {
    const [history, setHistory] = createSignal<readonly HistoryEntry[]>([
        {
            object: createInitialObject2(),
            selectionPathInfo: {effectiveLength: 0, path: []},
        },
    ]);
    const [budget, setBudget] = createSignal(Number.POSITIVE_INFINITY);

    const lastHistoryEntry = () => {
        const last = history().at(-1);
        if (!last) throw new Error(":(");

        return last;
    };

    const modifyLast = (modifier: (entry: HistoryEntry) => HistoryEntry) => {
        setHistory(history =>
            history.map((entry, i) =>
                i === history.length - 1 ? modifier(entry) : entry,
            ),
        );
    };

    const popLastHistoryEntry = () => {
        setHistory(history =>
            history.filter((_, i) => i !== history.length - 1),
        );
    };

    const pushHistoryEntry = (entry: HistoryEntry) => {
        setHistory(history => [...history, entry]);
    };

    const objectSelection = new ObjectSelection(
        () => lastHistoryEntry().selectionPathInfo,
        selectionPathInfoTransform => {
            if (typeof selectionPathInfoTransform === "function") {
                modifyLast(entry => ({
                    ...entry,
                    selectionPathInfo: selectionPathInfoTransform(
                        entry.selectionPathInfo,
                    ),
                }));
            } else {
                modifyLast(entry => ({
                    ...entry,
                    selectionPathInfo: selectionPathInfoTransform,
                }));
            }
        },
    );

    let objectContainer: HTMLDivElement | undefined;

    onMount(() => {
        if (!objectContainer) return;

        const updateBudget = () => {
            const width = objectContainer?.getBoundingClientRect().width ?? 0;

            if (width > 0) setBudget(width);
        };

        updateBudget();

        const resizeObserver = new ResizeObserver(updateBudget);
        resizeObserver.observe(objectContainer);

        onCleanup(() => resizeObserver.disconnect());
    });

    return (
        <div
            class="mx-auto my-2 max-w-3xl grow rounded-3xl border border-neutral-200 bg-white p-4"
            tabIndex={0}
            onKeyDown={e => {
                if (e.key === "z" && e.ctrlKey) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    e.stopPropagation();

                    if (history().length > 1) popLastHistoryEntry();
                }
            }}
        >
            <div
                class="w-full"
                ref={el => {
                    objectContainer = el;
                }}
            >
                <ObjectSelectionContext.Provider value={objectSelection}>
                    <ObjectView
                        siblingCount={1}
                        object={lastHistoryEntry().object}
                        setObject={newObject => {
                            pushHistoryEntry({
                                object: newObject ?? defaultObject,
                                selectionPathInfo:
                                    lastHistoryEntry().selectionPathInfo,
                            });
                        }}
                        path={[]}
                        budget={budget()}
                        replaceParentWithThis={() => {
                            // Do nothing, there is no parent.
                        }}
                    />
                </ObjectSelectionContext.Provider>
            </div>
            <Swatch />
        </div>
    );
};
