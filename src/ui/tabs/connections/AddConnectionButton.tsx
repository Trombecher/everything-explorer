import {DropdownMenu} from "@kobalte/core/dropdown-menu";
import ChevronDownIcon from "lucide-solid/icons/chevron-down";
import PlusIcon from "lucide-solid/icons/plus";
import {createSignal} from "solid-js";

import * as backend from "@/backend/api";
import {useAppState} from "@/context";
import {Phrase} from "@/i18n/phrases";
import {ConnectionType} from "@/state/app";

import AddRemoteConnectionDialog from "./AddRemoteConnectionDialog";

export default () => {
    const appState = useAppState();

    const [remoteDialogOpen, setRemoteDialogOpen] = createSignal(false);

    return (
        <>
            <DropdownMenu>
                <DropdownMenu.Trigger class="flex rounded-xl bg-blue-500 py-1 pr-1 pl-3 font-medium text-white transition select-none data-expanded:bg-blue-600 dark:text-black">
                    <span>
                        {appState.translate(Phrase.AddKnowledgeBase, undefined)}
                    </span>
                    <DropdownMenu.Icon class="origin-center transition-transform data-expanded:-scale-100">
                        <ChevronDownIcon />
                    </DropdownMenu.Icon>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                    <DropdownMenu.Content class="mt-2 rounded-3xl border border-neutral-200 bg-white p-2 shadow-lg select-none dark:bg-neutral-100">
                        {[
                            {
                                name: appState.translate(
                                    Phrase.CreateNewLocal,
                                    undefined,
                                ),
                                handler: async () => {
                                    const path =
                                        await backend.pickPathForNewKnowledgeBaseFile();
                                    if (path === null) return;

                                    appState.addConnection({
                                        type: ConnectionType.Local,
                                        name: "",
                                        filePath: path,
                                    });
                                },
                            },
                            {
                                name: appState.translate(
                                    Phrase.ExistingLocal,
                                    undefined,
                                ),
                                handler: async () => {
                                    const path =
                                        await backend.pickKnowledgeBaseFile();
                                    if (path === null) return;

                                    appState.addConnection({
                                        type: ConnectionType.Local,
                                        name: "",
                                        filePath: path,
                                    });
                                },
                            },
                            {
                                name: appState.translate(
                                    Phrase.RemoteConnection,
                                    undefined,
                                ),
                                handler: () => setRemoteDialogOpen(true),
                            },
                        ].map(({name, handler}) => (
                            <DropdownMenu.Item
                                onClick={handler}
                                class="flex gap-1 rounded-xl py-1 pr-3 pl-1 hover:bg-blue-500 hover:text-white active:scale-97 dark:hover:text-black"
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
                    appState.addConnection({
                        type: ConnectionType.Remote,
                        url,
                        name,
                    });
                }}
            />
        </>
    );
};
