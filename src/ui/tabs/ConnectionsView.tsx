import {Button as KobalteButton} from "@kobalte/core/button";
import {DropdownMenu} from "@kobalte/core/dropdown-menu";
import {TextField} from "@kobalte/core/text-field";
import ChevronDownIcon from "lucide-solid/icons/chevron-down";
import GlobeIcon from "lucide-solid/icons/globe";
import MonitorPcIcon from "lucide-solid/icons/monitor-pc";
import PlusIcon from "lucide-solid/icons/plus";
import TrashIcon from "lucide-solid/icons/trash";
import {Index, Match, Show, Switch} from "solid-js";

import * as backend from "@/backend/api";
import {useAppState} from "@/context";
import {Phrase} from "@/i18n/phrases";
import {type Connection, ConnectionType} from "@/state/app";
import Button, {ButtonSeverity} from "@/ui/reuse/Button";
import type {DeepReadonly} from "@/util";

const connectionPath = (connection: DeepReadonly<Connection>) =>
    connection.type === ConnectionType.Local
        ? connection.filePath
        : connection.url;

const AddConnectionButton = () => {
    const appState = useAppState();

    return (
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
                            handler: () => {},
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
    );
};

export default () => {
    const appState = useAppState();

    const isConnected = (connectionIndex: number) =>
        appState.isConnected()
        && appState.state.lastUsedConnectionIndex === connectionIndex;

    return (
        <div class="mx-auto my-2 max-w-3xl grow rounded-4xl border border-neutral-200 bg-white p-4 dark:bg-neutral-100">
            <h2 class="mb-4 text-2xl font-semibold tracking-tight text-black">
                {appState.translate(Phrase.Connections, undefined)}
            </h2>

            <div class="mb-4 flex">
                <AddConnectionButton />
            </div>

            <Show
                when={appState.state.connections.length > 0}
                fallback={
                    <div class="rounded-3xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
                        {appState.translate(Phrase.NoConnectionsYet, undefined)}
                    </div>
                }
            >
                <div class="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-3">
                    <Index each={appState.state.connections}>
                        {(connection, connectionIndex) => (
                            <div
                                class="flex aspect-square flex-col rounded-3xl border p-3 transition"
                                classList={{
                                    "border-blue-400 bg-neutral-200":
                                        isConnected(connectionIndex),
                                    "border-neutral-200 hover:border-neutral-300":
                                        !isConnected(connectionIndex),
                                }}
                            >
                                <div class="flex items-center gap-2">
                                    <Switch>
                                        <Match
                                            when={
                                                connection().type
                                                === ConnectionType.Local
                                            }
                                        >
                                            <MonitorPcIcon class="size-4 shrink-0" />
                                            <span class="text-xs font-medium text-neutral-600">
                                                {appState.translate(
                                                    Phrase.Local,
                                                    undefined,
                                                )}
                                            </span>
                                        </Match>
                                        <Match
                                            when={
                                                connection().type
                                                === ConnectionType.Remote
                                            }
                                        >
                                            <GlobeIcon class="size-4 shrink-0" />
                                            <span class="text-xs font-medium text-neutral-600">
                                                {appState.translate(
                                                    Phrase.Remote,
                                                    undefined,
                                                )}
                                            </span>
                                        </Match>
                                    </Switch>
                                    <div class="ml-auto flex items-center gap-1">
                                        <Show
                                            when={isConnected(connectionIndex)}
                                        >
                                            <span class="flex items-center gap-1 text-xs font-medium whitespace-nowrap text-blue-500">
                                                <span class="size-1.5 rounded-full bg-blue-500" />
                                                {appState.translate(
                                                    Phrase.Connected,
                                                    undefined,
                                                )}
                                            </span>
                                        </Show>
                                        <KobalteButton
                                            class="shrink-0 rounded-xl p-1 text-neutral-400 hover:bg-neutral-200 hover:text-red-500"
                                            title={appState.translate(
                                                Phrase.DeleteConnection,
                                                undefined,
                                            )}
                                            aria-label={appState.translate(
                                                Phrase.DeleteConnection,
                                                undefined,
                                            )}
                                            onClick={() => {
                                                void appState.removeConnection(
                                                    connectionIndex,
                                                );
                                            }}
                                        >
                                            <TrashIcon class="size-4" />
                                        </KobalteButton>
                                    </div>
                                </div>

                                <TextField
                                    class="mt-2 min-w-0"
                                    value={connection().name}
                                    onChange={newName =>
                                        appState.setConnectionName(
                                            connectionIndex,
                                            newName,
                                        )
                                    }
                                >
                                    <TextField.Input
                                        class="w-full rounded-lg bg-transparent px-1 py-0.5 text-sm font-semibold text-black outline-none placeholder:font-normal placeholder:text-neutral-400 hover:bg-neutral-200 focus:bg-neutral-200"
                                        placeholder={appState.translate(
                                            Phrase.UnnamedConnection,
                                            undefined,
                                        )}
                                    />
                                </TextField>

                                <p
                                    class="mt-1 line-clamp-3 px-1 font-mono text-xs break-all text-neutral-500"
                                    title={connectionPath(connection())}
                                >
                                    {connectionPath(connection())}
                                </p>

                                <Button
                                    class="mt-auto w-full text-sm"
                                    severity={
                                        isConnected(connectionIndex)
                                            ? ButtonSeverity.Danger
                                            : ButtonSeverity.Primary
                                    }
                                    onClick={async () => {
                                        if (isConnected(connectionIndex))
                                            await appState.disconnect();
                                        else
                                            await appState.connect(
                                                connectionIndex,
                                            );
                                    }}
                                >
                                    {appState.translate(
                                        isConnected(connectionIndex)
                                            ? Phrase.Disconnect
                                            : Phrase.Connect,
                                        undefined,
                                    )}
                                </Button>
                            </div>
                        )}
                    </Index>
                </div>
            </Show>
        </div>
    );
};
