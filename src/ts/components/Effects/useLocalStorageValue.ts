import { Dispatch, SetStateAction } from "react";
import { useLocalStorage, useReadLocalStorage } from "usehooks-ts";

import {
    ChartDisplayOptions,
    isValidCombatLogChartCategoryType,
    isValidCombatLogChartType,
} from "../../types/combatLogTypes";
import { Spoiler, ThemeType, isValidSpoilerType, isValidThemeType } from "../../types/commonTypes";

const localStorageCombatLogChartDisplayOptions = "combatLogChartDisplayOptions";
const localStorageSpoilersName = "spoilers";
const localStorageThemeName = "theme";

type SetValue<T> = Dispatch<SetStateAction<T>>;

export function useSpoilers() {
    return useValue<Spoiler>(localStorageSpoilersName, "None", isValidSpoilerType);
}

export function useEditableSpoilers() {
    return useEditableValue<Spoiler>(localStorageSpoilersName, "None", isValidSpoilerType);
}

export function useTheme() {
    return useValue<ThemeType>(localStorageThemeName, "Dark", isValidThemeType);
}

export function useEditableTheme() {
    return useEditableValue<ThemeType>(localStorageThemeName, "Dark", isValidThemeType);
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

function useValue<T>(key: string, defaultValue: T, validator: (value: T) => boolean): T {
    let value = useReadLocalStorage<T>(key) || defaultValue;
    if (!validator(value)) {
        value = defaultValue;
    }

    return value;
}

function useEditableValue<T>(key: string, defaultValue: T, validator: (value: T) => boolean): [T, SetValue<T>] {
    let [value, setValue] = useLocalStorage<T>(key, defaultValue) || defaultValue;
    if (!validator(value)) {
        value = defaultValue;
    }

    return [value, setValue];
}
