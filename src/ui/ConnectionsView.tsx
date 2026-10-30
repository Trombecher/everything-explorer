import {DropdownMenu} from "@kobalte/core/dropdown-menu";
import {TextField} from "@kobalte/core/text-field";
import ChevronDownIcon from "lucide-solid/icons/chevron-down";
import Globe from "lucide-solid/icons/globe";
import MonitorPc from "lucide-solid/icons/monitor-pc";
import PlusIcon from "lucide-solid/icons/plus";
import {Index, Match, Switch} from "solid-js";

import * as backend from "@/backend/api";
import {useAppState} from "@/context";
import {
    KBConnection,
    KBConnectionTypeLocal,
    KBConnectionTypeRemote,
} from "@/state/app";

const AddConnectionButton = () => {
    const appState = useAppState();

    return (
        <DropdownMenu>
            <DropdownMenu.Trigger class="mb-4 flex rounded-xl bg-blue-500 py-1 pr-1 pl-3 font-medium text-white transition select-none data-expanded:bg-blue-600 dark:text-black">
                <span>Add Knowledge Base</span>
                <DropdownMenu.Icon class="origin-center transition-transform data-expanded:-scale-100">
                    <ChevronDownIcon />
                </DropdownMenu.Icon>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
                <DropdownMenu.Content class="mt-2 rounded-3xl border border-neutral-200 bg-white p-2 shadow-lg select-none">
                    {[
                        {
                            name: "Create New Local",
                            handler: async () => {
                                const path =
                                    await backend.pickPathForNewKnowledgeBaseFile();
                                if (path === null) return;

                                appState.addConnection({
                                    type: KBConnectionTypeLocal,
                                    name: "",
                                    filePath: path,
                                });
                            },
                        },
                        {
                            name: "Existing Local",
                            handler: async () => {
                                const path =
                                    await backend.pickKnowledgeBaseFile();
                                if (path === null) return;

                                appState.addConnection({
                                    type: KBConnectionTypeLocal,
                                    name: "",
                                    filePath: path,
                                });
                            },
                        },
                        {name: "Remote Connection", handler: () => {}},
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
    );
};

export default () => {
    const appState = useAppState();

    return (
        <div class="mx-auto my-3 max-w-3xl grow rounded-3xl border border-neutral-200 bg-white p-4">
            <h2 class="mb-4 text-2xl font-semibold tracking-tight text-black">
                Manage Knowledge Base Connections
            </h2>
            <AddConnectionButton />

            <Index each={appState.state.connections}>
                {(connection, connectionIndex) => (
                    <div class="mb-2 flex gap-2 rounded-2xl border border-neutral-200 p-3">
                        <Switch>
                            <Match
                                when={
                                    connection().type === KBConnectionTypeLocal
                                }
                            >
                                <MonitorPc />
                                Local
                            </Match>
                            <Match
                                when={
                                    connection().type === KBConnectionTypeRemote
                                }
                            >
                                <Globe />
                                Remote
                            </Match>
                        </Switch>
                        <div class="w-px self-stretch bg-neutral-200" />
                        <TextField
                            value={connection().name}
                            onChange={newName =>
                                appState.setConnectionName(
                                    connectionIndex,
                                    newName,
                                )
                            }
                        >
                            <TextField.Label />
                            <TextField.Input />
                        </TextField>

                        <Switch>
                            <Match
                                when={(() => {
                                    const c = connection();

                                    return (
                                        c.type === KBConnectionTypeLocal && c
                                    );
                                })()}
                            >
                                {connection => (
                                    <>
                                        <TextField
                                            value={connection().filePath}
                                        >
                                            <TextField.Label />
                                            <TextField.Input />
                                        </TextField>
                                        <button
                                            onClick={async () => {
                                                const port =
                                                    await backend.serveKnowledgeBase(
                                                        connection().filePath,
                                                    );

                                                console.log(
                                                    `server with port ${port}`,
                                                );
                                            }}
                                        >
                                            connect
                                        </button>
                                    </>
                                )}
                            </Match>
                        </Switch>
                    </div>
                )}
            </Index>
        </div>
    );
};
