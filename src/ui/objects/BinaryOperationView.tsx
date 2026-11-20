import {Show} from "solid-js";
import {Dynamic} from "solid-js/web";

import {useAppState} from "@/context";
import type {EverythingObject} from "@/model";

import {
    BinaryOperationBlock,
    BlockIcon,
    changeBlockFirst,
    changeBlockSecond,
    getFirst,
    getSecond,
    prefixIconOf,
} from "./blocks/binaryOperationAccessors";
import {
    binaryBlockSlotWidthBudgetInPixels,
    calculateLayoutModeOfBlock,
} from "./layout";
import ObjectView from "./ObjectView";
import {useObjectSelection, type ObjectSelectionPath} from "./selection";

export default (props: {
    block: BinaryOperationBlock;
    path: ObjectSelectionPath;
    wholeWidthBudgetInPixels: number;
    setObject?: ((newObject: EverythingObject) => void) | undefined;
}) => {
    const objectSelection = useObjectSelection();
    const appState = useAppState();

    const first = () => getFirst(props.block);
    const second = () => getSecond(props.block);

    const layoutMode = () =>
        calculateLayoutModeOfBlock(
            props.block,
            props.wholeWidthBudgetInPixels,
            appState.layoutOptions(),
        );

    return (
        <>
            <Show when={prefixIconOf(props.block)}>
                {icon => <Dynamic component={icon()} />}
            </Show>
            <ObjectView
                indentLeft={false}
                parentObjectLayoutMode={layoutMode()}
                replaceParentWithThis={
                    props.setObject
                    && (() => {
                        if (!props.setObject) return;

                        objectSelection.selectParent();
                        props.setObject(first());
                    })
                }
                siblingCount={2}
                object={first()}
                setObject={
                    props.setObject
                    && (newFirst => {
                        if (newFirst === undefined) {
                            objectSelection.selectParent();

                            props.setObject?.(second());
                        } else {
                            props.setObject?.(
                                changeBlockFirst(props.block, newFirst),
                            );
                        }
                    })
                }
                path={[...props.path, 0]}
                widthBudgetInPixels={binaryBlockSlotWidthBudgetInPixels(
                    layoutMode(),
                    props.wholeWidthBudgetInPixels,
                    appState.layoutOptions(),
                )}
            />
            <Dynamic component={BlockIcon[props.block.type]} />
            <ObjectView
                indentLeft={false}
                parentObjectLayoutMode={layoutMode()}
                replaceParentWithThis={
                    props.setObject
                    && (() => {
                        if (!props.setObject) return;

                        objectSelection.selectParent();
                        props.setObject(second());
                    })
                }
                siblingCount={2}
                object={second()}
                setObject={
                    props.setObject
                    && (newSecond => {
                        if (newSecond === undefined) {
                            objectSelection.selectParent();

                            props.setObject?.(first());
                        } else {
                            props.setObject?.(
                                changeBlockSecond(props.block, newSecond),
                            );
                        }
                    })
                }
                path={[...props.path, 1]}
                widthBudgetInPixels={binaryBlockSlotWidthBudgetInPixels(
                    layoutMode(),
                    props.wholeWidthBudgetInPixels,
                    appState.layoutOptions(),
                )}
            />
        </>
    );
};
