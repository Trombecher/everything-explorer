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
    Show,
    Suspense,
} from "solid-js";
import {Index} from "solid-js";
import {onMount} from "solid-js";
import {onCleanup} from "solid-js";

import {useAppState} from "@/context";
import {defaultObject, objectsEqual, type EverythingObject} from "@/model";
import type {Atom} from "@/model/atoms";

import ObjectRootView from "../objects/ObjectRootView";
import {useAtomName} from "../objects/useAtomName";
import Button from "../reuse/Button";

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
     * The properties shown in the UI. This is kept separate from the resource
     * so that adding a property is reflected immediately and duplicate
     * properties are not collapsed.
     */
    const [properties, setProperties] = createSignal<
        readonly EverythingObject[]
    >([]);

    createEffect(() => {
        const loadedValues = values();

        if (loadedValues) setProperties(loadedValues);
    });

    const addProperty = () => {
        const current = clientAndAtom();
        if (!current) return;

        const {connectionClient, selectedAtom} = current;

        // A fresh object so a failed request can be rolled back unambiguously
        // (all added properties would otherwise share `defaultObject`).
        const optimisticObject: EverythingObject = {...defaultObject};

        setProperties(previous => [...previous, optimisticObject]);

        void connectionClient
            .addStatement({atom: selectedAtom, object: defaultObject})
            .catch(error => {
                console.error("failed to add property", error);

                setProperties(previous =>
                    previous.filter(object => object !== optimisticObject),
                );
            });
    };

    const changeProperty = (
        index: number,
        oldObject: EverythingObject,
        newObject: EverythingObject | undefined,
    ) => {
        const current = clientAndAtom();
        if (!current) return;

        const {connectionClient, selectedAtom} = current;

        const propertiesBeforeChange = properties();

        setProperties(previous => {
            if (newObject === undefined) {
                return previous.filter((_, i) => i !== index);
            }

            return previous.map((object, i) =>
                i === index ? newObject : object,
            );
        });

        if (newObject !== undefined && objectsEqual(oldObject, newObject)) {
            return;
        }

        void (async () => {
            try {
                // Add first so a failed add does not lose the existing
                // statement.
                if (newObject !== undefined) {
                    await connectionClient.addStatement({
                        atom: selectedAtom,
                        object: newObject,
                    });
                }

                await connectionClient.removeStatement({
                    atom: selectedAtom,
                    object: oldObject,
                });
            } catch (error) {
                console.error("failed to update property", error);

                // Roll the optimistic update back. The server state is
                // unchanged or only partially changed.
                setProperties(propertiesBeforeChange);
            }
        })();
    };

    const removeProperty = (index: number) => {
        const oldObject = properties()[index];
        if (!oldObject) return;

        changeProperty(index, oldObject, undefined);
    };

    const [budget, setBudget] = createSignal(Number.POSITIVE_INFINITY);

    return (
        <div class="relative flex w-full flex-col gap-2 rounded-4xl border border-neutral-200 bg-white p-2">
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

            <div
                ref={div => {
                    onMount(() => {
                        const updateBudget = () => {
                            const width =
                                div.getBoundingClientRect().width ?? 0;

                            if (width > 0) setBudget(width);
                        };

                        updateBudget();

                        const resizeObserver = new ResizeObserver(updateBudget);
                        resizeObserver.observe(div);

                        onCleanup(() => resizeObserver.disconnect());
                    });
                }}
            >
                <Show when={values()} fallback={<>loading properties...</>}>
                    <Index each={properties()}>
                        {(object, index) => (
                            <div class="flex items-center gap-2">
                                <div class="min-w-0 flex-1">
                                    <ObjectRootView
                                        widthBudgetInPixels={
                                            budget() - REMOVE_BUTTON_SPACE
                                        }
                                        object={object()}
                                        setObject={newObject => {
                                            changeProperty(
                                                index,
                                                object(),
                                                newObject,
                                            );
                                        }}
                                    />
                                </div>
                                <KobalteButton
                                    class="shrink-0 rounded-2xl p-2 text-neutral-500 hover:bg-neutral-100 hover:text-red-500"
                                    title="Remove property"
                                    aria-label="Remove property"
                                    onClick={() => removeProperty(index)}
                                >
                                    <XIcon />
                                </KobalteButton>
                            </div>
                        )}
                    </Index>
                </Show>
            </div>
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
