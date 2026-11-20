/**
 * Escapes a character for display inside single quotes.
 *
 * Printable characters are kept as they are. Characters that are not visible on
 * their own (control, format, combining and similar characters) are escaped
 * like in Rust string literals. Backslashes and apostrophes must always be
 * escaped because they would otherwise be ambiguous with the surrounding quotes
 * or with an escape sequence.
 */
const escapeScalarForDisplay = (character: string): string => {
    switch (character) {
        case "\\":
            return "\\\\";
        case "'":
            return "\\'";
        case "\n":
            return "\\n";
        case "\r":
            return "\\r";
        case "\t":
            return "\\t";
        case "\0":
            return "\\0";
    }

    const codePoint = character.codePointAt(0);

    if (codePoint === undefined) return character;

    const isEscapedCategory =
        /[\p{Cc}\p{Cf}\p{Cs}\p{Co}\p{Cn}\p{M}\p{Zl}\p{Zp}]/u.test(character)
        // Spaces other than the regular space are hard to tell apart from it.
        || (codePoint !== 0x20 && /\p{Zs}/u.test(character));

    return isEscapedCategory
        ? `\\u{${codePoint.toString(16).toUpperCase()}}`
        : character;
};

export const escapeCharacterForDisplay = (value: string): string =>
    Array.from(value, escapeScalarForDisplay).join("");

const namedCharacterEscapes: ReadonlyMap<string, string> = new Map([
    ["n", "\n"],
    ["r", "\r"],
    ["t", "\t"],
    ["0", "\0"],
    ["\\", "\\"],
    ["'", "'"],
    ['"', '"'],
]);

const isSurrogateCodePoint = (codePoint: number): boolean =>
    codePoint >= 0xd800 && codePoint <= 0xdfff;

const parseHexCodePoint = (text: string, start: number, end: number) => {
    const digits = text.slice(start, end);

    if (digits.length === 0 || !/^[0-9a-f]+$/iu.test(digits)) return undefined;

    const codePoint = Number.parseInt(digits, 16);

    if (
        !Number.isSafeInteger(codePoint)
        || codePoint > 0x10ffff
        || isSurrogateCodePoint(codePoint)
    ) {
        return undefined;
    }

    return codePoint;
};

/**
 * Parses the text of a character field. It accepts either a single character or
 * one escape sequence. Exactly one Unicode scalar value must result.
 */
export const parseCharacterText = (text: string): string | undefined => {
    let result = "";
    let resultCodePointCount = 0;
    let index = 0;

    while (index < text.length) {
        const character = text[index];

        if (character === undefined) return undefined;

        if (character === "\\") {
            const escaped = text[index + 1];

            if (escaped === undefined) return undefined;

            const namedEscape = namedCharacterEscapes.get(escaped);

            if (namedEscape !== undefined) {
                result += namedEscape;
                resultCodePointCount += 1;
                index += 2;
            } else if (escaped === "u") {
                let codePoint: number | undefined;
                let nextIndex: number;

                if (text[index + 2] === "{") {
                    const closingBrace = text.indexOf("}", index + 3);

                    if (closingBrace === -1) return undefined;

                    codePoint = parseHexCodePoint(
                        text,
                        index + 3,
                        closingBrace,
                    );
                    nextIndex = closingBrace + 1;
                } else {
                    const digits = text.slice(index + 2, index + 6);

                    if (!/^[0-9a-f]{4}$/iu.test(digits)) return undefined;

                    codePoint = Number.parseInt(digits, 16);

                    if (isSurrogateCodePoint(codePoint)) return undefined;

                    nextIndex = index + 6;
                }

                if (codePoint === undefined) return undefined;

                result += String.fromCodePoint(codePoint);
                resultCodePointCount += 1;
                index = nextIndex;
            } else {
                return undefined;
            }
        } else {
            const codePoint = text.codePointAt(index);

            if (codePoint === undefined || isSurrogateCodePoint(codePoint)) {
                return undefined;
            }

            const width = codePoint > 0xffff ? 2 : 1;

            result += text.slice(index, index + width);
            resultCodePointCount += 1;
            index += width;
        }

        if (resultCodePointCount > 1) return undefined;
    }

    return resultCodePointCount === 1 ? result : undefined;
};

/**
 * Formats a byte the same way as the backend's `Debug` implementation.
 */
export const formatByteValue = (value: number): string =>
    value.toString(16).toUpperCase().padStart(2, "0");

/**
 * Parses a byte field. Accepts one or two hexadecimal digits, optionally
 * prefixed with `x` or `0x`.
 */
export const parseByteText = (text: string): number | undefined => {
    const match = /^(?:x|0x)?([0-9a-f]{1,2})$/iu.exec(text.trim());
    const digits = match?.[1];

    if (digits === undefined) return undefined;

    return Number.parseInt(digits, 16);
};
