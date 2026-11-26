import {Index} from "solid-js";

import {
    type EverythingComposite,
    type EverythingObject,
    type EverythingSet,
    ObjectType,
} from "@/model";
import type {DeepReadonly} from "@/util";

import AngleBracketIcon from "../icons/sets/AngleBracketIcon";
import BraceIcon from "../icons/sets/BraceIcon";
import {useLayoutOptions} from "./atomNames";
import {
    calculateCollectionElementWidthBudgetInPixels,
    calculateLayoutModeOfBlock,
    LayoutMode,
} from "./layout";
import ObjectView from "./ObjectView";
import type {ObjectSelectionPath} from "./selection";
import {useObjectSelection} from "./selection";

export default (props: {
    collection: EverythingComposite | EverythingSet;
    setCollection:
        | ((newCollection: EverythingObject | undefined) => void)
        | undefined;
    path: DeepReadonly<ObjectSelectionPath>;

    widthBudgetInPixels: number;
}) => {
    const objectSelection = useObjectSelection();
    const layoutOptions = useLayoutOptions();

    const objects = () =>
        props.collection.type === ObjectType.Composite
            ? props.collection.properties
            : props.collection.items;

    const withObjects = (
        objects: readonly EverythingObject[],
    ): EverythingObject =>
        props.collection.type === ObjectType.Composite
            ? {type: ObjectType.Composite, properties: objects}
            : {type: ObjectType.Set, items: objects};

    const layoutMode = () =>
        calculateLayoutModeOfBlock(
            props.collection,
            props.widthBudgetInPixels,
            layoutOptions,
        );

    const leftDelimiter = () =>
        props.collection.type === ObjectType.Composite ? (
            <AngleBracketIcon side="left" />
        ) : (
            <BraceIcon side="left" />
        );

    const rightDelimiter = () =>
        props.collection.type === ObjectType.Composite ? (
            <AngleBracketIcon side="right" />
        ) : (
            <BraceIcon side="right" />
        );

    return (
        <>
            {leftDelimiter()}
            <Index each={objects()}>
                {(object, i) => (
                    <span class="flex items-center">
                        <ObjectView
                            indentLeft={layoutMode() === LayoutMode.Column}
                            parentObjectLayoutMode={layoutMode()}
                            replaceParentWithThis={
                                props.setCollection
                                && (() => {
                                    if (!props.setCollection) return;

                                    objectSelection.selectParent();
                                    props.setCollection(object());
                                })
                            }
                            object={object()}
                            siblingCount={objects().length}
                            setObject={
                                props.setCollection
                                && (newObject => {
                                    if (newObject === undefined) {
                                        const isOnlyObject =
                                            objects().length === 1;
                                        const isLastObject =
                                            i === objects().length - 1;

                                        props.setCollection?.(
                                            withObjects(
                                                objects().filter(
                                                    (_, j) => i !== j,
                                                ),
                                            ),
                                        );

                                        if (isOnlyObject) {
                                            // The collection becomes empty, so
                                            // the object selection is invalid.
                                            objectSelection.selectParent();
                                        } else if (isLastObject) {
                                            // The selection would point past
                                            // the last object.
                                            objectSelection.selectPreviousSibling();
                                        }
                                        // Otherwise the selection keeps its
                                        // index, which now refers to the next
                                        // object.
                                    } else {
                                        // Change object
                                        props.setCollection?.(
                                            withObjects(
                                                objects().map((object, j) =>
                                                    i !== j
                                                        ? object
                                                        : newObject,
                                                ),
                                            ),
                                        );
                                    }
                                })
                            }
                            path={[...props.path, i]}
                            widthBudgetInPixels={calculateCollectionElementWidthBudgetInPixels(
                                props.collection,
                                props.widthBudgetInPixels,
                                layoutOptions,
                                i,
                            )}
                        />
                        {i < objects().length - 1 ? "," : ""}
                    </span>
                )}
            </Index>
            {rightDelimiter()}
        </>
    );
};
