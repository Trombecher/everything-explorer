import {Index} from "solid-js";

import type {EverythingObject} from "@/model";
import {type EverythingSet, ObjectType} from "@/model";
import type {DeepReadonly} from "@/util";

import LeftBraceIcon from "../reuse/LeftBraceIcon";
import type {LayoutMode} from "./layout";
import {
    calculateSetElementWidthBudgetInPixels,
    defaultBlockLayoutOptions,
} from "./layout";
import ObjectView from "./ObjectView";
import type {ObjectSelectionPath} from "./selection";
import {useObjectSelection} from "./selection";

export default (props: {
    set: EverythingSet;
    setSet: ((newSet: EverythingObject | undefined) => void) | undefined;
    path: DeepReadonly<ObjectSelectionPath>;

    widthBudgetInPixels: number;

    layoutModeOfEnclosingObjectView: LayoutMode;
}) => {
    const objectSelection = useObjectSelection();

    return (
        <>
            <LeftBraceIcon />
            <Index each={props.set.elements}>
                {(element, i) => (
                    <span class="flex items-center">
                        <ObjectView
                            parentObjectLayoutMode={
                                props.layoutModeOfEnclosingObjectView
                            }
                            replaceParentWithThis={
                                props.setSet
                                && (() => {
                                    if (!props.setSet) return;

                                    objectSelection.selectParent();
                                    props.setSet?.(element());
                                })
                            }
                            object={element()}
                            siblingCount={props.set.elements.length}
                            setObject={
                                props.setSet
                                && (newElement => {
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
                            widthBudgetInPixels={calculateSetElementWidthBudgetInPixels(
                                props.set,
                                props.widthBudgetInPixels,
                                {
                                    atomNames: new Map(),
                                    block: defaultBlockLayoutOptions,
                                },
                                i,
                            )}
                        />
                        {i < props.set.elements.length - 1 ? "," : ""}
                    </span>
                )}
            </Index>
            <LeftBraceIcon class="-scale-x-100" />
        </>
    );
};
