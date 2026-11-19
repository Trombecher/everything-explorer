import {Button} from "@kobalte/core/button";
import TrashIcon from "lucide-solid/icons/trash";
import {splitProps} from "solid-js";

import {useAppState} from "@/context";
import type {Phrase} from "@/i18n/phrases";

/**
 * Destructive action button. Always uses the trash icon with the danger
 * treatment so deletion looks identical everywhere. Dismissals (closing panels,
 * collapsing search) keep the X icon and must not use this.
 */
export default (props: Parameters<typeof Button>[0] & {label: Phrase}) => {
    const appState = useAppState();
    const [local, others] = splitProps(props, ["label", "class"]);

    const label = () => appState.translate(local.label, undefined);

    return (
        <Button
            {...others}
            class={`shrink-0 cursor-pointer rounded-2xl p-2 text-fg-muted hover:bg-danger-subtle hover:text-danger-fg ${local.class ?? ""}`}
            title={label()}
            aria-label={label()}
        >
            <TrashIcon />
        </Button>
    );
};
