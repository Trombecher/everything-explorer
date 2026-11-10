import {Index} from "solid-js";

import {useAppState} from "@/context";
import type {EverythingObject} from "@/model";
import {type EverythingSet, ObjectType} from "@/model";
import type {DeepReadonly} from "@/util";

import LeftBraceIcon from "../icons/LeftBraceIcon";
import {
    calculateLayoutModeOfBlock,
    calculateSetElementWidthBudgetInPixels,
    LayoutMode,
} from "./layout";
import ObjectView from "./ObjectView";
import type {ObjectSelectionPath} from "./selection";
import {useObjectSelection} from "./selection";

export default (props: {
    set: EverythingSet;
    setSet: ((newSet: EverythingObject | undefined) => void) | undefined;
    path: DeepReadonly<ObjectSelectionPath>;

    widthBudgetInPixels: number;
}) => {
    const objectSelection = useObjectSelection();
    const appState = useAppState();

    const layoutMode = () =>
        calculateLayoutModeOfBlock(
            props.set,
            props.widthBudgetInPixels,
            appState.layoutOptions(),
        );

    return (
        <>
            <LeftBraceIcon />
            <Index each={props.set.elements}>
                {(element, i) => (
                    <span class="flex items-center">
                        <ObjectView
                            indentLeft={layoutMode() === LayoutMode.Column}
                            parentObjectLayoutMode={layoutMode()}
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
                                        const isOnlyElement =
                                            props.set.elements.length === 1;
                                        const isLastElement =
                                            i === props.set.elements.length - 1;

                                        props.setSet?.({
                                            type: ObjectType.Set,
                                            elements: props.set.elements.filter(
                                                (_, j) => i !== j,
                                            ),
                                        });

                                        if (isOnlyElement) {
                                            // The set becomes empty, so the
                                            // element selection is invalid.
                                            objectSelection.selectParent();
                                        } else if (isLastElement) {
                                            // The selection would point past
                                            // the last element.
                                            objectSelection.selectPreviousSibling();
                                        }
                                        // Otherwise the selection keeps its
                                        // index, which now refers to the next
                                        // element.
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
                                appState.layoutOptions(),
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
