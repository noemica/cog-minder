import {
    ColumnDef,
    Header,
    HeaderGroup,
    Row,
    SortingState,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import React, { useMemo } from "react";

import { Item, OtherItem, PowerItem, PropulsionItem, UtilityItem, WeaponItem } from "../../../types/itemTypes";
import { getItem } from "../../../utilities/common";
import Table, { TableHeaderGroup, TableRow } from "../../Table/Table";
import { PartsPageState, SlotSearchType } from "./PartsPage";
import { criticalSort, damageSort, heatSort, spectrumSort } from "./PartsSortingUtils";

const effectDescriptionMinWidth = 30;

// Slot categories to show for spreadsheet view
const otherSlotColumns: ColumnDef<OtherItem>[] = [
    {
        header: "Overview",
        columns: [
            { accessorKey: "name", header: "Name" },
            { accessorKey: "type", header: "Type" },
            { accessorKey: "ratingString", header: "Rating" },
            { accessorKey: "size", header: "Size" },
            { accessorKey: "integrity", header: "Integrity" },
            { accessorKey: "life", header: "Life" },
        ],
    },
    {
        header: "Effect",
        columns: [
            { accessorKey: "effect", header: "Effect", size: effectDescriptionMinWidth },
            { accessorKey: "description", header: "Description", size: effectDescriptionMinWidth },
        ],
    },
];

const powerSlotColumns: ColumnDef<PowerItem>[] = [
    {
        header: "Overview",
        columns: [
            { accessorKey: "name", header: "Name" },
            { accessorKey: "type", header: "Type" },
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
            { accessorKey: "effect", header: "Effect", size: effectDescriptionMinWidth },
            { accessorKey: "description", header: "Description", size: effectDescriptionMinWidth },
        ],
    },
];

const propulsionSlotColumns: ColumnDef<PropulsionItem>[] = [
    {
        header: "Overview",
        columns: [
            { accessorKey: "name", header: "Name" },
            { accessorKey: "type", header: "Type" },
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
            { accessorKey: "siege", header: "Siege" },
        ],
    },
    {
        header: "Fabrication",
        columns: [
            { accessorFn: (item) => item.fabrication?.number, header: "Count" },
            { accessorFn: (item) => item.fabrication?.time, header: "Time" },
        ],
    },
];

const utilitySlotColumns: ColumnDef<UtilityItem>[] = [
    {
        header: "Overview",
        columns: [
            { accessorKey: "name", header: "Name" },
            { accessorKey: "type", header: "Type" },
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
            { accessorKey: "effect", header: "Effect", size: effectDescriptionMinWidth },
            { accessorKey: "description", header: "Description", size: effectDescriptionMinWidth },
        ],
    },
];

const weaponSlotColumns: ColumnDef<WeaponItem>[] = [
    {
        header: "Overview",
        columns: [
            { accessorKey: "name", header: "Name" },
            { accessorKey: "type", header: "Type" },
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
            },
            { accessorKey: "penetration", header: "Penetration" },
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
            { accessorKey: "effect", header: "Effect", size: effectDescriptionMinWidth },
            { accessorKey: "description", header: "Description", size: effectDescriptionMinWidth },
        ],
    },
];

const columnDefs: Record<SlotSearchType, ColumnDef<Item>[]> = {
    Any: [],
    "N/A": otherSlotColumns,
    Power: powerSlotColumns as any,
    Propulsion: propulsionSlotColumns as any,
    Utility: utilitySlotColumns as any,
    Weapon: weaponSlotColumns as any,
};

export default function PartsSpreadsheetDisplay({
    pageState,
    itemNames,
}: {
    pageState: PartsPageState;
    itemNames: string[];
}) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const data = useMemo(() => {
        return itemNames.map((itemName) => getItem(itemName));
    }, [itemNames]);

    const slotSearch = pageState.slotSearch || "Any";
    const columns = columnDefs[slotSearch];

    if (slotSearch === "Any") {
        return <span>Please select a slot to see the spreadsheet view.</span>;
    }

    return <Table columns={columns} data={data} setSorting={setSorting} sorting={sorting} />;
}
