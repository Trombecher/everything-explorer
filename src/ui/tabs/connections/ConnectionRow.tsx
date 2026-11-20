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

    const typeLabel = () =>
        preferences.translate(
            props.connection.type === ConnectionType.Local
                ? Phrase.Local
                : Phrase.Remote,
            undefined,
        );

    return (
        <div
            class="flex flex-wrap items-center gap-3 rounded-3xl border p-3 transition"
            classList={{
                "border-primary bg-primary-subtle": isConnected(),
                "border-line-subtle hover:border-line-strong": !isConnected(),
            }}
        >
            <div class="flex shrink-0 flex-col items-center gap-0.5">
                <Switch>
                    <Match
                        when={props.connection.type === ConnectionType.Local}
                    >
                        <MonitorPcIcon
                            class="size-5 shrink-0 text-fg-muted"
                            aria-hidden="true"
                        />
                    </Match>
                    <Match
                        when={props.connection.type === ConnectionType.Remote}
                    >
                        <GlobeIcon
                            class="size-5 shrink-0 text-fg-muted"
                            aria-hidden="true"
                        />
                    </Match>
                </Switch>
                <span class="text-xs font-medium whitespace-nowrap text-fg-muted">
                    {typeLabel()}
                </span>
            </div>

            <div class="flex min-w-0 flex-1 flex-col">
                <TextField
                    class="min-w-0"
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
                    class="mt-1.5 truncate px-1 font-mono text-xs text-fg-muted"
                    title={connectionPath(props.connection)}
                >
                    {connectionPath(props.connection)}
                </p>
            </div>

            <Show when={isConnected()}>
                <span class="flex shrink-0 items-center gap-1 text-xs font-medium whitespace-nowrap text-primary-fg">
                    <span class="size-1.5 rounded-full bg-primary" />
                    {preferences.translate(Phrase.Connected, undefined)}
                </span>
            </Show>

            <Button
                class="shrink-0 text-sm"
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
                <span class="px-2">
                    {preferences.translate(
                        isConnected() ? Phrase.Disconnect : Phrase.Connect,
                        undefined,
                    )}
                </span>
            </Button>

            <DeleteButton
                label={Phrase.DeleteConnection}
                onClick={() => {
                    void connections.removeConnection(props.connectionIndex);
                }}
            />
        </div>
    );
};
