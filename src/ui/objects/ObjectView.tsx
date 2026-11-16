import QuoteIcon from "lucide-solid/icons/quote";
import {createEffect, Match, Show, Switch} from "solid-js";

import {useAppState} from "@/context";
import {Phrase} from "@/i18n/phrases";
import {defaultObject, ObjectType, type EverythingObject} from "@/model";
import {nodeToObject, NodeType, NotANode, objectToNode} from "@/model/nodes";
import type {DeepReadonly} from "@/util";
import {variant} from "@/util";

import ItalicXIcon from "../icons/ItalicXIcon";
import MapsToIcon from "../icons/MapsToIcon";
import Select from "../reuse/Select";
import AtomView from "./AtomView";
import BinaryOperationView from "./BinaryOperationView";
import type {Block} from "./blocks";
import {objectToBlock} from "./blocks";
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
    childCountOfBlock,
    LayoutMode,
} from "./layout";
import ParameterNameField from "./ParameterNameField";
import type {ObjectSelection, ObjectSelectionPath} from "./selection";
import {useObjectSelection} from "./selection";
import SetObjectView from "./SetObjectView";
import TextView from "./TextView";
import UnaryOperationView from "./UnaryOperationView";

const isHandledKey = (key: string): boolean =>
    key === "ArrowUp"
    || key === "ArrowDown"
    || key === "ArrowRight"
    || key === "ArrowLeft"
    || key === "Enter"
    || key === "Backspace"
    || key === "Delete"
    || key === "+"
    || key === "="
    || key === "&"
    || key === "|"
    || key === "u"
    || key === "n"
    || key === "i"
    || key === "!"
    || key === "F"
    || key === " "
    || key === "*"
    || key === "l"
    || key === "f"
    || key === "e"
    || key === "a"
    || key === "t"
    || key === "p"
    || key === "c"
    || (key.length === 1 && "0123456789".includes(key));

