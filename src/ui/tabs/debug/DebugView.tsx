import type {EverythingObject} from "@/model";
import {defaultObject, ObjectType} from "@/model";
import {nodeToObject, NodeType} from "@/model/nodes";

import {handleHistoryKeyDown, ObjectHistory} from "../../objects/history";
import {LayoutMode} from "../../objects/layout";
import ObjectView from "../../objects/ObjectView";
import {ObjectSelectionContext} from "../../objects/selection";
import WidthMeasurer from "../../reuse/WidthMeasurer";
import Swatch from "./Swatch";

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
            parameterName: undefined,
            rest: [],
        }),
        nodeToObject({
            type: NodeType.Literal,
            object: {type: ObjectType.Text, text: "literal"},
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
        nodeToObject({
            type: NodeType.Times,
            first: {type: ObjectType.Integer, value: 6n},
            second: {type: ObjectType.Integer, value: 7n},
            rest: [],
        }),
        nodeToObject({
            type: NodeType.Equal,
            first: {type: ObjectType.Integer, value: 1n},
            second: {type: ObjectType.Integer, value: 1n},
            rest: [],
        }),
        nodeToObject({
            type: NodeType.Contains,
            element: {type: ObjectType.Atom, value: 2n},
            set: {
                type: ObjectType.Set,
                elements: [{type: ObjectType.Atom, value: 2n}],
            },
            rest: [],
        }),
        nodeToObject({
            type: NodeType.And,
            first: {type: ObjectType.Integer, value: 1n},
            second: {type: ObjectType.Integer, value: 0n},
            rest: [],
        }),
        nodeToObject({
            type: NodeType.Or,
            first: {type: ObjectType.Integer, value: 1n},
            second: {type: ObjectType.Integer, value: 0n},
            rest: [],
        }),
        nodeToObject({
            type: NodeType.Not,
            operand: {type: ObjectType.Integer, value: 0n},
            rest: [],
        }),
        nodeToObject({
            type: NodeType.Union,
            first: defaultObject,
            second: defaultObject,
            rest: [],
        }),
        nodeToObject({
            type: NodeType.Filter,
            set: defaultObject,
            filterFunction: nodeToObject({
                type: NodeType.Function,
                body: nodeToObject({
                    type: NodeType.Parameter,
                    depth: 0n,
                    rest: [],
                }),
                parameterName: undefined,
                rest: [],
            }),
            rest: [],
        }),
        nodeToObject({
            type: NodeType.Call,
            callee: nodeToObject({
                type: NodeType.Function,
                body: nodeToObject({
                    type: NodeType.Parameter,
                    depth: 0n,
                    rest: [],
                }),
                parameterName: undefined,
                rest: [],
            }),
            with: {type: ObjectType.Integer, value: 42n},
            rest: [],
        }),
        nodeToObject({type: NodeType.Parameter, depth: 0n, rest: []}),
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
            class="mx-auto my-2 max-w-3xl min-w-0 grow rounded-4xl border border-neutral-200 bg-white p-4 dark:bg-neutral-100"
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
                            widthBudgetInPixels={widthBudgetInPixels()}
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
