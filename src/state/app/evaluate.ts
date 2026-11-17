import {ObjectType, type EverythingObject} from "@/model";
import {nodeToObject, NodeType} from "@/model/nodes";
import {ObjectHistory} from "@/ui/objects/history";

/**
 * An initial expression that makes it obvious what evaluating does: `1 + 1`.
 */
const createInitialObject = (): EverythingObject =>
    nodeToObject({
        type: NodeType.Plus,
        first: nodeToObject({
            type: NodeType.Literal,
            object: {type: ObjectType.Integer, value: 1n},
            rest: [],
        }),
        second: nodeToObject({
            type: NodeType.Literal,
            object: {type: ObjectType.Integer, value: 1n},
            rest: [],
        }),
        rest: [],
    });

/**
 * The object, undo/redo history and selection of the evaluate tab.
 *
 * The history keeps a selection per entry, so creating it once keeps both the
 * history and the selection across tab changes.
 */
export const createEvaluateHistory = (): ObjectHistory =>
    new ObjectHistory([createInitialObject()]);
