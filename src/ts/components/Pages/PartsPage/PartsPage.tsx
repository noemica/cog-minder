import { ReactNode, useState } from "react";

import { ItemSlot } from "../../../types/itemTypes";
import { itemData, leetSpeakMatchTransform } from "../../../utilities/common";
import { useSpoilers } from "../../Effects/useLocalStorageValue";
import PartsPageInput from "./PartsPageInput";
import PartsSimpleDisplay from "./PartsSimpleDisplay";

import "./PartsPage.less";

export type PartsPageMode = "Simple" | "Comparison" | "Spreadsheet" | "Gallery";

export type TerminalSearchLevel = "Level 1" | "Level 2" | "Level 3";

export type SlotSearchType = "Any" | ItemSlot;

export type PartCategory =
    | "Any"
    | "0b10"
    | "Alien"
    | "Architects"
    | "Derelict"
    | "Exile"
    | "Golem"
    | "Heroes"
    | "Lab"
    | "Quarantine"
    | "S7 Guarded"
    | "S7 Hangar"
    | "S7 LRC Lab"
    | "S7 Unguarded"
    | "Testing"
    | "Unobtainable"
    | "Warlord"
    | "Zion"
    | "Zionite";

export type PowerSlotType = "Any" | "Engine" | "Power Core" | "Reactor";

export type PropulsionSlotType = "Any" | "Flight" | "Hover" | "Wheel" | "Leg" | "Treads";

export type UtilitySlotType = "Any" | "Artifact" | "Device" | "Hackware" | "Processor" | "Protection" | "Storage";

export type WeaponSlotType =
    | "Any"
    | "Ballistic Cannon"
    | "Ballistic Gun"
    | "Energy Cannon"
    | "Energy Gun"
    | "Impact"
    | "Launcher"
    | "Piercing"
    | "Slashing"
    | "Special Melee Weapon"
    | "Special Weapon";

export type PrimarySortOptions =
    | "Alphabetical"
    | "Gallery"
    | "Coverage"
    | "Integrity"
    | "Mass"
    | "Rating"
    | "Size"
    | "Arc"
    | "Critical"
    | "Damage"
    | "Delay"
    | "Disruption"
    | "Drag"
    | "Energy/Move"
    | "Energy Generation"
    | "Energy Storage"
    | "Energy Upkeep"
    | "Explosion Radius"
    | "Falloff"
    | "Heat/Move"
    | "Heat Generation"
    | "Heat Transfer"
    | "Matter Upkeep"
    | "Penalty"
    | "Projectile Count"
    | "Range"
    | "Recoil"
    | "Salvage"
    | "Shot Energy"
    | "Shot Heat"
    | "Shot Matter"
    | "Spectrum"
    | "Support"
    | "Targeting"
    | "Time/Move"
    | "Waypoints";

export type SecondarySortOptions = PrimarySortOptions | "None";

export type SortDirection = "Ascending" | "Descending";

export type SlotTypeSearchType = PowerSlotType | PropulsionSlotType | UtilitySlotType | WeaponSlotType;

export type PartsPageState = {
    nameSearch?: string;
    effectSearch?: string;
    mode: PartsPageMode;
    ratingSearch?: string;
    sizeSearch?: string;
    massSearch?: string;
    schematicsDepthSearch?: string;
    terminalLevelSearch?: TerminalSearchLevel;
    slotSearch?: SlotSearchType;
    slotTypeSearch?: SlotTypeSearchType;
    categorySearch?: PartCategory;
    primarySort?: PrimarySortOptions;
    primarySortDirection?: SortDirection;
    secondarySort?: SecondarySortOptions;
    secondarySortDirection?: SortDirection;
};

