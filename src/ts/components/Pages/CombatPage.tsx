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
import {
    CombatLogChartType,
    CombatLogChartCategoryType,
    ChartDisplayOptions,
    CombatLogEntry,
} from "../../types/combatLogTypes";
import CombatLogDropzone from "../Dropzone/CombatLogDropzone";
import PageHeader from "../PageHeader/PageHeader";

import "./Pages.less";
import { LabeledExclusiveButtonGroup } from "../LabeledItem/LabeledItem";

const chartTypeButtons: ExclusiveButtonDefinition<CombatLogChartType>[] = [
    {
        label: "Pie",
        value: "Pie",
        tooltip: "Sets charts to display as pie charts. Only the top 10 categories are shown in a pie chart.",
    },
    {
        label: "Bar",
        value: "Bar",
        tooltip:
            'Sets charts to display as horizontal bar charts. Only the top 10 categories are shown by default, but an "Other\" category can be expanded to show the full list of options.',
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
        tooltip: "Groups chart values based on the damage type of the weapon used.",
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
        label: "Used Weapon",
        value: "Weapon",
        tooltip: "Groups chart values based on the weapon used.",
    },
];

function Charts(combatLogData: CombatLogEntry[], displayOptions: ChartDisplayOptions) {
    return (
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
    );
}

export function CombatPage() {
    const isDev = process.env.NODE_ENV === "development";
    const initialLoaded = isDev;
    const initialData = isDev ? fakeData : [];
    const [loaded, setLoaded] = useState(initialLoaded);
    const [combatLogData, setCombatLogData] = useState(initialData);
    const [displayOptions, setDisplayOptions] = useState<ChartDisplayOptions>({
        category: "Bot",
        chartType: "Pie",
    });

    async function onLoadDataClick() {
        setLoaded(true);
        setCombatLogData(fakeData);
    }

    const charts = loaded ? Charts(combatLogData, displayOptions) : null;

    return (
        <>
            <PageHeader />
            <div className="page-content">
                <CombatLogDropzone
                    onParse={(combatLogEntries) => {
                        setCombatLogData(combatLogEntries);
                        setLoaded(true);
                    }}
                />
                {isDev && <Button onClick={onLoadDataClick}>Load fake data</Button>}
                {loaded && (
                    <>
                        <div className="todo">
                            <LabeledExclusiveButtonGroup
                                label="Chart Type"
                                flexGrowButtonCount={true}
                                tooltip="Sets the display type of all charts."
                                buttons={chartTypeButtons}
                                initialSelected={displayOptions.chartType}
                                onValueChanged={(value) => {
                                    setDisplayOptions((d) => ({ ...d, chartType: value }));
                                }}
                            />
                            <LabeledExclusiveButtonGroup<CombatLogChartCategoryType>
                                label="Chart Category"
                                flexGrowButtonCount={true}
                                buttons={categoryTypeButtons}
                                initialSelected={displayOptions.category}
                                onValueChanged={(value) => {
                                    setDisplayOptions((d) => ({ ...d, category: value }));
                                }}
                            />
                        </div>
                        {charts}
                    </>
                )}
            </div>
        </>
    );
}
