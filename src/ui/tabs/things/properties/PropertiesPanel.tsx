import {Button as KobalteButton} from "@kobalte/core/button";
import PlusIcon from "lucide-solid/icons/plus";
import TablePropertiesIcon from "lucide-solid/icons/table-properties";
import XIcon from "lucide-solid/icons/x";
import {Index, Show} from "solid-js";

import {useConnections, usePreferences} from "@/context";
import {Phrase} from "@/i18n/phrases";
import {defaultObject} from "@/model";
import type {Atom} from "@/model/atoms";
import {createAtomName} from "@/ui/objects/createAtomName";
import {ObjectSelectionContext} from "@/ui/objects/selection";
import {handleHistoryKeyDown} from "@/ui/objects/undoRedoKeys";
import Button from "@/ui/reuse/Button";
import WidthMeasurer from "@/ui/reuse/WidthMeasurer";

import CopyAtomIdButton from "./CopyAtomIdButton";
import {createPropertySync} from "./createPropertySync";
import PropertyRow from "./PropertyRow";

/**
 * Horizontal space taken by the per-property remove button and the gap before
 * it, in px.
 */
const REMOVE_BUTTON_SPACE = 48;

export default (props: {selectedAtom: Atom; close: () => void}) => {
    const connections = useConnections();
    const preferences = usePreferences();
    const name = createAtomName(() => props.selectedAtom);
    const {history, values} = createPropertySync(() => props.selectedAtom);

    const addProperty = () => {
        if (!connections.connectionClient()) return;

        // A fresh object so it is not confused with any other property.
        history.pushObjects([...history.objects(), {...defaultObject}]);
    };

    const removeProperty = (index: number) => {
        history.pushObjects(history.objects().filter((_, i) => i !== index));
    };

    return (
        <div
            class="relative flex size-full flex-col gap-2 rounded-4xl border border-line-subtle bg-surface-panel p-2"
            tabIndex={0}
            onKeyDown={event => {
                handleHistoryKeyDown(event, history);

                // Up/down navigation from the panel itself (e.g. right after
                // opening it) selects the first/last property. Navigation
                // between selected properties is handled by the object views.
                if (
                    event.target !== event.currentTarget
                    || event.ctrlKey
                    || event.metaKey
                    || event.altKey
                )
                    return;

                const propertyCount = history.objects().length;
                if (propertyCount === 0) return;

                if (event.key === "ArrowDown") {
                    event.preventDefault();
                    history.objectSelection.focusPath([0]);
                } else if (event.key === "ArrowUp") {
                    event.preventDefault();
                    history.objectSelection.focusPath([propertyCount - 1]);
                }
            }}
        >
            <div class="flex items-center gap-2 py-2 pr-12 pl-2">
                <TablePropertiesIcon class="shrink-0" />
                <h2 class="flex min-w-0 items-center gap-1 text-xl font-semibold text-fg-strong">
                    <span class="shrink-0">
                        {preferences.translate(Phrase.PropertiesOf, undefined)}
                    </span>
                    <span class="min-w-0 truncate font-bold text-primary-fg italic">
                        {name() ?? String(props.selectedAtom.value)}
                    </span>
                </h2>
            </div>
            <KobalteButton
                class="absolute top-2 right-2 rounded-2xl p-2 hover:bg-surface-hover"
                aria-label={preferences.translate(
                    Phrase.CloseProperties,
                    undefined,
                )}
                title={preferences.translate(Phrase.CloseProperties, undefined)}
                onClick={() => {
                    props.close();
                }}
            >
                <XIcon />
            </KobalteButton>

            <div class="flex flex-wrap items-center gap-2 px-2">
                <Button
                    class="flex w-fit gap-0.5"
                    disabled={values() === undefined}
                    onClick={addProperty}
                >
                    <PlusIcon />
                    <span class="pr-1">
                        {preferences.translate(Phrase.AddProperty, undefined)}
                    </span>
                </Button>
                <CopyAtomIdButton atom={props.selectedAtom} />
            </div>

            <WidthMeasurer class="mt-2 flex flex-col gap-2 px-2">
                {widthBudgetInPixels => (
                    <ObjectSelectionContext.Provider
                        value={history.objectSelection}
                    >
                        <Show
                            when={values()}
                            fallback={
                                <>
                                    {preferences.translate(
                                        Phrase.LoadingProperties,
                                        undefined,
                                    )}
                                </>
                            }
                        >
                            <Show
                                when={history.objects().length > 0}
                                fallback={
                                    <p class="rounded-2xl border border-line-subtle bg-surface-sunken p-3 text-sm text-fg-muted">
                                        {preferences.translate(
                                            Phrase.NoProperties,
                                            undefined,
                                        )}
                                    </p>
                                }
                            >
                                <Index each={history.objects()}>
                                    {(object, index) => (
                                        <PropertyRow
                                            object={object()}
                                            index={index}
                                            siblingCount={
                                                history.objects().length
                                            }
                                            widthBudgetInPixels={Math.max(
                                                widthBudgetInPixels()
                                                    - REMOVE_BUTTON_SPACE,
                                                0,
                                            )}
                                            setObject={newObject => {
                                                if (newObject === undefined) {
                                                    removeProperty(index);
                                                    return;
                                                }

                                                history.pushObject(
                                                    index,
                                                    newObject,
                                                );
                                            }}
                                            remove={() => removeProperty(index)}
                                        />
                                    )}
                                </Index>
                            </Show>
                        </Show>
                    </ObjectSelectionContext.Provider>
                )}
            </WidthMeasurer>
        </div>
    );
};
