const Keybinds = Symbol();
const KeybindsHint = Symbol();
const SearchKeybinds = Symbol();
const NoKeybindsFound = Symbol();
const KeybindsSelection = Symbol();
const KeybindsEditing = Symbol();
const KeybindsOperators = Symbol();
const KeybindsSetOperations = Symbol();
const KeybindsQueries = Symbol();
const KeybindsConstructions = Symbol();
const KeybindsFunctions = Symbol();
const KeybindsValues = Symbol();

const KeybindPreviousSibling = Symbol();
const KeybindNextSibling = Symbol();
const KeybindFirstChild = Symbol();
const KeybindParent = Symbol();
const KeybindAddOrEdit = Symbol();
const KeybindDelete = Symbol();
const KeybindDeleteRetainingChild = Symbol();
const KeybindReplaceParent = Symbol();
const KeybindQueryType = Symbol();
const KeybindUndo = Symbol();
const KeybindRedo = Symbol();
const KeybindUseClipboardSlot = Symbol();
const KeybindCopyToClipboard = Symbol();

const KeybindInsertPlus = Symbol();
const KeybindInsertTimes = Symbol();
const KeybindInsertEquality = Symbol();
const KeybindInsertLessThan = Symbol();
const KeybindInsertAnd = Symbol();
const KeybindInsertOr = Symbol();
const KeybindInsertXor = Symbol();
const KeybindInsertNot = Symbol();
const KeybindInsertSetCount = Symbol();
const KeybindInsertHasProperty = Symbol();
const KeybindInsertContains = Symbol();
const KeybindInsertSetUnion = Symbol();
const KeybindInsertSetIntersection = Symbol();
const KeybindInsertSetDifference = Symbol();
const KeybindInsertSetFilter = Symbol();
const KeybindInsertEvery = Symbol();
const KeybindInsertAny = Symbol();
const KeybindInsertMap = Symbol();
const KeybindInsertFold = Symbol();
const KeybindInsertHasASetItem = Symbol();
const KeybindInsertUnwrap = Symbol();
const KeybindInsertCompositeFromSet = Symbol();
const KeybindInsertSet = Symbol();
const KeybindInsertNewSet = Symbol();
const KeybindInsertNewComposite = Symbol();
const KeybindInsertAtomsWithProperty = Symbol();
const KeybindInsertPropertiesOf = Symbol();
const KeybindInsertIsComposite = Symbol();
const KeybindInsertIsNode = Symbol();
const KeybindInsertIsAtom = Symbol();
const KeybindInsertIsConstruction = Symbol();
const KeybindInsertConstruction = Symbol();
const KeybindInsertNewConstruction = Symbol();
const KeybindInsertConstructor = Symbol();
const KeybindInsertConstructionValue = Symbol();
const KeybindInsertFunction = Symbol();
const KeybindInsertCall = Symbol();
const KeybindInsertIf = Symbol();
const KeybindInsertParameter = Symbol();
const KeybindInsertSelf = Symbol();
const KeybindInsertLiteral = Symbol();
const KeybindInsertInteger = Symbol();
const KeybindInsertAtom = Symbol();
const KeybindInsertText = Symbol();
const KeybindInsertCharacter = Symbol();
const KeybindInsertByte = Symbol();

export const keybindPhrases = {
    Keybinds,
    KeybindsHint,
    SearchKeybinds,
    NoKeybindsFound,
    KeybindsSelection,
    KeybindsEditing,
    KeybindsOperators,
    KeybindsSetOperations,
    KeybindsQueries,
    KeybindsConstructions,
    KeybindsFunctions,
    KeybindsValues,
    KeybindPreviousSibling,
    KeybindNextSibling,
    KeybindFirstChild,
    KeybindParent,
    KeybindAddOrEdit,
    KeybindDelete,
    KeybindDeleteRetainingChild,
    KeybindReplaceParent,
    KeybindQueryType,
    KeybindUndo,
    KeybindRedo,
    KeybindUseClipboardSlot,
    KeybindCopyToClipboard,
    KeybindInsertPlus,
    KeybindInsertTimes,
    KeybindInsertEquality,
    KeybindInsertLessThan,
    KeybindInsertAnd,
    KeybindInsertOr,
    KeybindInsertXor,
    KeybindInsertNot,
    KeybindInsertSetCount,
    KeybindInsertHasProperty,
    KeybindInsertContains,
    KeybindInsertSetUnion,
    KeybindInsertSetIntersection,
    KeybindInsertSetDifference,
    KeybindInsertSetFilter,
    KeybindInsertEvery,
    KeybindInsertAny,
    KeybindInsertMap,
    KeybindInsertFold,
    KeybindInsertHasASetItem,
    KeybindInsertUnwrap,
    KeybindInsertCompositeFromSet,
    KeybindInsertSet,
    KeybindInsertNewSet,
    KeybindInsertNewComposite,
    KeybindInsertAtomsWithProperty,
    KeybindInsertPropertiesOf,
    KeybindInsertIsComposite,
    KeybindInsertIsNode,
    KeybindInsertIsAtom,
    KeybindInsertIsConstruction,
    KeybindInsertConstruction,
    KeybindInsertNewConstruction,
    KeybindInsertConstructor,
    KeybindInsertConstructionValue,
    KeybindInsertFunction,
    KeybindInsertCall,
    KeybindInsertIf,
    KeybindInsertParameter,
    KeybindInsertSelf,
    KeybindInsertLiteral,
    KeybindInsertInteger,
    KeybindInsertAtom,
    KeybindInsertText,
    KeybindInsertCharacter,
    KeybindInsertByte,
} as const;

