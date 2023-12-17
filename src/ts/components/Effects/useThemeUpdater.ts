import { useReadLocalStorage } from "usehooks-ts";
import { localStorageThemeName, ThemeType } from "../../types/commonTypes";
import { useBodyDataAttribute } from "./useBodyDataAttribute";

export default function useThemeUpdater() {
    const theme = useReadLocalStorage<ThemeType>(localStorageThemeName) || "Dark";
    console.log(theme);

    useBodyDataAttribute("data-theme", theme);
}
