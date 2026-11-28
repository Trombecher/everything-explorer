import KeyboardIcon from "lucide-solid/icons/keyboard";
import {For, Index, Show} from "solid-js";

import {usePreferences} from "@/context";
import {Phrase} from "@/i18n/phrases";
import Kbd from "@/ui/reuse/Kbd";

import {keybindGroups, type KeybindRow} from "./keybindGroups";

const KeybindRowView = (props: {row: KeybindRow}) => {
    const preferences = usePreferences();

    return (
        <div class="flex items-baseline justify-between gap-3 py-0.5">
            <span class="min-w-0 text-xs leading-relaxed text-fg">
                {preferences.translate(props.row.label, undefined)}
            </span>
            <span class="flex shrink-0 items-center gap-1">
                <Index each={props.row.chords}>
                    {(chord, chordIndex) => (
                        <>
                            <Show when={chordIndex > 0}>
                                <span class="text-[11px] text-fg-muted">/</span>
                            </Show>
                            <span class="flex items-center gap-0.5">
                                <For each={chord()}>
                                    {key => <Kbd>{key}</Kbd>}
                                </For>
                            </span>
                        </>
                    )}
                </Index>
            </span>
        </div>
    );
};

export default () => {
    const preferences = usePreferences();

    return (
        <div class="flex size-full min-h-0 flex-col rounded-4xl border border-line-subtle bg-surface-panel p-2">
            <div class="flex items-center gap-2 p-2">
                <KeyboardIcon class="shrink-0" />
                <h2 class="text-xl font-semibold text-fg-strong">
                    {preferences.translate(Phrase.Keybinds, undefined)}
                </h2>
            </div>

            <p class="px-2 pb-2 text-xs leading-relaxed text-fg-muted">
                {preferences.translate(Phrase.KeybindsHint, undefined)}
            </p>

            <div class="min-h-0 flex-1 overflow-y-auto px-2 pb-1">
                <For each={keybindGroups}>
                    {group => (
                        <section class="mb-3 last:mb-0">
                            <h3 class="mb-1 text-[11px] font-semibold tracking-wide text-fg-muted uppercase">
                                {preferences.translate(group.title, undefined)}
                            </h3>
                            <div class="flex flex-col">
                                <For each={group.rows}>
                                    {row => <KeybindRowView row={row} />}
                                </For>
                            </div>
                        </section>
                    )}
                </For>
            </div>
        </div>
    );
};
