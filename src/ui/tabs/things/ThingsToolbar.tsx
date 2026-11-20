import LayoutGridIcon from "lucide-solid/icons/layout-grid";
import PlusIcon from "lucide-solid/icons/plus";
import SearchIcon from "lucide-solid/icons/search";
import XIcon from "lucide-solid/icons/x";
import {Show} from "solid-js";

import {usePreferences} from "@/context";
import {Phrase} from "@/i18n/phrases";
import Button from "@/ui/reuse/Button";

export default (props: {
    searchValue: string;
    onSearchValueChange: (value: string) => void;
    isSearchExpanded: boolean;
    onSearchExpandedChange: (expanded: boolean) => void;
    onAddThing: () => void;
    addThingDisabled: boolean;
}) => {
    const preferences = usePreferences();

    const searchToggleLabel = () =>
        preferences.translate(
            props.isSearchExpanded ? Phrase.CloseSearch : Phrase.SearchThings,
            undefined,
        );

    return (
        <div class="@container">
            <div class="flex flex-wrap items-center gap-2 px-2 text-fg-strong">
                <LayoutGridIcon class="shrink-0" />
                <h2 class="shrink-0 text-xl font-semibold">
                    {preferences.translate(Phrase.Things, undefined)}
                </h2>
                <label class="mx-2 flex grow items-center rounded-2xl border border-line-subtle bg-surface-sunken pl-2 focus-within:outline-2 @max-md:hidden">
                    <SearchIcon />
                    <input
                        type="search"
                        placeholder={preferences.translate(
                            Phrase.SearchByAtomId,
                            undefined,
                        )}
                        value={props.searchValue}
                        onInput={e => {
                            props.onSearchValueChange(e.currentTarget.value);
                        }}
                        class="block w-0 grow py-2 pr-3 pl-2 outline-none"
                    />
                </label>
                <button
                    onClick={() =>
                        props.onSearchExpandedChange(!props.isSearchExpanded)
                    }
                    aria-label={searchToggleLabel()}
                    title={searchToggleLabel()}
                    class="ml-auto flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-2xl text-fg-muted hover:bg-surface-hover @min-md:hidden"
                >
                    <Show
                        when={props.isSearchExpanded}
                        fallback={<SearchIcon />}
                    >
                        <XIcon />
                    </Show>
                </button>
                <Button
                    onClick={props.onAddThing}
                    disabled={props.addThingDisabled}
                    aria-label={preferences.translate(
                        Phrase.AddThing,
                        undefined,
                    )}
                    class="flex gap-0.5"
                >
                    <PlusIcon />
                    <span class="pr-1 @max-xs:hidden">
                        {preferences.translate(Phrase.AddThing, undefined)}
                    </span>
                </Button>
            </div>
            <Show when={props.isSearchExpanded}>
                <label class="mt-2 flex w-full items-center rounded-2xl border border-line-subtle bg-surface-sunken pl-2 focus-within:outline-2 @min-md:hidden">
                    <SearchIcon />
                    <input
                        type="search"
                        placeholder={preferences.translate(
                            Phrase.SearchByAtomId,
                            undefined,
                        )}
                        value={props.searchValue}
                        ref={el => queueMicrotask(() => el.focus())}
                        onInput={e => {
                            props.onSearchValueChange(e.currentTarget.value);
                        }}
                        onKeyDown={e => {
                            if (e.key === "Escape") {
                                props.onSearchExpandedChange(false);
                            }
                        }}
                        class="block min-w-0 grow py-2 pr-3 pl-2 outline-none"
                    />
                </label>
            </Show>
        </div>
    );
};
