import { Spoiler } from "../../../types/commonTypes";
import { canShowSpoiler } from "../../../utilities/common";
import Button from "../../Buttons/Button";
import { ExclusiveButtonDefinition } from "../../Buttons/ExclusiveButtonGroup";
import { useSpoilers } from "../../Effects/useLocalStorageValue";
import {
    LabeledExclusiveButtonGroup,
    LabeledInput,
    LabeledSelect,
    LabeledSelectGroup,
    SoloLabel,
} from "../../LabeledItem/LabeledItem";
import SelectWrapper, { SelectOptionType } from "../../Selectpicker/Select";
import {
    PartCategory,
    PartsPageMode,
    PartsPageState,
    PowerSlotType,
    PrimarySortOptions,
    PropulsionSlotType,
    SecondarySortOptions,
    SlotSearchType,
    SortDirection,
    TerminalSearchLevel,
    UtilitySlotType,
    WeaponSlotType,
} from "./PartsPage";

const modeButtons: ExclusiveButtonDefinition<PartsPageMode>[] = [
    {
        value: "Simple",
        tooltip: "Part name viewer with clickable parts to show part detail.",
    },
    {
        value: "Comparison",
        tooltip: "Side-by-side part comparison that shows details of both selected parts.",
    },
    {
        value: "Spreadsheet",
        tooltip: "Spreadsheet view that shows all applicable stats. Stats are filtered depending on the selected slot.",
    },
    {
        value: "Gallery",
        tooltip:
            "Gallery image viewer. Similar to simple view but shows the art of all parts in a grid as well as the names.",
    },
];

const slotButtons: ExclusiveButtonDefinition<SlotSearchType>[] = [
    { value: "Any" },
    { value: "N/A", label: "Other" },
    { value: "Power" },
    { value: "Propulsion" },
    { value: "Utility" },
    { value: "Weapon" },
];

const powerSlotTypeOptions: SelectOptionType<PowerSlotType>[] = [
    { value: "Any" },
    { value: "Engine" },
    { value: "Power Core" },
    { value: "Reactor" },
];

const propulsionSlotTypeOptions: SelectOptionType<PropulsionSlotType>[] = [
    { value: "Any" },
    { value: "Flight Unit" },
    { value: "Hover Unit" },
    { value: "Wheel" },
    { value: "Leg" },
    { value: "Treads" },
];

const utilitySlotTypeOptions: SelectOptionType<UtilitySlotType>[] = [
    { value: "Any" },
    { value: "Artifact" },
    { value: "Device" },
    { value: "Hackware" },
    { value: "Processor" },
    { value: "Protection" },
    { value: "Storage" },
];

const weaponSlotTypeOptions: SelectOptionType<WeaponSlotType>[] = [
    { value: "Any" },
    { value: "Ballistic Cannon" },
    { value: "Ballistic Gun" },
    { value: "Energy Cannon" },
    { value: "Energy Gun" },
    { value: "Launcher" },
    { value: "Impact Weapon" },
    { value: "Piercing Weapon" },
    { value: "Slashing Weapon" },
    { value: "Special Melee Weapon" },
    { value: "Special Weapon" },
];

const allSlotOptions: SelectOptionType[] = [];
allSlotOptions.push(...powerSlotTypeOptions);
allSlotOptions.push(...propulsionSlotTypeOptions.slice(1));
allSlotOptions.push(...utilitySlotTypeOptions.slice(1));
allSlotOptions.push(...weaponSlotTypeOptions.slice(1));
allSlotOptions.sort((a, b) => (a.value as string).localeCompare(b.value as string));

