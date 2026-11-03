export const System = Symbol();

export namespace Tab {
    export const AllAtoms = Symbol();
    export const InstanceProperties = Symbol();
    export const AppSettings = Symbol();
    export const Home = Symbol();
    export const Debug = Symbol();
}

export type Tab =
    | typeof Tab.AllAtoms
    | typeof Tab.InstanceProperties
    | typeof Tab.AppSettings
    | typeof Tab.Home
    | typeof Tab.Debug;
