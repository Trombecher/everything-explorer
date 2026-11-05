import LayoutGridIcon from "lucide-solid/icons/layout-grid";
import PlusIcon from "lucide-solid/icons/plus";
import {createResource, For, Suspense} from "solid-js";

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

    return (
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
                <For each={atoms()}>{atom => <AtomCard atom={atom} />}</For>
            </Suspense>
        </div>
    );
};

const AtomCard = (props: {atom: Atom}) => {
    const appState = useAppState();
    const [values] = createResource(
        () => appState.connectionClient(),
        client => client.valuesOfObject(props.atom),
    );

    return (
        <div class="h-48 w-48 overflow-hidden rounded-4xl border border-neutral-200 bg-neutral-100 p-4">
            <div class="mb-2">@{String(props.atom.value)}</div>

            <Suspense fallback={<>loading props</>}>
                <For each={values()}>
                    {value => <ObjectRootView budget={128} object={value} />}
                </For>
            </Suspense>
        </div>
    );
};
