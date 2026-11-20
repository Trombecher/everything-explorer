import {TextField} from "@kobalte/core/text-field";
import GlobeIcon from "lucide-solid/icons/globe";
import MonitorPcIcon from "lucide-solid/icons/monitor-pc";
import {Match, Show, Switch} from "solid-js";

import {useConnections, usePreferences} from "@/context";
import {Phrase} from "@/i18n/phrases";
import {type Connection, ConnectionType} from "@/state/app";
import Button, {ButtonSeverity} from "@/ui/reuse/Button";
import DeleteButton from "@/ui/reuse/DeleteButton";
import type {DeepReadonly} from "@/util";

const connectionPath = (connection: DeepReadonly<Connection>) =>
    connection.type === ConnectionType.Local
        ? connection.filePath
        : connection.url;

export default (props: {
    connection: DeepReadonly<Connection>;
    connectionIndex: number;
}) => {
    const connections = useConnections();
    const preferences = usePreferences();

    const isConnected = () =>
        connections.isConnected()
        && connections.lastUsedConnectionIndex() === props.connectionIndex;

    return (
        <div
            class="flex aspect-square flex-col rounded-3xl border p-3 transition"
            classList={{
                "border-primary bg-primary-subtle": isConnected(),
                "border-line-subtle hover:border-line-strong": !isConnected(),
            }}
        >
            <div class="flex items-center gap-2">
                <Switch>
                    <Match
                        when={props.connection.type === ConnectionType.Local}
                    >
                        <MonitorPcIcon class="size-4 shrink-0" />
                        <span class="text-xs font-medium text-fg-muted">
                            {preferences.translate(Phrase.Local, undefined)}
                        </span>
                    </Match>
                    <Match
                        when={props.connection.type === ConnectionType.Remote}
                    >
                        <GlobeIcon class="size-4 shrink-0" />
                        <span class="text-xs font-medium text-fg-muted">
                            {preferences.translate(Phrase.Remote, undefined)}
                        </span>
                    </Match>
                </Switch>
                <div class="ml-auto flex items-center gap-1">
                    <Show when={isConnected()}>
                        <span class="flex items-center gap-1 text-xs font-medium whitespace-nowrap text-primary-fg">
                            <span class="size-1.5 rounded-full bg-primary" />
                            {preferences.translate(Phrase.Connected, undefined)}
                        </span>
                    </Show>
                    <DeleteButton
                        label={Phrase.DeleteConnection}
                        onClick={() => {
                            void connections.removeConnection(
                                props.connectionIndex,
                            );
                        }}
                    />
                </div>
            </div>

            <TextField
                class="mt-2 min-w-0"
                value={props.connection.name}
                onChange={newName =>
                    connections.setConnectionName(
                        props.connectionIndex,
                        newName,
                    )
                }
            >
                <TextField.Input
                    class="w-full rounded-lg bg-transparent px-1 py-0.5 text-sm font-semibold text-fg outline-none placeholder:font-normal placeholder:text-fg-subtle hover:bg-surface-hover focus:bg-surface-hover"
                    placeholder={preferences.translate(
                        Phrase.UnnamedConnection,
                        undefined,
                    )}
                />
            </TextField>

            <p
                class="mt-1 line-clamp-3 px-1 font-mono text-xs break-all text-fg-muted"
                title={connectionPath(props.connection)}
            >
                {connectionPath(props.connection)}
            </p>

            <Button
                class="mt-auto w-full text-sm"
                severity={
                    isConnected()
                        ? ButtonSeverity.Danger
                        : ButtonSeverity.Primary
                }
                onClick={async () => {
                    if (isConnected()) await connections.disconnect();
                    else await connections.connect(props.connectionIndex);
                }}
            >
                <span class="px-1">
                    {preferences.translate(
                        isConnected() ? Phrase.Disconnect : Phrase.Connect,
                        undefined,
                    )}
                </span>
            </Button>
        </div>
    );
};
