import QuoteIcon from "lucide-solid/icons/quote";
import RotateCcwIcon from "lucide-solid/icons/rotate-ccw";
import {createEffect, Match, Show, Switch} from "solid-js";

import {useAppState} from "@/context";
import {Phrase} from "@/i18n/phrases";
import {defaultObject, ObjectType, type EverythingObject} from "@/model";
import {nodeToObject, NodeType} from "@/model/nodes";
import type {DeepReadonly} from "@/util";
import {variant} from "@/util";

import ItalicXIcon from "../icons/ItalicXIcon";
import MapsToIcon from "../icons/MapsToIcon";
import Select from "../reuse/Select";
import AtomView from "./AtomView";
import BinaryOperationView from "./BinaryOperationView";
import {objectToBlock} from "./blocks";
import {handleKeyDown} from "./editing/keyboardShortcuts";
import {
    EnclosingFunctionsContext,
    useEnclosingFunctions,
} from "./enclosingFunctions";
import IfOperationView from "./IfOperationView";
import IntegerView from "./IntegerView";
import {
    calculateFunctionBodyWidthBudgetInPixels,
    calculateLayoutModeOfBlock,
    calculateLiteralNodeInnerObjectWidthBudgetInPixels,
    LayoutMode,
} from "./layout";
import {
    blockInColumnModeIsItemsCenter,
    objectViewColorHue,
} from "./objectViewAppearance";
import ParameterNameField from "./ParameterNameField";
import type {ObjectSelectionPath} from "./selection";
import {useObjectSelection} from "./selection";
import SetObjectView from "./SetObjectView";
import TextView from "./TextView";
import UnaryOperationView from "./UnaryOperationView";

