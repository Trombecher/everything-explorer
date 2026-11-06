import {ObjectType, type EverythingObject} from 
import {
    type Node,
    nodeChildCount as childCountOfNode,
    NodeType,
    NotANode,
    objectToNode,
} from "@/model/nodes";

import {atomDisplayText, atomNamesRevision} from "./atomNames";

/**
 * Layout model for object views.
 *
 * Every object view lays its children out in a single row of flex items. To
 * decide whether an object has to switch to a column, we compute the width it
 * would have on a single row from the object tree. The decision therefore does
 * not depend on the rendered layout, which keeps it stable (it cannot
 * oscillate) and deterministic for a given available width.
 *
 * Keep this in sync with ObjectView, AtomView, NodeView, SetObjectView,
 * ConstructionView and TextView.
 */

/**
 * Horizontal padding and border of one object view (`p-1` + `border`).
 */
export const CHROME_X = 2 * (4 + 1);

/**
 * Width of `gap-1` between the flex items of an object view.
 */
export const GAP = 4;

/**
 * Widths of the icons used by the object views.
 */
export const ICON_WIDTH = {
    atom: 24,
    brace: 12,
    mapsTo: 32,
    dotDot: 24,
    box: 24,
    plus: 24,
    dot: 24,
    blackboardZ: 24,
} as const;

/**
 * Horizontal padding of the integer input (`pr-2`; Preflight resets the rest).
 */
const INTEGER_INPUT_PADDING_X = 8;

/**
 * Text that ObjectView renders for object types that have no view yet.
 */
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

/**
 * Width of a single-line text run in the font of the object views.
 */
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

const rowWidth = (childWidths: readonly number[]): number =>
    CHROME_X
    + childWidths.reduce((sum, width) => sum + width, 0)
    + GAP * Math.max(0, childWidths.length - 1);

const calculateRowLayoutWidthOfNode = (node: Node): number => {
    switch (node.type) {
        case NodeType.Function:
            return rowWidth([
                measureText("x"),
                ICON_WIDTH.mapsTo,
                calculateRowLayoutWidthOfObject(node.body),
            ]);
        case NodeType.Literal:
            return rowWidth([
                ICON_WIDTH.box,
                calculateRowLayoutWidthOfObject(node.object),
            ]);
        case NodeType.Plus:
            return rowWidth([
                calculateRowLayoutWidthOfObject(node.first),
                ICON_WIDTH.plus,
                calculateRowLayoutWidthOfObject(node.second),
            ]);
        case NodeType.Times:
            return rowWidth([
                calculateRowLayoutWidthOfObject(node.first),
                ICON_WIDTH.dot,
                calculateRowLayoutWidthOfObject(node.second),
            ]);
    }
};

const calculateRowLayoutWidthOfObjectWithoutCache = (
    object: Object,
): number => {
    const node = objectToNode(object);
    if (node !== NotANode) return calculateRowLayoutWidthOfNode(node);

    switch (object.type) {
        case ObjectType.Set: {
            const items: number[] = [ICON_WIDTH.brace];

            object.elements.forEach((element, index) => {
                const comma =
                    index < object.elements.length - 1 ? measureText(",") : 0;
                items.push(calculateRowLayoutWidthOfObject(element) + comma);
            });

            items.push(ICON_WIDTH.brace);
            return rowWidth(items);
        }
        case ObjectType.Construction:
            return rowWidth([
                ICON_WIDTH.dotDot,
                calculateRowLayoutWidthOfObject(object.constructor),
                calculateRowLayoutWidthOfObject(object.value),
            ]);
        case ObjectType.Atom:
            return rowWidth([
                ICON_WIDTH.atom,
                measureText(atomDisplayText(object)),
            ]);
        case ObjectType.Integer:
            return rowWidth([
                ICON_WIDTH.blackboardZ,
                measureText(String(object.value)) + INTEGER_INPUT_PADDING_X,
            ]);
        case ObjectType.Text:
            return rowWidth([
                measureText('"') + measureText(object.text) + measureText('"'),
            ]);
        case ObjectType.Character:
        case ObjectType.Byte:
            return leafWidth(NOT_IMPLEMENTED_TEXT);
    }
};

const rowLayoutWidthCache = new WeakMap<
    Object,
    {revision: number; width: number}
>();

/**
 * Natural (single row) width of an object view in px.
 */
export const calculateRowLayoutWidthOfObject = (object: Object): number => {
    const revision = atomNamesRevision();
    const cached = rowLayoutWidthCache.get(object);
    if (cached?.revision === revision) return cached.width;

    const width = calculateRowLayoutWidthOfObjectWithoutCache(object);
    rowLayoutWidthCache.set(object, {revision, width});
    return width;
};

export namespace LayoutMode {
    export const Row = Symbol("LayoutMode.Row");
    export const Column = Symbol("LayoutMode.Column");
}

export type LayoutMode = typeof LayoutMode.Column | typeof LayoutMode.Row;

/**
 * Counts the view-specific children of the given object.
 *
 * This function is rather cheap to compute.
 */
export const childCountOfObject = (object: Object): number => {
    const node = objectToNode(object);
    if (node !== NotANode) return childCountOfNode(node.type);

    switch (object.type) {
        case ObjectType.Atom:
            return 0;
        case ObjectType.Byte:
            return 0;
        case ObjectType.Character:
            return 0;
        case ObjectType.Construction:
            return 2;
        case ObjectType.Integer:
            return 0;
        case ObjectType.Set:
            return object.elements.length;
        case ObjectType.Text:
            return 0;
    }
};

export const calculateLayoutModeOfObject = (
    object: Object,
    widthBudgetInPixels: number,
): LayoutMode => {
    if (
        childCountOfObject(object) >= 2
        && calculateRowLayoutWidthOfObject(object) > widthBudgetInPixels
    ) {
        // Object has two or more children and exceeds width budget.
        return LayoutMode.Column;
    } else {
        return LayoutMode.Row;
    }
};
