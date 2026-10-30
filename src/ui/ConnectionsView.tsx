import {useAppState} from "@/context";

export default () => {
    const appState = useAppState();

    return (
        <div class="mx-auto my-3 max-w-2xl grow rounded-3xl border border-neutral-200 bg-white p-4">
            <h2 class="text-2xl font-semibold tracking-tight text-black">
                Manage Knowledge Base Connections
            </h2>
        </div>
    );
};