export const ObjectView = (props: {
    object: EverythingObject;
    setObject: ((newObject: EverythingObject | undefined) => void) | undefined;
    path: DeepReadonly<ObjectSelectionPath>;

    /**
     * How many siblings this object view has **INCLUDING ITSELF**.
     */
    siblingCount: number;

    /**
     * Available width for this view's border box in px.
     */
    widthBudgetInPixels: number;

    /**
     * Tries to replace the parent with this object. Selection is handled by
     * this function.
     *
     * The object view calling this function is selected.
     */
    replaceParentWithThis: (() => void) | undefined;

    /**
     * The layout mode of the parent object.
     */
    parentObjectLayoutMode: LayoutMode;

    /**
     * Overrides which sibling the left arrow selects. This is needed for blocks
     * whose children are laid out both vertically and horizontally.
     */
    leftArrowSiblingIndex?: number;

    /**
     * Whether to apply margin-left for indentation.
     */
    indentLeft: boolean;
}) => {
    const objectSelection = useObjectSelection();
    const appState = useAppState();
    const outerEnclosingFunctions = useEnclosingFunctions();

    const block = () => objectToBlock(props.object);
    const blockOptions = () => appState.layoutOptions().block;

    const layoutMode = () =>
        calculateLayoutModeOfBlock(
            block(),
            props.widthBudgetInPixels,
            appState.layoutOptions(),
        );

    return (
        <div
            onKeyDown={event =>
                handleKeyDown({
                    event,
                    object: props.object,
                    siblingCount: props.siblingCount,
                    objectSelection: objectSelection,
                    replaceParentWithThis: props.replaceParentWithThis,
                    setObject: props.setObject,
                    parentObjectLayoutMode: props.parentObjectLayoutMode,
                    leftArrowSiblingIndex: props.leftArrowSiblingIndex,
                })
            }
            ref={div => {
                createEffect(() => {
                    if (objectSelection.isSelected(props.path)) {
                        div.focus();
                    }
                });
            }}
            onFocus={() => {
                objectSelection.setPath(props.path);
            }}
            tabIndex={objectSelection.isSelected(props.path) ? 0 : -1}
            data-selected={objectSelection.dataSelected(props.path)}
            style={{
                "margin-left": `${props.indentLeft ? blockOptions().setElementIndentInPixels : 0}px`,
                "border-width": `${blockOptions().blockBorderWidthInPixels}px`,
                gap: `${blockOptions().itemGapInPixels}px`,
                padding: `4px ${blockOptions().blockPaddingRightInPixels}px 4px ${blockOptions().blockPaddingLeftInPixels}px`,
                "background-color": `light-dark(oklch(0.92 0.07 ${objectViewColorHue(props.object)}), oklch(0.3 0.07 ${objectViewColorHue(props.object)}))`,
            }}
            class={`flex rounded-xl border-solid border-neutral-400 bg-neutral-100 text-neutral-800 select-none data-selected:border-blue-500 data-selected:bg-blue-500! data-selected:text-always-white ${layoutMode() === LayoutMode.Column ? `flex-col ${blockInColumnModeIsItemsCenter(block().type) ? "items-center" : "items-start"}` : "items-center"}`}
        >
            <Switch>
                <Match when={variant(block(), NodeType.Function)}>
                    {functionNode => {
                        const enclosingFunctionsForBody = () => [
                            {parameterName: functionNode().parameterName},
                            ...outerEnclosingFunctions(),
                        ];

                        return (
                            <>
                                <ParameterNameField
                                    name={functionNode().parameterName}
                                    setName={
                                        props.setObject
                                        && (newName => {
                                            props.setObject?.(
                                                nodeToObject({
                                                    ...functionNode(),
                                                    parameterName: newName,
                                                }),
                                            );
                                        })
                                    }
                                />
                                <MapsToIcon />
                                <EnclosingFunctionsContext.Provider
                                    value={enclosingFunctionsForBody}
                                >
                                    <ObjectView
                                        indentLeft={false}
                                        parentObjectLayoutMode={layoutMode()}
                                        replaceParentWithThis={
                                            props.setObject
                                            && (() => {
                                                if (!props.setObject) return;

                                                objectSelection.selectParent();
                                                props.setObject(
                                                    functionNode().body,
                                                );
                                            })
                                        }
                                        siblingCount={1}
                                        object={functionNode().body}
                                        setObject={
                                            props.setObject
                                            && (newBody => {
                                                props.setObject?.(
                                                    nodeToObject({
                                                        ...functionNode(),
                                                        body:
                                                            newBody
                                                            ?? defaultObject,
                                                    }),
                                                );
                                            })
                                        }
                                        path={[...props.path, 0]}
                                        widthBudgetInPixels={calculateFunctionBodyWidthBudgetInPixels(
                                            props.widthBudgetInPixels,
                                            appState.layoutOptions(),
                                        )}
                                    />
                                </EnclosingFunctionsContext.Provider>
                            </>
                        );
                    }}
                </Match>
                <Match when={variant(block(), NodeType.FunctionSelf)}>
                    {functionSelfNode => {
                        const enclosingFunctions = outerEnclosingFunctions;

                        const options = () => {
                            const depth = functionSelfNode().depth;
                            const values = enclosingFunctions().map(
                                (_, index) => BigInt(index),
                            );

                            if (!values.some(value => value === depth)) {
                                // Keep an out-of-range depth selectable so the
                                // dropdown can display the current value.
                                values.push(depth);
                            }

                            return values;
                        };

                        const labelOf = (depth: bigint) => {
                            const self = appState.translate(
                                Phrase.Self,
                                undefined,
                            );
                            const functionDepth = appState.translate(
                                Phrase.FunctionDepth,
                                {depth: String(depth)},
                            );

                            const enclosingFunction =
                                enclosingFunctions()[Number(depth)];

                            if (!enclosingFunction) {
                                return `${self} (${functionDepth} (${appState.translate(Phrase.OutOfRange, undefined)}))`;
                            }

                            return `${self} (${functionDepth})`;
                        };

                        return (
                            <>
                                <RotateCcwIcon />
                                <Show
                                    when={enclosingFunctions().length > 0}
                                    fallback={
                                        <span class="italic">
                                            {appState.translate(
                                                Phrase.NoEnclosingFunction,
                                                undefined,
                                            )}
                                        </span>
                                    }
                                >
                                    <Select<bigint, string>
                                        options={options()}
                                        value={functionSelfNode().depth}
                                        onChange={newDepth => {
                                            props.setObject?.(
                                                nodeToObject({
                                                    ...functionSelfNode(),
                                                    depth: newDepth,
                                                }),
                                            );
                                        }}
                                        idFromValue={value => String(value)}
                                        idToValue={id => BigInt(id)}
                                        stringifyValue={labelOf}
                                        description=""
                                        class="w-48"
                                    />
                                </Show>
                            </>
                        );
                    }}
                </Match>
                <Match when={variant(block(), NodeType.Parameter)}>
                    {parameterNode => {
                        const enclosingFunctions = outerEnclosingFunctions;

                        const options = () => {
                            const depth = parameterNode().depth;
                            const values = enclosingFunctions().map(
                                (_, index) => BigInt(index),
                            );

                            if (!values.some(value => value === depth)) {
                                // Keep an out-of-range depth selectable so the
                                // dropdown can display the current value.
                                values.push(depth);
                            }

                            return values;
                        };

                        const labelOf = (depth: bigint) => {
                            const functionDepth = appState.translate(
                                Phrase.FunctionDepth,
                                {depth: String(depth)},
                            );

                            const enclosingFunction =
                                enclosingFunctions()[Number(depth)];

                            if (!enclosingFunction) {
                                return `${functionDepth} (${appState.translate(Phrase.OutOfRange, undefined)})`;
                            }

                            if (enclosingFunction.parameterName) {
                                return `${enclosingFunction.parameterName} (${functionDepth})`;
                            }

                            return functionDepth;
                        };

                        return (
                            <>
                                <ItalicXIcon />
                                <Show
                                    when={enclosingFunctions().length > 0}
                                    fallback={
                                        <span class="italic">
                                            {appState.translate(
                                                Phrase.NoEnclosingFunction,
                                                undefined,
                                            )}
                                        </span>
                                    }
                                >
                                    <Select<bigint, string>
                                        options={options()}
                                        value={parameterNode().depth}
                                        onChange={newDepth => {
                                            props.setObject?.(
                                                nodeToObject({
                                                    ...parameterNode(),
                                                    depth: newDepth,
                                                }),
                                            );
                                        }}
                                        idFromValue={value => String(value)}
                                        idToValue={id => BigInt(id)}
                                        stringifyValue={labelOf}
                                        description=""
                                        class="w-48"
                                    />
                                </Show>
                            </>
                        );
                    }}
                </Match>
                <Match when={variant(block(), NodeType.Plus)}>
                    {plusNode => (
                        <BinaryOperationView
                            block={plusNode()}
                            path={props.path}
                            wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                            setObject={props.setObject}
                        />
                    )}
                </Match>
                <Match when={variant(block(), NodeType.Literal)}>
                    {literalNode => (
                        <>
                            <QuoteIcon />
                            <ObjectView
                                indentLeft={false}
                                parentObjectLayoutMode={layoutMode()}
                                replaceParentWithThis={
                                    props.setObject
                                    && (() => {
                                        if (!props.setObject) return;

                                        objectSelection.selectParent();
                                        props.setObject?.(literalNode().object);
                                    })
                                }
                                siblingCount={1}
                                object={literalNode().object}
                                setObject={
                                    props.setObject
                                    && (newObject => {
                                        props.setObject?.(
                                            nodeToObject({
                                                ...literalNode(),
                                                object:
                                                    newObject ?? defaultObject,
                                            }),
                                        );
                                    })
                                }
                                path={[...props.path, 0]}
                                widthBudgetInPixels={calculateLiteralNodeInnerObjectWidthBudgetInPixels(
                                    props.widthBudgetInPixels,
                                    appState.layoutOptions(),
                                )}
                            />
                        </>
                    )}
                </Match>
                <Match when={variant(block(), NodeType.Times)}>
                    {timesNode => (
                        <BinaryOperationView
                            block={timesNode()}
                            path={props.path}
                            wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                            setObject={props.setObject}
                        />
                    )}
                </Match>
                <Match when={variant(block(), NodeType.Equal)}>
                    {equalNode => (
                        <BinaryOperationView
                            block={equalNode()}
                            path={props.path}
                            wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                            setObject={props.setObject}
                        />
                    )}
                </Match>
                <Match when={variant(block(), NodeType.Less)}>
                    {lessNode => (
                        <BinaryOperationView
                            block={lessNode()}
                            path={props.path}
                            wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                            setObject={props.setObject}
                        />
                    )}
                </Match>
                <Match when={variant(block(), NodeType.Contains)}>
                    {containsNode => (
                        <BinaryOperationView
                            block={containsNode()}
                            path={props.path}
                            wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                            setObject={props.setObject}
                        />
                    )}
                </Match>
                <Match when={variant(block(), NodeType.And)}>
                    {andNode => (
                        <BinaryOperationView
                            block={andNode()}
                            path={props.path}
                            wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                            setObject={props.setObject}
                        />
                    )}
                </Match>
                <Match when={variant(block(), NodeType.Or)}>
                    {orNode => (
                        <BinaryOperationView
                            block={orNode()}
                            path={props.path}
                            wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                            setObject={props.setObject}
                        />
                    )}
                </Match>
                <Match when={variant(block(), NodeType.Not)}>
                    {notNode => (
                        <UnaryOperationView
                            block={notNode()}
                            path={props.path}
                            wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                            setObject={props.setObject}
                        />
                    )}
                </Match>
                <Match when={variant(block(), NodeType.Union)}>
                    {unionNode => (
                        <BinaryOperationView
                            block={unionNode()}
                            path={props.path}
                            wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                            setObject={props.setObject}
                        />
                    )}
                </Match>
                <Match when={variant(block(), NodeType.Filter)}>
                    {filterNode => (
                        <BinaryOperationView
                            block={filterNode()}
                            path={props.path}
                            wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                            setObject={props.setObject}
                        />
                    )}
                </Match>
                <Match when={variant(block(), NodeType.If)}>
                    {ifNode => (
                        <IfOperationView
                            block={ifNode()}
                            path={props.path}
                            wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                            setObject={props.setObject}
                        />
                    )}
                </Match>
                <Match when={variant(block(), NodeType.Call)}>
                    {callNode => (
                        <BinaryOperationView
                            block={callNode()}
                            path={props.path}
                            wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                            setObject={props.setObject}
                        />
                    )}
                </Match>

                <Match when={variant(block(), ObjectType.Text)}>
                    {text => (
                        <TextView text={text()} setText={props.setObject} />
                    )}
                </Match>
                <Match when={variant(block(), ObjectType.Atom)}>
                    {atom => (
                        <AtomView atom={atom()} setAtom={props.setObject} />
                    )}
                </Match>
                <Match when={variant(block(), ObjectType.Integer)}>
                    {integer => (
                        <IntegerView
                            integer={integer()}
                            setInteger={props.setObject}
                        />
                    )}
                </Match>
                <Match when={variant(block(), ObjectType.Set)}>
                    {set => (
                        <SetObjectView
                            set={set()}
                            setSet={props.setObject}
                            path={props.path}
                            widthBudgetInPixels={props.widthBudgetInPixels}
                        />
                    )}
                </Match>
                <Match when={variant(block(), ObjectType.Construction)}>
                    {construction => (
                        <BinaryOperationView
                            wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                            block={construction()}
                            path={props.path}
                            setObject={props.setObject}
                        />
                    )}
                </Match>

                <Match when={true}>
                    {appState.translate(Phrase.NotImplemented, undefined)}
                </Match>
            </Switch>
        </div>
    );
};

export default ObjectView;
