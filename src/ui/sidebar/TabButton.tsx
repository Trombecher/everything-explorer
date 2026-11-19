import {Button} from "@kobalte/core/button";
import type {JSXElement} from "solid-js";
import {Show} from "solid-js";

import {useAppState} from "@/context";
import {Phrase} from "@/i18n/phrases";
import {Tab} from "@/state/common";

export const tabToPhrase = {
    [Tab.Things]: Phrase.Things,
    [Tab.Evaluate]: Phrase.Evaluate,
    [Tab.InstanceProperties]: Phrase.InstanceProperties,
    [Tab.Connections]: Phrase.Connections,
    [Tab.AppSettings]: Phrase.AppSettings,
    [Tab.Home]: Phrase.Home,
    [Tab.Debug]: Phrase.Debug,
} as const satisfies Record<Tab, Phrase>;

export default (props: {tab: Tab; icon: JSXElement; compact?: boolean}) => {
    const appState = useAppState();

    const label = () => appState.translate(tabToPhrase[props.tab], undefined);

    return (
        <Button
            class={`flex w-full gap-2 rounded-3xl p-2 text-left transition-transform duration-75 ease-in-out active:scale-97 ${props.tab === Tab.InstanceProperties ? "mt-auto" : ""} ${props.compact ? "justify-center" : ""} ${appState.state.currentTab === props.tab ? "bg-primary-subtle text-primary-fg font-medium" : "hover:bg-surface-hover"}`}
            title={props.compact ? label() : undefined}
            aria-label={label()}
            onPointerDown={() => {
                appState.setCurrentTab(props.tab);
            }}
        >
            {props.icon}
            <Show when={!props.compact}>{label()}</Show>
        </Button>
    );
};