const allCategoryOptions: (SelectOptionType<PartCategory> & { spoiler?: Spoiler })[] = [
    { value: "Any", tooltip: "All parts." },
    {
        value: "0b10",
        tooltip: "Parts that can be found on any standard complex floors or complex-controlled branches.",
    },
    { value: "Alien", tooltip: "All Sigix-related alien artifacts." },
    {
        value: "Derelict",
        tooltip: "Derelict-created parts, either found in derelict-controlled areas or on unique derelicts.",
        spoiler: "Spoiler",
    },
    { value: "Architects", tooltip: "Parts found on Architect-faction related bots.", spoiler: "Redacted" },
    { value: "Exile", tooltip: "Exile vault items and unique Exile bot parts." },
    { value: "Golem", tooltip: "Parts created by the GOLEM Unit.", spoiler: "Spoiler" },
    { value: "Heroes", tooltip: "Parts unique to the Heroes of Zion.", spoiler: "Spoiler" },
    { value: "Lab", tooltip: "Parts that can be found in the hidden Lab.", spoiler: "Redacted" },
    { value: "Quarantine", tooltip: "Parts that can be found in Quarantine.", spoiler: "Spoiler" },
    { value: "Protoforge", tooltip: "Parts that can be found in Protoforge.", spoiler: "Redacted" },
    {
        value: "S7 Guarded",
        tooltip: "Parts that can be found in Section 7 suspension chambers guarded by S7 Guards.",
        spoiler: "Redacted",
    },
    { value: "S7 Hangar", tooltip: "Parts that can be found in the Section 7 spaceship chamber.", spoiler: "Redacted" },
    {
        value: "S7 LRC Lab",
        tooltip:
            "Parts that can be found in the Section 7 LRC label. LRC parts are found in the locked room with a Terminal, the others are found in suspension chambers.",
        spoiler: "Redacted",
    },
    {
        value: "S7 Unguarded",
        tooltip: "Parts that can be found in unguarded Section 7 suspension chambers.",
        spoiler: "Redacted",
    },
    { value: "Testing", tooltip: "Parts that can be found in Testing.", spoiler: "Spoiler" },
    { value: "Unobtainable", tooltip: "Parts that are not obtainable by normal gameplay." },
    {
        value: "UFD",
        tooltip: "Parts that can be found in Scraptown or are related to the United Federation of Derelicts",
        spoiler: "Spoiler",
    },
    { value: "Unchained", tooltip: "Parts found on 0b10 Unchained related bots.", spoiler: "Spoiler" },
    {
        value: "Warlord",
        tooltip: "Parts that are obtainable in the Warlord map, or on Warlord-aligned bots",
        spoiler: "Spoiler",
    },
    { value: "Zion", tooltip: "Parts that are obtainable in Zion.", spoiler: "Spoiler" },
    {
        value: "Zionite",
        tooltip:
            "Parts that are obtainable from Imprinter-aligned Zionites. Some are obtainable in Zion Deep Caves, and some are only obtainable by Imprinting.",
        spoiler: "Spoiler",
    },
];

const terminalLevelButtons: ExclusiveButtonDefinition<TerminalSearchLevel>[] = [
    { value: "Level 1" },
    { value: "Level 2" },
    { value: "Level 3" },
];

const primarySortOptions: SelectOptionType<PrimarySortOptions>[] = [
    { value: "Alphabetical" },
    { value: "Gallery" },
    { value: "Coverage" },
    { value: "Integrity" },
    { value: "Mass" },
    { value: "Rating" },
    { value: "Size" },
    { value: "Arc" },
    { value: "Critical" },
    { value: "Damage" },
    { value: "Delay" },
    { value: "Disruption" },
    { value: "Drag" },
    { value: "Energy/Move" },
    { value: "Energy Generation" },
    { value: "Energy Storage" },
    { value: "Energy Upkeep" },
    { value: "Explosion Radius" },
    { value: "Falloff" },
    { value: "Heat/Move" },
    { value: "Heat Generation" },
    { value: "Heat Transfer" },
    { value: "Matter Upkeep" },
    { value: "Penalty" },
    { value: "Projectile Count" },
    { value: "Range" },
    { value: "Recoil" },
    { value: "Salvage" },
    { value: "Shot Energy" },
    { value: "Shot Heat" },
    { value: "Shot Matter" },
    { value: "Spectrum" },
    { value: "Support" },
    { value: "Targeting" },
    { value: "Time/Move" },
    { value: "Waypoints" },
];

const secondarySortOptions: SelectOptionType<SecondarySortOptions>[] = [{ value: "None" }, ...primarySortOptions];

