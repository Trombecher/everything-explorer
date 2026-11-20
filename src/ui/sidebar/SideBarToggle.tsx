import PanelLeftCloseIcon from "lucide-solid/icons/panel-left-close";
import PanelLeftOpenIcon from "lucide-solid/icons/panel-left-open";
import {Show} from "solid-js";

import {useNavigation, usePreferences} from "@/context";
import {Phrase} from "@/i18n/phrases";

export default () => {
    const navigation = useNavigation();
    const preferences = usePreferences();

    return (
        <button
            type="button"
            class="flex shrink-0 cursor-pointer items-center justify-center rounded-2xl p-2 text-fg hover:bg-surface-hover active:scale-97"
            title={preferences.translate(Phrase.ToggleSidebar, undefined)}
            aria-label={preferences.translate(Phrase.ToggleSidebar, undefined)}
            aria-expanded={!navigation.sidebarCollapsed()}
            aria-controls="app-sidebar"
            onClick={() => navigation.toggleSidebarCollapsed()}
        >
            <Show
                when={navigation.sidebarCollapsed()}
                fallback={<PanelLeftCloseIcon />}
            >
                <PanelLeftOpenIcon />
            </Show>
        </button>
    );
};
