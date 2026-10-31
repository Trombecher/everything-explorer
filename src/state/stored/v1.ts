type StoredLanguageSetting = "en-US" | "de";

type StoredThemeSetting = "dark" | "light";

export type StoredAppState = {
    /**
     * Default: system.
     */
    languageSetting?: StoredLanguageSetting;

    /**
     * Default: system
     */
    themeSetting?: StoredThemeSetting;

    /**
     * Default: empty array.
     */
    connections?: StoredConnection[];
};

type StoredConnection = (
    | {type: "local"; filePath: string}
    | {type: "remote"; url: string}
) & {name: string};
