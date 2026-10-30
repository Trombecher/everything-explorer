import {Button} from "@kobalte/core/button";
import type {JSXElement} from "solid-js";

import {useAppState} from "@/context";

import {Tab, tabToPhrase} from "./tabs";

export default (props: {tab: Tab; icon: JSXElement}) => {
    const appState = useAppState();

    return (
        <Button
            class={`flex w-full gap-2 rounded-2xl p-2 text-left transition-transform duration-75 ease-in-out active:scale-97 ${props.tab === Tab.InstanceProperties ? "mt-auto" : ""} ${appState.state.currentTab === props.tab ? "bg-blue-400/20 font-semibold text-blue-500" : "hover:bg-neutral-100"}`}
            onPointerDown={() => {
                appState.setCurrentTab(props.tab);
            }}
        >
            {props.icon}
            {appState.translate(tabToPhrase[props.tab], undefined)}
        </Button>
    );
};
