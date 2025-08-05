import { ColumnDef, SortingState } from "@tanstack/react-table";
import React from "react";

import { Item } from "../../../types/itemTypes";
import {
    otherSlotColumns,
    powerSlotColumns,
    propulsionSlotColumns,
    utilitySlotColumns,
    weaponSlotColumns,
} from "../../../utilities/partColumnDefs";
import Table from "../../Table/Table";
import { PartsPageState, SlotSearchType } from "./PartsPage";

const columnDefs: Record<SlotSearchType, ColumnDef<Item>[]> = {
    Any: [],
    "N/A": otherSlotColumns,
    Power: powerSlotColumns as any,
    Propulsion: propulsionSlotColumns as any,
    Utility: utilitySlotColumns as any,
    Weapon: weaponSlotColumns as any,
};

export default function PartsSpreadsheetDisplay({ pageState, items }: { pageState: PartsPageState; items: Item[] }) {
    const [sorting, setSorting] = React.useState<SortingState>([]);

    const slotSearch = pageState.slot || "Any";
    const columns = columnDefs[slotSearch];

    if (slotSearch === "Any") {
        return <span>Please select a slot to see the spreadsheet view.</span>;
    }

    return <Table columns={columns} data={items} setSorting={setSorting} sorting={sorting} />;
}
