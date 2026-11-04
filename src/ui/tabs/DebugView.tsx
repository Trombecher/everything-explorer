import {createEffect, createSignal} from "solid-js";

import type {Object} from "@/model";
import {defaultObject, ObjectType} from "@/model";
import {Atom} from "@/model/atoms";

import ObjectView from "../objects/ObjectView";
import {ObjectSelection, ObjectSelectionContext} from "../objects/selection";

export default () => {
    const [object, setObject] = createSignal<Object>({
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

    const objectSelection = new ObjectSelection();

    createEffect(() =>
        console.log(
            objectSelection.pathInfo.path.join("->"),
            objectSelection.pathInfo.effectiveLength,
        ),
    );

    return (
        <div class="mx-auto my-2 max-w-3xl grow rounded-3xl border border-neutral-200 bg-white p-4">
            <ObjectSelectionContext.Provider value={objectSelection}>
                <ObjectView
                    siblingCount={1}
                    object={object()}
                    setObject={newObject => {
                        setObject(newObject ?? defaultObject);
                    }}
                    path={[]}
                />
            </ObjectSelectionContext.Provider>
            yo
        </div>
    );
};
