import Settings2Icon from "lucide-solid/icons/settings-2";

import {useConnections, usePreferences} from "@/context";
import {Phrase} from "@/i18n/phrases";

import Button from "../reuse/Button";

export default () => {
    const connections = useConnections();
    const preferences = usePreferences();

    return (
        <div class="mx-auto my-2 max-w-3xl grow rounded-4xl border border-line-subtle bg-surface-panel p-4">
            <div class="mb-4 flex items-center gap-2">
                <Settings2Icon />
                <h2 class="text-2xl font-semibold tracking-tight text-fg-strong">
                    {preferences.translate(
                        Phrase.InstanceProperties,
                        undefined,
                    )}
                </h2>
            </div>
            <Button
                disabled={connections.connectionClient() === undefined}
                onClick={() => {
                    const connectionClient = connections.connectionClient();
                    if (!connectionClient) return;

                    void connectionClient.compact().catch(error => {
                        console.error(
                            "failed to compact knowledge base",
                            error,
                        );
                    });
                }}
            >
                <span class="px-1">
                    {preferences.translate(Phrase.Compact, undefined)}
                </span>
            </Button>
        </div>
    );
};
