import {Index, Show} from "solid-js";

import {useAppState} from "@/context";
import {Phrase} from "@/i18n/phrases";

import AddConnectionButton from "./AddConnectionButton";
import ConnectionCard from "./ConnectionCard";

export default () => {
    const appState = useAppState();

    return (
        <div class="mx-auto my-2 max-w-3xl grow rounded-4xl border border-neutral-200 bg-white p-4 dark:bg-neutral-100">
            <h2 class="mb-4 text-2xl font-semibold tracking-tight text-black">
                {appState.translate(Phrase.Connections, undefined)}
            </h2>

            <div class="mb-4 flex">
                <AddConnectionButton />
            </div>

            <Show
                when={appState.state.connections.length > 0}
                fallback={
                    <div class="rounded-3xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
                        {appState.translate(Phrase.NoConnectionsYet, undefined)}
                    </div>
                }
            >
                <div class="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-3">
                    <Index each={appState.state.connections}>
                        {(connection, connectionIndex) => (
                            <ConnectionCard
                                connection={connection()}
                                connectionIndex={connectionIndex}
                            />
                        )}
                    </Index>
                </div>
            </Show>
        </div>
    );
};
