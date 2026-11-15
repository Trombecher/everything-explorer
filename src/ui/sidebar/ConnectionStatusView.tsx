import CableIcon from "lucide-solid/icons/cable";
import UnplugIcon from "lucide-solid/icons/unplug";
import {Show} from "solid-js";

import {useAppState} from "@/context";
import {Phrase} from "@/i18n/phrases";
import {Tab} from "@/state/common";

import Button, {ButtonSeverity} from "../reuse/Button";
import TabButton from "./TabButton";

export default (props: {compact?: boolean}) => {
    const appState = useAppState();

    return (
        <div class="rounded-4xl border border-neutral-200 bg-white p-2 dark:bg-neutral-100">
            <Show when={!props.compact}>
                <h2 class="m-2 font-semibold">Connection</h2>
            </Show>
            <Button
                class={`flex items-center justify-center gap-2 text-sm ${props.compact ? "mx-auto px-1.5! py-1.5!" : "w-full"}`}
                severity={
                    appState.isConnected()
                        ? ButtonSeverity.Danger
                        : ButtonSeverity.Primary
                }
                title={
                    props.compact
                        ? appState.translate(
                              appState.isConnected()
                                  ? Phrase.Disconnect
                                  : Phrase.Connect,
                              undefined,
                          )
                        : undefined
                }
                aria-label={
                    props.compact
                        ? appState.translate(
                              appState.isConnected()
                                  ? Phrase.Disconnect
                                  : Phrase.Connect,
                              undefined,
                          )
                        : undefined
                }
                onClick={() => {
                    if (appState.isConnected()) {
                        appState.disconnect();
                    } else if (
                        appState.state.connections.length > 0
                        && appState.state.lastUsedConnectionIndex !== undefined
                    ) {
                        appState.connect(
                            appState.state.lastUsedConnectionIndex,
                        );
                    }
                }}
            >
                <UnplugIcon class="shrink-0" />
                <Show when={!props.compact}>
                    <span class="overflow-hidden py-1 pr-2 text-ellipsis whitespace-nowrap">
                        {appState.isConnected()
                            ? "Disconnect from "
                            : "Connect to "}
                        {appState.lastUsedConnection()?.name}
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
