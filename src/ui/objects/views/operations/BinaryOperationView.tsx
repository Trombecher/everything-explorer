import {Show} from "solid-js";
import {Dynamic} from "solid-js/web";

import {defaultObject, type EverythingObject} from "@/model";

import {useLayoutOptions} from "../../atomNames";
import {
    BinaryOperationBlock,
    BlockIcon,
    changeBlockFirst,
    changeBlockSecond,
    getFirst,
    getSecond,
    prefixIconOf,
} from "../../blocks/binaryOperationAccessors";
import {
    binaryBlockSlotWidthBudgetInPixels,
    calculateLayoutModeOfBlock,
} from "../../layout";
import ObjectView from "../../ObjectView";
import {useObjectSelection, type ObjectSelectionPath} from "../../selection";

export default (props: {
    block: BinaryOperationBlock;
    path: ObjectSelectionPath;
    wholeWidthBudgetInPixels: number;
    setObject?: ((newObject: EverythingObject) => void) | undefined;
}) => {
    const objectSelection = useObjectSelection();
    const layoutOptions = useLayoutOptions();

    const first = () => getFirst(props.block);
    const second = () => getSecond(props.block);

    const layoutMode = () =>
        calculateLayoutModeOfBlock(
            props.block,
            props.wholeWidthBudgetInPixels,
            layoutOptions,
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
                        // Deleting the operand replaces it with the empty
                        // object instead of removing the binary node.
                        props.setObject?.(
                            changeBlockFirst(
                                props.block,
                                newFirst ?? defaultObject,
                            ),
                        );
                    })
                }
                path={[...props.path, 0]}
                widthBudgetInPixels={binaryBlockSlotWidthBudgetInPixels(
                    layoutMode(),
                    props.wholeWidthBudgetInPixels,
                    layoutOptions,
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
                        // Deleting the operand replaces it with the empty
                        // object instead of removing the binary node.
                        props.setObject?.(
                            changeBlockSecond(
                                props.block,
                                newSecond ?? defaultObject,
                            ),
                        );
                    })
                }
                path={[...props.path, 1]}
                widthBudgetInPixels={binaryBlockSlotWidthBudgetInPixels(
                    layoutMode(),
                    props.wholeWidthBudgetInPixels,
                    layoutOptions,
                )}
            />
        </>
    );
};
