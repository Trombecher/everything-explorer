import {Index, Show} from "solid-js";

import {useAppState} from "@/context";
import {Phrase} from "@/i18n/phrases";

import AddConnectionButton from "./AddConnectionButton";
import ConnectionCard from "./ConnectionCard";

export default () => {
    const appState = useAppState();

    return (
        <div class="mx-auto my-2 max-w-3xl grow rounded-4xl border border-line-subtle bg-surface-panel p-4">
            <h2 class="mb-4 text-2xl font-semibold tracking-tight text-fg-strong">
                {appState.translate(Phrase.Connections, undefined)}
            </h2>

            <div class="mb-4 flex">
                <AddConnectionButton />
            </div>

            <Show
                when={appState.state.connections.length > 0}
                fallback={
                    <div class="rounded-3xl border border-dashed border-line-strong p-6 text-center text-sm text-fg-muted">
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
