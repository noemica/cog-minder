import { ColumnDef, GroupColumnDef } from "@tanstack/react-table";

import { criticalSort, damageSort, heatSort, spectrumSort } from "../components/Pages/PartsPage/PartsSortingUtils";
import { OtherItem, PowerItem, PropulsionItem, UtilityItem, WeaponItem } from "../types/itemTypes";

const effectDescriptionWidth = 40;
const nameWidth = 15;
const typeWidth = 10;

// Slot categories to show for spreadsheet view
export const otherSlotColumns: GroupColumnDef<OtherItem>[] = [
    {
        header: "Overview",
        columns: [
            { accessorKey: "name", header: "Name", size: nameWidth, maxSize: nameWidth },
            { accessorKey: "type", header: "Type", maxSize: typeWidth },
            { accessorKey: "ratingString", header: "Rating" },
            { accessorKey: "size", header: "Size" },
            { accessorKey: "integrity", header: "Integrity" },
            { accessorKey: "life", header: "Life" },
        ],
    },
    {
        header: "Effect",
        columns: [
            { accessorKey: "effect", header: "Effect", size: effectDescriptionWidth },
            { accessorKey: "description", header: "Description", size: effectDescriptionWidth },
        ],
    },
    {
        header: "Fabrication",
        columns: [
            { accessorFn: (item) => item.fabrication?.number, header: "Count" },
            { accessorFn: (item) => item.fabrication?.time, header: "Time" },
        ],
    },
    {
        header: "Other",
        columns: [{ accessorKey: "supporterAttribution", header: "Attribution" }],
    },
];

export const powerSlotColumns: GroupColumnDef<PowerItem>[] = [
    {
        header: "Overview",
        columns: [
            { accessorKey: "name", header: "Name", size: nameWidth, maxSize: nameWidth },
            { accessorKey: "type", header: "Type", maxSize: typeWidth },
            { accessorKey: "ratingString", header: "Rating" },
            { accessorKey: "size", header: "Size" },
            { accessorKey: "mass", header: "Mass" },
            { accessorKey: "integrity", header: "Integrity" },
            { accessorKey: "coverage", header: "Coverage" },
            { accessorKey: "heatGeneration", header: "Heat" },
            { accessorKey: "matterUpkeep", header: "Matter" },
        ],
    },
    {
        header: "Power",
        columns: [
            { accessorKey: "energyGeneration", header: "Rate" },
            { accessorKey: "energyStorage", header: "Storage" },
            { accessorKey: "powerStability", header: "Stability" },
        ],
    },
    {
        header: "Fabrication",
        columns: [
            { accessorFn: (item) => item.fabrication?.number, header: "Count" },
            { accessorFn: (item) => item.fabrication?.time, header: "Time" },
        ],
    },
    {
        header: "Effect",
        columns: [
            { accessorKey: "effect", header: "Effect", size: effectDescriptionWidth },
            { accessorKey: "description", header: "Description", size: effectDescriptionWidth },
        ],
    },
    {
        header: "Other",
        columns: [{ accessorKey: "supporterAttribution", header: "Attribution" }],
    },
];

export const propulsionSlotColumns: GroupColumnDef<PropulsionItem>[] = [
    {
        header: "Overview",
        columns: [
            { accessorKey: "name", header: "Name", size: nameWidth, maxSize: nameWidth },
            { accessorKey: "type", header: "Type", maxSize: typeWidth },
            { accessorKey: "ratingString", header: "Rating" },
            { accessorKey: "size", header: "Size" },
            { accessorKey: "integrity", header: "Integrity" },
            { accessorKey: "coverage", header: "Coverage" },
        ],
    },
    {
        header: "Upkeep",
        columns: [
            { accessorKey: "energyUpkeep", header: "Energy" },
            { accessorKey: "heatGeneration", header: "Heat" },
        ],
    },
    {
        header: "Propulsion",
        columns: [
            { accessorKey: "timePerMove", header: "Time/Move" },
            { accessorKey: "modPerExtra", header: "Mod/Extra" },
            { accessorKey: "drag", header: "Drag" },
            { accessorKey: "energyPerMove", header: "Energy" },
            { accessorKey: "heatPerMove", header: "Heat" },
            { accessorKey: "support", header: "Support" },
            { accessorKey: "penalty", header: "Penalty" },
            { accessorKey: "burnout", header: "Burnout" },
            { accessorKey: "special", header: "Special" },
        ],
    },
    {
        header: "Fabrication",
        columns: [
            { accessorFn: (item) => item.fabrication?.number, header: "Count" },
            { accessorFn: (item) => item.fabrication?.time, header: "Time" },
        ],
    },
    {
        header: "Other",
        columns: [{ accessorKey: "supporterAttribution", header: "Attribution" }],
    },
];

export const utilitySlotColumns: GroupColumnDef<UtilityItem>[] = [
    {
        header: "Overview",
        columns: [
            { accessorKey: "name", header: "Name", size: nameWidth, maxSize: nameWidth },
            { accessorKey: "type", header: "Type", maxSize: typeWidth },
            { accessorKey: "ratingString", header: "Rating" },
            { accessorKey: "size", header: "Size" },
            { accessorKey: "mass", header: "Mass" },
            { accessorKey: "integrity", header: "Integrity" },
            { accessorKey: "coverage", header: "Coverage" },
            { accessorKey: "specialTrait", header: "Special Trait" },
        ],
    },
    {
        header: "Upkeep",
        columns: [
            { accessorKey: "energyUpkeep", header: "Energy" },
            { accessorKey: "matterUpkeep", header: "Matter" },
            { accessorKey: "heatGeneration", header: "Heat" },
        ],
    },
    {
        header: "Fabrication",
        columns: [
            { accessorFn: (item) => item.fabrication?.number, header: "Count" },
            { accessorFn: (item) => item.fabrication?.time, header: "Time" },
        ],
    },
    {
        header: "Effect",
        columns: [
            { accessorKey: "effect", header: "Effect", size: effectDescriptionWidth },
            { accessorKey: "description", header: "Description", size: effectDescriptionWidth },
        ],
    },
    {
        header: "Other",
        columns: [{ accessorKey: "supporterAttribution", header: "Attribution" }],
    },
];

