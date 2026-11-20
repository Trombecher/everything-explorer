import type {Accessor, Setter} from "solid-js";
import {createEffect, createSignal, on} from "solid-js";
import {type SetStoreFunction, createStore, produce} from "solid-js/store";

import {Tab} from "@/state/common";
import type {ObjectHistory} from "@/ui/objects/history";
import {
    defaultBlockLayoutOptions,
    type LayoutOptions,
} from "@/ui/objects/layout";
import type {DeepReadonly} from "@/util";

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
     * Id of the atom whose properties are open in the things tab.
     *
     * This is runtime state, not part of the persisted app state. It lives here
     * (and not in the things tab) so that it survives tab changes and other
     * tabs can preselect an atom before switching to the things tab.
     */
    public readonly selectedAtomId: Accessor<bigint | undefined>;
    public readonly setSelectedAtomId: Setter<bigint | undefined>;

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

        this.connections = createConnectionState(store, {
            onDisconnected: () => {
                const currentTab = navigation.currentTab();

                if (
                    currentTab === Tab.InstanceProperties
                    || currentTab === Tab.Things
                    || currentTab === Tab.Evaluate
                ) {
                    navigation.setCurrentTab(Tab.Home);
                }
            },
        });

        // Layout options
        const [layoutOptions, setLayoutOptions] = createSignal<LayoutOptions>({
            atomNames: new Map(),
            block: defaultBlockLayoutOptions,
        });

        this.layoutOptions = layoutOptions;
        this.setLayoutOptions = setLayoutOptions;

        // Evaluate history
        this.evaluateHistory = createEvaluateHistory();

        // Properties panel width
        const [propertiesPanelWidth, setPropertiesPanelWidth] =
            createSignal(600);

        this.propertiesPanelWidth = propertiesPanelWidth;
        this.setPropertiesPanelWidth = setPropertiesPanelWidth;

        // Selected atom id
        const [selectedAtomId, setSelectedAtomId] = createSignal<
            bigint | undefined
        >(undefined);

        this.selectedAtomId = selectedAtomId;
        this.setSelectedAtomId = setSelectedAtomId;

        // Atom names belong to a specific knowledge base, so drop them when
        // reconnecting. The selected atom belongs to the knowledge base as
        // well, so drop it too.
        createEffect(
            on(
                this.connections.connectionClient,
                () => {
                    setLayoutOptions(previous =>
                        previous.atomNames.size === 0
                            ? previous
                            : {...previous, atomNames: new Map()},
                    );

                    setSelectedAtomId(undefined);
                },
                {defer: true},
            ),
        );
    }

    public reset() {
        this.setState(defaultAppStateData());
    }
}
