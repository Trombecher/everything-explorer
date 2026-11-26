import {Match, Switch} from "solid-js";

import {usePreferences} from "@/context";
import {Phrase} from "@/i18n/phrases";
import {ObjectType, type EverythingObject} from "@/model";
import {NodeType} from "@/model/nodes";
import type {DeepReadonly} from "@/util";
import {variant} from "@/util";

import AtomView from "../AtomView";
import BinaryOperationView from "../BinaryOperationView";
import ByteView from "../ByteView";
import CharacterView from "../CharacterView";
import CompositeObjectView from "../CompositeObjectView";
import CountObjectView from "../CountObjectView";
import FoldOperationView from "../FoldOperationView";
import IfOperationView from "../IfOperationView";
import IntegerView from "../IntegerView";
import type {LayoutMode} from "../layout";
import NewSetOperationView from "../NewSetOperationView";
import type {ObjectSelectionPath} from "../selection";
import SetObjectView from "../SetObjectView";
import TextView from "../TextView";
import UnaryOperationView from "../UnaryOperationView";
import FunctionObjectView from "./FunctionObjectView";
import FunctionSelfObjectView from "./FunctionSelfObjectView";
import type {Block} from "./index";
import LiteralObjectView from "./LiteralObjectView";
import ParameterObjectView from "./ParameterObjectView";

