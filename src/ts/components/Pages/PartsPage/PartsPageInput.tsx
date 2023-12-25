import Button from "../../Buttons/Button";
import { ExclusiveButtonDefinition } from "../../Buttons/ExclusiveButtonGroup";
import {
    LabeledExclusiveButtonGroup,
    LabeledInput,
    LabeledSelect,
    LabeledSelectGroup,
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
    { value: "Other" },
    { value: "Power" },
    { value: "Propulsion" },
    { value: "Utility" },
    { value: "Weapon" },
];

const anySlotOptions: SelectOptionType[] = [{ label: "Any", value: "Any" }];

const powerSlotTypeOptions: SelectOptionType<PowerSlotType>[] = [
    { value: "Any" },
    { value: "Engine" },
    { value: "Power Core" },
    { value: "Reactor" },
];

const propulsionSlotTypeOptions: SelectOptionType<PropulsionSlotType>[] = [
    { value: "Any" },
    { value: "Flight" },
    { value: "Hover" },
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
    { value: "Impact" },
    { value: "Launcher" },
    { value: "Piercing" },
    { value: "Slashing" },
    { value: "Special Melee Weapon" },
    { value: "Special Weapon" },
];

const categoryOptions: SelectOptionType<PartCategory>[] = [
    { value: "Any", tooltip: "All parts." },
    {
        value: "0b10",
        tooltip: "Parts that can be found on any standard complex floors or complex-controlled branches.",
    },
    { value: "Alien", tooltip: "All Sigix-related alien artifacts." },
    { value: "Architects", tooltip: "Parts found on Architect-faction related bots." },
    {
        value: "Derelict",
        tooltip: "Derelict-created parts, either found in derelict-controlled areas or on unique derelicts.",
    },
    { value: "Exile", tooltip: "Exile vault items and unique Exile bot parts." },
    { value: "Golem", tooltip: "Parts created by the GOLEM Unit." },
    { value: "Heroes", tooltip: "Parts unique to the Heroes of Zion." },
    { value: "Lab", tooltip: "Parts that can be found in the hidden Lab." },
    { value: "Quarantine", tooltip: "Parts that can be found in Quarantine." },
    { value: "S7 Guarded", tooltip: "Parts that can be found in Section 7 suspension chambers guarded by S7 Guards." },
    { value: "S7 Hangar", tooltip: "Parts that can be found in the Section 7 spaceship chamber." },
    {
        value: "S7 LRC Lab",
        tooltip:
            "Parts that can be found in the Section 7 LRC label. LRC parts are found in the locked room with a Terminal, the others are found in suspension chambers.",
    },
    { value: "S7 Unguarded", tooltip: "Parts that can be found in unguarded Section 7 suspension chambers." },
    { value: "Testing", tooltip: "Parts that can be found in Testing." },
    { value: "Unobtainable", tooltip: "Parts that are not obtainable by normal gameplay." },
    { value: "Warlord", tooltip: "Parts that are obtainable in the Warlord map, or on Warlord-aligned bots" },
    { value: "Zion", tooltip: "Parts that are obtainable in Zion." },
    {
        value: "Zionite",
        tooltip:
            "Parts that are obtainable from Imprinter-aligned Zionites. Some are obtainable in Zion Deep Caves, and some are only obtainable by Imprinting.",
    },
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
    setPageState: React.Dispatch<React.SetStateAction<PartsPageState>>;
}) {
    function SlotSelect<T>({ options }: { options: SelectOptionType<T>[] }) {
        const value = options.find((o) => o.value === pageState.slotTypeSearch) || options[0];
        return (
            <LabeledSelect
                label="Type"
                className="slot-type-select"
                isSearchable={false}
                options={options}
                tooltip="Additional filter based on the sub-type of the part based on slot."
                value={value}
                onChange={(val) => {
                    setPageState({ ...pageState, slotTypeSearch: val!.value });
                }}
            />
        );
    }

    switch (pageState.slotSearch) {
        case "Power":
            return <SlotSelect options={powerSlotTypeOptions} />;

        case "Propulsion":
            return <SlotSelect options={propulsionSlotTypeOptions} />;

        case "Utility":
            return <SlotSelect options={utilitySlotTypeOptions} />;

        case "Weapon":
            return <SlotSelect options={weaponSlotTypeOptions} />;
    }

    return (
        <LabeledSelect
            label="Type"
            className="slot-type-select"
            isSearchable={false}
            options={anySlotOptions}
            value={anySlotOptions[0]}
            tooltip="Additional filter based on the sub-type of the part based on slot."
        />
    );
}

export default function PartsPageInput({
    pageState,
    setPageState,
}: {
    pageState: PartsPageState;
    setPageState: React.Dispatch<React.SetStateAction<PartsPageState>>;
}) {
    return (
        <>
            <div className="page-input-group">
                <LabeledInput
                    label="Name"
                    placeholder="Any"
                    tooltip="The name of a part to search for."
                    value={pageState.nameSearch}
                    onChange={(val) => {
                        setPageState({ ...pageState, nameSearch: val });
                    }}
                />
                <LabeledInput
                    label="Effect"
                    placeholder="Any"
                    tooltip="The text to search for the description or effect of a part."
                    value={pageState.effectSearch}
                    onChange={(val) => {
                        setPageState({ ...pageState, effectSearch: val });
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
                    tooltip="The rating of the part. Use * to search for prototypes only. Add a + to include larger values, or a - to include smaller values."
                    value={pageState.ratingSearch}
                    onChange={(val) => {
                        setPageState({ ...pageState, ratingSearch: val });
                    }}
                />
                <LabeledInput
                    label="Size"
                    placeholder="Any"
                    tooltip="The size of the part (aka # of slots). Add a + to include larger values, or a - to include smaller values."
                    value={pageState.sizeSearch}
                    onChange={(val) => {
                        setPageState({ ...pageState, sizeSearch: val });
                    }}
                />
                <LabeledInput
                    label="Mass"
                    placeholder="Any"
                    tooltip="The mass of the part. Add a + to include larger values, or a - to include smaller values."
                    value={pageState.massSearch}
                    onChange={(val) => {
                        setPageState({ ...pageState, massSearch: val });
                    }}
                />
                <LabeledSelect
                    label="Category"
                    tooltip="Additional part category like location/faction"
                    className="category-type-select"
                    isSearchable={false}
                    options={categoryOptions}
                    value={categoryOptions.find((o) => o.value === pageState.categorySearch) || categoryOptions[0]}
                    onChange={(val) => {
                        setPageState({ ...pageState, categorySearch: val!.value });
                    }}
                />
            </div>
            <div className="page-input-group">
                <LabeledExclusiveButtonGroup
                    label="Slot"
                    buttons={slotButtons}
                    flexGrowButtonCount={true}
                    selected={pageState.slotSearch}
                    tooltip="Only shows parts with the matching slot."
                    onValueChanged={(val) => {
                        if (val !== pageState.slotSearch) {
                            setPageState({ ...pageState, slotSearch: val, slotTypeSearch: "Any" });
                        }
                    }}
                />
                <SlotSpecificFilter pageState={pageState} setPageState={setPageState} />
            </div>
            <div className="page-input-group">
                <LabeledSelectGroup label="Sort by" tooltip="How to sort parts matching all filters.">
                    <SelectWrapper
                        className="sort-select"
                        options={primarySortOptions}
                        isSearchable={false}
                        value={
                            primarySortOptions.find((o) => o.value === pageState.primarySort) || primarySortOptions[0]
                        }
                        onChange={(val) => {
                            setPageState({ ...pageState, primarySort: val!.value });
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
        </>
    );
}
