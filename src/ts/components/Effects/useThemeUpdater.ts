import { useReadLocalStorage } from "usehooks-ts";

import { ThemeType, localStorageThemeName } from "../../types/commonTypes";
import { useBodyDataAttribute } from "./useBodyDataAttribute";

// Automatically updates the page-wide theme based on the local storage setting
export default function useThemeUpdater() {
    const theme = useReadLocalStorage<ThemeType>(localStorageThemeName) || "Dark";

    useBodyDataAttribute("data-theme", theme);
}
