import {Index} from "solid-js";

import type {Object} from "@/model";
import {type SetObject, ObjectType} from "@/model";
import type {DeepReadonly} from "@/util";

import LeftBraceIcon from "../reuse/LeftBraceIcon";
import ObjectView from "./ObjectView";
import type {ObjectSelectionPath} from "./selection";
import {useObjectSelection} from "./selection";

export default (props: {
    set: SetObject;
    setSet: ((newSet: Object | undefined) => void) | undefined;
    path: DeepReadonly<ObjectSelectionPath>;
}) => {
    const objectSelection = useObjectSelection();

    return (
        <>
            <LeftBraceIcon />
            <Index each={props.set.elements}>
                {(element, i) => (
                    <>
                        {i > 0 ? "," : ""}
                        <ObjectView
                            replaceParentWithThis={
                                props.setSet &&
                                (() => {
                                    if (!props.setSet) return;

                                    objectSelection.selectParent();
                                    props.setSet?.(element());
                                })
                            }
                            object={element()}
                            siblingCount={props.set.elements.length}
                            setObject={
                                props.setSet &&
                                (newElement => {
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
                        />
                    </>
                )}
            </Index>
            <LeftBraceIcon class="-scale-x-100" />
        </>
    );
};
