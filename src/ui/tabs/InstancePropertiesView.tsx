import Settings2Icon from "lucide-solid/icons/settings-2";

import {useAppState} from "@/context";
import {Phrase} from "@/i18n/phrases";

import Button from "../reuse/Button";

export default () => {
    const appState = useAppState();

    return (
        <div class="mx-auto my-2 max-w-3xl grow rounded-4xl border border-line-subtle bg-surface-panel p-4">
            <div class="mb-4 flex items-center gap-2">
                <Settings2Icon />
                <h2 class="text-2xl font-semibold tracking-tight text-fg-strong">
                    {appState.translate(Phrase.InstanceProperties, undefined)}
                </h2>
            </div>
            <Button
                disabled={appState.connectionClient() === undefined}
                onClick={() => {
                    const connectionClient = appState.connectionClient();
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
                    {appState.translate(Phrase.Compact, undefined)}
                </span>
            </Button>
        </div>
    );
};
