import {defaultObject, type EverythingObject} from "@/model";
import {NodeType, NotANode, objectToNode} from "@/model/nodes";

/**
 * Returned for objects that have no child worth retaining. The caller must
 * leave the object unchanged, matching the behavior of an unhandled deletion.
 */
export const NoRetainedChild = Symbol("NoRetainedChild");

/**
 * The object to keep when the user deletes `object` while retaining a child.
 *
 * Every node type retains the child that best preserves the user's data.
 * Objects that are not nodes have no child and are removed entirely.
 */
export const replaceWithRetainedChild = (
    object: EverythingObject,
): EverythingObject | undefined | typeof NoRetainedChild => {
    const node = objectToNode(object);
    if (node === NotANode) return undefined;

    switch (node.type) {
        case NodeType.Function:
            return node.body;
        case NodeType.FunctionSelf:
        case NodeType.Parameter:
            return NoRetainedChild;
        case NodeType.Literal:
            return node.object;
        case NodeType.Plus:
            return node.first;
        case NodeType.Equal:
            return node.first;
        case NodeType.Less:
            return node.first;
        case NodeType.And:
            return node.first;
        case NodeType.Or:
            return node.first;
        case NodeType.Xor:
            return node.first;
        case NodeType.Not:
            return node.operand;
        case NodeType.SetCount:
            return node.inner;
        case NodeType.QueryAtomsWithProperty:
            return node.property;
        case NodeType.QueryAtomsWithConstructor:
            return node.constructor;
        case NodeType.QueryConstructions:
            return node.constructor;
        case NodeType.PropertiesOf:
            return node.inner;
        case NodeType.HasASetItem:
            return node.inner;
        case NodeType.HasProperty:
            return node.subject;
        case NodeType.SetUnwrap:
            return node.set;
        case NodeType.IsAtom:
            return node.inner;
        case NodeType.IsConstruction:
            return node.inner;
        case NodeType.IsComposite:
            return node.inner;
        case NodeType.IsNode:
            return node.inner;
        case NodeType.ConstructionConstructor:
            return node.construction;
        case NodeType.ConstructionValue:
            return node.construction;
        case NodeType.SetUnion:
            return node.first;
        case NodeType.SetIntersection:
            return node.first;
        case NodeType.SetDifference:
            return node.first;
        case NodeType.NewConstruction:
            return node.constructor;
        case NodeType.SetFilter:
        case NodeType.SetMap:
        case NodeType.SetEvery:
        case NodeType.SetAny:
            return node.set;
        case NodeType.QueryConstructionValues:
            return node.object;
        case NodeType.SetFold:
            return node.set;
        case NodeType.NewSet:
            return node.items[0] ?? defaultObject;
        case NodeType.NewComposite:
            return node.properties[0] ?? defaultObject;
        case NodeType.If:
            return node.condition;
        case NodeType.SetContains:
            return node.element;
        case NodeType.Call:
            return node.callee;
    }
};
