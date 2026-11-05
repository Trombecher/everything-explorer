import UnplugIcon from "lucide-solid/icons/unplug";
import {Show} from "solid-js";

import {useAppState} from "@/context";

import Button, {ButtonSeverity} from "../reuse/Button";

export default () => {
    const appState = useAppState();

    return (
        <div class="rounded-4xl border border-neutral-200 bg-white p-2">
            <h2 class="m-2 font-semibold">Connection</h2>
            <Button
                class="flex w-full items-center justify-center gap-2 text-sm"
                severity={
                    appState.isConnected()
                        ? ButtonSeverity.Danger
                        : ButtonSeverity.Primary
                }
                onClick={() => {
                    if (appState.isConnected()) {
                        appState.disconnect();
                    } else if (appState.state.connections.length > 0) {
                        appState.connect(0);
                    }
                }}
            >
                <UnplugIcon class="shrink-0" />
                <span class="overflow-hidden py-1 pr-2 text-ellipsis whitespace-nowrap">
                    {appState.isConnected()
                        ? "Disconnect from "
                        : "Connect to "}
                    {appState.state.connections[0]?.name}
                </span>
            </Button>
        </div>
    );
};
