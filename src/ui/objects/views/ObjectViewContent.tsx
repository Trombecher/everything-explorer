import {Match, Switch} from "solid-js";

import {usePreferences} from "@/context";
import {Phrase} from "@/i18n/phrases";
import {ObjectType, type EverythingObject} from "@/model";
import {NodeType} from "@/model/nodes";
import type {DeepReadonly} from "@/util";
import {variant} from "@/util";

import type {Block} from "../blocks";
import type {LayoutMode} from "../layout";
import type {ObjectSelectionPath} from "../selection";
import CompositeObjectView from "./collections/CompositeObjectView";
import NewCompositeOperationView from "./collections/NewCompositeOperationView";
import NewSetOperationView from "./collections/NewSetOperationView";
import SetObjectView from "./collections/SetObjectView";
import FunctionObjectView from "./functions/FunctionObjectView";
import FunctionSelfObjectView from "./functions/FunctionSelfObjectView";
import ParameterObjectView from "./functions/ParameterObjectView";
import BinaryOperationView from "./operations/BinaryOperationView";
import CountObjectView from "./operations/CountObjectView";
import FoldOperationView from "./operations/FoldOperationView";
import IfOperationView from "./operations/IfOperationView";
import LiteralObjectView from "./operations/LiteralObjectView";
import UnaryOperationView from "./operations/UnaryOperationView";
import AtomView from "./scalars/AtomView";
import ByteView from "./scalars/ByteView";
import CharacterView from "./scalars/CharacterView";
import IntegerView from "./scalars/IntegerView";
import TextView from "./scalars/TextView";

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
            <Match when={variant(props.block, NodeType.SetContains)}>
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
            <Match when={variant(props.block, NodeType.SetCount)}>
                {setCountNode => (
                    <CountObjectView
                        block={setCountNode()}
                        path={props.path}
                        wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                        setObject={props.setObject}
                    />
                )}
            </Match>
            <Match when={variant(props.block, NodeType.SetUnion)}>
                {unionNode => (
                    <BinaryOperationView
                        block={unionNode()}
                        path={props.path}
                        wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                        setObject={props.setObject}
                    />
                )}
            </Match>
            <Match when={variant(props.block, NodeType.SetIntersection)}>
                {intersectionNode => (
                    <BinaryOperationView
                        block={intersectionNode()}
                        path={props.path}
                        wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                        setObject={props.setObject}
                    />
                )}
            </Match>
            <Match when={variant(props.block, NodeType.SetDifference)}>
                {differenceNode => (
                    <BinaryOperationView
                        block={differenceNode()}
                        path={props.path}
                        wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                        setObject={props.setObject}
                    />
                )}
            </Match>
            <Match when={variant(props.block, NodeType.SetFilter)}>
                {filterNode => (
                    <BinaryOperationView
                        block={filterNode()}
                        path={props.path}
                        wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                        setObject={props.setObject}
                    />
                )}
            </Match>
            <Match when={variant(props.block, NodeType.SetMap)}>
                {mapNode => (
                    <BinaryOperationView
                        block={mapNode()}
                        path={props.path}
                        wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                        setObject={props.setObject}
                    />
                )}
            </Match>
            <Match when={variant(props.block, NodeType.SetFold)}>
                {foldNode => (
                    <FoldOperationView
                        block={foldNode()}
                        path={props.path}
                        wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                        setObject={props.setObject}
                    />
                )}
            </Match>
            <Match when={variant(props.block, NodeType.SetEvery)}>
                {everyNode => (
                    <BinaryOperationView
                        block={everyNode()}
                        path={props.path}
                        wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                        setObject={props.setObject}
                    />
                )}
            </Match>
            <Match when={variant(props.block, NodeType.SetAny)}>
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
            <Match when={variant(props.block, NodeType.NewComposite)}>
                {newCompositeNode => (
                    <NewCompositeOperationView
                        block={newCompositeNode()}
                        path={props.path}
                        wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                        setObject={props.setObject}
                    />
                )}
            </Match>
            <Match when={variant(props.block, NodeType.NewConstruction)}>
                {newConstructionNode => (
                    <BinaryOperationView
                        block={newConstructionNode()}
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
            <Match when={variant(props.block, NodeType.PropertiesOf)}>
                {propertiesOfNode => (
                    <UnaryOperationView
                        block={propertiesOfNode()}
                        path={props.path}
                        wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                        setObject={props.setObject}
                    />
                )}
            </Match>
            <Match when={variant(props.block, NodeType.CompositeFromSet)}>
                {compositeFromSetNode => (
                    <UnaryOperationView
                        block={compositeFromSetNode()}
                        path={props.path}
                        wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                        setObject={props.setObject}
                    />
                )}
            </Match>
            <Match when={variant(props.block, NodeType.HasASetItem)}>
                {hasASetItemNode => (
                    <UnaryOperationView
                        block={hasASetItemNode()}
                        path={props.path}
                        wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                        setObject={props.setObject}
                    />
                )}
            </Match>
            <Match when={variant(props.block, NodeType.HasProperty)}>
                {hasPropertyNode => (
                    <BinaryOperationView
                        block={hasPropertyNode()}
                        path={props.path}
                        wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                        setObject={props.setObject}
                    />
                )}
            </Match>
            <Match when={variant(props.block, NodeType.SetUnwrap)}>
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
            <Match when={variant(props.block, NodeType.IsComposite)}>
                {isCompositeNode => (
                    <UnaryOperationView
                        block={isCompositeNode()}
                        path={props.path}
                        wholeWidthBudgetInPixels={props.widthBudgetInPixels}
                        setObject={props.setObject}
                    />
                )}
            </Match>
            <Match when={variant(props.block, NodeType.IsNode)}>
                {isNodeNode => (
                    <UnaryOperationView
                        block={isNodeNode()}
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
