import {createResource, For, Suspense} from "solid-js";

import {useAppState} from "@/context";

export default () => {
    const appState = useAppState();

    const [atoms] = createResource(
        () => appState.connectionClient(),
        client => client.knownAtoms(100),
    );

    return (
        <div class="mx-auto my-2 max-w-2xl grow rounded-3xl border border-neutral-200 bg-white p-4">
            <Suspense fallback={"loading..."}>
                <For each={atoms()}>
                    {atom => <div>{String(atom.value)}</div>}
                </For>
            </Suspense>
        </div>
    );
};
