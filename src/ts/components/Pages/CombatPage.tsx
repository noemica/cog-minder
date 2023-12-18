import { useState } from "react";
import { useLocalStorage } from "usehooks-ts";

import { fakeData } from "../../fakeData";
import {
    ChartDisplayOptions,
    CombatLogChartCategoryType,
    CombatLogChartType,
    CombatLogEntry,
    isValidCombatLogChartCategoryType,
    isValidCombatLogChartType,
} from "../../types/combatLogTypes";
import { localStorageCombatLogChartDisplayOptions } from "../../types/commonTypes";
import Button from "../Buttons/Button";
import { ExclusiveButtonDefinition } from "../Buttons/ExclusiveButtonGroup";
import ChartGrid from "../ChartGrid/ChartGrid";
import CogmindPartsDestroyedChart from "../Charts/CogmindPartsDestroyedChart";
import CriticalHitTargetsByCogmind from "../Charts/CriticalHitTargetsByCogmindChart";
import CriticalHitTargetsToCogmind from "../Charts/CriticalHitTargetsToCogmindChart";
import DamageDealtChart from "../Charts/DamageDealtChart";
import DamageReceivedChart from "../Charts/DamageReceivedChart";
import OverflowDamageDealtChart from "../Charts/OverflowDamageDealtChart";
import OverflowDamageReceivedChart from "../Charts/OverflowDamageReceivedChart";
import PartsDestroyedByCogmindChart from "../Charts/PartsDestroyedByCogmindChart";
import SneakAttacksChart from "../Charts/SneakAttacksChart";
import CombatLogDropzone from "../Dropzone/CombatLogDropzone";
import useThemeUpdater from "../Effects/useThemeUpdater";
import { LabeledExclusiveButtonGroup } from "../LabeledItem/LabeledItem";
import PageHeader from "../PageHeader/PageHeader";

import "./Pages.less";

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
            'Sets charts to display as horizontal bar charts. Only the top 10 categories are shown by default, but an "Other" category can be expanded to show the full list of options.',
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
        label: "Critical",
        value: "Critical",
        tooltip: "Groups chart values based on critical hit type (or None).",
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
            <OverflowDamageDealtChart combatLogEntries={combatLogData} displayOptions={displayOptions} />
            <OverflowDamageReceivedChart combatLogEntries={combatLogData} displayOptions={displayOptions} />
            <PartsDestroyedByCogmindChart combatLogEntries={combatLogData} displayOptions={displayOptions} />
            <CogmindPartsDestroyedChart combatLogEntries={combatLogData} displayOptions={displayOptions} />
            <SneakAttacksChart combatLogEntries={combatLogData} displayOptions={displayOptions}></SneakAttacksChart>
            <CriticalHitTargetsByCogmind combatLogEntries={combatLogData} displayOptions={displayOptions} />
            <CriticalHitTargetsToCogmind combatLogEntries={combatLogData} displayOptions={displayOptions} />
        </ChartGrid>
    );
}

export function CombatPage() {
    const isDev = process.env.NODE_ENV === "development";
    const initialLoaded = isDev;
    const initialData = isDev ? fakeData : [];

    useThemeUpdater();
    const [initialChartDisplayOptions, setInitialChartDisplayOptions] = useLocalStorage<ChartDisplayOptions>(
        localStorageCombatLogChartDisplayOptions,
        {
            category: "Bot",
            chartType: "Pie",
        },
    );
    if (!isValidCombatLogChartCategoryType(initialChartDisplayOptions.category)) {
        initialChartDisplayOptions.category = "Bot";
    }
    if (!isValidCombatLogChartType(initialChartDisplayOptions.chartType)) {
        initialChartDisplayOptions.chartType = "Bar";
    }

    const [loaded, setLoaded] = useState(initialLoaded);
    const [combatLogData, setCombatLogData] = useState(initialData);
    const [displayOptions, setDisplayOptions] = useState<ChartDisplayOptions>(initialChartDisplayOptions);

    async function onLoadDataClick() {
        setLoaded(true);
        setCombatLogData(fakeData);
    }

    const charts = loaded ? Charts(combatLogData, displayOptions) : null;

    return (
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
                    <div className="page-input-group">
                        <LabeledExclusiveButtonGroup
                            label="Chart Type"
                            tooltip="Sets the display type of all charts."
                            flexGrowButtonCount={true}
                            buttons={chartTypeButtons}
                            initialSelected={displayOptions.chartType}
                            onValueChanged={(value) => {
                                const newDisplayOptions = { ...displayOptions, chartType: value };
                                setDisplayOptions(newDisplayOptions);
                                setInitialChartDisplayOptions(newDisplayOptions);
                            }}
                        />
                        <LabeledExclusiveButtonGroup<CombatLogChartCategoryType>
                            label="Chart Category"
                            tooltip="Sets the category type for all charts. This determines how the combat log is split into pieces."
                            flexGrowButtonCount={true}
                            buttons={categoryTypeButtons}
                            initialSelected={displayOptions.category}
                            onValueChanged={(value) => {
                                const newDisplayOptions = { ...displayOptions, category: value };
                                setDisplayOptions(newDisplayOptions);
                                setInitialChartDisplayOptions(newDisplayOptions);
                            }}
                        />
                    </div>
                    {charts}
                </>
            )}
        </div>
    );
}
