import {Index} from "solid-js";

import type {EverythingObject} from "@/model";
import {type EverythingSet, ObjectType} from "@/model";
import type {DeepReadonly} from "@/util";

import LeftBraceIcon from "../reuse/LeftBraceIcon";
import {GAP, ICON_WIDTH, LayoutMode, measureText} from "./layout";
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

    const elementBudget = (index: number) =>
        (props.layoutModeOfEnclosingObjectView === LayoutMode.Column
            ? props.widthBudgetInPixels
            : props.widthBudgetInPixels - 2 * ICON_WIDTH.brace - 2 * GAP)
        - (index < props.set.elements.length - 1 ? measureText(",") : 0);

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
                            widthBudgetInPixels={elementBudget(i)}
                        />
                        {i < props.set.elements.length - 1 ? "," : ""}
                    </span>
                )}
            </Index>
            <LeftBraceIcon class="-scale-x-100" />
        </>
    );
};
