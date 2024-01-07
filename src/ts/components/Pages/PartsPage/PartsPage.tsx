import { ReactNode, useState } from "react";

import { ItemSlot } from "../../../types/itemTypes";
import { canShowSpoiler, gallerySort, getItem, itemData, leetSpeakMatchTransform } from "../../../utilities/common";
import { useSpoilers } from "../../Effects/useLocalStorageValue";
import PartsComparisonDisplay from "./PartsComparisonDisplay";
import PartsGalleryDisplay from "./PartsGalleryDisplay";
import PartsPageInput from "./PartsPageInput";
import PartsSimpleDisplay from "./PartsSimpleDisplay";
import { alphabeticalSort, criticalSort, damageSort, heatSort, integerSort, spectrumSort } from "./PartsSortingUtils";
import PartsSpreadsheetDisplay from "./PartsSpreadsheetDisplay";

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
        if (!canShowSpoiler(item.spoiler, spoilers)) {
            return false;
        }

        // Name filter
        if (pageState.nameSearch) {
            const lowerName = item.name.toLowerCase();
            const nameSearch = pageState.nameSearch.toLowerCase();

            // Only add a leetspeak convert if > 1 letter to reduce chance of
            // false positives on the translation
            // 2 min works well as it will catch somebody typing in the first half
            // of a bot name, like BR for 8R-AWN
            if (nameSearch.length > 1) {
                if (!lowerName.includes(nameSearch) && !leetSpeakMatchTransform(lowerName).includes(nameSearch)) {
                    return false;
                }
            } else if (nameSearch.length > 0) {
                if (!lowerName.includes(nameSearch)) {
                    return false;
                }
            }
        }

        // Effect/Description filter
        if (pageState.effectSearch && pageState.effectSearch.length > 0) {
            const effectSearch = pageState.effectSearch.toLowerCase();
            if (
                !item.description?.toLowerCase().includes(effectSearch) &&
                !item.effect?.toLowerCase().includes(effectSearch)
            ) {
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

function sortItemNames(itemNames: string[], pageState: PartsPageState) {
    // Sorts the collection of item names based on the sort settings
    const sortKeyMap = {
        Alphabetical: { key: "name", sort: alphabeticalSort },
        Gallery: { key: "name", sort: gallerySort },
        Rating: { key: "rating", sort: integerSort },
        Size: { key: "size", sort: integerSort },
        Mass: { key: "mass", sort: integerSort },
        Integrity: { key: "integrity", sort: integerSort },
        Coverage: { key: "coverage", sort: integerSort },
        Arc: { key: "arc", sort: integerSort },
        Critical: { key: "criticalString", sort: criticalSort },
        Damage: { keys: ["damage", "explosionDamage"], sort: damageSort },
        Delay: { key: "delay", sort: integerSort },
        Disruption: { keys: ["disruption", "explosionDisruption"], sort: integerSort },
        Drag: { key: "drag", sort: integerSort },
        "Energy/Move": { key: "energyPerMove", sort: integerSort },
        "Energy Generation": { key: "energyGeneration", sort: integerSort },
        "Energy Storage": { key: "energyStorage", sort: integerSort },
        "Energy Upkeep": { key: "energyUpkeep", sort: integerSort },
        "Explosion Radius": { key: "explosionRadius", sort: integerSort },
        Falloff: { key: "falloff", sort: integerSort },
        "Heat/Move": { key: "heatPerMove", sort: integerSort },
        "Heat Generation": { key: "heatGeneration", sort: integerSort },
        "Heat Transfer": { keys: ["heatTransfer", "explosionHeatTransfer"], sort: heatSort },
        "Matter Upkeep": { key: "matterUpkeep", sort: integerSort },
        Penalty: { key: "penalty", sort: integerSort },
        "Projectile Count": { key: "projectileCount", sort: integerSort },
        Range: { key: "range", sort: integerSort },
        Recoil: { key: "recoil", sort: integerSort },
        Salvage: { keys: ["salvage", "explosionSalvage"], sort: integerSort },
        "Shot Energy": { key: "shotEnergy", sort: integerSort },
        "Shot Heat": { key: "shotHeat", sort: integerSort },
        "Shot Matter": { key: "shotMatter", sort: integerSort },
        Spectrum: { keys: ["spectrum", "explosionSpectrum"], sort: spectrumSort },
        Support: { key: "support", sort: integerSort },
        Targeting: { key: "targeting", sort: integerSort },
        "Time/Move": { key: "timePerMove", sort: integerSort },
        Waypoints: { key: "waypoints", sort: integerSort },
    };

    // Do initial sort
    const isSpreadsheet = pageState.mode === "Spreadsheet";
    const primaryObject = isSpreadsheet ? sortKeyMap["Gallery"] : sortKeyMap[pageState.primarySort || "Alphabetical"];
    const primaryKeys: string[] = "key" in primaryObject ? [primaryObject.key] : primaryObject.keys;
    const primarySort = primaryObject.sort;
    itemNames.sort((a, b) => {
        const itemA = getItem(a);
        const itemB = getItem(b);

        const aKey = primaryKeys.find((key: string) => key in itemA && itemA[key] !== undefined);
        const bKey = primaryKeys.find((key: string) => key in itemB && itemB[key] !== undefined);

        return primarySort(itemA[aKey!], itemB[bKey!]);
    });

    if (isSpreadsheet) {
        // If in spreadsheet view do an initial gallery sort only
        return itemNames;
    }

    if (pageState.primarySortDirection === "Descending") {
        itemNames.reverse();
    }

    // Do secondary sort if selected
    if (pageState.secondarySort === undefined || pageState.secondarySort === "None") {
        return itemNames;
    }
    const secondaryObject = sortKeyMap[pageState.secondarySort];

    const secondaryKeys = "key" in secondaryObject ? [secondaryObject.key] : secondaryObject.keys;
    const secondarySort = secondaryObject.sort;

    // Group items based on the initial sort
    const groupedItemNames = {};
    const groupedKeys: any[] = [];
    itemNames.forEach((itemName: string) => {
        const item = getItem(itemName);
        const key = primaryKeys.find((key: string) => key in item && item[key] !== undefined);
        const value = item[key!];

        if (value in groupedItemNames) {
            groupedItemNames[value].push(itemName);
        } else {
            groupedItemNames[value] = [itemName];
            groupedKeys.push(value);
        }
    });

    // Sort subgroups
    groupedKeys.forEach((key) => {
        const itemNames = groupedItemNames[key];

        itemNames.sort((a: string, b: string) => {
            const itemA = getItem(a);
            const itemB = getItem(b);

            const aKey = secondaryKeys.find((key: string) => key in itemA)!;
            const bKey = secondaryKeys.find((key: string) => key in itemB)!;

            return secondarySort(itemA[aKey], itemB[bKey]);
        });
    });

    // Combine groups back into single sorted array
    const reverseSecondaryGroups = pageState.secondarySortDirection === "Descending";
    let newItems: string[] = [];
    groupedKeys.forEach((key) => {
        if (reverseSecondaryGroups) {
            groupedItemNames[key].reverse();
        }

        newItems = newItems.concat(groupedItemNames[key]);
    });

    return newItems;
}

export default function PartsPage() {
    const [pageState, setPageState] = useState<PartsPageState>({
        mode: "Simple",
    });

    const itemNames = sortItemNames(filterItemNames(pageState), pageState);

    let modeNode: ReactNode | undefined;

    switch (pageState.mode) {
        case "Simple":
            modeNode = <PartsSimpleDisplay itemNames={itemNames} pageState={pageState} />;
            break;

        case "Comparison":
            modeNode = <PartsComparisonDisplay itemNames={itemNames} pageState={pageState} />;
            break;

        case "Gallery":
            modeNode = <PartsGalleryDisplay itemNames={itemNames} pageState={pageState} />;
            break;

        case "Spreadsheet":
            modeNode = <PartsSpreadsheetDisplay itemNames={itemNames} pageState={pageState} />;
            break;
    }

    return (
        <div className="page-content">
            <PartsPageInput pageState={pageState} setPageState={setPageState} />
            {modeNode}
        </div>
    );
}
