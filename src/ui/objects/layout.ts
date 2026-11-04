import {ObjectType, type Object} from "@/model";
import {type Node, NodeType, objectToNode} from "@/model/nodes";

/**
 * Layout model for object views.
 *
 * Every object view lays its children out in a single row of flex items. To
 * decide whether an object has to switch to a column, we compute the width it
 * would have on a single row from the object tree. The decision therefore does
 * not depend on the rendered layout, which keeps it stable (it cannot
 * oscillate) and deterministic for a given available width.
 *
 * Keep this in sync with ObjectView, NodeView, SetObjectView and
 * ConstructionView.
 */

/** Horizontal padding and border of one object view (`p-1` + `border`). */
export const CHROME_X = 2 * (4 + 1);

/** Width of `gap-1` between the flex items of an object view. */
export const GAP = 4;

/** Widths of the icons used by the object views. */
export const ICON_WIDTH = {
    brace: 12,
    mapsTo: 32,
    dotDot: 24,
    box: 24,
    plus: 24,
    dot: 24,
    blackboardZ: 24,
} as const;

/** Horizontal padding of the integer input (`pr-2`; Preflight resets the rest). */
const INTEGER_INPUT_PADDING_X = 8;

/** Text that ObjectView renders for object types that have no view yet. */
const NOT_IMPLEMENTED_TEXT = "NOT IMPL";

let textMeasurer: HTMLSpanElement | undefined;

const textMeasurerElement = (): HTMLSpanElement => {
    if (textMeasurer) return textMeasurer;

    const span = document.createElement("span");
    span.style.position = "absolute";
    span.style.left = "-10000px";
    span.style.top = "0";
    span.style.visibility = "hidden";
    span.style.whiteSpace = "pre";
    span.style.pointerEvents = "none";
    document.body.appendChild(span);

    textMeasurer = span;
    return span;
};

const textWidthCache = new Map<string, number>();

/** Width of a single-line text run in the font of the object views. */
export const measureText = (text: string): number => {
    const cached = textWidthCache.get(text);
    if (cached !== undefined) return cached;

    const span = textMeasurerElement();
    span.textContent = text;

    const width = span.getBoundingClientRect().width;
    textWidthCache.set(text, width);
    return width;
};

const leafWidth = (text: string): number => CHROME_X + measureText(text);

const rowWidth = (items: readonly number[]): number =>
    CHROME_X +
    items.reduce((sum, width) => sum + width, 0) +
    GAP * Math.max(0, items.length - 1);

const nodeCache = new WeakMap<Object, Node | undefined>();

/** Cached `objectToNode` that is shared with the width model. */
export const nodeFor = (object: Object): Node | undefined => {
    if (nodeCache.has(object)) return nodeCache.get(object);

    const node = objectToNode(object);
    nodeCache.set(object, node);
    return node;
};

const nodeWidth = (node: Node): number => {
    switch (node.type) {
        case NodeType.Function:
            return rowWidth([
                measureText("x"),
                ICON_WIDTH.mapsTo,
                naturalWidth(node.body),
            ]);
        case NodeType.Literal:
            return rowWidth([ICON_WIDTH.box, naturalWidth(node.object)]);
        case NodeType.Plus:
            return rowWidth([
                naturalWidth(node.first),
                ICON_WIDTH.plus,
                naturalWidth(node.second),
            ]);
        case NodeType.Times:
            return rowWidth([
                naturalWidth(node.first),
                ICON_WIDTH.dot,
                naturalWidth(node.second),
            ]);
    }
};

const computeNaturalWidth = (object: Object): number => {
    const node = nodeFor(object);
    if (node) return nodeWidth(node);

    switch (object.type) {
        case ObjectType.Set: {
            const items: number[] = [ICON_WIDTH.brace];

            object.elements.forEach((element, index) => {
                const comma =
                    index < object.elements.length - 1 ? measureText(",") : 0;
                items.push(naturalWidth(element) + comma);
            });

            items.push(ICON_WIDTH.brace);
            return rowWidth(items);
        }
        case ObjectType.Construction:
            return rowWidth([
                ICON_WIDTH.dotDot,
                naturalWidth(object.constructor),
                naturalWidth(object.value),
            ]);
        case ObjectType.Atom:
            return leafWidth(`@${object.value}`);
        case ObjectType.Integer:
            return rowWidth([
                ICON_WIDTH.blackboardZ,
                measureText(String(object.value)) + INTEGER_INPUT_PADDING_X,
            ]);
        case ObjectType.Character:
        case ObjectType.Byte:
        case ObjectType.Text:
            return leafWidth(NOT_IMPLEMENTED_TEXT);
    }
};

const naturalWidthCache = new WeakMap<Object, number>();

/** Natural (single row) width of an object view in px. */
export const naturalWidth = (object: Object): number => {
    const cached = naturalWidthCache.get(object);
    if (cached !== undefined) return cached;

    const width = computeNaturalWidth(object);
    naturalWidthCache.set(object, width);
    return width;
};
