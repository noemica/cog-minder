import { Dispatch, SetStateAction } from "react";
import { useLocalStorage, useReadLocalStorage } from "usehooks-ts";

import { Spoiler, ThemeType, isValidSpoilerType, isValidThemeType } from "../../types/commonTypes";

const localStorageSpoilersName = "spoilers";
const localStorageThemeName = "theme";

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

function useValue<T>(key: string, defaultValue: T, validator: (value: T) => boolean): T {
    let value = useReadLocalStorage<T>(key) || defaultValue;
    if (!validator(value)) {
        value = defaultValue;
    }

    return value;
}

function useEditableValue<T>(
    key: string,
    defaultValue: T,
    validator: (value: T) => boolean,
): [T, Dispatch<SetStateAction<T>>] {
    let [value, setValue] = useLocalStorage<T>(key, defaultValue) || defaultValue;
    if (!validator(value)) {
        value = defaultValue;
    }

    return [value, setValue];
}
