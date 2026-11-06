import AtomIcon from "lucide-solid/icons/atom";
import {
    createComputed,
    createEffect,
    createResource,
    createSignal,
} from "solid-js";

import {useAppState} from "@/context";
import {ObjectType} from "@/model";
import {Atom} from "@/model/atoms";

import {
    cacheAtomNames,
    formatAtomNames,
    noteAtomNamesConnection,
} from "./atomNames";

const MAX_ATOM_VALUE = (1n << 128n) - 1n;

export default (props: {
    atom: Atom;
    setAtom: ((newAtom: Atom) => void) | undefined;
}) => {
    const appState = useAppState();

    const [names] = createResource(
        () => {
            const connectionClient = appState.connectionClient();
            return connectionClient && {connectionClient, atom: props.atom};
        },
        ({connectionClient, atom}) => {
            noteAtomNamesConnection(connectionClient.url);

            return connectionClient.constructionValuesOfObject(atom, Atom.Name);
        },
    );

    createEffect(() => {
        const atomNames = names();

        if (atomNames) cacheAtomNames(props.atom, atomNames);
    });

    const label = () => {
        const atomNames = names();

        if (!atomNames || atomNames.length === 0) {
            return String(props.atom.value);
        }

        return formatAtomNames(atomNames);
    };

    const [text, setText] = createSignal("");
    const [editing, setEditing] = createSignal(false);

    createComputed(() => {
        if (!editing()) setText(String(props.atom.value));
    });

    const displayedText = () => (editing() ? text() : label());

    return (
        <span class="flex items-center gap-1">
            <AtomIcon />
            <input
                value={displayedText()}
                readOnly={!props.setAtom}
                spellcheck={false}
                title={label()}
                onFocus={() => {
                    if (!props.setAtom) return;

                    setText(String(props.atom.value));
                    setEditing(true);
                }}
                onKeyDown={e => {
                    if (e.key === "Enter") {
                        e.currentTarget.blur();
                    } else if (e.key === "Escape") {
                        setText(String(props.atom.value));
                        e.currentTarget.blur();
                    }
                }}
                onBlur={() => {
                    const newText = text().trim();

                    if (props.setAtom && newText.length > 0) {
                        try {
                            const value = BigInt(newText);

                            if (value >= 0n && value <= MAX_ATOM_VALUE) {
                                if (value !== props.atom.value) {
                                    props.setAtom({
                                        type: ObjectType.Atom,
                                        value,
                                    });
                                }
                            }
                        } catch {}
                    }

                    setEditing(false);
                }}
                onInput={e => {
                    setText(e.currentTarget.value);
                }}
                class="block field-sizing-content"
            />
        </span>
    );
};
