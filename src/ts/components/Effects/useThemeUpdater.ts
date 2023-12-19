import { useBodyDataAttribute } from "./useBodyDataAttribute";
import { useTheme } from "./useLocalStorageValue";

// Automatically updates the page-wide theme based on the local storage setting
export default function useThemeUpdater() {
    const theme = useTheme();

    useBodyDataAttribute("data-theme", theme);
}
