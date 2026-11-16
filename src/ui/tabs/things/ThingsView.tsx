import {createMemo, createSignal, For, Show} from "solid-js";

import {useAppState} from "@/context";
import {Phrase} from "@/i18n/phrases";
import {generateAtomId, type Atom} from "@/model/atoms";
import ResizeSeparator from "@/ui/reuse/ResizeSeparator";

import AtomCard from "./AtomCard";
import {parseAtomId} from "./atomSearch";
import PropertiesPanel from "./properties/PropertiesPanel";
import {
    MIN_PROPERTIES_PANEL_WIDTH,
    usePropertiesPanelResize,
} from "./propertiesPanelResize";
import ThingsToolbar from "./ThingsToolbar";
import {useAtomList} from "./useAtomList";

export default () => {
    const appState = useAppState();

    const {setContainer, maximumPropertiesPanelWidth} =
        usePropertiesPanelResize();
    const {atoms, displayedAtoms, isNew} = useAtomList();

    /**
     * The search field is the single source of truth for the selected atom: an
     * id in the field selects that atom, anything else selects nothing. This
     * keeps typing an id and clicking an atom in sync.
     */
    const [searchValue, setSearchValue] = createSignal("");

    const selectedAtom = createMemo<Atom | undefined>(previous => {
        const atom = parseAtomId(searchValue());

        // Keep the object identity stable while the parsed id does not change,
        // e.g. when the search text only gains leading zeros or whitespace.
        if (previous && atom && previous.value === atom.value) return previous;

        return atom;
    });

    const selectAtom = (atom: Atom | undefined) =>
        setSearchValue(atom ? atom.value.toString() : "");

    /**
     * On narrow containers the search field is collapsed into a button and only
     * shown in an extra row once expanded.
     */
    const [isSearchExpanded, setIsSearchExpanded] = createSignal(false);

    const generateAndSearchNewAtom = () => {
        setSearchValue(generateAtomId().toString());
    };

    return (
        <div class="flex grow gap-2 py-2" ref={el => setContainer(el)}>
            <div class="min-w-0 grow rounded-4xl border border-neutral-200 bg-white p-2 dark:bg-neutral-100">
                <ThingsToolbar
                    searchValue={searchValue()}
                    onSearchValueChange={setSearchValue}
                    isSearchExpanded={isSearchExpanded()}
                    onSearchExpandedChange={setIsSearchExpanded}
                    onAddThing={generateAndSearchNewAtom}
                    addThingDisabled={appState.connectionClient() === undefined}
                />

                <div class="mt-4 flex flex-wrap gap-2">
                    <Show
                        when={!atoms.loading}
                        fallback={appState.translate(Phrase.Loading, undefined)}
                    >
                        <For each={displayedAtoms()}>
                            {atom => (
                                <AtomCard
                                    atom={atom}
                                    isNew={isNew(atom)}
                                    selectedAtom={selectedAtom()}
                                    setSelectedAtom={selectAtom}
                                />
                            )}
                        </For>
                    </Show>
                </div>
            </div>
            <Show when={selectedAtom()} keyed>
                {selectedAtom => (
                    <>
                        {/*
                         * Negative margin makes the separator occupy the
                         * `gap-2` between the panels instead of adding to it.
                         */}
                        <ResizeSeparator
                            label={appState.translate(
                                Phrase.ResizePropertiesPanel,
                                undefined,
                            )}
                            width={appState.propertiesPanelWidth}
                            setWidth={appState.setPropertiesPanelWidth}
                            minWidth={MIN_PROPERTIES_PANEL_WIDTH}
                            maxWidth={maximumPropertiesPanelWidth}
                            resizedSide="end"
                            class="-mx-2"
                        />
                        <div
                            class="shrink-0 self-stretch"
                            style={{
                                width: `${appState.propertiesPanelWidth()}px`,
                            }}
                        >
                            <PropertiesPanel
                                selectedAtom={selectedAtom}
                                close={() => selectAtom(undefined)}
                            />
                        </div>
                    </>
                )}
            </Show>
        </div>
    );
};
