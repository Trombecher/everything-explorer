import FlaskConicalIcon from "lucide-solid/icons/flask-conical";
import LayoutGrid from "lucide-solid/icons/layout-grid";
import Settings2Icon from "lucide-solid/icons/settings-2";
import {Show} from "solid-js";

import {usePreferences} from "@/context";
import {Phrase} from "@/i18n/phrases";
import {Tab} from "@/state/common";

import TabButton from "./TabButton";

export default (props: {compact?: boolean}) => {
    const preferences = usePreferences();

    return (
        <div class="flex grow flex-col rounded-4xl border border-line-subtle bg-surface-panel p-2">
            <Show when={!props.compact}>
                <h2 class="m-2 font-semibold">
                    {preferences.translate(Phrase.Views, undefined)}
                </h2>
            </Show>
            {(
                [
                    [Tab.Things, <LayoutGrid />],
                    [Tab.Evaluate, <FlaskConicalIcon />],
                    [Tab.InstanceProperties, <Settings2Icon />],
                ] as const
            ).map(([tab, icon]) => (
                <TabButton compact={props.compact} icon={icon} tab={tab} />
            ))}
        </div>
    );
};
