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
    explanation: string;
};
const pages: Record<PageType, PageDetails> = {
    About: {
        label: "About",
        link: "about.html",
        explanation: "",
    },
    Bots: {
        label: "Bots",
        link: "bots.html",
        explanation:
            "A robot reference. This page contains a (should be) complete reference of " +
            "known bot information (parts, resistances, and other special stats) along with some basic search " +
            "filters. Bot names can be clicked to display bot information in a popup, and part names inside " +
            "of those popups can be clicked to display another part info popup.",
    },
    Build: {
        label: "Build",
        link: "build.html",
        explanation:
            "A build creator/planner. Allows for creating a build loadout and view some detailed stats " +
            "like the ones that are shown in-game. Some overall build summary stats are always shown up at " +
            'the top, while more individual part stats are available through the "Part Info" buttons. ' +
            "All stats are updated whenever any part is added, removed, or modified.",
    },
    Combat: {
        label: "Combat",
        link: "combat.html",
        explanation:
            "A combat log analyzer. Combat logs from Beta 13 runs can be uploaded and analyzed to display " +
            "a breakdown of damage dealt and taken from different sources.",
    },
    Hacks: {
        label: "Hacks",
        link: "hacks.html",
        explanation:
            "A machine hacking reference. Lists all available hacks for each type of machine as well " +
            "as their success rates. Entering hackware bonuses or other modifiers will update the odds " +
            "of each hack.",
    },
    Lore: {
        label: "Lore",
        link: "lore.html",
        explanation: "A lore reference. Lists all lore entries in the game and allows searching for specific entries.",
    },
    Parts: {
        label: "Parts",
        link: "parts.html",
        explanation:
            "A parts reference. This page lists the stats of all known parts in Cogmind. Most parts " +
            "come directly from the in-game gallery export, and the remainder (usually enemy-unique " +
            "unequippable parts) are manually entered. There are many ways to sort and filter the parts, " +
            "as well as three ways to view and compare the parts (info popup, part-to-part comparison, " +
            "and spreadsheet).",
    },
    RIF: {
        label: "RIF",
        link: "rif.html",
        explanation:
            "A RIF ability and bothacking reference. This page lists all RIF abilities and their effects, " +
            "as well as all 0b10 hacks, their coupler charge usage, and effects.",
    },
    Simulator: {
        label: "Simulator",
        link: "simulator.html",
        explanation:
            "A combat simulator. This page allows simulating a 1-on-1 combat with any bot in the game " +
            "with a given offensive loadout. Select an enemy, weapons, and any number of other various " +
            "combat-related utilities/stats, and then hit the Simulate button to kick off the simulator. " +
            "once complete, a graph of the number of volleys to kill is shown. Multiple simulations can be " +
            'compared by giving each dataset a name and clicking the "Add to comparison" button.',
    },
    Wiki: {
        label: "Wiki",
        link: "wiki.html",
        explanation: "A Cogmind wiki.",
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
            <ButtonLink
                activeLink={PageType === p}
                tooltip={pageInfo.explanation}
                key={pageInfo.label}
                href={pageInfo.link}
            >
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
                    <TextTooltip tooltipText={pageDetails.explanation}>
                        <span className="page-explanation">?</span>
                    </TextTooltip>
                </div>
                <SettingsButton />
            </div>
            <PageButtons pageType={pageType} />
        </>
    );
}
