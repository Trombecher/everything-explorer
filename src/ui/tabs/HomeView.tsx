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
        <div class="mx-auto my-2 max-w-3xl grow rounded-4xl border border-neutral-200 bg-white p-4 dark:bg-neutral-100">
            <h2 class="mb-4 text-2xl font-semibold tracking-tight text-black">
                {appState.translate(Phrase.WelcomeBack, undefined)}
                <Suspense>{userName() && `, ${userName()}`}</Suspense>!
            </h2>
        </div>
    );
};