const handleKeyDown = (props: {
    event: KeyboardEvent & {currentTarget: HTMLDivElement; target: Element};
    objectSelection: ObjectSelection;
    siblingCount: number;
    object: EverythingObject;
    setObject: ((newObject: EverythingObject | undefined) => void) | undefined;
    replaceParentWithThis: (() => void) | undefined;
    parentObjectLayoutMode: LayoutMode;
    leftArrowSiblingIndex: number | undefined;
}) => {
    if (
        props.event.target.tagName === "INPUT"
        || props.event.target !== props.event.currentTarget
        // Do not consume shortcuts of the browser or the OS.
        || props.event.ctrlKey
        || props.event.metaKey
        || props.event.altKey
        // Do not consume keys we have no use for (Tab, F5, ...).
        || !isHandledKey(props.event.key)
    )
        return;

    props.event.preventDefault();

    if (props.event.key === "ArrowUp") {
        if (props.parentObjectLayoutMode === LayoutMode.Column) {
            props.objectSelection.selectPreviousSibling();
        }
    } else if (props.event.key === "ArrowDown") {
        if (props.parentObjectLayoutMode === LayoutMode.Column) {
            props.objectSelection.selectNextSibling(props.siblingCount);
        }
    } else if (props.event.key === "ArrowRight") {
        if (props.event.shiftKey) {
            const childCount = childCountOfBlock(objectToBlock(props.object));

            if (childCount > 0) props.objectSelection.selectChild("previous");
        } else if (props.parentObjectLayoutMode === LayoutMode.Row) {
            props.objectSelection.selectNextSibling(props.siblingCount);
        }
    } else if (props.event.key === "ArrowLeft") {
        if (props.event.shiftKey) {
            props.objectSelection.selectParent();
        } else if (props.leftArrowSiblingIndex !== undefined) {
            // The sibling layout of this object is not simply row or column,
            // so the block tells us which sibling the left arrow selects.
            props.objectSelection.selectSibling(props.leftArrowSiblingIndex);
        } else if (props.parentObjectLayoutMode === LayoutMode.Row) {
            // Only allow left sibling selection if the layout mode is Row.
            props.objectSelection.selectPreviousSibling();
        }
    } else if (props.event.key === "Enter") {
        if (!props.setObject) return;

        // Try to add new empty set to object.

        if (props.object.type === ObjectType.Set) {
            props.setObject({
                type: ObjectType.Set,
                elements: [
                    ...props.object.elements,
                    {type: ObjectType.Set, elements: []},
                ],
            });

            props.objectSelection.selectChild(
                Math.max(0, props.object.elements.length - 1),
            );
        } else if (
            props.object.type === ObjectType.Atom
            || props.object.type === ObjectType.Integer
            || props.object.type === ObjectType.Text
        ) {
            // Focus field
            const input = props.event.currentTarget.querySelector("input");

            if (input) {
                input.focus();
                input.select();
            }
        }
    } else if (props.event.key === "Backspace" && !props.event.shiftKey) {
        // Replace parent with this object.

        props.replaceParentWithThis?.();
    } else if (props.event.key === "Delete") {
        // Delete whole object (or replace with empty set).

        props.setObject?.(undefined);
    } else if (props.event.key === "Backspace") {
        if (!props.setObject) return;

        // Delete object but retain a child if possible.

        const node = objectToNode(props.object);

        if (node !== NotANode) {
            switch (node.type) {
                case NodeType.Function: {
                    // Retain body.

                    props.setObject(node.body);
                    break;
                }
                case NodeType.Literal: {
                    // Retain literal.

                    props.setObject(node.object);
                    break;
                }
                case NodeType.Plus: {
                    // Retain first operand.

                    props.setObject(node.first);
                    break;
                }
                case NodeType.Equal: {
                    // Retain first operand.

                    props.setObject(node.first);
                    break;
                }
                case NodeType.And: {
                    // Retain first operand.

                    props.setObject(node.first);
                    break;
                }
                case NodeType.Or: {
                    // Retain first operand.

                    props.setObject(node.first);
                    break;
                }
                case NodeType.Not: {
                    // Retain operand.

                    props.setObject(node.operand);
                    break;
                }
                case NodeType.Union: {
                    // Retain first operand.

                    props.setObject(node.first);
                    break;
                }
                case NodeType.Filter: {
                    // Retain set.

                    props.setObject(node.set);
                    break;
                }
                case NodeType.If: {
                    // Retain condition.

                    props.setObject(node.condition);
                    break;
                }
                case NodeType.Contains: {
                    // Retain element.

                    props.setObject(node.element);
                    break;
                }
                case NodeType.Call: {
                    // Retain callee.

                    props.setObject(node.callee);
                    break;
                }
            }
        } else {
            // We just delete everything.

            props.setObject?.(undefined);
        }
    } else if (props.event.key === "+") {
        if (!props.setObject) return;

        props.setObject(
            nodeToObject({
                type: NodeType.Plus,
                first: props.object,
                second: defaultObject,
                rest: [],
            }),
        );

        props.objectSelection.selectChild(1);
    } else if (props.event.key === "=") {
        if (!props.setObject) return;

        props.setObject(
            nodeToObject({
                type: NodeType.Equal,
                first: props.object,
                second: defaultObject,
                rest: [],
            }),
        );

        props.objectSelection.selectChild(1);
    } else if (props.event.key === "&") {
        if (!props.setObject) return;

        props.setObject(
            nodeToObject({
                type: NodeType.And,
                first: props.object,
                second: defaultObject,
                rest: [],
            }),
        );

        props.objectSelection.selectChild(1);
    } else if (props.event.key === "|") {
        if (!props.setObject) return;

        props.setObject(
            nodeToObject({
                type: NodeType.Or,
                first: props.object,
                second: defaultObject,
                rest: [],
            }),
        );

        props.objectSelection.selectChild(1);
    } else if (props.event.key === "u") {
        if (!props.setObject) return;

        props.setObject(
            nodeToObject({
                type: NodeType.Union,
                first: props.object,
                second: defaultObject,
                rest: [],
            }),
        );

        props.objectSelection.selectChild(1);
    } else if (props.event.key === "n" || props.event.key === "!") {
        if (!props.setObject) return;

        props.setObject(
            nodeToObject({type: NodeType.Not, operand: props.object, rest: []}),
        );

        props.objectSelection.selectChild(0);
    } else if (props.event.key === "i") {
        if (!props.setObject) return;

        props.setObject(
            nodeToObject({
                type: NodeType.If,
                condition: props.object,
                thenBranch: defaultObject,
                otherwiseBranch: defaultObject,
                rest: [],
            }),
        );

        props.objectSelection.selectChild(1);
    } else if (props.event.key === "F") {
        if (!props.setObject) return;

        props.setObject(
            nodeToObject({
                type: NodeType.Filter,
                set: props.object,
                filterFunction: defaultObject,
                rest: [],
            }),
        );

        props.objectSelection.selectChild(1);
    } else if (props.event.key === " ") {
        if (!props.setObject) return;

        props.setObject({
            type: ObjectType.Construction,
            constructor: props.object,
            value: defaultObject,
        });

        props.objectSelection.selectChild(1);
    } else if (props.event.key === "l") {
        if (!props.setObject) return;

        props.setObject(
            nodeToObject({
                type: NodeType.Literal,
                object: props.object,
                rest: [],
            }),
        );

        props.objectSelection.selectChild(0);
    } else if (props.event.key === "f") {
        if (!props.setObject) return;

        props.setObject(
            nodeToObject({
                type: NodeType.Function,
                body: props.object,
                parameterName: undefined,
                rest: [],
            }),
        );

        props.objectSelection.selectChild(0);
    } else if (props.event.key === "p") {
        if (!props.setObject) return;

        props.setObject(
            nodeToObject({type: NodeType.Parameter, depth: 0n, rest: []}),
        );
    } else if (props.event.key === "e") {
        if (!props.setObject) return;

        props.setObject(
            nodeToObject({
                type: NodeType.Contains,
                element: props.object,
                set: defaultObject,
                rest: [],
            }),
        );

        props.objectSelection.selectChild(1);
    } else if (props.event.key === "c") {
        if (!props.setObject) return;

        props.setObject(
            nodeToObject({
                type: NodeType.Call,
                callee: props.object,
                with: defaultObject,
                rest: [],
            }),
        );

        props.objectSelection.selectChild(1);
    } else if ("0123456789".includes(props.event.key)) {
        if (!props.setObject) return;

        // Replace with number.

        props.setObject({
            type: ObjectType.Integer,
            value: BigInt(props.event.key),
        });
    } else if (props.event.key === "*") {
        if (!props.setObject) return;

        props.setObject(
            nodeToObject({
                type: NodeType.Times,
                first: props.object,
                second: defaultObject,
                rest: [],
            }),
        );

        props.objectSelection.selectChild(1);
    } else if (props.event.key === "a") {
        // Replace with atom

        props.setObject?.({type: ObjectType.Atom, value: 0n});
    } else if (props.event.key === "t") {
        // Replace with text

        props.setObject?.({type: ObjectType.Text, text: ""});
    }
};

