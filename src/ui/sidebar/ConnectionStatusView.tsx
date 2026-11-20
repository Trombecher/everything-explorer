import CableIcon from "lucide-solid/icons/cable";
import UnplugIcon from "lucide-solid/icons/unplug";
import {Show} from "solid-js";

import {useConnections, usePreferences} from "@/context";
import {Phrase} from "@/i18n/phrases";
import {Tab} from "@/state/common";

import Button, {ButtonSeverity} from "../reuse/Button";
import TabButton from "./TabButton";

export default (props: {compact?: boolean}) => {
    const connections = useConnections();
    const preferences = usePreferences();

    return (
        <div class="rounded-4xl border border-line-subtle bg-surface-panel p-2">
            <Show when={!props.compact}>
                <h2 class="m-2 font-semibold">
                    {preferences.translate(Phrase.Connection, undefined)}
                </h2>
            </Show>
            <Button
                class={`flex items-center justify-center gap-2 text-sm ${props.compact ? "mx-auto px-1.5! py-1.5!" : "w-full"}`}
                severity={
                    connections.isConnected()
                        ? ButtonSeverity.Danger
                        : ButtonSeverity.Primary
                }
                title={
                    props.compact
                        ? preferences.translate(
                              connections.isConnected()
                                  ? Phrase.Disconnect
                                  : Phrase.Connect,
                              undefined,
                          )
                        : undefined
                }
                aria-label={
                    props.compact
                        ? preferences.translate(
                              connections.isConnected()
                                  ? Phrase.Disconnect
                                  : Phrase.Connect,
                              undefined,
                          )
                        : undefined
                }
                onClick={() => {
                    if (connections.isConnected()) {
                        connections.disconnect();
                    } else {
                        const connectionIndex =
                            connections.lastUsedConnectionIndex();

                        if (
                            connectionIndex !== undefined
                            && connections.list().length > 0
                        ) {
                            connections.connect(connectionIndex);
                        }
                    }
                }}
            >
                <UnplugIcon class="ml-0.5 shrink-0" />
                <Show when={!props.compact}>
                    <span class="overflow-hidden py-1 pr-2 text-ellipsis whitespace-nowrap">
                        {preferences.translate(
                            connections.isConnected()
                                ? Phrase.DisconnectFrom
                                : Phrase.ConnectTo,
                            {
                                forName:
                                    connections.lastUsedConnection()?.name
                                    ?? "",
                            },
                        )}
                    </span>
                </Show>
            </Button>
            <div class="mt-1">
                <TabButton
                    compact={props.compact}
                    icon={<CableIcon />}
                    tab={Tab.Connections}
                />
            </div>
        </div>
    );
};