export default (props: {
    block: Block;
    path: DeepReadonly<ObjectSelectionPath>;
    setObject: ((newObject: EverythingObject | undefined) => void) | undefined;
    widthBudgetInPixels: number;
    layoutMode: LayoutMode;
}) => {
    const preferences = usePreferences();

    return (
        <Switch>
            <Match when={variant(props.block, NodeType.Function)}>
                {functionNode => (
                    <FunctionObjectView
                        node={functionNode()}
                        path={props.path}
                        setObject={props.setObject}
                        widthBudgetInPixels={props.widthBudgetInPixels}
                        layoutMode={props.layoutMode}
                    />
                )}
            </Match>
            <Match when={variant(props.block, NodeType.FunctionSelf)}>
                {functionSelfNode => (
                    <FunctionSelfObjectView
                        node={functionSelfNode()}
                        setObject={props.setObject}
                    />
                )}
            </Match>
            <Match when={variant(props.block, NodeType.Parameter)}>
                {parameterNode => (
                    <ParameterObjectView
                        node={parameterNode()}
                        setObject={props.setObject}
                    />
                )}
            </Match>
            <Match when={variant(props.block, NodeType.Plus)}>
                {plusNode => (
                    <BinaryOperationView
                        block={plusNode()}
                        path={props.path}
                        wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                        setObject={props.setObject}
                    />
                )}
            </Match>
            <Match when={variant(props.block, NodeType.Literal)}>
                {literalNode => (
                    <LiteralObjectView
                        node={literalNode()}
                        path={props.path}
                        setObject={props.setObject}
                        widthBudgetInPixels={props.widthBudgetInPixels}
                        layoutMode={props.layoutMode}
                    />
                )}
            </Match>
            <Match when={variant(props.block, NodeType.Times)}>
                {timesNode => (
                    <BinaryOperationView
                        block={timesNode()}
                        path={props.path}
                        wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                        setObject={props.setObject}
                    />
                )}
            </Match>
            <Match when={variant(props.block, NodeType.Equal)}>
                {equalNode => (
                    <BinaryOperationView
                        block={equalNode()}
                        path={props.path}
                        wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                        setObject={props.setObject}
                    />
                )}
            </Match>
            <Match when={variant(props.block, NodeType.Less)}>
                {lessNode => (
                    <BinaryOperationView
                        block={lessNode()}
                        path={props.path}
                        wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                        setObject={props.setObject}
                    />
                )}
            </Match>
            <Match when={variant(props.block, NodeType.Contains)}>
                {containsNode => (
                    <BinaryOperationView
                        block={containsNode()}
                        path={props.path}
                        wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                        setObject={props.setObject}
                    />
                )}
            </Match>
            <Match when={variant(props.block, NodeType.And)}>
                {andNode => (
                    <BinaryOperationView
                        block={andNode()}
                        path={props.path}
                        wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                        setObject={props.setObject}
                    />
                )}
            </Match>
            <Match when={variant(props.block, NodeType.Or)}>
                {orNode => (
                    <BinaryOperationView
                        block={orNode()}
                        path={props.path}
                        wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                        setObject={props.setObject}
                    />
                )}
            </Match>
            <Match when={variant(props.block, NodeType.Xor)}>
                {xorNode => (
                    <BinaryOperationView
                        block={xorNode()}
                        path={props.path}
                        wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                        setObject={props.setObject}
                    />
                )}
            </Match>
            <Match when={variant(props.block, NodeType.Not)}>
                {notNode => (
                    <UnaryOperationView
                        block={notNode()}
                        path={props.path}
                        wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                        setObject={props.setObject}
                    />
                )}
            </Match>
            <Match when={variant(props.block, NodeType.Count)}>
                {countNode => (
                    <CountObjectView
                        block={countNode()}
                        path={props.path}
                        wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                        setObject={props.setObject}
                    />
                )}
            </Match>
            <Match when={variant(props.block, NodeType.Union)}>
                {unionNode => (
                    <BinaryOperationView
                        block={unionNode()}
                        path={props.path}
                        wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                        setObject={props.setObject}
                    />
                )}
            </Match>
            <Match when={variant(props.block, NodeType.Intersection)}>
                {intersectionNode => (
                    <BinaryOperationView
                        block={intersectionNode()}
                        path={props.path}
                        wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                        setObject={props.setObject}
                    />
                )}
            </Match>
            <Match when={variant(props.block, NodeType.Filter)}>
                {filterNode => (
                    <BinaryOperationView
                        block={filterNode()}
                        path={props.path}
                        wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                        setObject={props.setObject}
                    />
                )}
            </Match>
            <Match when={variant(props.block, NodeType.Map)}>
                {mapNode => (
                    <BinaryOperationView
                        block={mapNode()}
                        path={props.path}
                        wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                        setObject={props.setObject}
                    />
                )}
            </Match>
            <Match when={variant(props.block, NodeType.Fold)}>
                {foldNode => (
                    <FoldOperationView
                        block={foldNode()}
                        path={props.path}
                        wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                        setObject={props.setObject}
                    />
                )}
            </Match>
            <Match when={variant(props.block, NodeType.Every)}>
                {everyNode => (
                    <BinaryOperationView
                        block={everyNode()}
                        path={props.path}
                        wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                        setObject={props.setObject}
                    />
                )}
            </Match>
            <Match when={variant(props.block, NodeType.Any)}>
                {anyNode => (
                    <BinaryOperationView
                        block={anyNode()}
                        path={props.path}
                        wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                        setObject={props.setObject}
                    />
                )}
            </Match>
            <Match when={variant(props.block, NodeType.NewSet)}>
                {newSetNode => (
                    <NewSetOperationView
                        block={newSetNode()}
                        path={props.path}
                        wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                        setObject={props.setObject}
                    />
                )}
            </Match>
            <Match when={variant(props.block, NodeType.QueryAtomsWithProperty)}>
                {queryAtomsWithPropertyNode => (
                    <UnaryOperationView
                        block={queryAtomsWithPropertyNode()}
                        path={props.path}
                        wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                        setObject={props.setObject}
                    />
                )}
            </Match>
            <Match
                when={variant(props.block, NodeType.QueryAtomsWithConstructor)}
            >
                {queryAtomsWithConstructorNode => (
                    <UnaryOperationView
                        block={queryAtomsWithConstructorNode()}
                        path={props.path}
                        wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                        setObject={props.setObject}
                    />
                )}
            </Match>
            <Match when={variant(props.block, NodeType.ValuesOf)}>
                {valuesOfNode => (
                    <UnaryOperationView
                        block={valuesOfNode()}
                        path={props.path}
                        wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                        setObject={props.setObject}
                    />
                )}
            </Match>
            <Match when={variant(props.block, NodeType.HasValue)}>
                {hasValueNode => (
                    <UnaryOperationView
                        block={hasValueNode()}
                        path={props.path}
                        wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                        setObject={props.setObject}
                    />
                )}
            </Match>
            <Match when={variant(props.block, NodeType.Unwrap)}>
                {unwrapNode => (
                    <UnaryOperationView
                        block={unwrapNode()}
                        path={props.path}
                        wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                        setObject={props.setObject}
                    />
                )}
            </Match>
            <Match when={variant(props.block, NodeType.IsAtom)}>
                {isAtomNode => (
                    <UnaryOperationView
                        block={isAtomNode()}
                        path={props.path}
                        wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                        setObject={props.setObject}
                    />
                )}
            </Match>
            <Match when={variant(props.block, NodeType.IsConstruction)}>
                {isConstructionNode => (
                    <UnaryOperationView
                        block={isConstructionNode()}
                        path={props.path}
                        wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                        setObject={props.setObject}
                    />
                )}
            </Match>
            <Match when={variant(props.block, NodeType.IsSet)}>
                {isSetNode => (
                    <UnaryOperationView
                        block={isSetNode()}
                        path={props.path}
                        wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                        setObject={props.setObject}
                    />
                )}
            </Match>
            <Match
                when={variant(props.block, NodeType.QueryConstructionValues)}
            >
                {queryConstructionValuesNode => (
                    <BinaryOperationView
                        block={queryConstructionValuesNode()}
                        path={props.path}
                        wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                        setObject={props.setObject}
                    />
                )}
            </Match>
            <Match when={variant(props.block, NodeType.QueryConstructions)}>
                {queryConstructionsNode => (
                    <UnaryOperationView
                        block={queryConstructionsNode()}
                        path={props.path}
                        wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                        setObject={props.setObject}
                    />
                )}
            </Match>
            <Match
                when={variant(props.block, NodeType.ConstructionConstructor)}
            >
                {constructionConstructorNode => (
                    <UnaryOperationView
                        block={constructionConstructorNode()}
                        path={props.path}
                        wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                        setObject={props.setObject}
                    />
                )}
            </Match>
            <Match when={variant(props.block, NodeType.ConstructionValue)}>
                {constructionValueNode => (
                    <UnaryOperationView
                        block={constructionValueNode()}
                        path={props.path}
                        wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                        setObject={props.setObject}
                    />
                )}
            </Match>
            <Match when={variant(props.block, NodeType.If)}>
                {ifNode => (
                    <IfOperationView
                        block={ifNode()}
                        path={props.path}
                        wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                        setObject={props.setObject}
                    />
                )}
            </Match>
            <Match when={variant(props.block, NodeType.Call)}>
                {callNode => (
                    <BinaryOperationView
                        block={callNode()}
                        path={props.path}
                        wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                        setObject={props.setObject}
                    />
                )}
            </Match>

            <Match when={variant(props.block, ObjectType.Text)}>
                {text => <TextView text={text()} setText={props.setObject} />}
            </Match>
            <Match when={variant(props.block, ObjectType.Atom)}>
                {atom => <AtomView atom={atom()} setAtom={props.setObject} />}
            </Match>
            <Match when={variant(props.block, ObjectType.Integer)}>
                {integer => (
                    <IntegerView
                        integer={integer()}
                        setInteger={props.setObject}
                    />
                )}
            </Match>
            <Match when={variant(props.block, ObjectType.Character)}>
                {character => (
                    <CharacterView
                        character={character()}
                        setCharacter={props.setObject}
                    />
                )}
            </Match>
            <Match when={variant(props.block, ObjectType.Byte)}>
                {byte => <ByteView byte={byte()} setByte={props.setObject} />}
            </Match>
            <Match when={variant(props.block, ObjectType.Composite)}>
                {composite => (
                    <CompositeObjectView
                        composite={composite()}
                        setComposite={props.setObject}
                        path={props.path}
                        widthBudgetInPixels={props.widthBudgetInPixels}
                    />
                )}
            </Match>
            <Match when={variant(props.block, ObjectType.Set)}>
                {set => (
                    <SetObjectView
                        set={set()}
                        setSet={props.setObject}
                        path={props.path}
                        widthBudgetInPixels={props.widthBudgetInPixels}
                    />
                )}
            </Match>
            <Match when={variant(props.block, ObjectType.Construction)}>
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
                {preferences.translate(Phrase.NotImplemented, undefined)}
            </Match>
        </Switch>
    );
};
