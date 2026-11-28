import {ObjectType} from "@/model";
import {NodeType} from "@/model/nodes";

import type {Block} from "../blocks";

export const childCountOfBlock = (block: Block): number => {
    switch (block.type) {
        case ObjectType.Atom:
        case ObjectType.Byte:
        case ObjectType.Character:
        case ObjectType.Integer:
        case ObjectType.Text:
        case NodeType.FunctionSelf:
        case NodeType.Parameter:
            return 0;
        case NodeType.Function:
        case NodeType.Literal:
        case NodeType.SetCount:
        case NodeType.HasASetItem:
        case NodeType.Not:
        case NodeType.QueryAtomsWithConstructor:
        case NodeType.QueryAtomsWithProperty:
        case NodeType.QueryConstructions:
        case NodeType.PropertiesOf:
        case NodeType.SetUnwrap:
        case NodeType.IsAtom:
        case NodeType.IsConstruction:
        case NodeType.IsComposite:
        case NodeType.IsNode:
        case NodeType.ConstructionConstructor:
        case NodeType.ConstructionValue:
            return 1;
        case ObjectType.Construction:
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
        case NodeType.NewConstruction:
        case NodeType.SetFilter:
        case NodeType.SetMap:
        case NodeType.SetEvery:
        case NodeType.SetAny:
        case NodeType.QueryConstructionValues:
        case NodeType.Call:
            return 2;
        case NodeType.SetFold:
        case NodeType.If:
            return 3;
        case NodeType.NewSet:
            return block.items.length;
        case NodeType.NewComposite:
            return block.properties.length;
        case ObjectType.Composite:
            return block.properties.length;
        case ObjectType.Set:
            return block.items.length;
    }
};
