import ClipboardIcon from "lucide-solid/icons/clipboard";
import {For, Show} from "solid-js";

import {useClipboard, usePreferences} from "@/context";
import {Phrase} from "@/i18n/phrases";

import ClipboardSlotRow from "./ClipboardSlotRow";

export default () => {
    const clipboard = useClipboard();
    const preferences = usePreferences();

    return (
        <div class="flex size-full min-h-0 flex-col gap-2 rounded-4xl border border-line-subtle bg-surface-panel p-2">
            <div class="flex items-center gap-2 p-2">
                <ClipboardIcon class="shrink-0" />
                <h2 class="text-xl font-semibold text-fg-strong">
                    {preferences.translate(Phrase.Clipboard, undefined)}
                </h2>
            </div>

            <p class="px-2 text-xs leading-relaxed text-fg-muted">
                {preferences.translate(Phrase.ClipboardShortcutHint, undefined)}
            </p>

            <div class="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-2 pb-1">
                <Show
                    when={clipboard.slots().length > 0}
                    fallback={
                        <p class="mt-2 text-center text-sm text-fg-muted italic">
                            {preferences.translate(
                                Phrase.EmptyClipboard,
                                undefined,
                            )}
                        </p>
                    }
                >
                    <div class="flex flex-col gap-2" role="list">
                        <For each={clipboard.slots()}>
                            {(slot, index) => (
                                <ClipboardSlotRow slot={slot} index={index} />
                            )}
                        </For>
                    </div>
                </Show>
            </div>
        </div>
    );
};
