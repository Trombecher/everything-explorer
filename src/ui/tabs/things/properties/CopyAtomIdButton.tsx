import CheckIcon from "lucide-solid/icons/check";
import CopyIcon from "lucide-solid/icons/copy";
import {createSignal, onCleanup, Show} from "solid-js";

import {useAppState} from "@/context";
import {Phrase} from "@/i18n/phrases";
import type {Atom} from "@/model/atoms";
import Button, {ButtonSeverity} from "@/ui/reuse/Button";

export default (props: {atom: Atom}) => {
    const appState = useAppState();

    const copyIdLabel = () => appState.translate(Phrase.CopyId, undefined);

    /**
     * How long the copy button shows a check mark after copying, in ms.
     */
    const COPIED_FEEDBACK_DURATION = 2000;

    const [copied, setCopied] = createSignal(false);
    let copiedFeedbackTimeout: ReturnType<typeof setTimeout> | undefined;

    onCleanup(() => clearTimeout(copiedFeedbackTimeout));

    const copyId = () => {
        void navigator.clipboard
            .writeText(String(props.atom.value))
            .then(() => {
                setCopied(true);
                clearTimeout(copiedFeedbackTimeout);
                copiedFeedbackTimeout = setTimeout(
                    () => setCopied(false),
                    COPIED_FEEDBACK_DURATION,
                );
            })
            .catch(error => {
                console.error("failed to copy atom id", error);
            });
    };

    return (
        <Button
            class="flex"
            title={copyIdLabel()}
            aria-label={copyIdLabel()}
            onClick={copyId}
            severity={ButtonSeverity.Secondary}
        >
            <Show when={copied()} fallback={<CopyIcon />}>
                <CheckIcon />
            </Show>
            <span class="px-1">{copyIdLabel()}</span>
        </Button>
    );
};
