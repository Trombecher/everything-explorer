import type {Accessor, Setter} from "solid-js";
import {createSignal} from "solid-js";
import {type SetStoreFunction, createStore, produce} from "solid-js/store";

import {Tab} from "@/state/common";
import type {ObjectHistory} from "@/ui/objects/history";
import {
    defaultBlockLayoutOptions,
    type LayoutOptions,
} from "@/ui/objects/layout";
import type {DeepReadonly} from "@/util";

import {type ClipboardState, createClipboardState} from "./clipboard";
import {enforceInvariants} from "./connections";
import {type ConnectionState, createConnectionState} from "./connectionState";
import {createEvaluateHistory} from "./evaluate";
import type {AppStateStore} from "./internal";
import {type NavigationState, createNavigationState} from "./navigationState";
import {
    type PreferencesState,
    createPreferencesState,
} from "./preferencesState";
import {defaultAppStateData, type InternalAppState} from "./types";

/**
 * The application state.
 *
 * The persisted part lives in a single store, such that every change to a
 * persisted field can be written to disk by one persistence effect. Feature
 * modules are composed here and expose narrower, guarded surfaces. They never
 * receive the raw store setter; all mutations go through a commit function that
 * enforces the state invariants.
 */
export class AppState {
    public readonly state: DeepReadonly<InternalAppState>;
    private readonly setState: SetStoreFunction<InternalAppState>;

    /**
     * Connections to knowledge bases and the client of the active connection.
     */
    public readonly connections: ConnectionState;

    /**
     * Language and theme preferences.
     */
    public readonly preferences: PreferencesState;

    /**
     * The virtual clipboard.
     */
    public readonly clipboard: ClipboardState;

    /**
     * The current tab and sidebar state.
     */
    public readonly navigation: NavigationState;

    /**
     * Layout options of all object views.
     *
     * This is runtime state, not part of the persisted app state.
     */
    public readonly layoutOptions: Accessor<LayoutOptions>;
    public readonly setLayoutOptions: Setter<LayoutOptions>;

    /**
     * Object, undo/redo history and selection of the evaluate tab.
     *
     * This is runtime state, not part of the persisted app state. It lives here
     * so that it survives tab changes.
     */
    public readonly evaluateHistory: ObjectHistory;

    /**
     * Width of the properties panel of the things tab in px.
     *
     * This is runtime state, not part of the persisted app state.
     */
    public readonly propertiesPanelWidth: Accessor<number>;
    public readonly setPropertiesPanelWidth: Setter<number>;

    /**
     * Width of the clipboard panel on the right of the app in px.
     *
     * This is runtime state, not part of the persisted app state.
     */
    public readonly clipboardPanelWidth: Accessor<number>;
    public readonly setClipboardPanelWidth: Setter<number>;

    /**
     * The text of the atom search field in the things tab.
     *
     * This is runtime state, not part of the persisted app state. It lives here
     * (and not in the things tab) so that the search survives tab changes, and
     * so that other tabs can preselect an atom by setting its id as the text.
     */
    public readonly atomsSearchText: Accessor<string>;
    public readonly setAtomsSearchText: Setter<string>;

    constructor(initial: InternalAppState) {
        enforceInvariants(initial);

        const [state, setState] = createStore<InternalAppState>(initial);

        this.state = state;
        this.setState = setState;

        const commit = (mutate: (draft: InternalAppState) => void) => {
            setState(
                produce(draft => {
                    mutate(draft);
                    enforceInvariants(draft);
                }),
            );
        };

        const store: AppStateStore = {state, commit};

        const navigation = createNavigationState(store);
        this.navigation = navigation;

        this.preferences = createPreferencesState(store);

        this.clipboard = createClipboardState(store);

        // Layout options
        const [layoutOptions, setLayoutOptions] = createSignal<LayoutOptions>({
            atomNames: new Map(),
            block: defaultBlockLayoutOptions,
        });

        this.layoutOptions = layoutOptions;
        this.setLayoutOptions = setLayoutOptions;

        // Atom search text
        const [atomsSearchText, setAtomsSearchText] = createSignal("");

        this.atomsSearchText = atomsSearchText;
        this.setAtomsSearchText = setAtomsSearchText;

        this.connections = createConnectionState(store, {
            onConnectionChanged: client => {
                // Atom names and the atom search belong to a specific
                // knowledge base, so drop them when the client changes.
                setLayoutOptions(previous =>
                    previous.atomNames.size === 0
                        ? previous
                        : {...previous, atomNames: new Map()},
                );

                setAtomsSearchText("");

                // Tabs that show knowledge base contents do not make sense
                // while disconnected.
                if (client === undefined) {
                    const currentTab = navigation.currentTab();

                    if (
                        currentTab === Tab.InstanceProperties
                        || currentTab === Tab.Things
                        || currentTab === Tab.Evaluate
                    ) {
                        navigation.setCurrentTab(Tab.Home);
                    }
                }
            },
        });

        // Evaluate history
        this.evaluateHistory = createEvaluateHistory();

        // Properties panel width
        const [propertiesPanelWidth, setPropertiesPanelWidth] =
            createSignal(600);

        this.propertiesPanelWidth = propertiesPanelWidth;
        this.setPropertiesPanelWidth = setPropertiesPanelWidth;

        // Clipboard panel width
        const [clipboardPanelWidth, setClipboardPanelWidth] = createSignal(340);

        this.clipboardPanelWidth = clipboardPanelWidth;
        this.setClipboardPanelWidth = setClipboardPanelWidth;
    }

    public reset() {
        this.setState(defaultAppStateData());
    }
}
