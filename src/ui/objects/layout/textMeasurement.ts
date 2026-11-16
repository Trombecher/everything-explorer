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

/**
 * Width of a single-line text run in the font of the object views.
 */
export const measureText = (text: string): number => {
    const span = textMeasurerElement();
    span.textContent = text;

    const width = span.getBoundingClientRect().width;
    return width;
};

/**
 * Widths of the fixed punctuation that several blocks measure. Only these
 * static strings are cached: caching dynamic text would keep an unbounded
 * number of strings alive.
 */
const staticTextWidthCache = new Map<string, number>();

export const measureStaticText = (text: "," | '"'): number => {
    const cached = staticTextWidthCache.get(text);
    if (cached !== undefined) return cached;

    const width = measureText(text);
    staticTextWidthCache.set(text, width);
    return width;
};