export const weaponSlotColumns: GroupColumnDef<WeaponItem>[] = [
    {
        header: "Overview",
        columns: [
            { accessorKey: "name", header: "Name", maxSize: nameWidth },
            { accessorKey: "type", header: "Type", maxSize: typeWidth },
            { accessorKey: "ratingString", header: "Rating" },
            { accessorKey: "size", header: "Size" },
            { accessorKey: "mass", header: "Mass" },
            { accessorKey: "integrity", header: "Integrity" },
            { accessorKey: "coverage", header: "Coverage" },
            { accessorKey: "specialTrait", header: "Special Trait" },
        ],
    },
    {
        header: "Shot",
        columns: [
            { accessorKey: "range", header: "Range" },
            { accessorKey: "shotEnergy", header: "Energy" },
            { accessorKey: "shotMatter", header: "Matter" },
            { accessorKey: "shotHeat", header: "Heat" },
            { accessorKey: "recoil", header: "Recoil" },
            { accessorKey: "targeting", header: "Targeting" },
            { accessorKey: "delay", header: "Delay" },
            { accessorKey: "overloadStability", header: "Stability" },
            { accessorKey: "waypoints", header: "Waypoints" },
        ],
    },
    {
        header: "Projectile",
        columns: [
            { accessorKey: "arc", header: "Arc" },
            { accessorKey: "projectileCount", header: "Count" },
            {
                accessorKey: "damage",
                header: "Damage",
                sortingFn: (rowA, rowB, columnId) =>
                    damageSort(rowA.getValue<string>(columnId), rowB.getValue<string>(columnId)),
            },
            { accessorKey: "damageType", header: "Type" },
            {
                accessorKey: "criticalString",
                header: "Critical",
                sortingFn: (rowA, rowB, columnId) =>
                    criticalSort(rowA.getValue<string>(columnId), rowB.getValue<string>(columnId)),
                maxSize: 8,
            },
            { accessorKey: "penetration", header: "Penetration", maxSize: 10 },
            {
                accessorKey: "heatTransfer",
                header: "Heat Transfer",
                sortingFn: (rowA, rowB, columnId) =>
                    heatSort(rowA.getValue<string>(columnId), rowB.getValue<string>(columnId)),
            },
            {
                accessorKey: "spectrum",
                header: "Spectrum",
                sortingFn: (rowA, rowB, columnId) =>
                    spectrumSort(rowA.getValue<string>(columnId), rowB.getValue<string>(columnId)),
                maxSize: 9,
            },
            { accessorKey: "disruption", header: "Disruption" },
            { accessorKey: "salvage", header: "Salvage" },
        ],
    },
    {
        header: "Explosion",
        columns: [
            { accessorKey: "explosionRadius", header: "Radius" },
            {
                accessorKey: "explosionDamage",
                header: "Damage",
                sortingFn: (rowA, rowB, columnId) =>
                    damageSort(rowA.getValue<string>(columnId), rowB.getValue<string>(columnId)),
            },
            { accessorKey: "falloff", header: "Falloff" },
            { accessorKey: "explosionType", header: "Type" },
            {
                accessorKey: "explosionHeatTransfer",
                header: "Heat Transfer",
                sortingFn: (rowA, rowB, columnId) =>
                    heatSort(rowA.getValue<string>(columnId), rowB.getValue<string>(columnId)),
            },
            {
                accessorKey: "explosionSpectrum",
                header: "Spectrum",
                sortingFn: (rowA, rowB, columnId) =>
                    spectrumSort(rowA.getValue<string>(columnId), rowB.getValue<string>(columnId)),
                maxSize: 9,
            },
            { accessorKey: "explosionDisruption", header: "Disruption" },
            { accessorKey: "explosionSalvage", header: "Salvage" },
        ],
    },
    {
        header: "Fabrication",
        columns: [
            { accessorFn: (item) => item.fabrication?.number, header: "Count" },
            { accessorFn: (item) => item.fabrication?.time, header: "Time" },
        ],
    },
    {
        header: "Effect",
        columns: [
            { accessorKey: "effect", header: "Effect", size: effectDescriptionWidth },
            { accessorKey: "description", header: "Description", size: effectDescriptionWidth },
        ],
    },
    {
        header: "Other",
        columns: [{ accessorKey: "supporterAttribution", header: "Attribution" }],
    },
];

// Create a list of all legal column names
export const allPartColumnDefs = new Map<String, ColumnDef<any>>();
function addColumns(defs: GroupColumnDef<any>[]) {
    for (const def of defs) {
        for (const column of def.columns!) {
            allPartColumnDefs.set(`${def.header}/${column.header}` as string, column);
        }
    }
}

addColumns(otherSlotColumns);
addColumns(powerSlotColumns);
addColumns(propulsionSlotColumns);
addColumns(utilitySlotColumns);
addColumns(weaponSlotColumns);
