import LayoutGridIcon from "lucide-solid/icons/layout-grid";
import SearchIcon from "lucide-solid/icons/search";
import {
    createEffect,
    createMemo,
    createResource,
    createSignal,
    For,
    on,
    Show,
} from "solid-js";

import {useAppState} from "@/context";
import type {Atom} from "@/model/atoms";

import AddThingDialog from "./AddThingDialog";
import AtomCard from "./AtomCard";
import PropertiesPanel from "./PropertiesPanel";

export default () => {
    const appState = useAppState();

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

    const addThing = (atom: Atom) => {
        const existing = displayedAtoms().find(
            candidate => candidate.value === atom.value,
        );

        if (existing) {
            setSelectedAtom(existing);
            return;
        }

        setAddedAtoms(previous => [...previous, atom]);
        setSelectedAtom(atom);
    };

    return (
        <div class="flex grow gap-2 py-2">
            <div class="w-full rounded-4xl border border-neutral-200 bg-white p-2">
                <div class="flex items-center gap-2 px-2 text-black">
                    <LayoutGridIcon />
                    <h2 class="text-xl font-semibold">Things</h2>
                    <label class="mx-2 flex grow items-center rounded-2xl border border-neutral-200 bg-neutral-100 pl-2 focus-within:outline-2">
                        <SearchIcon />
                        <input
                            type="search"
                            placeholder="Search for something..."
                            class="block min-w-0 grow py-2 pr-3 pl-2 outline-none"
                        />
                    </label>
                    <AddThingDialog
                        disabled={appState.connectionClient() === undefined}
                        onAdd={addThing}
                    />
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
                    <PropertiesPanel
                        selectedAtom={selectedAtom}
                        close={() => setSelectedAtom(undefined)}
                    />
                )}
            </Show>
        </div>
    );
};
