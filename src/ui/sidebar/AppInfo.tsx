import BugIcon from "lucide-solid/icons/bug";
import HouseIcon from "lucide-solid/icons/house";
import SettingsIcon from "lucide-solid/icons/settings";

import {useAppState} from "@/context";
import {Phrase} from "@/i18n/phrases";
import {Tab} from "@/state/common";

import TabButton from "./TabButton";

export default () => {
    const appState = useAppState();

    return (
        <div class="rounded-4xl border border-neutral-200 bg-white p-2">
            <h1 class="mt-2 px-2 text-lg font-bold text-black">
                Everything Explorer
            </h1>
            <p class="mb-4 px-2 text-sm">
                {appState.translate(Phrase.Version, undefined)} {APP_VERSION}
            </p>
            <TabButton icon={<HouseIcon />} tab={Tab.Home} />
            <TabButton icon={<SettingsIcon />} tab={Tab.AppSettings} />
            <TabButton icon={<BugIcon />} tab={Tab.Debug} />
        </div>
    );
};
