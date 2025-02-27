import { Dispatch, SetStateAction } from "react";
import { useLocalStorage, useReadLocalStorage } from "usehooks-ts";

import {
    ChartDisplayOptions,
    isValidCombatLogChartCategoryType,
    isValidCombatLogChartType,
} from "../../types/combatLogTypes";
import { Spoiler, ThemeType, isValidSpoilerType, isValidThemeType } from "../../types/commonTypes";

const localStorageCombatLogChartDisplayOptions = "combatLogChartDisplayOptions";
const localStorageLastLocationName = "lastLocation";
const localStoragePrereleasesName = "prerelease";
const localStorageSpoilersName = "spoilers";
const localStorageThemeName = "theme";
const localStorageWikiEntriesName = "wikiEntries";

type SetValue<T> = Dispatch<SetStateAction<T>>;

export type SavedWikiEntry = {
    name: string;
    content: string;
};

export type SavedWikiEntries = {
    entries: SavedWikiEntry[];
};

export function useSpoilers() {
    return useValue<Spoiler>(localStorageSpoilersName, "None", isValidSpoilerType);
}

export function useEditableSpoilers() {
    return useEditableValue<Spoiler>(localStorageSpoilersName, "None", isValidSpoilerType);
}

export function useLastLocation() {
    return useEditableValue<string>(localStorageLastLocationName, "/");
}

export function useTheme() {
    return useValue<ThemeType>(localStorageThemeName, "Dark", isValidThemeType);
}

export function useEditableTheme() {
    return useEditableValue<ThemeType>(localStorageThemeName, "Dark", isValidThemeType);
}

export function usePrerelease() {
    return useValue<boolean>(localStoragePrereleasesName, false);
}

export function useEditablePrerelease() {
    return useEditableValue<boolean>(localStoragePrereleasesName, false);
}

export function useChartDisplayOptions(): [ChartDisplayOptions, SetValue<ChartDisplayOptions>] {
    const [chartDisplayOptions, setChartDisplayOptions] = useLocalStorage<ChartDisplayOptions>(
        localStorageCombatLogChartDisplayOptions,
        {
            category: "Bot",
            chartType: "Pie",
        },
    );
    if (!isValidCombatLogChartCategoryType(chartDisplayOptions.category)) {
        chartDisplayOptions.category = "Bot";
    }
    if (!isValidCombatLogChartType(chartDisplayOptions.chartType)) {
        chartDisplayOptions.chartType = "Bar";
    }

    return [chartDisplayOptions, setChartDisplayOptions];
}

export function useEditableWikiEntryEdits() {
    return useEditableValue<SavedWikiEntries>(localStorageWikiEntriesName, { entries: [] });
}

function useValue<T>(key: string, defaultValue: T, validator?: (value: T) => boolean): T {
    let value = useReadLocalStorage<T>(key) || defaultValue;
    if (validator && !validator(value)) {
        value = defaultValue;
    }

    return value;
}

function useEditableValue<T>(key: string, defaultValue: T, validator?: (value: T) => boolean): [T, SetValue<T>] {
    let [value, setValue] = useLocalStorage<T>(key, defaultValue) || defaultValue;
    if (validator && !validator(value)) {
        value = defaultValue;
    }

    return [value, setValue];
}
