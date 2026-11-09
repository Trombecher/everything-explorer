import {Button as KobalteButton} from "@kobalte/core/button";
import LayoutGridIcon from "lucide-solid/icons/layout-grid";
import PlusIcon from "lucide-solid/icons/plus";
import SearchIcon from "lucide-solid/icons/search";
import TablePropertiesIcon from "lucide-solid/icons/table-properties";
import XIcon from "lucide-solid/icons/x";
import type {Setter} from "solid-js";
import {
    createEffect,
    createResource,
    createSignal,
    For,
    Index,
    on,
    Show,
    Suspense,
} from "solid-js";

import {useAppState} from "@/context";
import {defaultObject, type EverythingObject} from "@/model";
import type {Atom} from "@/model/atoms";

import {handleHistoryKeyDown, ObjectHistory} from "../objects/history";
import {LayoutMode} from "../objects/layout";
import ObjectView from "../objects/ObjectView";
import {ObjectSelectionContext} from "../objects/selection";
import {useAtomName} from "../objects/useAtomName";
import Button from "../reuse/Button";
import WidthMeasurer from "../reuse/WidthMeasurer";

export default () => {
    const appState = useAppState();

    const [atoms] = createResource(
        () => appState.connectionClient(),
        client => client.knownAtoms(100),
    );

    const [selectedAtom, setSelectedAtom] = createSignal<undefined | Atom>();

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
                    <Button class="flex gap-2">
                        <PlusIcon />
                        Add
                    </Button>
                </div>

                <div class="mt-4 flex flex-wrap gap-2">
                    <Suspense fallback={"loading..."}>
                        <For each={atoms()}>
                            {atom => (
                                <AtomCard
                                    atom={atom}
                                    selectedAtom={selectedAtom()}
                                    setSelectedAtom={setSelectedAtom}
                                />
                            )}
                        </For>
                    </Suspense>
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

/**
 * Horizontal space taken by the per-property remove button and the gap before
 * it, in px.
 */
const REMOVE_BUTTON_SPACE = 48;

const PropertiesPanel = (props: {selectedAtom: Atom; close: () => void}) => {
    const appState = useAppState();
    const name = useAtomName(() => props.selectedAtom);

    const clientAndAtom = () => {
        const connectionClient = appState.connectionClient();

        return (
            connectionClient && {
                connectionClient,
                selectedAtom: props.selectedAtom,
            }
        );
    };

    const [values] = createResource(
        clientAndAtom,
        ({connectionClient, selectedAtom}) =>
            connectionClient.valuesOfObject(selectedAtom),
    );

    /**
     * All properties share one selection and one edit history.
     *
     * Selection paths start with the property index, so at most one property
     * can be selected at a time.
     */
    const history = new ObjectHistory([]);

    /**
     * The object list that is known to match the server. Used to derive the
     * statements that must be added or removed after every edit.
     */
    let syncedObjects = history.objects();

    /**
     * The latest object list that still has to be sent to the server, or
     * `undefined` if the server is up to date.
     *
     * Only the latest list is kept: if the user edits again while a sync is
     * running, the older intermediate state is skipped. Syncing the latest
     * state is enough because the diff is always computed against
     * `syncedObjects`.
     */
    let pendingSync: readonly EverythingObject[] | undefined;
    let syncInProgress = false;

    /**
     * Reconciles the server with `pendingSync`.
     *
     * All requests are serialized through this single async loop. Running them
     * concurrently would interleave add and remove requests, which can leave
     * the server with the wrong statements after rapid edit/undo/redo.
     */
    const syncProperties = () => {
        if (syncInProgress) return;

        const current = clientAndAtom();
        if (!current) {
            pendingSync = undefined;
            return;
        }

        const {connectionClient, selectedAtom} = current;
        syncInProgress = true;

        void (async () => {
            try {
                while (pendingSync) {
                    const target = pendingSync;
                    pendingSync = undefined;

                    if (target === syncedObjects) continue;

                    const previous = syncedObjects;

                    // Add first so a failed add does not lose existing
                    // statements.
                    for (const object of target) {
                        if (!previous.includes(object)) {
                            await connectionClient.addStatement({
                                atom: selectedAtom,
                                object,
                            });
                        }
                    }

                    for (const object of previous) {
                        if (!target.includes(object)) {
                            await connectionClient.removeStatement({
                                atom: selectedAtom,
                                object,
                            });
                        }
                    }

                    syncedObjects = target;
                }
            } catch (error) {
                console.error("failed to update properties", error);
            } finally {
                syncInProgress = false;

                // An edit that arrived while the failed sync was running is
                // still pending. Try to sync it instead of dropping it.
                if (
                    pendingSync !== undefined
                    && pendingSync !== syncedObjects
                ) {
                    syncProperties();
                }
            }
        })();
    };

    createEffect(() => {
        const loadedValues = values();

        if (!loadedValues) return;

        syncedObjects = loadedValues;
        history.reset(loadedValues);
    });

    createEffect(
        on(history.objects, objects => {
            pendingSync = objects;
            syncProperties();
        }),
    );

    const addProperty = () => {
        if (!clientAndAtom()) return;

        // A fresh object so it is not confused with any other property.
        history.pushObjects([...history.objects(), {...defaultObject}]);
    };

    const removeProperty = (index: number) => {
        history.pushObjects(history.objects().filter((_, i) => i !== index));
    };

    return (
        <div
            class="relative flex w-full flex-col gap-2 rounded-4xl border border-neutral-200 bg-white p-2"
            tabIndex={0}
            onKeyDown={event => {
                handleHistoryKeyDown(event, history);

                // Up/down navigation from the panel itself (e.g. right after
                // opening it) selects the first/last property. Navigation
                // between selected properties is handled by the object views.
                if (
                    event.target !== event.currentTarget
                    || event.ctrlKey
                    || event.metaKey
                    || event.altKey
                )
                    return;

                const propertyCount = history.objects().length;
                if (propertyCount === 0) return;

                if (event.key === "ArrowDown") {
                    event.preventDefault();
                    history.objectSelection.setPath([0]);
                } else if (event.key === "ArrowUp") {
                    event.preventDefault();
                    history.objectSelection.setPath([propertyCount - 1]);
                }
            }}
        >
            <div class="flex items-center gap-2 p-2">
                <TablePropertiesIcon />
                <h2 class="text-xl font-semibold text-black">
                    Properties of {name() ?? String(props.selectedAtom.value)}
                </h2>
            </div>
            <KobalteButton
                class="absolute top-2 right-2 rounded-2xl p-2 hover:bg-neutral-100"
                onClick={() => {
                    props.close();
                }}
            >
                <XIcon />
            </KobalteButton>

            <div class="px-2">
                <Button
                    class="flex w-fit gap-2"
                    disabled={values() === undefined}
                    onClick={addProperty}
                >
                    <PlusIcon />
                    Add property
                </Button>
            </div>

            <WidthMeasurer>
                {widthBudgetInPixels => (
                    <ObjectSelectionContext.Provider
                        value={history.objectSelection}
                    >
                        <Show
                            when={values()}
                            fallback={<>loading properties...</>}
                        >
                            <Index each={history.objects()}>
                                {(object, index) => (
                                    <div class="flex items-center gap-2">
                                        <div class="min-w-0 flex-1">
                                            <ObjectView
                                                indentLeft={false}
                                                widthBudgetInPixels={Math.max(
                                                    widthBudgetInPixels
                                                        - REMOVE_BUTTON_SPACE,
                                                    0,
                                                )}
                                                object={object()}
                                                path={[index]}
                                                siblingCount={
                                                    history.objects().length
                                                }
                                                replaceParentWithThis={
                                                    undefined
                                                }
                                                setObject={newObject => {
                                                    if (
                                                        newObject === undefined
                                                    ) {
                                                        removeProperty(index);
                                                        return;
                                                    }

                                                    history.pushObject(
                                                        index,
                                                        newObject,
                                                    );
                                                }}
                                                parentObjectLayoutMode={
                                                    LayoutMode.Column
                                                }
                                            />
                                        </div>
                                        <KobalteButton
                                            class="shrink-0 rounded-2xl p-2 text-neutral-500 hover:bg-neutral-100 hover:text-red-500"
                                            title="Remove property"
                                            aria-label="Remove property"
                                            onClick={() =>
                                                removeProperty(index)
                                            }
                                        >
                                            <XIcon />
                                        </KobalteButton>
                                    </div>
                                )}
                            </Index>
                        </Show>
                    </ObjectSelectionContext.Provider>
                )}
            </WidthMeasurer>
        </div>
    );
};

const AtomCard = (props: {
    atom: Atom;
    selectedAtom: Atom | undefined;
    setSelectedAtom: Setter<Atom | undefined>;
}) => {
    const name = useAtomName(() => props.atom);

    return (
        <KobalteButton
            onClick={() => {
                // Toggle
                if (props.selectedAtom !== props.atom) {
                    props.setSelectedAtom(props.atom);
                } else {
                    props.setSelectedAtom(undefined);
                }
            }}
            class={`flex h-48 w-48 flex-col overflow-hidden rounded-4xl border p-4 text-left ${props.selectedAtom === props.atom ? "border-blue-500 bg-blue-400/20" : "border-neutral-200 bg-neutral-100 hover:bg-neutral-200"}`}
        >
            <span class="block text-center text-lg font-medium">
                {name() ?? String(props.atom.value)}
            </span>
        </KobalteButton>
    );
};