function filterItemNames(pageState: PartsPageState) {
    const spoilers = useSpoilers();

    const filteredItemNames = Object.keys(itemData).filter((itemName) => {
        const item = itemData[itemName];

        // Spoilers filter
        if (spoilers === "None" && item.spoiler !== "None") {
            return false;
        } else if (spoilers === "Spoiler" && item.spoiler === "Redacted") {
            return false;
        }

        // Name filter
        const lowerName = item.name.toLowerCase();
        if (pageState.nameSearch) {
            // Only add a leetspeak convert if > 1 letter to reduce chance of
            // false positives on the translation
            // 2 min works well as it will catch somebody typing in the first half
            // of a bot name, like BR for 8R-AWN
            if (pageState.nameSearch.length > 1) {
                if (
                    !lowerName.includes(pageState.nameSearch) &&
                    !leetSpeakMatchTransform(lowerName).includes(pageState.nameSearch)
                ) {
                    return false;
                }
            } else if (pageState.nameSearch.length > 0) {
                if (!lowerName.includes(pageState.nameSearch)) {
                    return false;
                }
            }
        }

        // Effect/Description filter
        if (pageState.effectSearch && pageState.effectSearch.length > 0) {
            if (!item.description?.includes(pageState.effectSearch) && !item.effect?.includes(pageState.effectSearch)) {
                return false;
            }
        }

        // Rating filter
        if (pageState.ratingSearch && pageState.ratingSearch.length > 0) {
            const includeAbove = pageState.ratingSearch.includes("+");
            const includeBelow = pageState.ratingSearch.includes("-");
            const ratingValue = pageState.ratingSearch.replace("+", "").replace("-", "");

            let floatRatingValue: number;
            if (ratingValue.slice(-1) === "*") {
                floatRatingValue = parseFloat(ratingValue.slice(0, ratingValue.lastIndexOf("*"))) + 0.5;
            } else {
                floatRatingValue = parseFloat(ratingValue);
            }

            // A + at the end means also include values above the given value
            // A - means include values below
            if (includeAbove) {
                if (item.rating < floatRatingValue) {
                    return false;
                }
            } else if (includeBelow) {
                if (item.rating > floatRatingValue) {
                    return false;
                }
            } else if (ratingValue === "*") {
                if (!item.ratingString.includes("*")) {
                    return false;
                }
            } else {
                if (item.rating !== floatRatingValue) {
                    return false;
                }
            }
        }

        // Size filter
        if (pageState.sizeSearch && pageState.sizeSearch.length > 0) {
            const includeAbove = pageState.sizeSearch.includes("+");
            const includeBelow = pageState.sizeSearch.includes("-");
            const sizeValue = pageState.sizeSearch.replace("+", "").replace("-", "");

            const intSizeValue = parseInt(sizeValue);

            // A + at the end means also include values above the given value
            // A - means include values below
            if (includeAbove) {
                if (item.size < intSizeValue) {
                    return false;
                }
            } else if (includeBelow) {
                if (item.size > intSizeValue) {
                    return false;
                }
            } else {
                if (item.size !== intSizeValue) {
                    return false;
                }
            }
        }

        // Mass filter
        if (pageState.massSearch && pageState.massSearch.length > 0) {
            const includeAbove = pageState.massSearch.includes("+");
            const includeBelow = pageState.massSearch.includes("-");
            const massValue = pageState.massSearch.replace("+", "").replace("-", "");

            const intMassValue = parseInt(massValue);

            // A + at the end means also include values above the given value
            // A - means include values below
            if (includeAbove) {
                if (!item.mass || item.mass < intMassValue) {
                    return false;
                }
            } else if (includeBelow) {
                if (!item.mass || item.mass > intMassValue) {
                    return false;
                }
            } else {
                if (item.mass !== intMassValue) {
                    return false;
                }
            }
        }

        // Category filter
        if (pageState.categorySearch) {
            if (pageState.categorySearch !== "Any" && !item.categories.includes(pageState.categorySearch)) {
                return false;
            }
        }

        // Slot filter
        if (pageState.slotSearch) {
            if (pageState.slotSearch !== "Any" && item.slot !== pageState.slotSearch) {
                return false;
            }
        }

        if (pageState.slotTypeSearch) {
            if (pageState.slotTypeSearch !== "Any" && item.type !== pageState.slotTypeSearch) {
                return false;
            }
        }

        // Schematic filter
        if (pageState.schematicsDepthSearch && pageState.schematicsDepthSearch.length > 0) {
            const depthNum = Math.abs(parseInt(pageState.schematicsDepthSearch));

            if (!Number.isNaN(depthNum)) {
                let terminalModifier = 1;
                if (pageState.terminalLevelSearch === "Level 2") {
                    terminalModifier = 2;
                } else if (pageState.terminalLevelSearch === "Level 3") {
                    terminalModifier = 3;
                }

                const hackLevel = 10 - depthNum + terminalModifier;

                if (hackLevel < Math.ceil(item.rating)) {
                    return false;
                }
            }
        }

        return true;
    });

    return filteredItemNames;
}

export default function PartsPage() {
    const [pageState, setPageState] = useState<PartsPageState>({
        mode: "Simple",
    });

    const itemNames = filterItemNames(pageState);

    let modeNode: ReactNode | undefined;

    switch (pageState.mode) {
        case "Simple":
            modeNode = <PartsSimpleDisplay itemNames={itemNames} pageState={pageState} />;
            break;
    }

    return (
        <div className="page-content">
            <PartsPageInput pageState={pageState} setPageState={setPageState} />
            {modeNode}
        </div>
    );
}
