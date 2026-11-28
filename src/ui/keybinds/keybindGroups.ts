import {Phrase} from "@/i18n/phrases";

/**
 * A phrase that can be translated without arguments.
 */
type NoArgumentPhrase = {
    [P in Phrase]: Phrase.TranslationArguments[P] extends undefined ? P : never;
}[Phrase];

/**
 * Keys that are pressed together, e.g. `["Ctrl", "Shift", "Z"]`.
 */
export type KeybindChord = readonly string[];

export type KeybindRow = {
    /**
     * The alternative chords that trigger the action.
     */
    readonly chords: readonly KeybindChord[];

    readonly label: NoArgumentPhrase;
};

export type KeybindGroup = {
    readonly title: NoArgumentPhrase;
    readonly rows: readonly KeybindRow[];
};

/**
 * The shortcuts handled by the object views, in display order. Every key that
 * changes the focused object or selects another node belongs here.
 */
export const keybindGroups: readonly KeybindGroup[] = [
    {
        title: Phrase.KeybindsSelection,
        rows: [
            {chords: [["↑"], ["←"]], label: Phrase.KeybindPreviousSibling},
            {chords: [["↓"], ["→"]], label: Phrase.KeybindNextSibling},
            {chords: [["Shift", "→"]], label: Phrase.KeybindFirstChild},
            {chords: [["Shift", "←"]], label: Phrase.KeybindParent},
        ],
    },
    {
        title: Phrase.KeybindsEditing,
        rows: [
            {chords: [["Enter"]], label: Phrase.KeybindAddOrEdit},
            {chords: [["Delete"]], label: Phrase.KeybindDelete},
            {
                chords: [["Shift", "Backspace"]],
                label: Phrase.KeybindDeleteRetainingChild,
            },
            {chords: [["Backspace"]], label: Phrase.KeybindReplaceParent},
            {chords: [["1…9"]], label: Phrase.KeybindQueryType},
            {chords: [["Ctrl", "Z"]], label: Phrase.KeybindUndo},
            {
                chords: [
                    ["Ctrl", "Shift", "Z"],
                    ["Ctrl", "Y"],
                ],
                label: Phrase.KeybindRedo,
            },
        ],
    },
    {
        title: Phrase.Clipboard,
        rows: [
            {chords: [["Alt", "1…0"]], label: Phrase.KeybindUseClipboardSlot},
            {
                chords: [["Ctrl", "Alt", "N"]],
                label: Phrase.KeybindCopyToClipboard,
            },
        ],
    },
    {
        title: Phrase.KeybindsOperators,
        rows: [
            {chords: [["+"]], label: Phrase.KeybindInsertPlus},
            {chords: [["*"]], label: Phrase.KeybindInsertTimes},
            {chords: [["="]], label: Phrase.KeybindInsertEquality},
            {chords: [["<"]], label: Phrase.KeybindInsertLessThan},
            {chords: [["&"]], label: Phrase.KeybindInsertAnd},
            {chords: [["|"]], label: Phrase.KeybindInsertOr},
            {chords: [["X"]], label: Phrase.KeybindInsertXor},
            {chords: [["!"]], label: Phrase.KeybindInsertNot},
            {chords: [["C"]], label: Phrase.KeybindInsertSetCount},
            {chords: [["H"]], label: Phrase.KeybindInsertHasProperty},
            {chords: [["e"]], label: Phrase.KeybindInsertContains},
        ],
    },
    {
        title: Phrase.KeybindsSetOperations,
        rows: [
            {chords: [["u"]], label: Phrase.KeybindInsertSetUnion},
            {chords: [["n"]], label: Phrase.KeybindInsertSetIntersection},
            {chords: [["d"]], label: Phrase.KeybindInsertSetDifference},
            {chords: [["F"]], label: Phrase.KeybindInsertSetFilter},
            {chords: [["A"]], label: Phrase.KeybindInsertEvery},
            {chords: [["E"]], label: Phrase.KeybindInsertAny},
            {chords: [["m"]], label: Phrase.KeybindInsertMap},
            {chords: [["r"]], label: Phrase.KeybindInsertFold},
            {chords: [["h"]], label: Phrase.KeybindInsertHasASetItem},
            {chords: [["U"]], label: Phrase.KeybindInsertUnwrap},
            {chords: [["S"]], label: Phrase.KeybindInsertSet},
            {chords: [["N"]], label: Phrase.KeybindInsertNewSet},
            {chords: [["O"]], label: Phrase.KeybindInsertNewComposite},
        ],
    },
    {
        title: Phrase.KeybindsQueries,
        rows: [
            {chords: [["q"]], label: Phrase.KeybindInsertAtomsWithProperty},
            {chords: [["v"]], label: Phrase.KeybindInsertPropertiesOf},
            {chords: [["I"]], label: Phrase.KeybindInsertIsComposite},
            {chords: [["J"]], label: Phrase.KeybindInsertIsNode},
            {chords: [["P"]], label: Phrase.KeybindInsertIsAtom},
            {chords: [["K"]], label: Phrase.KeybindInsertIsConstruction},
        ],
    },
    {
        title: Phrase.KeybindsConstructions,
        rows: [
            {chords: [["Space"]], label: Phrase.KeybindInsertConstruction},
            {chords: [["b"]], label: Phrase.KeybindInsertNewConstruction},
            {chords: [["k"]], label: Phrase.KeybindInsertConstructor},
            {chords: [["V"]], label: Phrase.KeybindInsertConstructionValue},
        ],
    },
    {
        title: Phrase.KeybindsFunctions,
        rows: [
            {chords: [["f"]], label: Phrase.KeybindInsertFunction},
            {chords: [["c"]], label: Phrase.KeybindInsertCall},
            {chords: [["i"]], label: Phrase.KeybindInsertIf},
            {chords: [["p"]], label: Phrase.KeybindInsertParameter},
            {chords: [["s"]], label: Phrase.KeybindInsertSelf},
        ],
    },
    {
        title: Phrase.KeybindsValues,
        rows: [
            {chords: [["l"]], label: Phrase.KeybindInsertLiteral},
            {chords: [["z"]], label: Phrase.KeybindInsertInteger},
            {chords: [["a"]], label: Phrase.KeybindInsertAtom},
            {chords: [["t"]], label: Phrase.KeybindInsertText},
            {chords: [["'"]], label: Phrase.KeybindInsertCharacter},
            {chords: [["x"]], label: Phrase.KeybindInsertByte},
        ],
    },
];
