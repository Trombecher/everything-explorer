import {ObjectType} from "@/model";
import {NodeType} from "@/model/nodes";

import type {Block} from "./blocks";

/**
 * The semantic color category an object view is tinted with. This is a UI
 * concept only, not part of the wire format.
 */
export namespace ObjectViewColorCategory {
    export const Functional = Symbol();
    export const Computation = Symbol();
    export const Boolean = Symbol();
    export const Set = Symbol();
    export const Literal = Symbol();
    export const Query = Symbol();
    export const Control = Symbol();
    export const Constructions = Symbol();
    export const Atom = Symbol();
    export const Values = Symbol();
}

export type ObjectViewColorCategory =
    | typeof ObjectViewColorCategory.Functional
    | typeof ObjectViewColorCategory.Computation
    | typeof ObjectViewColorCategory.Boolean
    | typeof ObjectViewColorCategory.Set
    | typeof ObjectViewColorCategory.Literal
    | typeof ObjectViewColorCategory.Query
    | typeof ObjectViewColorCategory.Control
    | typeof ObjectViewColorCategory.Constructions
    | typeof ObjectViewColorCategory.Atom
    | typeof ObjectViewColorCategory.Values;

/**
 * The background class per category. The class names are spelled out literally
 * so that the Tailwind source scanner picks them up.
 */
const colorCategoryClasses: Record<ObjectViewColorCategory, string> = {
    [ObjectViewColorCategory.Functional]: "bg-obj-functional",
    [ObjectViewColorCategory.Computation]: "bg-obj-computation",
    [ObjectViewColorCategory.Boolean]: "bg-obj-boolean",
    [ObjectViewColorCategory.Set]: "bg-obj-set",
    [ObjectViewColorCategory.Literal]: "bg-obj-literal",
    [ObjectViewColorCategory.Query]: "bg-obj-query",
    [ObjectViewColorCategory.Control]: "bg-obj-control",
    [ObjectViewColorCategory.Constructions]: "bg-obj-constructions",
    [ObjectViewColorCategory.Atom]: "bg-obj-atom",
    [ObjectViewColorCategory.Values]: "bg-obj-values",
};

/**
 * The semantic color category of a block type, covering both node types and
 * object types. A new block type must be categorized here, otherwise the
 * missing return statement fails type checking.
 */
export const objectViewColorCategory = (
    blockType: Block["type"],
): ObjectViewColorCategory => {
    switch (blockType) {
        case NodeType.Function:
        case NodeType.FunctionSelf:
        case NodeType.Call:
        case NodeType.Parameter:
            return ObjectViewColorCategory.Functional;

        case NodeType.Plus:
        case NodeType.Times:
        case NodeType.Less:
        case NodeType.Equal:
        case NodeType.SetCount:
            return ObjectViewColorCategory.Computation;

        case NodeType.Not:
        case NodeType.And:
        case NodeType.Or:
        case NodeType.Xor:
        case NodeType.SetContains:
        case NodeType.IsAtom:
        case NodeType.IsConstruction:
        case NodeType.IsComposite:
        case NodeType.IsNode:
        case NodeType.HasASetItem:
        case NodeType.HasProperty:
            return ObjectViewColorCategory.Boolean;

        case NodeType.SetUnwrap:
        case NodeType.SetUnion:
        case NodeType.SetIntersection:
        case NodeType.SetDifference:
        case NodeType.SetFilter:
        case NodeType.SetMap:
        case NodeType.SetEvery:
        case NodeType.SetAny:
        case NodeType.SetFold:
        case NodeType.NewSet:
        case NodeType.NewComposite:
        case ObjectType.Composite:
        case ObjectType.Set:
            return ObjectViewColorCategory.Set;

        case NodeType.Literal:
            return ObjectViewColorCategory.Literal;

        case NodeType.PropertiesOf:
        case NodeType.QueryAtomsWithProperty:
        case NodeType.QueryAtomsWithConstructor:
        case NodeType.QueryConstructionValues:
        case NodeType.QueryConstructions:
            return ObjectViewColorCategory.Query;

        case NodeType.If:
            return ObjectViewColorCategory.Control;

        case ObjectType.Construction:
        case NodeType.ConstructionConstructor:
        case NodeType.ConstructionValue:
        case NodeType.NewConstruction:
            return ObjectViewColorCategory.Constructions;

        case ObjectType.Atom:
            return ObjectViewColorCategory.Atom;

        case ObjectType.Text:
        case ObjectType.Integer:
        case ObjectType.Byte:
        case ObjectType.Character:
            return ObjectViewColorCategory.Values;
    }
};

/**
 * The background class for an object view, derived from its color category.
 */
export const objectViewBackgroundClass = (blockType: Block["type"]): string =>
    colorCategoryClasses[objectViewColorCategory(blockType)];

export const blockInColumnModeIsItemsCenter = (blockType: Block["type"]) => {
    switch (blockType) {
        case NodeType.Plus:
        case NodeType.Times:
        case NodeType.Equal:
        case NodeType.Less:
        case NodeType.SetContains:
        case NodeType.HasProperty:
        case NodeType.And:
        case NodeType.Or:
        case NodeType.Xor:
        case NodeType.SetUnion:
        case NodeType.SetIntersection:
        case NodeType.SetDifference:
        case NodeType.SetFilter:
        case NodeType.SetMap:
        case NodeType.SetEvery:
        case NodeType.SetAny:
        case NodeType.SetFold:
        case NodeType.NewConstruction:
        case NodeType.QueryConstructionValues:
        case NodeType.Call:
        case ObjectType.Construction:
            return true;
        default:
            return false;
    }
};
