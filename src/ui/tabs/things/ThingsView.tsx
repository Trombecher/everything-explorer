import LayoutGridIcon from "lucide-solid/icons/layout-grid";
import PlusIcon from "lucide-solid/icons/plus";
import SearchIcon from "lucide-solid/icons/search";
import XIcon from "lucide-solid/icons/x";
import {
    createEffect,
    createMemo,
    createResource,
    createSignal,
    For,
    on,
    onCleanup,
    onMount,
    Show,
} from "solid-js";

import {useAppState} from "@/context";
import {Phrase} from "@/i18n/phrases";
import {ObjectType} from "@/model";
import {generateAtomId, MAX_ATOM_ID, type Atom} from "@/model/atoms";
import Button from "@/ui/reuse/Button";
import ResizeSeparator from "@/ui/reuse/ResizeSeparator";

import AtomCard from "./AtomCard";
import PropertiesPanel from "./properties/PropertiesPanel";

const MIN_PROPERTIES_PANEL_WIDTH = 240;

/**
 * The atom list is never squeezed below this width when resizing the properties
 * panel.
 */
const MIN_ATOM_LIST_WIDTH = 280;

const DECIMAL_INTEGER_PATTERN = /^\d+$/;

export default () => {
    const appState = useAppState();

    let container: HTMLDivElement | undefined;

    const maximumPropertiesPanelWidth = () =>
        Math.max(
            MIN_PROPERTIES_PANEL_WIDTH,
            (container?.getBoundingClientRect().width ?? 0)
                - MIN_ATOM_LIST_WIDTH,
        );

    const clampPropertiesPanelWidth = (width: number) =>
        Math.min(
            Math.max(width, MIN_PROPERTIES_PANEL_WIDTH),
            maximumPropertiesPanelWidth(),
        );

    onMount(() => {
        if (!container) return;

        const observer = new ResizeObserver(() => {
            appState.setPropertiesPanelWidth(clampPropertiesPanelWidth);
        });

        observer.observe(container);

        onCleanup(() => observer.disconnect());
    });

    const [atoms] = createResource(
        () => appState.connectionClient(),
        client => client.knownAtoms(100),
    );

    /**
     * Atoms that were added in this view. Until they have at least one
     * statement they are not returned by the server and are lost on reload.
     */
    const [addedAtoms, setAddedAtoms] = createSignal<readonly Atom[]>([]);

    const displayedAtoms = createMemo(() => {
        const loaded = atoms.latest ?? [];
        const added = addedAtoms();

        if (added.length === 0) return loaded;

        const displayed = [...loaded];
        for (const atom of added) {
            if (!displayed.some(existing => existing.value === atom.value)) {
                displayed.push(atom);
            }
        }

        return displayed.sort((left, right) =>
            left.value < right.value ? -1 : left.value > right.value ? 1 : 0,
        );
    });

    const isNew = (atom: Atom) =>
        addedAtoms().some(added => added.value === atom.value)
        && !(atoms.latest ?? []).some(
            existing => existing.value === atom.value,
        );

    // Locally added atoms belong to the current knowledge base, so drop them
    // when the knowledge base changes.
    createEffect(
        on(
            () => appState.connectionClient(),
            () => setAddedAtoms([]),
            {defer: true},
        ),
    );

    const parseAtomId = (input: string): Atom | undefined => {
        const trimmed = input.trim();

        if (!DECIMAL_INTEGER_PATTERN.test(trimmed)) return undefined;

        const value = BigInt(trimmed);
        if (value > MAX_ATOM_ID) return undefined;

        return {type: ObjectType.Atom, value};
    };

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

    const searchToggleLabel = () =>
        appState.translate(
            isSearchExpanded() ? Phrase.CloseSearch : Phrase.SearchThings,
            undefined,
        );

    const generateAndSearchNewAtom = () => {
        setSearchValue(generateAtomId().toString());
    };

    return (
        <div
            class="flex grow gap-2 py-2"
            ref={el => {
                container = el;
            }}
        >
            <div class="min-w-0 grow rounded-4xl border border-neutral-200 bg-white p-2 dark:bg-neutral-100">
                <div class="@container">
                    <div class="flex flex-wrap items-center gap-2 px-2 text-black">
                        <LayoutGridIcon class="shrink-0" />
                        <h2 class="shrink-0 text-xl font-semibold">
                            {appState.translate(Phrase.Things, undefined)}
                        </h2>
                        <label class="mx-2 flex grow items-center rounded-2xl border border-neutral-200 bg-neutral-100 pl-2 focus-within:outline-2 @max-md:hidden dark:bg-white">
                            <SearchIcon />
                            <input
                                type="search"
                                placeholder={appState.translate(
                                    Phrase.SearchByAtomId,
                                    undefined,
                                )}
                                value={searchValue()}
                                onInput={e => {
                                    setSearchValue(e.currentTarget.value);
                                }}
                                class="block w-0 grow py-2 pr-3 pl-2 outline-none"
                            />
                        </label>
                        <button
                            onClick={() =>
                                setIsSearchExpanded(expanded => !expanded)
                            }
                            aria-label={searchToggleLabel()}
                            title={searchToggleLabel()}
                            class="ml-auto flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-2xl text-neutral-600 hover:bg-neutral-100 @min-md:hidden"
                        >
                            <Show
                                when={isSearchExpanded()}
                                fallback={<SearchIcon />}
                            >
                                <XIcon />
                            </Show>
                        </button>
                        <Button
                            onClick={generateAndSearchNewAtom}
                            disabled={appState.connectionClient() === undefined}
                            aria-label={appState.translate(
                                Phrase.AddThing,
                                undefined,
                            )}
                            class="flex gap-1"
                        >
                            <PlusIcon />
                            <span class="pr-1 @max-xs:hidden">
                                {appState.translate(Phrase.AddThing, undefined)}
                            </span>
                        </Button>
                    </div>
                    <Show when={isSearchExpanded()}>
                        <label class="mt-2 flex w-full items-center rounded-2xl border border-neutral-200 bg-neutral-100 pl-2 focus-within:outline-2 @min-md:hidden dark:bg-white">
                            <SearchIcon />
                            <input
                                type="search"
                                placeholder={appState.translate(
                                    Phrase.SearchByAtomId,
                                    undefined,
                                )}
                                value={searchValue()}
                                ref={el => queueMicrotask(() => el.focus())}
                                onInput={e => {
                                    setSearchValue(e.currentTarget.value);
                                }}
                                onKeyDown={e => {
                                    if (e.key === "Escape") {
                                        setIsSearchExpanded(false);
                                    }
                                }}
                                class="block min-w-0 grow py-2 pr-3 pl-2 outline-none"
                            />
                        </label>
                    </Show>
                </div>

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
