import { useLocalStorage } from "usehooks-ts";
import { SelectOptionType } from "../Selectpicker/Select";
import { LabeledSelect } from "../LabeledItem/LabeledItem";
import TextTooltip from "../Tooltip/TextTooltip";
import { Spoiler, ThemeType, localStorageThemeName } from "../../types/commonTypes";
import ButtonPopover from "../Tooltip/ButtonPopover";

import "./PageHeader.less";

export type PageHeaderProps = {
    type: PageType;
};

const spoilerOptions: SelectOptionType[] = [
    { value: "None", label: "None", tooltip: "No spoilers: Factory or higher depth branch content is hidden." },
    {
        value: "Spoilers",
        label: "Spoilers",
        tooltip: "Moderate spoilers: Normal Factory and Research branch content is shown.",
    },
    { value: "Redacted", label: "Redacted", tooltip: "Full spoilers: All game content is shown" },
];

const themeOptions: SelectOptionType[] = [
    { value: "Dark", label: "Dark", tooltip: "Use a more typical dark mode theme." },
    { value: "Cogmind", label: "Cogmind", tooltip: "Use a Cogmind-styled dark mode website theme." },
];

export type PageType = "Combat";
type PageDetails = {
    label: string;
    explanation: string;
};
const pages = new Map<PageType, PageDetails>([
    [
        "Combat",
        {
            label: "Combat",
            explanation:
                "A combat log analyzer. Combat logs from Beta 13 runs can be uploaded and analyzed to display a breakdown of damage dealt and taken from different sources.",
        },
    ],
]);

function SettingsButton() {
    const [spoilers, setSpoilers] = useLocalStorage<Spoiler>("spoilers", "None");
    const spoilerSelected = spoilerOptions.find((o) => o.label === spoilers) || spoilerOptions[0];

    const [theme, setTheme] = useLocalStorage<ThemeType>(localStorageThemeName, "Dark");
    const themeSelected = themeOptions.find((t) => t.label === theme) || themeOptions[0];

    return (
        <ButtonPopover buttonLabel="Settings" buttonTooltip="Change various site-wide settings">
            <div className="settings-popover-container">
                <LabeledSelect
                    label="Spoilers"
                    tooltip="What spoiler content to show. By default, no spoilers are shown."
                    className="spoilers-selectpicker"
                    isSearchable={false}
                    options={spoilerOptions}
                    value={spoilerSelected}
                    onChange={(newValue) => {
                        setSpoilers(newValue!.value as Spoiler);
                    }}
                />
                <LabeledSelect
                    label="Theme"
                    tooltip="Determines the overall website theme."
                    isSearchable={false}
                    options={themeOptions}
                    value={themeSelected}
                    onChange={(newValue) => {
                        setTheme(newValue!.value as ThemeType);
                    }}
                />
            </div>
        </ButtonPopover>
    );
}

export default function PageHeader({ type }: PageHeaderProps) {
    const pageDetails = pages.get(type)!;

    return (
        <div className="title-grid">
            <div className="cogminder-title">Cog-Minder</div>
            <div className="page-title-container">
                <h1 className="page-title">{pageDetails.label}</h1>
                <TextTooltip tooltipText={pageDetails.explanation}>
                    <span className="page-explanation">?</span>
                </TextTooltip>
            </div>
            <SettingsButton />
        </div>
    );
}
