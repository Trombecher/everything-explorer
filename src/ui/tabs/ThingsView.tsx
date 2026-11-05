import {Button as KobalteButton} from "@kobalte/core/button";
import LayoutGridIcon from "lucide-solid/icons/layout-grid";
import PlusIcon from "lucide-solid/icons/plus";
import type {Setter} from "solid-js";
import {createResource, createSignal, For, Show, Suspense} from "solid-js";

import {useAppState} from "@/context";
import type {Atom} from "@/model/atoms";

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
        <>
            <div class="my-2 flex grow flex-col gap-2 rounded-4xl border border-neutral-200 bg-white p-2">
                <div class="flex items-center gap-2 px-2 text-black">
                    <LayoutGridIcon />
                    <h2 class="text-xl font-semibold">Things</h2>
                    <Button class="ml-4 flex gap-2">
                        <PlusIcon />
                        Add
                    </Button>
                </div>
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
            <Show when={selectedAtom() !== undefined}>
                <div class="my-2 ml-2 flex grow flex-col gap-2 rounded-4xl border border-neutral-200 bg-white p-2">
                    selected
                </div>
            </Show>
        </>
    );
};

const AtomCard = (props: {
    atom: Atom;
    selectedAtom: Atom | undefined;
    setSelectedAtom: Setter<Atom | undefined>;
}) => {
    const appState = useAppState();
    const [values] = createResource(
        () => appState.connectionClient(),
        client => client.valuesOfObject(props.atom),
    );

    return (
        <KobalteButton
            onPointerDown={() => {
                // Toggle
                if (props.selectedAtom === undefined) {
                    props.setSelectedAtom(props.atom);
                } else {
                    props.setSelectedAtom(undefined);
                }
            }}
            class={`block h-48 w-48 overflow-hidden rounded-4xl border p-4 text-left ${props.selectedAtom === props.atom ? "border-blue-500 bg-blue-400/20" : "border-neutral-200 bg-neutral-100 hover:bg-neutral-200"}`}
        >
            <div class="mb-2">@{String(props.atom.value)}</div>

            <Suspense fallback={<>loading props</>}>
                <For each={values()}>
                    {value => <ObjectRootView budget={128} object={value} />}
                </For>
            </Suspense>
        </KobalteButton>
    );
};
