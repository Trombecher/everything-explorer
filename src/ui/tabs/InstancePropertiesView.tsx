import Settings2Icon from "lucide-solid/icons/settings-2";

import {useAppState} from "@/context";
import {Phrase} from "@/i18n/phrases";

import Button from "../reuse/Button";

export default () => {
    const appState = useAppState();

    return (
        <div class="mx-auto my-2 max-w-3xl grow rounded-4xl border border-neutral-200 bg-white p-4">
            <div class="mb-4 flex items-center gap-2">
                <Settings2Icon />
                <h2 class="text-2xl font-semibold tracking-tight text-black">
                    {appState.translate(Phrase.InstanceProperties, undefined)}
                </h2>
            </div>
            <Button>{appState.translate(Phrase.Compact, undefined)}</Button>
        </div>
    );
};
