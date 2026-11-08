import type {EverythingObject} from "@/model";
import {defaultObject, ObjectType} from "@/model";
import {nodeToObject, NodeType} from "@/model/nodes";

import {handleHistoryKeyDown, ObjectHistory} from "../objects/history";
import {LayoutMode} from "../objects/layout";
import ObjectView from "../objects/ObjectView";
import {ObjectSelectionContext} from "../objects/selection";
import WidthMeasurer from "../reuse/WidthMeasurer";
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
    const objectHistory = new ObjectHistory([createInitialObject2()]);

    return (
        <div
            class="mx-auto my-2 max-w-3xl min-w-0 grow rounded-4xl border border-neutral-200 bg-white p-4"
            tabIndex={0}
            onKeyDown={event => handleHistoryKeyDown(event, objectHistory)}
        >
            <WidthMeasurer class="w-full">
                {widthBudgetInPixels => (
                    <ObjectSelectionContext.Provider
                        value={objectHistory.objectSelection}
                    >
                        <ObjectView
                            indentLeft={false}
                            siblingCount={1}
                            object={objectHistory.object(0)}
                            setObject={newObject => {
                                objectHistory.pushObject(
                                    0,
                                    newObject ?? defaultObject,
                                );
                            }}
                            path={[]}
                            widthBudgetInPixels={widthBudgetInPixels}
                            replaceParentWithThis={undefined}
                            parentObjectLayoutMode={LayoutMode.Row}
                        />
                    </ObjectSelectionContext.Provider>
                )}
            </WidthMeasurer>
            <Swatch />
        </div>
    );
};
