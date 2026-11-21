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
        case NodeType.Count:
        case NodeType.HasValue:
        case NodeType.Not:
        case NodeType.QueryAtomsWithConstructor:
        case NodeType.QueryAtomsWithProperty:
        case NodeType.QueryConstructions:
        case NodeType.ValuesOf:
        case NodeType.Unwrap:
        case NodeType.IsAtom:
        case NodeType.IsConstruction:
        case NodeType.IsSet:
        case NodeType.ConstructionConstructor:
            return 1;
        case ObjectType.Construction:
        case NodeType.Plus:
        case NodeType.Times:
        case NodeType.Equal:
        case NodeType.Less:
        case NodeType.Contains:
        case NodeType.And:
        case NodeType.Or:
        case NodeType.Xor:
        case NodeType.Union:
        case NodeType.Intersection:
        case NodeType.Filter:
        case NodeType.Map:
        case NodeType.Every:
        case NodeType.Any:
        case NodeType.QueryConstructionValues:
        case NodeType.Call:
            return 2;
        case NodeType.Fold:
        case NodeType.If:
            return 3;
        case ObjectType.Set:
            return block.elements.length;
    }
};
