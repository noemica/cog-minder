import { PageType, Spoiler, ThemeType } from "../../types/commonTypes";
import { ButtonLink } from "../Buttons/Button";
import { useEditableSpoilers, useEditableTheme } from "../Effects/useLocalStorageValue";
import { LabeledSelect } from "../LabeledItem/LabeledItem";
import { SelectOptionType } from "../Selectpicker/Select";
import ButtonPopover from "../Tooltip/ButtonPopover";
import TextTooltip from "../Tooltip/TextTooltip";

import "./PageHeader.less";

export type PageHeaderProps = {
    pageType: PageType;
};

const spoilerOptions: SelectOptionType<Spoiler>[] = [
    { value: "None", label: "None", tooltip: "No spoilers: Factory or higher depth branch content is hidden." },
    {
        value: "Spoiler",
        label: "Spoilers",
        tooltip: "Moderate spoilers: Normal Factory and Research branch content is shown.",
    },
    { value: "Redacted", label: "Redacted", tooltip: "Full spoilers: All game content is shown" },
];

const themeOptions: SelectOptionType[] = [
    { value: "Dark", label: "Dark", tooltip: "Use a more typical dark mode theme." },
    { value: "Cogmind", label: "Cogmind", tooltip: "Use a Cogmind-styled dark mode website theme." },
];

type PageDetails = {
    label: string;
    link: string;
    explanation?: string;
};
const pages: Record<PageType, PageDetails> = {
    About: {
        label: "About",
        link: "about.html",
    },
    Bots: {
        label: "Bots",
        link: "bots.html",
    },
    Build: {
        label: "Build",
        link: "build.html",
    },
    Combat: {
        label: "Combat",
        link: "combat.html",
        explanation:
            "A combat log analyzer. Combat logs from Beta 13 runs can be uploaded and analyzed to display a breakdown of damage dealt and taken from different sources.",
    },
    Hacks: {
        label: "Hacks",
        link: "hacks.html",
    },
    Lore: {
        label: "Lore",
        link: "lore.html",
    },
    Parts: {
        label: "Parts",
        link: "parts.html",
    },
    RIF: {
        label: "RIF",
        link: "rif.html",
    },
    Simulator: {
        label: "Simulator",
        link: "simulator.html",
    },
    Wiki: {
        label: "Wiki",
        link: "wiki.html",
    },
};

function PageButtons({ pageType: PageType }) {
    const pageTypes: PageType[] = [
        "About",
        "Bots",
        "Build",
        "Combat",
        "Hacks",
        "Lore",
        "Parts",
        "RIF",
        "Simulator",
        "Wiki",
    ];

    const pageButtons = pageTypes.map((p) => {
        const pageInfo = pages[p];
        return (
            <ButtonLink activeLink={PageType === p} key={pageInfo.label} href={pageInfo.link}>
                {pageInfo.label}
            </ButtonLink>
        );
    });

    return <div className="navigation-buttons-container">{pageButtons}</div>;
}

function SettingsButton() {
    const [spoilers, setSpoilers] = useEditableSpoilers();
    const spoilerSelected = spoilerOptions.find((o) => o.value === spoilers) || spoilerOptions[0];

    const [theme, setTheme] = useEditableTheme();
    const themeSelected = themeOptions.find((t) => t.value === theme) || themeOptions[0];

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

export default function PageHeader({ pageType }: PageHeaderProps) {
    const pageDetails = pages[pageType];

    return (
        <>
            <div className="title-grid">
                <div className="cogminder-title">Cog-Minder</div>
                <div className="page-title-container">
                    <h1 className="page-title">{pageDetails.label}</h1>
                    {/* // TODO */}
                    <TextTooltip tooltipText={pageDetails.explanation ?? ""}>
                        <span className="page-explanation">?</span>
                    </TextTooltip>
                </div>
                <SettingsButton />
            </div>
            <PageButtons pageType={pageType} />
        </>
    );
}
