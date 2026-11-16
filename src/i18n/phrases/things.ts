const Things = Symbol();
const CopyId = Symbol();
const SearchByAtomId = Symbol();
const SearchThings = Symbol();
const CloseSearch = Symbol();
const AddThing = Symbol();
const LoadingProperties = Symbol();
const ResizePropertiesPanel = Symbol();
const PropertiesOf = Symbol();
const AddProperty = Symbol();
const RemoveProperty = Symbol();
const New = Symbol();

export const thingsPhrases = {
    Things,
    CopyId,
    SearchByAtomId,
    SearchThings,
    CloseSearch,
    AddThing,
    LoadingProperties,
    ResizePropertiesPanel,
    PropertiesOf,
    AddProperty,
    RemoveProperty,
    New,
} as const;

export type ThingsTranslationArguments = {
    [Things]: undefined;
    [CopyId]: undefined;
    [SearchByAtomId]: undefined;
    [SearchThings]: undefined;
    [CloseSearch]: undefined;
    [AddThing]: undefined;
    [LoadingProperties]: undefined;
    [ResizePropertiesPanel]: undefined;
    [PropertiesOf]: {forName: string};
    [AddProperty]: undefined;
    [RemoveProperty]: undefined;
    [New]: undefined;
};
