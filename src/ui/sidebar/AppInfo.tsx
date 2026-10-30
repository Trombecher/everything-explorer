import DatabaseCog from "lucide-solid/icons/database-cog";
import SettingsIcon from "lucide-solid/icons/settings";

import {useAppState} from "@/context";
import {Phrase} from "@/i18n/phrases";

import TabButton from "./TabButton";
import {Tab} from "./tabs";

export default () => {
    const appState = useAppState();

    return (
        <div class="rounded-3xl border border-neutral-200 bg-white p-2">
            <h1 class="mt-2 px-2 text-lg font-bold text-black">
                Everything Explorer
            </h1>
            <p class="mb-4 px-2 text-sm">
                {appState.translate(Phrase.Version, undefined)} {APP_VERSION}
            </p>
            <TabButton icon={<DatabaseCog />} tab={Tab.Connections} />
            <TabButton icon={<SettingsIcon />} tab={Tab.AppSettings} />
        </div>
    );
};
