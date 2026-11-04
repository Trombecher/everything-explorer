import {createSignal} from "solid-js";

import type {Object} from "@/model";
import {defaultObject, ObjectType} from "@/model";
import {Atom} from "@/model/atoms";

import ObjectView from "../objects/ObjectView";
import type {ObjectSelectionPathInfo} from "../objects/selection";
import {ObjectSelection, ObjectSelectionContext} from "../objects/selection";

const createInitialObject = (): Object => ({
    type: ObjectType.Set,
    elements: [
        {
            type: ObjectType.Construction,
            constructor: Atom.NodeFunction,
            value: {
                type: ObjectType.Set,
                elements: [
                    {
                        type: ObjectType.Construction,
                        constructor: Atom.NodeLiteral,
                        value: {
                            type: ObjectType.Set,
                            elements: [
                                {
                                    type: ObjectType.Integer,
                                    value: 42n,
                                },
                                {
                                    type: ObjectType.Set,
                                    elements: [],
                                },
                            ],
                        },
                    },
                ],
            },
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
            object: createInitialObject(),
            selectionPathInfo: {effectiveLength: 0, path: []},
        },
    ]);

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
                    replaceParentWithThis={() => {
                        // Do nothing, there is no parent.
                    }}
                />
            </ObjectSelectionContext.Provider>
            yo
        </div>
    );
};
