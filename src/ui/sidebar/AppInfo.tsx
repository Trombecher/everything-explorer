import BugIcon from "lucide-solid/icons/bug";
import HouseIcon from "lucide-solid/icons/house";
import SettingsIcon from "lucide-solid/icons/settings";
import {Show} from "solid-js";

import {useAppState} from "@/context";
import {Phrase} from "@/i18n/phrases";
import {Tab} from "@/state/common";

import SideBarToggle from "./SideBarToggle";
import TabButton from "./TabButton";

export default (props: {compact?: boolean}) => {
    const appState = useAppState();

    return (
        <div class="rounded-4xl border border-neutral-200 bg-white p-2 dark:bg-neutral-100">
            <Show
                when={!props.compact}
                fallback={
                    <div class="flex justify-center">
                        <SideBarToggle />
                    </div>
                }
            >
                <div class="mb-3 flex items-start justify-between gap-2">
                    <div class="pt-2 pl-2">
                        <h1 class="text-lg font-bold text-black">
                            Everything
                            <br />
                            Explorer
                        </h1>
                        <p class="text-sm">
                            {appState.translate(Phrase.Version, undefined)}{" "}
                            {APP_VERSION}
                        </p>
                    </div>
                    <SideBarToggle />
                </div>
            </Show>
            <TabButton
                compact={props.compact}
                icon={<HouseIcon />}
                tab={Tab.Home}
            />
            <TabButton
                compact={props.compact}
                icon={<SettingsIcon />}
                tab={Tab.AppSettings}
            />
            <TabButton
                compact={props.compact}
                icon={<BugIcon />}
                tab={Tab.Debug}
            />
        </div>
    );
};
