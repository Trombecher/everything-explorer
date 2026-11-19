import {useAppState} from "@/context";
import {Phrase} from "@/i18n/phrases";
import Button from "@/ui/reuse/Button";

import LanguageSelector from "./LanguageSelector";
import ThemeSelector from "./ThemeSelector";

export default () => {
    const appState = useAppState();

    return (
        <div class="mx-auto my-2 max-w-2xl grow rounded-4xl border border-line-subtle bg-surface-panel p-4">
            <h2 class="mb-4 text-2xl font-semibold tracking-tight text-fg-strong">
                {appState.translate(Phrase.AppSettings, undefined)}
            </h2>
            <div class="grid grid-cols-2 items-center gap-4">
                <LanguageSelector />
                <ThemeSelector />
                <Button
                    onClick={() => {
                        location.href = "/";
                    }}
                >
                    <span class="px-2">
                        {appState.translate(Phrase.Reload, undefined)}
                    </span>
                </Button>
            </div>
        </div>
    );
};