const sortDirectionOptions: SelectOptionType<SortDirection>[] = [{ value: "Ascending" }, { value: "Descending" }];

function SlotSpecificFilter({
    pageState,
    setPageState,
}: {
    pageState: PartsPageState;
    setPageState: (newPageState: PartsPageState) => void;
}) {
    function SlotSelect<T>({ options }: { options: SelectOptionType<T>[] }) {
        const value = options.find((o) => o.value === pageState.slotType) || options[0];
        return (
            <LabeledSelect
                label="Type"
                className="slot-type-select"
                isSearchable={false}
                options={options}
                tooltip="Additional filter based on the sub-type of the part based on slot."
                value={value}
                onChange={(val) => {
                    setPageState({ ...pageState, slotType: val!.value });
                }}
            />
        );
    }

    switch (pageState.slot) {
        case "Power":
            return <SlotSelect options={powerSlotTypeOptions} />;

        case "Propulsion":
            return <SlotSelect options={propulsionSlotTypeOptions} />;

        case "Utility":
            return <SlotSelect options={utilitySlotTypeOptions} />;

        case "Weapon":
            return <SlotSelect options={weaponSlotTypeOptions} />;
    }

    return <SlotSelect options={allSlotOptions} />;
}

export default function PartsPageInput({
    pageState,
    setPageState,
}: {
    pageState: PartsPageState;
    setPageState: (newPageState: PartsPageState) => void;
}) {
    const spoilers = useSpoilers();
    const categoryOptions = allCategoryOptions.filter((option) => canShowSpoiler(option.spoiler || "None", spoilers));

    return (
        <>
            <div className="page-input-group">
                <LabeledInput
                    label="Name"
                    placeholder="Any"
                    tooltip="The name of a part to search for."
                    value={pageState.name || ""}
                    onChange={(val) => {
                        setPageState({ ...pageState, name: val });
                    }}
                />
                <LabeledInput
                    label="Effect"
                    placeholder="Any"
                    tooltip="The text to search for the description or effect of a part."
                    value={pageState.effect || ""}
                    onChange={(val) => {
                        setPageState({ ...pageState, effect: val });
                    }}
                />
                <LabeledExclusiveButtonGroup
                    label="Mode"
                    buttons={modeButtons}
                    className="flex-grow-0"
                    tooltip="The mode to display the parts in."
                    selected={pageState.mode}
                    onValueChanged={(val) => {
                        setPageState({ ...pageState, mode: val });
                    }}
                />
                <Button
                    className="flex-grow-0"
                    tooltip="Resets all filters to their default (unfiltered) state"
                    onClick={() => {
                        setPageState({
                            // The only thing that is explicitly saved is the mode
                            mode: pageState.mode,
                        });
                    }}
                >
                    Reset
                </Button>
            </div>
            <div className="page-input-group">
                <LabeledInput
                    label="Rating"
                    placeholder="Any"
                    tooltip="The rating of the part. Use * to search for prototypes only. Add a + at the end to include larger values, a - at the end to include smaller values, or a - between two values to include a range."
                    value={pageState.rating || ""}
                    onChange={(val) => {
                        setPageState({ ...pageState, rating: val });
                    }}
                />
                <LabeledInput
                    label="Size"
                    placeholder="Any"
                    tooltip="The size of the part (aka # of slots). Add a + at the end to include larger values, a - at the end to include smaller values, or a - between two values to include a range."
                    value={pageState.size || ""}
                    onChange={(val) => {
                        setPageState({ ...pageState, size: val });
                    }}
                />
                <LabeledInput
                    label="Mass"
                    placeholder="Any"
                    tooltip="The mass of the part. Add a + at the end to include larger values, a - at the end to include smaller values, or a - between two values to include a range."
                    value={pageState.mass || ""}
                    onChange={(val) => {
                        setPageState({ ...pageState, mass: val });
                    }}
                />
                <LabeledSelect
                    label="Category"
                    tooltip="Additional part category like location/faction"
                    className="category-type-select"
                    isSearchable={false}
                    options={categoryOptions}
                    value={categoryOptions.find((o) => o.value === pageState.category) || categoryOptions[0]}
                    onChange={(val) => {
                        setPageState({ ...pageState, category: val!.value });
                    }}
                />
            </div>
            <div className="page-input-group">
                <LabeledExclusiveButtonGroup
                    label="Slot"
                    buttons={slotButtons}
                    flexGrowButtonCount={true}
                    selected={pageState.slot}
                    tooltip="Only shows parts with the matching slot."
                    onValueChanged={(val) => {
                        if (val !== pageState.slot) {
                            setPageState({ ...pageState, slot: val, slotType: "Any" });
                        }
                    }}
                />
                <SlotSpecificFilter pageState={pageState} setPageState={setPageState} />
            </div>
            <div className="page-input-group">
                <SoloLabel label="Schematics" tooltip="Search for hackable schematics." />
                <LabeledInput
                    label="Depth"
                    tooltip="Current map depth. Can enter as 7 or -7."
                    placeholder="Any"
                    value={pageState.schematicsDepth || ""}
                    onChange={(val) => {
                        setPageState({ ...pageState, schematicsDepth: val });
                    }}
                />
                <LabeledExclusiveButtonGroup
                    label="Terminal Level"
                    tooltip="The level of the terminal to hack from. Higher level terminals can hack higher rating schematics."
                    buttons={terminalLevelButtons}
                    selected={pageState.terminalLevel}
                    onValueChanged={(val) => {
                        setPageState({ ...pageState, terminalLevel: val });
                    }}
                />
            </div>
            {pageState.mode !== "Spreadsheet" && (
                <div className="page-input-group">
                    <LabeledSelectGroup label="Sort by" tooltip="How to sort parts matching all filters.">
                        <SelectWrapper
                            className="sort-select"
                            options={primarySortOptions}
                            isSearchable={false}
                            value={
                                primarySortOptions.find((o) => o.value === pageState.primarySort) ||
                                primarySortOptions[0]
                            }
                            onChange={(val) => {
                                if (val!.value === "Alphabetical" || val!.value === "Gallery") {
                                    // If setting to alphabetical/gallery sort then remove the
                                    // secondary sort
                                    setPageState({
                                        ...pageState,
                                        primarySort: val!.value,
                                        secondarySort: undefined,
                                    });
                                } else if (
                                    pageState.secondarySort === undefined ||
                                    pageState.secondarySort === "None"
                                ) {
                                    // If no secondary sort set yet then default to alphabetical
                                    // when the primary sort order is changed unless the current
                                    // sort is alphabetical
                                    setPageState({
                                        ...pageState,
                                        primarySort: val!.value,
                                        secondarySort: "Alphabetical",
                                    });
                                } else {
                                    setPageState({ ...pageState, primarySort: val!.value });
                                }
                            }}
                        />
                        <SelectWrapper
                            className="sort-order-select"
                            options={sortDirectionOptions}
                            isSearchable={false}
                            value={
                                sortDirectionOptions.find((o) => o.value === pageState.primarySortDirection) ||
                                sortDirectionOptions[0]
                            }
                            onChange={(val) => {
                                setPageState({ ...pageState, primarySortDirection: val!.value });
                            }}
                        />
                    </LabeledSelectGroup>
                    <LabeledSelectGroup label="Then by" tooltip="How to sort parts tied by the primary sort.">
                        <SelectWrapper
                            className="sort-select"
                            options={secondarySortOptions}
                            isSearchable={false}
                            value={
                                secondarySortOptions.find((o) => o.value === pageState.secondarySort) ||
                                secondarySortOptions[0]
                            }
                            onChange={(val) => {
                                setPageState({ ...pageState, secondarySort: val!.value });
                            }}
                        />
                        <SelectWrapper
                            className="sort-order-select"
                            options={sortDirectionOptions}
                            isSearchable={false}
                            value={
                                sortDirectionOptions.find((o) => o.value === pageState.secondarySortDirection) ||
                                sortDirectionOptions[0]
                            }
                            onChange={(val) => {
                                setPageState({ ...pageState, secondarySortDirection: val!.value });
                            }}
                        />
                    </LabeledSelectGroup>
                </div>
            )}
        </>
    );
}
