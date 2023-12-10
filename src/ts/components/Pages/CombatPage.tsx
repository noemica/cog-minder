import { useState } from "react";
import { fakeData } from "../../fakeData";
import DamageDealtChart from "../Charts/DamageDealtChart";
import DamageReceivedChart from "../Charts/DamageReceivedChart";
import ChartGrid from "../ChartGrid/ChartGrid";
import PartsDestroyedByCogmindChart from "../Charts/PartsDestroyedByCogmindChart";
import CogmindPartsDestroyedChart from "../Charts/CogmindPartsDestroyedChart";
import OverflowDamageDealtChart from "../Charts/OverflowDamageDealtChart";
import OverflowDamageReceivedChart from "../Charts/OverflowDamageReceivedChart";
import SneakAttacksChart from "../Charts/SneakAttacksChart";
import CriticalHitsByCogmind from "../Charts/CriticalHitsByCogmindChart";
import CriticalHitsToCogmind from "../Charts/CriticalHitsToCogmindChart";
import Button from "../Buttons/Button";
import ExclusiveButtonGroup, { ExclusiveButtonDefinition } from "../Buttons/ExclusiveButtonGroup";
import { CombatLogChartType, CombatLogChartCategoryType, ChartDisplayOptions } from "../../types/combatLogTypes";

const chartTypeButtons: ExclusiveButtonDefinition<CombatLogChartType>[] = [
    {
        label: "Pie",
        value: "Pie",
        tooltip:
            "Sets most charts to display as pie charts. " +
            "Some charts are only displayable as horizontal " +
            "bar charts.",
    },
    {
        label: "Bar",
        value: "Bar",
        tooltip: "Sets all charts to display as horizontal bar " + "charts.",
    },
];

const categoryTypeButtons: ExclusiveButtonDefinition<CombatLogChartCategoryType>[] = [
    {
        label: "Bot",
        value: "Bot",
        tooltip: "Groups chart values based on damage dealt to individual bot types.",
    },
    {
        label: "Class",
        value: "Class",
        tooltip: "Groups chart values based on damage dealt to bot class types.",
    },
    {
        label: "Damage Type",
        value: "Damage Type",
        tooltip: "Groups chart values based on the damage type of the fired weapon.",
    },
    {
        label: "Damaged Part",
        value: "Part",
        tooltip: "Groups chart values based on the damaged part.",
    },
    {
        label: "Damaged Slot",
        value: "Slot",
        tooltip: "Groups chart values based on the damaged slot. Core is considered its own slot.",
    },
    {
        label: "Fired Weapon",
        value: "Weapon",
        tooltip: "Groups chart values based on the fired weapon.",
    },
];

export function CombatPage() {
    const [loaded, setLoaded] = useState(true);
    const [combatLogData, setCombatLogData] = useState(fakeData);
    // const [loaded, setLoaded] = useState(false);
    // const [combatLogData, setCombatLogData] = useState([] as CombatLogEntry[]);
    const [displayOptions, setDisplayOptions] = useState<ChartDisplayOptions>({
        category: "Bot",
        chartType: "Pie",
    });

    async function loadDataPressed() {
        setLoaded(true);
        setCombatLogData(fakeData);
    }

    const charts = loaded ? (
        <ChartGrid>
            <DamageDealtChart combatLogEntries={combatLogData} displayOptions={displayOptions}></DamageDealtChart>
            <DamageReceivedChart combatLogEntries={combatLogData} displayOptions={displayOptions}></DamageReceivedChart>
            <OverflowDamageDealtChart
                combatLogEntries={combatLogData}
                displayOptions={displayOptions}
            ></OverflowDamageDealtChart>
            <OverflowDamageReceivedChart
                combatLogEntries={combatLogData}
                displayOptions={displayOptions}
            ></OverflowDamageReceivedChart>
            <PartsDestroyedByCogmindChart
                combatLogEntries={combatLogData}
                displayOptions={displayOptions}
            ></PartsDestroyedByCogmindChart>
            <CogmindPartsDestroyedChart
                combatLogEntries={combatLogData}
                displayOptions={displayOptions}
            ></CogmindPartsDestroyedChart>
            <SneakAttacksChart combatLogEntries={combatLogData} displayOptions={displayOptions}></SneakAttacksChart>
            <CriticalHitsByCogmind
                combatLogEntries={combatLogData}
                displayOptions={displayOptions}
            ></CriticalHitsByCogmind>
            <CriticalHitsToCogmind
                combatLogEntries={combatLogData}
                displayOptions={displayOptions}
            ></CriticalHitsToCogmind>
        </ChartGrid>
    ) : null;

    return (
        <>
            <Button onClick={loadDataPressed}>Load fake data</Button>
            <ExclusiveButtonGroup
                buttons={chartTypeButtons}
                initialSelected={displayOptions.chartType}
                onValueChanged={(value) => {
                    setDisplayOptions((d) => ({ ...d, chartType: value }));
                }}
            ></ExclusiveButtonGroup>
            <ExclusiveButtonGroup<CombatLogChartCategoryType>
                buttons={categoryTypeButtons}
                initialSelected={displayOptions.category}
                onValueChanged={(value) => {
                    setDisplayOptions((d) => ({ ...d, category: value }));
                }}
            ></ExclusiveButtonGroup>
            {charts}
        </>
    );
}
