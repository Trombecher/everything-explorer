import {createSignal, onCleanup, onMount} from "solid-js";

import type {EverythingObject} from "@/model";
import {defaultObject, ObjectType} from "@/model";
import {nodeToObject, NodeType} from "@/model/nodes";

import {ObjectHistory} from "../objects/history";
import {LayoutMode} from "../objects/layout";
import ObjectView from "../objects/ObjectView";
import {ObjectSelectionContext} from "../objects/selection";
import Swatch from "../Swatch";

const createInitialObject2 = (): EverythingObject => ({
    type: ObjectType.Set,
    elements: [
        nodeToObject({
            type: NodeType.Function,
            body: nodeToObject({
                type: NodeType.Literal,
                object: {type: ObjectType.Integer, value: 42n},
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

export default () => {
    const objectHistory = new ObjectHistory(createInitialObject2());
    const [budget, setBudget] = createSignal(Number.POSITIVE_INFINITY);

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
            class="mx-auto my-2 max-w-3xl min-w-0 grow rounded-4xl border border-neutral-200 bg-white p-4"
            tabIndex={0}
            onKeyDown={e => {
                if (e.key === "z" && e.ctrlKey) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    e.stopPropagation();

                    if (objectHistory.canUndo()) objectHistory.undo();
                }
            }}
        >
            <div
                class="w-full"
                ref={el => {
                    objectContainer = el;
                }}
            >
                <ObjectSelectionContext.Provider
                    value={objectHistory.objectSelection}
                >
                    <ObjectView
                        indentLeft={false}
                        siblingCount={1}
                        object={objectHistory.current().object}
                        setObject={newObject => {
                            objectHistory.push(newObject ?? defaultObject);
                        }}
                        path={[]}
                        widthBudgetInPixels={budget()}
                        replaceParentWithThis={() => {
                            // Do nothing, there is no parent.
                        }}
                        parentObjectLayoutMode={LayoutMode.Row}
                    />
                </ObjectSelectionContext.Provider>
            </div>
            <Swatch />
        </div>
    );
};
