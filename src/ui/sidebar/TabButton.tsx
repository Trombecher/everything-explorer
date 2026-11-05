import {Button} from "@kobalte/core/button";
import type {JSXElement} from "solid-js";

import {useAppState} from "@/context";
import {Phrase} from "@/i18n/phrases";
import {Tab} from "@/state/common";

export const tabToPhrase = {
    [Tab.Things]: Phrase.Things,
    [Tab.InstanceProperties]: Phrase.InstanceProperties,
    [Tab.AppSettings]: Phrase.AppSettings,
    [Tab.Home]: Phrase.Home,
    [Tab.Debug]: Phrase.Debug,
} as const satisfies Record<Tab, Phrase>;

export default (props: {tab: Tab; icon: JSXElement}) => {
    const appState = useAppState();

    return (
        <Button
            class={`flex w-full gap-2 rounded-3xl p-2 text-left transition-transform duration-75 ease-in-out active:scale-97 ${props.tab === Tab.InstanceProperties ? "mt-auto" : ""} ${appState.state.currentTab === props.tab ? "bg-blue-400/20 font-medium text-blue-500" : "hover:bg-neutral-100"}`}
            onPointerDown={() => {
                appState.setCurrentTab(props.tab);
            }}
        >
            {props.icon}
            {appState.translate(tabToPhrase[props.tab], undefined)}
        </Button>
    );
};
