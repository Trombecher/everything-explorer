import {Button as KobalteButton} from "@kobalte/core/button";
import LayoutGridIcon from "lucide-solid/icons/layout-grid";
import PlusIcon from "lucide-solid/icons/plus";
import SearchIcon from "lucide-solid/icons/search";
import TablePropertiesIcon from "lucide-solid/icons/table-properties";
import XIcon from "lucide-solid/icons/x";
import type {Setter} from "solid-js";
import {createResource, createSignal, For, Show, Suspense} from "solid-js";
import {Index} from "solid-js";
import {onMount} from "solid-js";
import {onCleanup} from "solid-js";

import {useAppState} from "@/context";
import {Object, ObjectType} from "@/model";
import {Atom} from "@/model/atoms";

import ObjectRootView from "../objects/ObjectRootView";
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
            <Show when={selectedAtom()}>
                {selectedAtom => (
                    <PropertiesPanel
                        selectedAtom={selectedAtom()}
                        close={() => setSelectedAtom(undefined)}
                    />
                )}
            </Show>
        </div>
    );
};

const PropertiesPanel = (props: {selectedAtom: Atom; close: () => void}) => {
    const clientAndAtom = () => {
        const connectionClient = appState.connectionClient();

        return (
            connectionClient && {
                connectionClient,
                selectedAtom: props.selectedAtom,
            }
        );
    };

    const appState = useAppState();
    const [names] = createResource(
        clientAndAtom,
        ({connectionClient, selectedAtom}) =>
            connectionClient.constructionValuesOfObject(
                selectedAtom,
                Atom.Name,
            ),
    );

    const [values] = createResource(
        clientAndAtom,
        ({connectionClient, selectedAtom}) =>
            connectionClient.valuesOfObject(selectedAtom),
    );

    const [budget, setBudget] = createSignal(Number.POSITIVE_INFINITY);

    return (
        <div class="relative flex w-full flex-col gap-2 rounded-4xl border border-neutral-200 bg-white p-2">
            <div class="flex items-center gap-2 p-2">
                <TablePropertiesIcon />
                <h2 class="text-xl font-semibold text-black">
                    Properties of {formatNames(names() ?? [])}
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
                <Suspense fallback={<>loading properties...</>}>
                    <Index each={values()}>
                        {object => (
                            <ObjectRootView
                                budget={budget()}
                                object={object()}
                            />
                        )}
                    </Index>
                </Suspense>
            </div>
        </div>
    );
};

const formatNames = (names: readonly Object[]): string =>
    names
        .map(object => {
            if (object.type === ObjectType.Text) return object.text;
            return "<object>";
        })
        .join(", ");

const AtomCard = (props: {
    atom: Atom;
    selectedAtom: Atom | undefined;
    setSelectedAtom: Setter<Atom | undefined>;
}) => {
    const appState = useAppState();
    const [names] = createResource(
        () => {
            const connectionClient = appState.connectionClient();
            return connectionClient && {connectionClient, atom: props.atom};
        },
        ({connectionClient, atom}) =>
            connectionClient.constructionValuesOfObject(atom, Atom.Name),
    );

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
                <Suspense fallback={<>loading...</>}>
                    {formatNames(names() ?? [])}
                </Suspense>
            </span>
        </KobalteButton>
    );
};
