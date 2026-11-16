import LayoutGrid from "lucide-solid/icons/layout-grid";
import Settings2Icon from "lucide-solid/icons/settings-2";
import {Show} from "solid-js";

import {useAppState} from "@/context";
import {Phrase} from "@/i18n/phrases";
import {Tab} from "@/state/common";

import TabButton from "./TabButton";

export default (props: {compact?: boolean}) => {
    const appState = useAppState();

    return (
        <div class="flex grow flex-col rounded-4xl border border-neutral-200 bg-white p-2 dark:bg-neutral-100">
            <Show when={!props.compact}>
                <h2 class="m-2 font-semibold">
                    {appState.translate(Phrase.Views, undefined)}
                </h2>
            </Show>
            {(
                [
                    [Tab.Things, <LayoutGrid />],
                    [Tab.InstanceProperties, <Settings2Icon />],
                ] as const
            ).map(([tab, icon]) => (
                <TabButton compact={props.compact} icon={icon} tab={tab} />
            ))}
        </div>
    );
};
