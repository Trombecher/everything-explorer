import LayoutGridIcon from "lucide-solid/icons/layout-grid";
import SearchIcon from "lucide-solid/icons/search";
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
import {ObjectType} from "@/model";
import {generateAtomId, MAX_ATOM_ID, type Atom} from "@/model/atoms";
import ResizeSeparator from "@/ui/reuse/ResizeSeparator";

import AtomCard from "./AtomCard";
import PropertiesPanel from "./PropertiesPanel";

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

    const [selectedAtom, setSelectedAtom] = createSignal<undefined | Atom>();
    const [searchValue, setSearchValue] = createSignal("");

    const parseAtomId = (input: string): Atom | undefined => {
        const trimmed = input.trim();

        if (!DECIMAL_INTEGER_PATTERN.test(trimmed)) return undefined;

        const value = BigInt(trimmed);
        if (value > MAX_ATOM_ID) return undefined;

        return {type: ObjectType.Atom, value};
    };

    const searchForAtom = (input: string) => {
        const atom = parseAtomId(input);
        if (!atom) {
            setSelectedAtom(undefined);
            return;
        }

        setSelectedAtom(atom);
    };

    const generateAndSearchNewAtom = () => {
        const newId = generateAtomId().toString();
        setSearchValue(newId);
        searchForAtom(newId);
    };

    return (
        <div
            class="flex grow gap-2 py-2"
            ref={el => {
                container = el;
            }}
        >
            <div class="min-w-0 grow rounded-4xl border border-neutral-200 bg-white p-2">
                <div class="flex items-center gap-2 px-2 text-black">
                    <LayoutGridIcon />
                    <h2 class="text-xl font-semibold">Things</h2>
                    <label class="mx-2 flex grow items-center rounded-2xl border border-neutral-200 bg-neutral-100 pl-2 focus-within:outline-2">
                        <SearchIcon />
                        <input
                            type="search"
                            placeholder="Search by atom ID..."
                            value={searchValue()}
                            onInput={e => {
                                setSearchValue(e.currentTarget.value);
                                searchForAtom(e.currentTarget.value);
                            }}
                            class="block min-w-0 grow py-2 pr-3 pl-2 outline-none"
                        />
                    </label>
                    <button
                        onClick={generateAndSearchNewAtom}
                        disabled={appState.connectionClient() === undefined}
                        class="flex cursor-pointer items-center gap-2 rounded-2xl bg-blue-500 px-3 py-1 font-medium text-white hover:bg-blue-600 active:scale-97 active:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-black"
                    >
                        + Add thing
                    </button>
                </div>

                <div class="mt-4 flex flex-wrap gap-2">
                    <Show when={!atoms.loading} fallback={"loading..."}>
                        <For each={displayedAtoms()}>
                            {atom => (
                                <AtomCard
                                    atom={atom}
                                    isNew={isNew(atom)}
                                    selectedAtom={selectedAtom()}
                                    setSelectedAtom={setSelectedAtom}
                                />
                            )}
                        </For>
                    </Show>
                </div>
            </div>
            <Show when={selectedAtom()} keyed>
                {selectedAtom => (
                    <>
                        <ResizeSeparator
                            label="Resize properties panel"
                            width={appState.propertiesPanelWidth}
                            setWidth={appState.setPropertiesPanelWidth}
                            minWidth={MIN_PROPERTIES_PANEL_WIDTH}
                            maxWidth={maximumPropertiesPanelWidth}
                            resizedSide="end"
                        />
                        <div
                            class="shrink-0"
                            style={{
                                width: `${appState.propertiesPanelWidth()}px`,
                            }}
                        >
                            <PropertiesPanel
                                selectedAtom={selectedAtom}
                                close={() => setSelectedAtom(undefined)}
                            />
                        </div>
                    </>
                )}
            </Show>
        </div>
    );
};