const objectViewColorHue = (object: EverythingObject): number => {
    const node = objectToNode(object);

    if (node !== NotANode) {
        switch (node.type) {
            case NodeType.Function:
                return 54;
            case NodeType.Parameter:
                return 280;
            case NodeType.Literal:
                return 23;
            case NodeType.Plus:
                return 100;
            case NodeType.Times:
                return 340;
            case NodeType.Equal:
                return 280;
            case NodeType.Contains:
                return 175;
            case NodeType.And:
                return 130;
            case NodeType.Or:
                return 10;
            case NodeType.Not:
                return 70;
            case NodeType.Union:
                return 230;
            case NodeType.Filter:
                return 205;
            case NodeType.If:
                return 260;
            case NodeType.Call:
                return 320;
        }
    }

    switch (object.type) {
        case ObjectType.Atom:
            return 190;
        case ObjectType.Byte:
            return 200;
        case ObjectType.Integer:
            return 300;
        case ObjectType.Construction:
            return 80;
        case ObjectType.Character:
            return 160;
        case ObjectType.Set:
            return 220;
        case ObjectType.Text:
            return 250;
    }
};

const blockInColumnModeIsItemsCenter = (blockType: Block["type"]) => {
    switch (blockType) {
        case NodeType.Plus:
        case NodeType.Times:
        case NodeType.Equal:
        case NodeType.Contains:
        case NodeType.And:
        case NodeType.Or:
        case NodeType.Union:
        case NodeType.Filter:
        case NodeType.Call:
        case ObjectType.Construction:
            return true;
        default:
            return false;
    }
};

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
