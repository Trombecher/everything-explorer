import {useAppState} from "@/context";
import {Phrase} from "@/i18n/phrases";

import LanguageSelector from "./LanguageSelector";
import ThemeSelector from "./ThemeSelector";

export default () => {
    const appState = useAppState();

    return (
        <div class="mx-auto my-3 max-w-2xl grow rounded-3xl border border-neutral-200 bg-white p-4">
            <h2 class="mb-4 text-2xl font-semibold tracking-tight text-black">
                {appState.translate(Phrase.AppSettings, undefined)}
            </h2>
            <div class="grid grid-cols-2 items-center gap-4">
                <LanguageSelector />
                <ThemeSelector />
            </div>
        </div>
    );
};
