import {useAppState} from "@/context";
import {Phrase} from "@/i18n/phrases";
import {System} from "@/state/common";
import {Theme, type ThemeSetting} from "@/state/theme";
import Select from "@/ui/reuse/Select";

type ThemeSettingStringId = "system" | "dark" | "light";

const themeToPhrase = {
    [Theme.Dark]: Phrase.Dark,
    [Theme.Light]: Phrase.Light,
    [System]: Phrase.System,
} as const satisfies Record<ThemeSetting, Phrase>;

const themeSettingToStringId = {
    [Theme.Dark]: "dark",
    [Theme.Light]: "light",
    [System]: "system",
} as const satisfies Record<ThemeSetting, ThemeSettingStringId>;

const themeSettingFromStringId = {
    dark: Theme.Dark,
    light: Theme.Light,
    system: System,
} as const satisfies Record<ThemeSettingStringId, ThemeSetting>;

export default () => {
    const appState = useAppState();

    return (
        <Select<ThemeSetting, ThemeSettingStringId>
            class="contents"
            description={<>{appState.translate(Phrase.Theme, undefined)}</>}
            value={appState.state.themeSetting}
            onChange={newTheme => {
                appState.setThemeSetting(newTheme);
            }}
            options={[System, Theme.Light, Theme.Dark]}
            stringifyValue={value =>
                appState.translate(themeToPhrase[value], undefined)
            }
            idFromValue={value => themeSettingToStringId[value]}
            idToValue={id => themeSettingFromStringId[id]}
        />
    );
};
