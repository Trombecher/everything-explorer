import {ObjectType, type EverythingObject} from "@/model";
import {objectToNode, NodeType, NotANode} from "@/model/nodes";

import type {Block} from "./blocks";

export const objectViewColorHue = (object: EverythingObject): number => {
    const node = objectToNode(object);

    if (node !== NotANode) {
        switch (node.type) {
            case NodeType.Function:
                return 54;
            case NodeType.FunctionSelf:
                return 280;
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
            case NodeType.Less:
                return 290;
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
            case NodeType.Map:
                return 195;
            case NodeType.QueryAtomsWithProperty:
                return 160;
            case NodeType.QueryAtomsWithConstructor:
                return 150;
            case NodeType.ValuesOf:
                return 140;
            case NodeType.HasValue:
                return 115;
            case NodeType.Unwrap:
                return 310;
            case NodeType.QueryConstructionValues:
                return 240;
            case NodeType.QueryConstructions:
                return 270;
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

export const blockInColumnModeIsItemsCenter = (blockType: Block["type"]) => {
    switch (blockType) {
        case NodeType.Plus:
        case NodeType.Times:
        case NodeType.Equal:
        case NodeType.Less:
        case NodeType.Contains:
        case NodeType.And:
        case NodeType.Or:
        case NodeType.Union:
        case NodeType.Filter:
        case NodeType.Map:
        case NodeType.QueryConstructionValues:
        case NodeType.Call:
        case ObjectType.Construction:
            return true;
        default:
            return false;
    }
};
