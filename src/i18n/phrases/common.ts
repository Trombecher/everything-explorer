const AppSettings = Symbol();
const ToggleSidebar = Symbol();
const Compact = Symbol();
const Greeting = Symbol();
const InstanceProperties = Symbol();
const Add = Symbol();
const Cancel = Symbol();
const Version = Symbol();
const Home = Symbol();
const WelcomeBack = Symbol();
const Debug = Symbol();
const Loading = Symbol();
const Reload = Symbol();
const Views = Symbol();
const SidePanel = Symbol();

export const commonPhrases = {
    AppSettings,
    ToggleSidebar,
    Compact,
    Greeting,
    InstanceProperties,
    Add,
    Cancel,
    Version,
    Home,
    WelcomeBack,
    Debug,
    Loading,
    Reload,
    Views,
    SidePanel,
} as const;

export type CommonTranslationArguments = {
    [AppSettings]: undefined;
    [ToggleSidebar]: undefined;
    [Compact]: undefined;
    [Greeting]: {forName: string};
    [InstanceProperties]: undefined;
    [Add]: undefined;
    [Cancel]: undefined;
    [Version]: undefined;
    [Home]: undefined;
    [WelcomeBack]: undefined;
    [Debug]: undefined;
    [Loading]: undefined;
    [Reload]: undefined;
    [Views]: undefined;
    [SidePanel]: undefined;
};
