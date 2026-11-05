import LayoutGrid from "lucide-solid/icons/layout-grid";
import Settings2Icon from "lucide-solid/icons/settings-2";

import {Tab} from "@/state/common";

import TabButton from "./TabButton";

export default () => {
    return (
        <div class="flex grow flex-col rounded-4xl border border-neutral-200 bg-white p-2">
            <h2 class="m-2 font-semibold">Views</h2>
            {(
                [
                    [Tab.Things, <LayoutGrid />],
                    [Tab.InstanceProperties, <Settings2Icon />],
                ] as const
            ).map(([tab, icon]) => (
                <TabButton icon={icon} tab={tab} />
            ))}
        </div>
    );
};