export type KeybindTranslationArguments = {
    [Keybinds]: undefined;
    [KeybindsHint]: undefined;
    [SearchKeybinds]: undefined;
    [NoKeybindsFound]: undefined;
    [KeybindsSelection]: undefined;
    [KeybindsEditing]: undefined;
    [KeybindsOperators]: undefined;
    [KeybindsSetOperations]: undefined;
    [KeybindsQueries]: undefined;
    [KeybindsConstructions]: undefined;
    [KeybindsFunctions]: undefined;
    [KeybindsValues]: undefined;
    [KeybindPreviousSibling]: undefined;
    [KeybindNextSibling]: undefined;
    [KeybindFirstChild]: undefined;
    [KeybindParent]: undefined;
    [KeybindAddOrEdit]: undefined;
    [KeybindDelete]: undefined;
    [KeybindDeleteRetainingChild]: undefined;
    [KeybindReplaceParent]: undefined;
    [KeybindQueryType]: undefined;
    [KeybindUndo]: undefined;
    [KeybindRedo]: undefined;
    [KeybindUseClipboardSlot]: undefined;
    [KeybindCopyToClipboard]: undefined;
    [KeybindInsertPlus]: undefined;
    [KeybindInsertTimes]: undefined;
    [KeybindInsertEquality]: undefined;
    [KeybindInsertLessThan]: undefined;
    [KeybindInsertAnd]: undefined;
    [KeybindInsertOr]: undefined;
    [KeybindInsertXor]: undefined;
    [KeybindInsertNot]: undefined;
    [KeybindInsertSetCount]: undefined;
    [KeybindInsertHasProperty]: undefined;
    [KeybindInsertContains]: undefined;
    [KeybindInsertSetUnion]: undefined;
    [KeybindInsertSetIntersection]: undefined;
    [KeybindInsertSetDifference]: undefined;
    [KeybindInsertSetFilter]: undefined;
    [KeybindInsertEvery]: undefined;
    [KeybindInsertAny]: undefined;
    [KeybindInsertMap]: undefined;
    [KeybindInsertFold]: undefined;
    [KeybindInsertHasASetItem]: undefined;
    [KeybindInsertUnwrap]: undefined;
    [KeybindInsertCompositeFromSet]: undefined;
    [KeybindInsertSet]: undefined;
    [KeybindInsertNewSet]: undefined;
    [KeybindInsertNewComposite]: undefined;
    [KeybindInsertAtomsWithProperty]: undefined;
    [KeybindInsertPropertiesOf]: undefined;
    [KeybindInsertIsComposite]: undefined;
    [KeybindInsertIsNode]: undefined;
    [KeybindInsertIsAtom]: undefined;
    [KeybindInsertIsConstruction]: undefined;
    [KeybindInsertConstruction]: undefined;
    [KeybindInsertNewConstruction]: undefined;
    [KeybindInsertConstructor]: undefined;
    [KeybindInsertConstructionValue]: undefined;
    [KeybindInsertFunction]: undefined;
    [KeybindInsertCall]: undefined;
    [KeybindInsertIf]: undefined;
    [KeybindInsertParameter]: undefined;
    [KeybindInsertSelf]: undefined;
    [KeybindInsertLiteral]: undefined;
    [KeybindInsertInteger]: undefined;
    [KeybindInsertAtom]: undefined;
    [KeybindInsertText]: undefined;
    [KeybindInsertCharacter]: undefined;
    [KeybindInsertByte]: undefined;
};
