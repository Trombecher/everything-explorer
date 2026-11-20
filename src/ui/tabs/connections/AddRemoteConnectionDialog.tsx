import {Dialog} from "@kobalte/core/dialog";
import {TextField} from "@kobalte/core/text-field";
import PlusIcon from "lucide-solid/icons/plus";
import {createEffect, createMemo, createSignal, Show} from "solid-js";

import {useConnections, usePreferences} from "@/context";
import {Phrase} from "@/i18n/phrases";
import {ConnectionType} from "@/state/app";
import Button from "@/ui/reuse/Button";

/**
 * Parses the text field content into a connection URL, or returns `undefined`
 * if it is not an absolute HTTP(S) URL.
 *
 * Trailing slashes are removed because the connection client appends API paths
 * that already start with a slash.
 */
const parseUrl = (text: string): string | undefined => {
    const trimmed = text.trim();

    let url: URL;
    try {
        url = new URL(trimmed);
    } catch {
        return undefined;
    }

    if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;

    return trimmed.replace(/\/+$/, "");
};

export default (props: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAdd: (url: string, name: string) => void;
}) => {
    const connections = useConnections();
    const preferences = usePreferences();

    const [urlText, setUrlText] = createSignal("");
    const [nameText, setNameText] = createSignal("");

    let urlInput: HTMLInputElement | undefined;

    const url = createMemo(() => parseUrl(urlText()));

    const urlAlreadyExists = createMemo(() => {
        const parsedUrl = url();
        if (parsedUrl === undefined) return false;

        return connections
            .list()
            .some(
                connection =>
                    connection.type === ConnectionType.Remote
                    && connection.url === parsedUrl,
            );
    });

    const canSubmit = () => url() !== undefined && !urlAlreadyExists();

    // Start every dialog with empty fields.
    createEffect(() => {
        if (!props.open) return;

        setUrlText("");
        setNameText("");
    });

    const confirm = () => {
        const parsedUrl = url();
        if (parsedUrl === undefined || urlAlreadyExists()) return;

        props.onAdd(parsedUrl, nameText().trim());
        props.onOpenChange(false);
    };

    return (
        <Dialog open={props.open} onOpenChange={props.onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay class="fixed inset-0 z-50 bg-scrim" />
                <Dialog.Content
                    onOpenAutoFocus={event => {
                        event.preventDefault();
                        urlInput?.focus();
                        urlInput?.select();
                    }}
                    class="fixed top-1/2 left-1/2 z-50 flex max-h-[90vh] w-[min(90vw,32rem)] -translate-x-1/2 -translate-y-1/2 flex-col gap-3 overflow-y-auto rounded-4xl border border-line-subtle bg-surface-panel p-4 shadow-raised"
                >
                    <Dialog.Title class="text-2xl font-semibold text-fg-strong">
                        {preferences.translate(
                            Phrase.AddRemoteConnection,
                            undefined,
                        )}
                    </Dialog.Title>
                    <Dialog.Description class="text-base text-fg-muted">
                        {preferences.translate(
                            Phrase.RemoteConnectionDescription,
                            undefined,
                        )}
                    </Dialog.Description>

                    <TextField
                        value={urlText()}
                        onChange={setUrlText}
                        validationState={
                            urlText().trim() !== "" && url() === undefined
                                ? "invalid"
                                : undefined
                        }
                    >
                        <TextField.Label class="mb-1 block text-base font-medium text-fg">
                            {preferences.translate(Phrase.Url, undefined)}
                        </TextField.Label>
                        <TextField.Input
                            ref={element => (urlInput = element)}
                            type="url"
                            inputmode="url"
                            spellcheck={false}
                            placeholder="https://example.com:8080"
                            onKeyDown={event => {
                                if (event.key !== "Enter") return;

                                event.preventDefault();
                                confirm();
                            }}
                            class="block w-full rounded-2xl border border-line-subtle bg-surface-sunken px-3 py-2 font-mono text-base text-fg data-invalid:outline-2 data-invalid:outline-danger"
                        />
                    </TextField>

                    <Show when={urlText().trim() !== "" && url() === undefined}>
                        <p class="text-base text-danger-fg">
                            {preferences.translate(
                                Phrase.InvalidRemoteUrl,
                                undefined,
                            )}
                        </p>
                    </Show>

                    <Show when={urlAlreadyExists()}>
                        <p class="text-base text-danger-fg">
                            {preferences.translate(
                                Phrase.RemoteConnectionAlreadyExists,
                                undefined,
                            )}
                        </p>
                    </Show>

                    <TextField
                        value={nameText()}
                        onChange={setNameText}
                        class="mt-1"
                    >
                        <TextField.Label class="mb-1 block text-base font-medium text-fg">
                            {preferences.translate(Phrase.Name, undefined)}
                        </TextField.Label>
                        <TextField.Input
                            spellcheck={false}
                            onKeyDown={event => {
                                if (event.key !== "Enter") return;

                                event.preventDefault();
                                confirm();
                            }}
                            class="block w-full rounded-2xl border border-line-subtle bg-surface-sunken px-3 py-2 text-base text-fg"
                        />
                    </TextField>

                    <div class="mt-1 flex items-center gap-2">
                        <div class="grow" />
                        <Dialog.CloseButton class="cursor-pointer rounded-2xl bg-surface-control px-2 py-1 font-medium text-fg hover:bg-surface-control-hover active:scale-97">
                            {preferences.translate(Phrase.Cancel, undefined)}
                        </Dialog.CloseButton>
                        <Button
                            class="flex items-center gap-0.5"
                            disabled={!canSubmit()}
                            onClick={confirm}
                        >
                            <PlusIcon />
                            <span class="pr-1">
                                {preferences.translate(Phrase.Add, undefined)}
                            </span>
                        </Button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog>
    );
};
