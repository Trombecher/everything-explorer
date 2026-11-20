import {DropdownMenu} from "@kobalte/core/dropdown-menu";
import ChevronDownIcon from "lucide-solid/icons/chevron-down";
import PlusIcon from "lucide-solid/icons/plus";
import {createSignal} from "solid-js";

import * as backend from "@/backend/api";
import {useConnections, usePreferences} from "@/context";
import {Phrase} from "@/i18n/phrases";
import {ConnectionType} from "@/state/app";

import AddRemoteConnectionDialog from "./AddRemoteConnectionDialog";

export default () => {
    const connections = useConnections();
    const preferences = usePreferences();

    const [remoteDialogOpen, setRemoteDialogOpen] = createSignal(false);

    // Local knowledge bases are files on this machine, so they can only be
    // picked when the frontend runs inside the Tauri app.
    const localConnectionsDisabled = !backend.isApp();

    return (
        <>
            <DropdownMenu>
                <DropdownMenu.Trigger class="flex rounded-xl bg-primary py-1 pr-1 pl-3 font-medium text-on-primary transition select-none hover:bg-primary-hover data-expanded:bg-primary-active">
                    <span>
                        {preferences.translate(
                            Phrase.AddKnowledgeBase,
                            undefined,
                        )}
                    </span>
                    <DropdownMenu.Icon class="origin-center transition-transform data-expanded:-scale-100">
                        <ChevronDownIcon />
                    </DropdownMenu.Icon>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                    <DropdownMenu.Content class="mt-2 rounded-3xl border border-line-subtle bg-surface-panel p-2 shadow-raised select-none">
                        {[
                            {
                                name: preferences.translate(
                                    Phrase.CreateNewLocal,
                                    undefined,
                                ),
                                disabled: localConnectionsDisabled,
                                handler: async () => {
                                    const path =
                                        await backend.pickPathForNewKnowledgeBaseFile();
                                    if (path === null) return;

                                    connections.addConnection({
                                        type: ConnectionType.Local,
                                        name: "",
                                        filePath: path,
                                    });
                                },
                            },
                            {
                                name: preferences.translate(
                                    Phrase.ExistingLocal,
                                    undefined,
                                ),
                                disabled: localConnectionsDisabled,
                                handler: async () => {
                                    const path =
                                        await backend.pickKnowledgeBaseFile();
                                    if (path === null) return;

                                    connections.addConnection({
                                        type: ConnectionType.Local,
                                        name: "",
                                        filePath: path,
                                    });
                                },
                            },
                            {
                                name: preferences.translate(
                                    Phrase.RemoteConnection,
                                    undefined,
                                ),
                                disabled: false,
                                handler: () => setRemoteDialogOpen(true),
                            },
                        ].map(({name, disabled, handler}) => (
                            <DropdownMenu.Item
                                disabled={disabled}
                                onClick={handler}
                                title={
                                    disabled
                                        ? preferences.translate(
                                              Phrase.LocalConnectionsUnavailable,
                                              undefined,
                                          )
                                        : undefined
                                }
                                class={`flex gap-1 rounded-xl py-1 pr-3 pl-1 ${disabled ? "text-fg-subtle cursor-not-allowed" : "hover:bg-primary hover:text-on-primary active:scale-97"}`}
                            >
                                <PlusIcon /> {name}
                            </DropdownMenu.Item>
                        ))}
                    </DropdownMenu.Content>
                </DropdownMenu.Portal>
            </DropdownMenu>

            <AddRemoteConnectionDialog
                open={remoteDialogOpen()}
                onOpenChange={setRemoteDialogOpen}
                onAdd={(url, name) => {
                    connections.addConnection({
                        type: ConnectionType.Remote,
                        url,
                        name,
                    });
                }}
            />
        </>
    );
};
