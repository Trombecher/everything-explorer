import type {Accessor} from "solid-js";

import {useClipboard, usePreferences} from "@/context";
import {Phrase} from "@/i18n/phrases";
import type {ClipboardSlot} from "@/state/app";
import DeleteButton from "@/ui/reuse/DeleteButton";
import Kbd from "@/ui/reuse/Kbd";
import type {DeepReadonly} from "@/util";

import ObjectPreview from "./ObjectPreview";

/**
 * The first ten slots are addressed by `Alt+1…9/0`.
 */
const keyLabel = (index: number): string =>
    index === 9 ? "0" : String(index + 1);

export default (props: {
    slot: DeepReadonly<ClipboardSlot>;
    index: Accessor<number>;
}) => {
    const clipboard = useClipboard();
    const preferences = usePreferences();

    const shortcutHint = () =>
        props.index() < 10 ? `Alt+${keyLabel(props.index())}` : undefined;

    return (
        <div
            class="flex shrink-0 flex-col gap-1 rounded-2xl border border-line-subtle bg-surface-sunken p-2"
            role="listitem"
        >
            <div class="flex items-center gap-2">
                <Kbd title={shortcutHint()}>
                    {props.index() < 10
                        ? keyLabel(props.index())
                        : String(props.index() + 1)}
                </Kbd>
                <input
                    class="min-w-0 grow rounded-lg bg-transparent px-1 py-0.5 font-medium text-fg-strong outline-none hover:bg-surface-hover focus:bg-surface-control"
                    value={props.slot.name}
                    aria-label={preferences.translate(
                        Phrase.ClipboardSlotName,
                        undefined,
                    )}
                    spellcheck={false}
                    onChange={event => {
                        const name = event.currentTarget.value.trim();

                        if (name.length === 0) {
                            event.currentTarget.value = props.slot.name;
                            return;
                        }

                        event.currentTarget.value = name;
                        clipboard.renameSlot(props.index(), name);
                    }}
                    onKeyDown={event => {
                        if (event.key === "Enter") {
                            event.currentTarget.blur();
                        } else if (event.key === "Escape") {
                            event.currentTarget.value = props.slot.name;
                            event.currentTarget.blur();
                        }
                    }}
                />
                <DeleteButton
                    label={Phrase.DeleteClipboardSlot}
                    onClick={() => clipboard.deleteSlot(props.index())}
                />
            </div>
            <div class="max-h-36 overflow-hidden">
                <ObjectPreview object={props.slot.object} />
            </div>
        </div>
    );
};
