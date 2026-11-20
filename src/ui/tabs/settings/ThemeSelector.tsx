import {usePreferences} from "@/context";
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
    const preferences = usePreferences();

    return (
        <Select<ThemeSetting, ThemeSettingStringId>
            class="contents"
            description={<>{preferences.translate(Phrase.Theme, undefined)}</>}
            value={preferences.themeSetting()}
            onChange={newTheme => {
                preferences.setThemeSetting(newTheme);
            }}
            options={[System, Theme.Light, Theme.Dark]}
            stringifyValue={value =>
                preferences.translate(themeToPhrase[value], undefined)
            }
            idFromValue={value => themeSettingToStringId[value]}
            idToValue={id => themeSettingFromStringId[id]}
        />
    );
};
