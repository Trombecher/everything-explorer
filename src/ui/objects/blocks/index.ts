import type {EverythingObject} from "@/model";
import {NotANode, objectToNode, type Node} from "@/model/nodes";

import {canonicalizeForDisplay} from "./canonicalize";

export {canonicalizeForDisplay};

export type Block = EverythingObject | Node;

export const objectToBlock = (object: EverythingObject): Block => {
    const canonical = canonicalizeForDisplay(object);
    const node = objectToNode(canonical);
    if (node !== NotANode) return node;

    return canonical;
};
