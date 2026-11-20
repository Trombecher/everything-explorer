import CableIcon from "lucide-solid/icons/cable";
import {Index, Show} from "solid-js";

import {useConnections, usePreferences} from "@/context";
import {Phrase} from "@/i18n/phrases";

import AddConnectionButton from "./AddConnectionButton";
import ConnectionRow from "./ConnectionRow";

export default () => {
    const connections = useConnections();
    const preferences = usePreferences();

    return (
        <div class="mx-auto my-2 max-w-3xl grow rounded-4xl border border-line-subtle bg-surface-panel p-4">
            <div class="mb-4 flex items-center gap-2">
                <CableIcon />
                <h2 class="text-2xl font-semibold tracking-tight text-fg-strong">
                    {preferences.translate(Phrase.Connections, undefined)}
                </h2>
            </div>

            <div class="mb-4 flex">
                <AddConnectionButton />
            </div>

            <Show
                when={connections.list().length > 0}
                fallback={
                    <div class="rounded-3xl border border-dashed border-line-strong p-6 text-center text-sm text-fg-muted">
                        {preferences.translate(
                            Phrase.NoConnectionsYet,
                            undefined,
                        )}
                    </div>
                }
            >
                <div class="flex flex-col gap-2">
                    <Index each={connections.list()}>
                        {(connection, connectionIndex) => (
                            <ConnectionRow
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
