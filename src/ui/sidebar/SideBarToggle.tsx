import PanelLeftCloseIcon from "lucide-solid/icons/panel-left-close";
import PanelLeftOpenIcon from "lucide-solid/icons/panel-left-open";
import {Show} from "solid-js";

import {useAppState} from "@/context";
import {Phrase} from "@/i18n/phrases";

export default () => {
    const appState = useAppState();

    return (
        <button
            type="button"
            class="flex shrink-0 cursor-pointer items-center justify-center rounded-2xl p-2 text-fg hover:bg-surface-hover active:scale-97"
            title={appState.translate(Phrase.ToggleSidebar, undefined)}
            aria-label={appState.translate(Phrase.ToggleSidebar, undefined)}
            aria-expanded={!appState.sidebarCollapsed()}
            aria-controls="app-sidebar"
            onClick={() => appState.toggleSidebarCollapsed()}
        >
            <Show
                when={appState.sidebarCollapsed()}
                fallback={<PanelLeftCloseIcon />}
            >
                <PanelLeftOpenIcon />
            </Show>
        </button>
    );
};
