import type {EverythingObject} from "@/model";
import {NotANode, objectToNode, type Node} from "@/model/nodes";

export type Block = EverythingObject | Node;

export const objectToBlock = (object: EverythingObject): Block => {
    const node = objectToNode(object);
    if (node !== NotANode) return node;

    return object;
};
