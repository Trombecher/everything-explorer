import {createResource, Suspense} from "solid-js";

import * as backend from "@/backend/api";
import {useAppState} from "@/context";
import {Phrase} from "@/i18n/phrases";

export default () => {
    const appState = useAppState();

    const [userName] = createResource(async () => {
        if (backend.isApp()) return backend.osUserFullName();
    });

    return (
        <div class="mx-auto my-2 max-w-3xl grow rounded-4xl border border-line-subtle bg-surface-panel p-4">
            <h2 class="mb-4 text-2xl font-semibold tracking-tight text-fg-strong">
                {appState.translate(Phrase.WelcomeBack, undefined)}
                <Suspense>{userName() && `, ${userName()}`}</Suspense>!
            </h2>
        </div>
    );
};
