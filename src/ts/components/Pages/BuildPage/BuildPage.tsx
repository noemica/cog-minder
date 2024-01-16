import LZString from "lz-string";
import { ReactNode } from "react";
import { useLocation, useSearch } from "wouter";

import { getRangedVolleyTime, volleyTimeMap } from "../../../simulatorCalcs";
import {
    Actuator,
    BaseItem,
    EnergyFilter,
    EnergyStorage,
    FusionCompressor,
    HeatDissipation,
    ItemSlot,
    ItemType,
    ItemWithUpkeep,
    MassSupport,
    PowerAmplifier,
    PowerItem,
    PropulsionItem,
    RangedWeaponCycling,
    WeaponItem,
    WeaponRegen,
} from "../../../types/itemTypes";
import { ItemData } from "../../../utilities/ItemData";
import {
    assertUnreachable,
    canShowSpoiler,
    getLocationFromState,
    getMovementText,
    getTopTwoValues,
    getValuePerTus,
    hasActiveSpecialProperty,
    isPartMelee,
    parseIntOrDefault,
    parseSearchParameters,
} from "../../../utilities/common";
import Button from "../../Buttons/Button";
import { ExclusiveButtonDefinition } from "../../Buttons/ExclusiveButtonGroup";
import useItemData from "../../Effects/useItemData";
import { useSpoilers } from "../../Effects/useLocalStorageValue";
import { LabeledExclusiveButtonGroup, LabeledInput, SoloLabel } from "../../LabeledItem/LabeledItem";
import ItemPopoverButton from "../../Popover/ItemPopover";
import SelectWrapper, { SelectOptionType } from "../../Selectpicker/Select";

import "../Pages.less";
import "./BuildPage.less";

type CalculatedPartInfo = {
    active: boolean;
    coverage: number;
    energyPerMove: number;
    energyPerTurn: number;
    energyPerVolley: number;
    heatPerMove: number;
    heatPerTurn: number;
    heatPerVolley: number;
    id: number;
    integrity: number;
    mass: number;
    name: string;
    partState: PartState;
    slot: ItemSlot;
    size: number;
    vulnerability: number;
};

type TotalPartsState = {
    // "Part" information for the core
    coreInfo: CalculatedPartInfo;

    // Information for all parts
    partsInfo: CalculatedPartInfo[];

    // Active propulsion item type, or undefined if core hovering
    activePropulsionType: ItemType | undefined;

    // Energy cost associated with propulsion parts by moving 1 tile
    energyUsePerMove: number;

    // Energy cost associated with weapon slots firing one volley
    energyUsePerVolley: number;

    // Heat generation associated with propulsion parts by moving 1 tile
    heatGenPerMove: number;

    energyStorage: number;

    // Heat generation associated with weapon slots firing one volley
    heatGenPerVolley: number;

    // Lowest and highest expected damage to destruction values to indicate relative vulnerability
    highestVulnerability: number;
    lowestVulnerability: number;

    slotsPerType: Map<ItemSlot, number>;

    isMelee: boolean;
    totalCoverage: number;
    totalEnergyGenPerMove: number;
    totalEnergyGenPerTurn: number;
    totalEnergyGenPerVolley: number;
    totalEnergyUsePerMove: number;
    totalEnergyUsePerTurn: number;
    totalEnergyUsePerVolley: number;
    totalHeatDissipationPerMove: number;
    totalHeatDissipationPerTurn: number;
    totalHeatDissipationPerVolley: number;
    totalHeatGenPerMove: number;
    totalHeatGenPerTurn: number;
    totalHeatGenPerVolley: number;
    totalIntegrity: number;
    totalMass: number;

    // The total support calculated from all active propulsion as the same type as the first active slot
    totalSupport: number;

    // The number of TUs per move including overweight penalties
    tusPerMove: number;

    // The number of TUs per volley including cycling time but not melee followups
    tusPerVolley: number;
};

type PartActive = "Yes" | "No";

type PartInfoType =
    | "Mass"
    | "Coverage"
    | "Vulnerability"
    | "Integrity"
    | "Energy Gain/Turn"
    | "Heat Gain/Turn"
    | "Energy Gain/Move"
    | "Heat Gain/Move"
    | "Energy Gain/Volley"
    | "Heat Gain/Volley";

type PartState = {
    active?: boolean;
    id: number;
    name: string;
    number?: string;
};

type PercentageColor =
    | "Default"
    | "EnergyConsumption"
    | "EnergyGen"
    | "HeatDissipation"
    | "HeatGen"
    | "MassSupport"
    | "Mass"
    | "Vulnerability";

const percentageColorClassLookup: Record<PercentageColor, string> = {
    Default: "build-percentage-default",
    EnergyConsumption: "build-percentage-energy-consumption",
    EnergyGen: "build-percentage-energy-gen",
    HeatDissipation: "build-percentage-heat-dissipation",
    HeatGen: "build-percentage-heat-gen",
    MassSupport: "build-percentage-mass-support",
    Mass: "build-percentage-mass",
    Vulnerability: "build-percentage-vulnerability",
};

type BuildPageState = {
    depth?: string;
    bonusEnergyGen?: string;
    bonusHeatDissipation?: string;
    partInfo?: PartInfoType;
    partState?: PartState[];
};

type SerializableBuildPageState = Omit<BuildPageState, "partState"> & {
    partState?: string;
};

const partInfoButtons: ExclusiveButtonDefinition<PartInfoType>[] = [
    { value: "Mass", tooltip: "The mass and support values of all parts." },
    { value: "Coverage", tooltip: "The coverage values of all parts." },
    {
        value: "Vulnerability",
        tooltip:
            "The approximate vulnerability of all parts. Determined by how much damage is expected before this part breaks, assuming no other parts are destroyed first.",
    },
    { value: "Integrity", tooltip: "The integrity values of all parts." },
    {
        value: "Energy Gain/Turn",
        tooltip: 'The energy generation and upkeep of all active parts per 100 "TUs" or turn.',
    },
    {
        value: "Heat Gain/Turn",
        tooltip: 'The heat generation and dissipation of all active parts per 100 "TUs" or turn.',
    },
    { value: "Energy Gain/Move", tooltip: "The energy generation and upkeep of all active parts per tile moved." },
    { value: "Heat Gain/Move", tooltip: "The heat generation and dissipation of all active parts per tile moved." },
    {
        value: "Energy Gain/Volley",
        tooltip: "The energy generation and upkeep of all active parts and weapons per volley fired.",
    },
    {
        value: "Heat Gain/Volley",
        tooltip: "The heat generation and dissipation of all active parts and weapons per volley.",
    },
];

const partActiveButtons: ExclusiveButtonDefinition<PartActive>[] = [{ value: "Yes" }, { value: "No" }];

function calculatePartsState(pageState: BuildPageState): TotalPartsState {
    const itemData = useItemData();

    type Part = {
        abilityActive: boolean;
        active: boolean;
        id: number;
        number: number;
        part: BaseItem;
        partState: PartState;
    };
    function sum(a: number, b: number) {
        return a + b;
    }

    function getEnergyPerMove(p: Part, powerAmplifierBonus: number, tusPerMove: number) {
        if (!p.active) {
            return 0;
        }

        // Return positive value for energy gen, negative for consumption
        if (p.part.slot === "Propulsion") {
            const energyPerTurn = getEnergyPerTurn(p, powerAmplifierBonus);
            return getValuePerTus(energyPerTurn, tusPerMove) - ((p.part as PropulsionItem).energyPerMove ?? 0);
        } else {
            return getValuePerTus(getEnergyPerTurn(p, powerAmplifierBonus), tusPerMove);
        }
    }

    function getEnergyPerTurn(p: Part, powerAmplifierBonus: number) {
        // Return positive value for energy gen, negative for consumption
        if (p.active && p.part.slot === "Power") {
            // Multiply only power-slot energy generation by the power amplifier bonus
            return ((p.part as PowerItem).energyGeneration ?? 0) * powerAmplifierBonus;
        } else if (hasActiveSpecialProperty(p.part, p.abilityActive, "FusionCompressor")) {
            // Fusion compressors convert matter to energy
            return (p.part.specialProperty!.trait as FusionCompressor).energyPerTurn;
        } else if ((p.active && p.part.slot === "Propulsion") || p.part.slot === "Utility") {
            return -((p.part as ItemWithUpkeep).energyUpkeep ?? 0);
        } else if (hasActiveSpecialProperty(p.part, p.abilityActive, "WeaponRegen")) {
            // Weapon regen ability turns energy into weapon integrity
            return -(p.part.specialProperty!.trait as WeaponRegen).energyPerTurn;
        }

        return 0;
    }

    function getEnergyPerVolley(
        p: Part,
        energyFilterPercent: number,
        powerAmplifierBonus: number,
        tusPerVolley: number,
    ) {
        if (!p.active) {
            return 0;
        }

        // Return positive value for energy gen, negative for consumption
        if (p.part.slot === "Weapon") {
            return -((p.part as WeaponItem).shotEnergy ?? 0) * energyFilterPercent;
        } else {
            return getValuePerTus(getEnergyPerTurn(p, powerAmplifierBonus), tusPerVolley);
        }
    }

    function getHeatPerMove(p: Part, tusPerMove: number) {
        // Return negative value for heat dissipation, positive for generation
        if (p.active && p.part.slot === "Propulsion") {
            return getValuePerTus(getHeatPerTurn(p), tusPerMove) + ((p.part as PropulsionItem).heatPerMove ?? 0);
        } else {
            return getValuePerTus(getHeatPerTurn(p), tusPerMove);
        }
    }

    function getHeatPerTurn(p: Part) {
        // Return negative value for heat dissipation, positive for generation
        if (hasActiveSpecialProperty(p.part, p.active, "HeatDissipation")) {
            return -(p.part.specialProperty!.trait as HeatDissipation).dissipation;
        } else if (p.active && (p.part.slot === "Power" || p.part.slot === "Propulsion" || p.part.slot === "Utility")) {
            return (p.part as ItemWithUpkeep).heatGeneration ?? 0;
        }

        return 0;
    }

    function getHeatPerVolley(p: Part, tusPerVolley: number) {
        if (!p.active) {
            return 0;
        }

        // Return negative values for heat dissipation, positive for generation
        if (p.part.slot === "Weapon") {
            return (p.part as WeaponItem).shotHeat ?? 0;
        } else {
            return getValuePerTus(getHeatPerTurn(p), tusPerVolley);
        }
    }

    function getMass(p: Part) {
        // Return negative value for support, positive for mass used
        if (p.active && p.part.slot === "Propulsion") {
            return -(p.part as PropulsionItem).support;
        } else if (hasActiveSpecialProperty(p.part, p.active, "MassSupport")) {
            return -(p.part.specialProperty!.trait as MassSupport).support;
        } else {
            return p.part.mass ?? 0;
        }
    }

    function getVulnerability(p: Part, totalCoverage: number) {
        if (p.part.coverage === undefined) {
            return 0;
        }

        const multiplier = 1 / (p.part.coverage / totalCoverage);
        return multiplier * p.part.integrity;
    }

    const parts: Part[] = (pageState.partState || [])
        .map((partState) => {
            const basePart = itemData.tryGetItem(partState.name);

            if (basePart === undefined) {
                return undefined!;
            } else {
                return {
                    abilityActive: partState.active || true,
                    active: partState.active || true,
                    id: partState.id,
                    number: parseIntOrDefault(partState.number, 1),
                    part: basePart,
                    partState: partState,
                };
            }
        })
        .filter((part) => part !== undefined);

    // Calculate propulsion-related stats
    const firstProp = parts.find((p) => p.active && p.part.slot === "Propulsion");
    let propulsionType: ItemType | undefined;
    let totalSupport: number;
    const totalMass = parts.map((p) => (p.part.mass ?? 0) * p.number).reduce(sum, 0);
    if (firstProp !== undefined) {
        propulsionType = firstProp.part.type;
    }
    const activeProp: PropulsionItem[] = [];
    parts
        .filter((p) => p.active && p.part.type === propulsionType)
        .forEach((p) => {
            for (let i = 0; i < p.number; i++) {
                activeProp.push(p.part as PropulsionItem);
            }
        });
    activeProp.sort((a, b) => (a.modPerExtra ?? 0) - (b.modPerExtra ?? 0));
    if (activeProp.length === 0) {
        // Core hover has 3 support
        totalSupport = 3;
    } else {
        // Sum support of all active prop
        totalSupport = activeProp.map((p) => p.support).reduce(sum, 0);
    }

    // Add mass support utils
    totalSupport += parts
        .filter((p) => hasActiveSpecialProperty(p.part, p.active, "MassSupport"))
        .map((p) => (p.part.specialProperty!.trait as MassSupport).support)
        .reduce(sum, 0);

    // Set irrelevant prop types to inactive
    parts.forEach((p) => {
        if (p.part.slot === "Propulsion" && !activeProp.includes(p.part as PropulsionItem)) {
            p.active = false;
        }
    });

    let tusPerMove: number;
    let overweightPenalty: number;
    if (activeProp.length === 0) {
        // If no active prop then use core hover speed initially...
        tusPerMove = 50;
        overweightPenalty = 50;
    } else {
        // First calculate the average speed of all parts...
        tusPerMove = Math.trunc(activeProp.map((p) => p.timePerMove).reduce(sum, 0) / activeProp.length);

        // Then calculate average penalty of all parts...
        overweightPenalty = Math.trunc(activeProp.map((p) => p.penalty).reduce(sum, 0) / activeProp.length);

        // Then apply per/move mods...
        tusPerMove += activeProp
            .filter((_, i) => i !== 0)
            .map((p) => p.modPerExtra ?? 0)
            .reduce(sum, 0);

        // Then apply overload mods...
        // TODO
    }

    // Then apply speed doubling like metafield before penalties...
    if (
        parts.find((p) => hasActiveSpecialProperty(p.part, p.active, "AirborneSpeedDoubling")) !== undefined &&
        (activeProp.length === 0 ||
            activeProp[0].type === ItemType.HoverUnit ||
            activeProp[0].type === ItemType.FlightUnit)
    ) {
        tusPerMove /= 2;
    }

    // Then apply overweight penalties...
    tusPerMove += Math.trunc(Math.max(0, totalMass - 1) / totalSupport) * overweightPenalty;

    // Then apply drag penalties if airborne...
    if (propulsionType === ItemType.FlightUnit || propulsionType === ItemType.HoverUnit) {
        tusPerMove += parts
            .filter((p) => p.part.slot === "Propulsion")
            .map((p) => (p.part as PropulsionItem).drag ?? 0)
            .reduce(sum, 0);
    }

    // Also apply a cap of 20 for hover or 10 for flight
    if (propulsionType === ItemType.FlightUnit) {
        tusPerMove = Math.max(tusPerMove, 10);
    } else if (propulsionType === ItemType.HoverUnit) {
        tusPerMove = Math.max(tusPerMove, 10);
    }

    // Apply metafiber after penalties
    if (
        parts.find((p) => hasActiveSpecialProperty(p.part, p.active, "Metafiber")) !== undefined &&
        activeProp.length > 0 &&
        activeProp[0].type === ItemType.Leg
    ) {
        tusPerMove *= 0.8;
    }

    // Calculate weapon-related stats
    const firstWeapon = parts.find((p) => p.active && p.part.slot === "Weapon");
    const isMelee = firstWeapon !== undefined && isPartMelee(firstWeapon.part);

    // Set irrelevant weapon types to inactive
    const activeWeapons: WeaponItem[] = [];
    parts.forEach((p) => {
        if (p.part.slot !== "Weapon") {
            return;
        }

        if ((isMelee && !isPartMelee(p.part)) || (!isMelee && isPartMelee(p.part))) {
            p.active = false;
        } else if (p.active) {
            for (let i = 0; i < p.number; i++) {
                activeWeapons.push(p.part as WeaponItem);

                if (isMelee) {
                    break;
                }
            }
        }
    });

    let tusPerVolley: number;
    if (isMelee) {
        // Assumes that all actuators stack up to 50%
        const actuatorParts = parts.filter((p) => hasActiveSpecialProperty(p.part, p.active, "Actuator"));
        let actuatorModifier = 0;
        actuatorParts.forEach(
            (p) => (actuatorModifier += (p.part.specialProperty!.trait as Actuator).amount * p.number),
        );
        actuatorModifier = 1 - Math.min(0.5, actuatorModifier);

        tusPerVolley = actuatorModifier * ((activeWeapons[0].delay ?? 0) + volleyTimeMap[1]);
    } else {
        let cyclerModifier = 0;
        // Semi-hacky, assumes that 50% cyclers are no-stack and all others stack up to 30%
        if (
            parts.filter((p) => hasActiveSpecialProperty(p.part, p.active, "QuantumCapacitor")).length > 0 &&
            activeWeapons.length === 1 &&
            (activeWeapons[0].type === ItemType.EnergyGun || activeWeapons[0].type === ItemType.EnergyCannon)
        ) {
            cyclerModifier = 0.5;
        } else if (
            parts.filter((p) => hasActiveSpecialProperty(p.part, p.active, "LauncherLoader")).length > 0 &&
            activeWeapons.length === 1 &&
            activeWeapons[0].type === ItemType.Launcher
        ) {
            cyclerModifier = 0.5;
        } else {
            const cyclerParts = parts.filter((p) => hasActiveSpecialProperty(p.part, p.active, "RangedWeaponCycling"));
            cyclerParts.forEach(
                (p) => (cyclerModifier += (p.part.specialProperty!.trait as RangedWeaponCycling).amount),
            );
            cyclerModifier = 1 - Math.min(0.3, cyclerModifier);
        }

        tusPerVolley = getRangedVolleyTime(activeWeapons, cyclerModifier);
    }

    let depth = Math.abs(parseIntOrDefault(pageState.depth, 10));
    depth = Math.max(1, Math.min(10, depth));

    const innateEnergyGen = parseIntOrDefault(pageState.bonusEnergyGen, 0);
    const innateHeatDissipation = parseIntOrDefault(pageState.bonusHeatDissipation, 0);

    // Core is additional 100 coverage
    const totalCoverage = parts.map((p) => (p.part.coverage ?? 0) * p.number).reduce(sum, 0) + 100;

    // Calculate core info
    const coreInfo: CalculatedPartInfo = {
        active: true,
        coverage: 100,
        energyPerMove: activeProp.length > 0 ? getValuePerTus(5, tusPerMove) : getValuePerTus(5, tusPerMove) - 1,
        energyPerTurn: 5,
        energyPerVolley: activeProp.length > 0 ? getValuePerTus(5, tusPerVolley) : getValuePerTus(5, tusPerVolley) - 1,
        heatPerMove: -getValuePerTus(55 - 3 * depth + innateHeatDissipation, tusPerMove),
        heatPerTurn: -(55 - 3 * depth + innateHeatDissipation),
        heatPerVolley: -getValuePerTus(55 - 3 * depth + innateHeatDissipation, tusPerVolley),
        name: "Core",
        partState: null!,
        id: -1,
        integrity: 1750 - 150 * depth,
        mass: activeProp.length > 0 ? 0 : -3,
        size: 0,
        slot: "N/A",
        vulnerability: (totalCoverage / 100) * (1750 - 150 * depth),
    };

    // Get energy bonuses
    let powerAmplifierBonus = 1;
    parts.forEach((p) => {
        if (hasActiveSpecialProperty(p.part, p.active, "PowerAmplifier")) {
            powerAmplifierBonus += (p.part.specialProperty!.trait as PowerAmplifier).percent * p.number;
        }
    });

    const filterValues: number[] = [];
    parts.forEach((p) => {
        if (hasActiveSpecialProperty(p.part, p.active, "EnergyFilter")) {
            for (let i = 0; i < p.number; i++) {
                filterValues.push((p.part.specialProperty!.trait as EnergyFilter).percent);
            }
        }
    });
    const [topFilter, secondFilter] = getTopTwoValues(filterValues);
    const energyFilterPercent = 1 - (topFilter + 0.5 * secondFilter);

    // Calculate info for each part
    const partsInfo: CalculatedPartInfo[] = parts.map((p) => {
        let activeMultiplierNumber = p.active ? p.number : 0;
        if (isMelee && isPartMelee(p.part) && p.active) {
            // In case multiple melee weapons are selected, only count the first
            activeMultiplierNumber = 1;
        }

        return {
            active: p.abilityActive,
            coverage: (p.part.coverage ?? 0) * p.number,
            energyPerMove: getEnergyPerMove(p, powerAmplifierBonus, tusPerMove) * activeMultiplierNumber,
            energyPerTurn: getEnergyPerTurn(p, powerAmplifierBonus) * activeMultiplierNumber,
            energyPerVolley:
                getEnergyPerVolley(p, energyFilterPercent, powerAmplifierBonus, tusPerVolley) * activeMultiplierNumber,
            heatPerMove: getHeatPerMove(p, tusPerMove) * activeMultiplierNumber,
            heatPerTurn: getHeatPerTurn(p) * activeMultiplierNumber,
            heatPerVolley: getHeatPerVolley(p, tusPerVolley) * activeMultiplierNumber,
            id: p.id,
            integrity: p.part.integrity * p.number,
            name: p.part.name,
            mass: getMass(p) * p.number,
            partState: p.partState,
            slot: p.part.slot,
            size: p.part.size * p.number,
            vulnerability: getVulnerability(p, totalCoverage),
        };
    });

    // Calculate totals
    const allPartInfo = partsInfo.concat(coreInfo);
    const totalEnergyGenPerTurn =
        innateEnergyGen + allPartInfo.map((p) => (p.energyPerTurn > 0 ? p.energyPerTurn : 0)).reduce(sum, 0);
    const totalEnergyUsePerTurn = allPartInfo.map((p) => (p.energyPerTurn < 0 ? -p.energyPerTurn : 0)).reduce(sum, 0);
    const totalHeatDissipationPerTurn = allPartInfo.map((p) => (p.heatPerTurn < 0 ? -p.heatPerTurn : 0)).reduce(sum, 0);
    const totalHeatGenPerTurn = allPartInfo.map((p) => (p.heatPerTurn > 0 ? p.heatPerTurn : 0)).reduce(sum, 0);
    const totalIntegrity = allPartInfo.map((p) => p.integrity).reduce(sum, 0);

    let energyPerMove = activeProp.map((p) => p.energyPerMove ?? 0).reduce(sum, 0);
    if (energyPerMove === 0) {
        // Core hover has 1 energy per move cost
        energyPerMove = 1;
    }
    const heatPerMove = activeProp.map((p) => p.heatPerMove ?? 0).reduce(sum, 0);
    const totalEnergyGenPerMove = getValuePerTus(totalEnergyGenPerTurn, tusPerMove);
    const totalEnergyUsePerMove = getValuePerTus(totalEnergyUsePerTurn, tusPerMove) + energyPerMove;
    const totalHeatDissipationPerMove = getValuePerTus(totalHeatDissipationPerTurn, tusPerMove);
    const totalHeatGenPerMove = getValuePerTus(totalHeatGenPerTurn, tusPerMove) + heatPerMove;

    const energyPerVolley = activeWeapons.map((p) => (p.shotEnergy ?? 0) * energyFilterPercent).reduce(sum, 0);
    const heatPerVolley = activeWeapons.map((p) => p.shotHeat ?? 0).reduce(sum, 0);
    const totalEnergyGenPerVolley = getValuePerTus(totalEnergyGenPerTurn, tusPerVolley);
    const totalEnergyUsePerVolley = getValuePerTus(totalEnergyUsePerTurn, tusPerVolley) + energyPerVolley;
    const totalHeatDissipationPerVolley = getValuePerTus(totalHeatDissipationPerTurn, tusPerVolley);
    const totalHeatGenPerVolley = getValuePerTus(totalHeatGenPerTurn, tusPerVolley) + heatPerVolley;
    const vulnerabilities = allPartInfo.map((p) => p.vulnerability).filter((v) => v !== 0);
    const lowestVulnerability = Math.max(...vulnerabilities, coreInfo.vulnerability) / 0.9;
    const highestVulnerability = Math.min(...vulnerabilities, coreInfo.vulnerability) * 0.9;

    const energyStorage =
        100 +
        parts
            .map((p) => {
                if (hasActiveSpecialProperty(p.part, p.active, "EnergyStorage")) {
                    return (p.part.specialProperty!.trait as EnergyStorage).storage * p.number;
                } else if (p.active && p.part.slot === "Power") {
                    return ((p.part as PowerItem).energyStorage ?? 0) * p.number;
                } else {
                    return 0;
                }
            })
            .reduce(sum, 0);

    const slotsPerType = new Map<ItemSlot, number>([
        ["N/A", 0],
        ["Power", 0],
        ["Propulsion", 0],
        ["Utility", 0],
        ["Weapon", 0],
    ]);
    allPartInfo.forEach((p) => {
        slotsPerType.set(p.slot, slotsPerType.get(p.slot)! + p.size);
    });

    return {
        activePropulsionType: propulsionType,
        coreInfo: coreInfo,
        isMelee: isMelee,
        partsInfo: partsInfo,
        energyStorage: energyStorage,
        energyUsePerMove: energyPerMove,
        energyUsePerVolley: energyPerVolley,
        heatGenPerMove: heatPerMove,
        heatGenPerVolley: heatPerVolley,
        lowestVulnerability: lowestVulnerability,
        highestVulnerability: highestVulnerability,
        slotsPerType: slotsPerType,
        totalCoverage: totalCoverage,
        totalEnergyGenPerMove: totalEnergyGenPerMove,
        totalEnergyGenPerTurn: totalEnergyGenPerTurn,
        totalEnergyGenPerVolley: totalEnergyGenPerVolley,
        totalEnergyUsePerMove: totalEnergyUsePerMove,
        totalEnergyUsePerTurn: totalEnergyUsePerTurn,
        totalEnergyUsePerVolley: totalEnergyUsePerVolley,
        totalHeatDissipationPerMove: totalHeatDissipationPerMove,
        totalHeatDissipationPerTurn: totalHeatDissipationPerTurn,
        totalHeatDissipationPerVolley: totalHeatDissipationPerVolley,
        totalHeatGenPerTurn: totalHeatGenPerTurn,
        totalHeatGenPerMove: totalHeatGenPerMove,
        totalHeatGenPerVolley: totalHeatGenPerVolley,
        totalIntegrity: totalIntegrity,
        totalMass: totalMass,
        totalSupport: totalSupport,
        tusPerMove: tusPerMove,
        tusPerVolley: tusPerVolley,
    };
}

function getPageState(): BuildPageState {
    const search = useSearch();

    const serializablePageState: SerializableBuildPageState = parseSearchParameters(search, {});

    let partState: PartState[] | undefined = undefined;

    if (serializablePageState.partState !== undefined) {
        // Attempt to parse the parse parts state from string
        const partString = LZString.decompressFromEncodedURIComponent(serializablePageState.partState);

        if (partString !== null) {
            const parsedPartState = JSON.parse(partString);

            if (Array.isArray(parsedPartState)) {
                partState = parsedPartState;
            }
        }
    }

    return {
        ...serializablePageState,
        partState: partState,
    };
}

function getSerializedPageState(pageState: BuildPageState): SerializableBuildPageState {
    let partState: string | undefined;

    if (pageState.partState && pageState.partState.length > 0) {
        const partStateString = JSON.stringify(pageState.partState);
        partState = LZString.compressToEncodedURIComponent(partStateString);
    }

    return {
        ...pageState,
        partState: partState,
    };
}

function skipLocationMember(key: string, pageState: SerializableBuildPageState) {
    const typedKey: keyof SerializableBuildPageState = key as keyof SerializableBuildPageState;

    if (typedKey === "partInfo" && pageState.partInfo === "Mass") {
        // Skip enum default values
        return true;
    }

    return false;
}

function CoreSection({ pageState, partsState }: { pageState: BuildPageState; partsState: TotalPartsState }) {
    let coreInfo: ReactNode;

    const infoType = pageState.partInfo || "Mass";
    switch (infoType) {
        case "Coverage":
            coreInfo = <InfoContainerBase color="Default" percentage={10000 / partsState.totalCoverage} value={100} />;
            break;

        case "Energy Gain/Move": {
            const energy = partsState.coreInfo.energyPerMove;
            const energyPercent = (energy * 100) / partsState.totalEnergyGenPerMove;
            coreInfo = <InfoContainerBase color="EnergyGen" percentage={energyPercent} value={energy} />;
            break;
        }

        case "Energy Gain/Turn": {
            const energy = partsState.coreInfo.energyPerTurn;
            const energyPercent = (energy * 100) / partsState.totalEnergyGenPerTurn;
            coreInfo = <InfoContainerBase color="EnergyGen" percentage={energyPercent} value={energy} />;
            break;
        }

        case "Energy Gain/Volley": {
            const energy = partsState.coreInfo.energyPerVolley;
            const energyPercent = (energy * 100) / partsState.totalEnergyGenPerVolley;
            coreInfo = <InfoContainerBase color="EnergyGen" percentage={energyPercent} value={energy} />;
            break;
        }

        case "Heat Gain/Move": {
            const heat = partsState.coreInfo.heatPerMove;
            const heatPercent = (-heat * 100) / partsState.totalHeatDissipationPerMove;
            coreInfo = <InfoContainerBase color="HeatDissipation" percentage={heatPercent} value={heat} />;
            break;
        }

        case "Heat Gain/Turn": {
            const heat = partsState.coreInfo.heatPerTurn;
            const heatPercent = (-heat * 100) / partsState.totalHeatDissipationPerTurn;
            coreInfo = <InfoContainerBase color="HeatDissipation" percentage={heatPercent} value={heat} />;
            break;
        }

        case "Heat Gain/Volley": {
            const heat = partsState.coreInfo.heatPerVolley;
            const heatPercent = (-heat * 100) / partsState.totalHeatDissipationPerVolley;
            coreInfo = <InfoContainerBase color="HeatDissipation" percentage={heatPercent} value={heat} />;
            break;
        }

        case "Integrity": {
            const integrity = partsState.coreInfo.integrity;
            const integrityPercent = (integrity * 100) / partsState.totalIntegrity;
            coreInfo = <InfoContainerBase color="Default" percentage={integrityPercent} value={integrity} />;
            break;
        }

        case "Mass": {
            const support = partsState.coreInfo.mass;
            const supportPercent = (-support * 100) / partsState.totalSupport;
            coreInfo = <InfoContainerBase color="Mass" percentage={supportPercent} value={support} />;
            break;
        }

        case "Vulnerability": {
            const vulnerability = partsState.coreInfo.vulnerability;
            const diffFromMin = vulnerability - partsState.highestVulnerability;
            const minMaxDiff = partsState.lowestVulnerability - partsState.highestVulnerability;
            const percentage = minMaxDiff === 0 ? 100.0 : 100.0 * (1.0 - diffFromMin / minMaxDiff);
            coreInfo = (
                <InfoContainerBase
                    color="Vulnerability"
                    percentage={percentage}
                    value={Math.ceil(vulnerability)}
                    percentageString=""
                />
            );
            break;
        }

        default:
            assertUnreachable(infoType);
    }

    return (
        <>
            <TitleSection title="Core" tooltip="Information about builtin core stats." content={coreInfo} />
        </>
    );
}

function InfoContainerBase({
    color,
    percentage,
    percentageString,
    value,
}: {
    color: PercentageColor;
    percentage: number;
    percentageString?: string;
    value: number;
}) {
    percentageString = percentageString === undefined ? percentage.toFixed(1) + "%" : percentageString;

    const valueText = Number.isInteger(value) ? value.toString() : value.toFixed(1);
    const percentageText = value === 0 ? value : `${valueText} ${percentageString}`;

    return (
        <div className="build-percentage-bar-container">
            <span className="build-percentage-bar-text">{percentageText}</span>
            <div
                style={{ width: `${Math.min(100, percentage)}%` }}
                className={`build-percentage-bar-inner ${percentageColorClassLookup[color]}`}
            />
        </div>
    );
}

function InfoContainer({
    infoType,
    partInfo,
    partsState,
}: {
    infoType: PartInfoType;
    partInfo: CalculatedPartInfo;
    partsState: TotalPartsState;
}) {
    switch (infoType) {
        case "Coverage": {
            // Add coverage info and percentage bar
            const coverage = partInfo.coverage;
            const coveragePercent = (coverage * 100) / partsState.totalCoverage;
            return <InfoContainerBase color="Default" percentage={coveragePercent} value={coverage} />;
        }

        case "Energy Gain/Move": {
            // Add energy/move info and percentage bar
            const energy = partInfo.energyPerMove;
            let energyPercent = 0;
            let color: PercentageColor = "Default";
            if (energy > 0) {
                energyPercent = (energy * 100) / partsState.totalEnergyGenPerMove;
                color = "EnergyGen";
            } else if (energy < 0) {
                energyPercent = (-energy * 100) / partsState.totalEnergyUsePerMove;
                color = "EnergyConsumption";
            }

            return <InfoContainerBase color={color} percentage={energyPercent} value={energy} />;
        }

        case "Energy Gain/Turn": {
            // Add energy/turn info and percentage bar
            const energy = partInfo.energyPerTurn;
            let energyPercent = 0;
            let color: PercentageColor = "Default";
            if (energy > 0) {
                energyPercent = (energy * 100) / partsState.totalEnergyGenPerTurn;
                color = "EnergyGen";
            } else if (energy < 0) {
                energyPercent = (-energy * 100) / partsState.totalEnergyUsePerTurn;
                color = "EnergyConsumption";
            }

            return <InfoContainerBase color={color} percentage={energyPercent} value={energy} />;
        }

        case "Energy Gain/Volley": {
            // Add energy/volley info and percentage bar
            const energy = partInfo.energyPerVolley;
            let energyPercent = 0;
            let color: PercentageColor = "Default";
            if (energy > 0) {
                energyPercent = (energy * 100) / partsState.totalEnergyGenPerVolley;
                color = "EnergyGen";
            } else if (energy < 0) {
                energyPercent = (-energy * 100) / partsState.totalEnergyUsePerVolley;
                color = "EnergyConsumption";
            }

            return <InfoContainerBase color={color} percentage={energyPercent} value={energy} />;
        }

        case "Heat Gain/Move": {
            // Add heat/move info and percentage bar
            const heat = partInfo.heatPerMove;
            let heatPercent = 0;
            let color: PercentageColor;
            if (heat > 0) {
                heatPercent = (heat * 100) / partsState.totalHeatGenPerMove;
                color = "HeatGen";
            } else {
                heatPercent = (-heat * 100) / partsState.totalHeatDissipationPerMove;
                color = "HeatDissipation";
            }

            return <InfoContainerBase color={color} percentage={heatPercent} value={heat} />;
        }

        case "Heat Gain/Turn": {
            // Add heat/turn info and percentage bar
            const heat = partInfo.heatPerTurn;
            let heatPercent = 0;
            let color: PercentageColor;
            if (heat > 0) {
                heatPercent = (heat * 100) / partsState.totalHeatGenPerTurn;
                color = "HeatGen";
            } else {
                heatPercent = (-heat * 100) / partsState.totalHeatDissipationPerTurn;
                color = "HeatDissipation";
            }

            return <InfoContainerBase color={color} percentage={heatPercent} value={heat} />;
        }

        case "Heat Gain/Volley": {
            // Add heat/volley info and percentage bar
            const heat = partInfo.heatPerVolley;
            let heatPercent = 0;
            let color: PercentageColor;
            if (heat > 0) {
                heatPercent = (heat * 100) / partsState.totalHeatGenPerVolley;
                color = "HeatGen";
            } else {
                heatPercent = (-heat * 100) / partsState.totalHeatDissipationPerVolley;
                color = "HeatDissipation";
            }

            return <InfoContainerBase color={color} percentage={heatPercent} value={heat} />;
        }

        case "Integrity": {
            // Add integrity info and percentage bar
            const integrity = partInfo.integrity;
            const integrityPercent = (integrity * 100) / partsState.totalIntegrity;

            return <InfoContainerBase color="Default" percentage={integrityPercent} value={integrity} />;
        }

        case "Mass": {
            // Add mass info and percentage bar
            // If we're a propulsion item then show negative mass for support and the total support percent
            const mass = partInfo.mass;
            let massPercent = 0;
            let color: PercentageColor;
            if (mass > 0) {
                massPercent = (mass * 100) / partsState.totalMass;
                color = "Mass";
            } else {
                massPercent = (-mass * 100) / partsState.totalSupport;
                color = "MassSupport";
            }

            return <InfoContainerBase color={color} percentage={massPercent} value={mass} />;
        }

        case "Vulnerability": {
            const vulnerability = partInfo.vulnerability;
            const diffFromMin = vulnerability - partsState.highestVulnerability;
            const minMaxDiff = partsState.lowestVulnerability - partsState.highestVulnerability;
            const percentage = minMaxDiff === 0 ? 100.0 : 100.0 * (1.0 - diffFromMin / minMaxDiff);

            return (
                <InfoContainerBase
                    color="Vulnerability"
                    percentage={percentage}
                    percentageString=""
                    value={Math.ceil(vulnerability)}
                />
            );
        }

        default:
            assertUnreachable(infoType);
    }
}

function PartRow({
    i,
    itemData,
    itemOptions,
    pageState,
    partInfo,
    partsState,
    updatePageState,
}: {
    i: number;
    itemData: ItemData;
    itemOptions: SelectOptionType[];
    pageState: BuildPageState;
    partInfo: CalculatedPartInfo;
    partsState: TotalPartsState;
    updatePageState: (newPageState: BuildPageState) => void;
}) {
    const selectInfoGroup = (
        <div className="build-part-row-group">
            <SelectWrapper
                className="build-part-select"
                onChange={(val) => {
                    // Update the current selected part
                    const oldPageState = pageState.partState!;
                    const partState = [...oldPageState];
                    partState[i] = { ...oldPageState[i], name: val!.value };

                    updatePageState({ ...pageState, partState: partState });
                }}
                value={itemOptions.find((o) => o.value === partInfo.name)}
                options={itemOptions}
            />
            <ItemPopoverButton item={itemData.getItem(partInfo.name)} tooltip="Show details about the part." text="?" />
        </div>
    );

    const numberInput = (
        <LabeledInput
            label="Number"
            tooltip="The number of parts of this type."
            className="build-part-row-growable"
            value={pageState.partState![i].number}
            placeholder="1"
            onChange={(value) => {
                // Update the current selected part
                const oldPageState = pageState.partState!;
                const partState = [...oldPageState];
                partState[i] = { ...oldPageState[i], number: value };

                updatePageState({ ...pageState, partState: partState });
            }}
        />
    );

    const activeGroup = (
        <LabeledExclusiveButtonGroup
            label="Active"
            tooltip="Is the part active or not? Mixed propulsion types will be determined by the first active type."
            buttons={partActiveButtons}
            selected={partsState.partsInfo[i].active || partsState.partsInfo[i].active === undefined ? "Yes" : "No"}
            onValueChanged={(value) => {
                // Update the current selected part
                const oldPageState = pageState.partState!;
                const partState = [...oldPageState];
                partState[i] = { ...oldPageState[i], active: value === "No" ? false : true };
            }}
        />
    );

    const deleteButton = (
        <Button
            tooltip="Deletes this part."
            onClick={() => {
                // Remove the part at this index from the state
                const partState = [...pageState.partState!];
                partState.splice(partState.indexOf(partInfo.partState), 1);

                updatePageState({ ...pageState, partState: partState });
            }}
        >
            X
        </Button>
    );

    return (
        <>
            <div className="build-part-row">
                {selectInfoGroup}
                {numberInput}
                {activeGroup}
                {deleteButton}
            </div>
            <InfoContainer infoType={pageState.partInfo || "Mass"} partInfo={partInfo} partsState={partsState} />
        </>
    );
}

function SlotSection({
    pageState,
    partsState,
    slot,
    updatePageState,
}: {
    pageState: BuildPageState;
    partsState: TotalPartsState;
    slot: ItemSlot;
    updatePageState: (newPageState: BuildPageState) => void;
}) {
    const itemData = useItemData();
    const spoilers = useSpoilers();

    const availableItems = itemData
        .getFilteredItems((item) => {
            return item.slot === slot && canShowSpoiler(item.spoiler, spoilers);
        })
        .map((item) => item.name);
    availableItems.sort();
    const itemOptions: SelectOptionType[] = availableItems.map((itemName) => ({ value: itemName }));

    function AddPartRow() {
        return (
            <div className="build-part-row">
                <SelectWrapper
                    className="build-part-row-growable"
                    onChange={(val) => {
                        const partState = [...(pageState.partState || [])];

                        // New ID = highest of all numbers
                        const id = Math.max(0, ...partState.map((p) => p.id + 1));
                        partState.push({ name: val!.value, id });

                        updatePageState({ ...pageState, partState });
                    }}
                    controlShouldRenderValue={false}
                    options={itemOptions}
                />
            </div>
        );
    }

    const partsInfo = partsState.partsInfo.filter((part) => part.slot === slot);

    const partRows = partsInfo.map((partInfo, i) => {
        return (
            <PartRow
                key={partInfo.id}
                i={i}
                itemData={itemData}
                itemOptions={itemOptions}
                pageState={pageState}
                partInfo={partInfo}
                partsState={partsState}
                updatePageState={updatePageState}
            />
        );
    });

    return (
        <>
            <TitleSection
                title={`${slot} x${partsInfo.length}`}
                tooltip={`Selection and information about ${slot.toLowerCase()} slot parts.`}
            />
            <div className="build-grid-container">
                {partRows}
                <AddPartRow />
            </div>
        </>
    );
}

function SummaryDetail({ label, tooltip, value }: { label: string; tooltip: string; value: string | number }) {
    if (typeof value === "number" && !Number.isInteger(value)) {
        // Round decimal numbers to the 10ths place
        value = value.toFixed(1);
    }

    return <SoloLabel label={`${label}: ${value}`} tooltip={tooltip} />;
}

function SummarySection({ partsState }: { partsState: TotalPartsState }) {
    const overweightText =
        partsState.totalSupport >= partsState.totalMass
            ? ""
            : " 0x" + Math.trunc(partsState.totalMass / partsState.totalSupport);

    return (
        <>
            <TitleSection title="Summary" tooltip="Summary information about Cogmind and all parts." />
            <div className="build-summary-container">
                <SummaryDetail
                    label="Support"
                    tooltip="Total mass / total support, including overweight multiplier if applicable."
                    value={`${partsState.totalMass}/${partsState.totalSupport}${overweightText}`}
                />
                <SummaryDetail
                    label="Movement"
                    tooltip="Movement type and speed."
                    value={`${getMovementText(partsState.activePropulsionType)} (${partsState.tusPerMove})`}
                />
                <SummaryDetail
                    label="Total Integrity"
                    tooltip="Total integrity of all parts and core."
                    value={partsState.totalIntegrity}
                />
                <SummaryDetail
                    label="Total Coverage"
                    tooltip="Total coverage of all parts and core."
                    value={partsState.totalCoverage}
                />
                <SummaryDetail
                    label="Energy Storage"
                    tooltip="Total energy storage of all equipped parts."
                    value={partsState.energyStorage}
                />
                <SummaryDetail
                    label="Net Energy/Turn"
                    tooltip="The amount of energy gained (or lost) per turn by waiting."
                    value={partsState.totalEnergyGenPerTurn - partsState.totalEnergyUsePerTurn}
                />
                <SummaryDetail
                    label="Net Heat/Turn"
                    tooltip="The amount of heat gained (or lost) per turn by waiting."
                    value={partsState.totalHeatGenPerTurn - partsState.totalHeatDissipationPerTurn}
                />
                <SummaryDetail
                    label="Net Energy/Move"
                    tooltip="The amount of energy gained (or lost) per single tile move."
                    value={partsState.totalEnergyGenPerMove - partsState.totalEnergyUsePerMove}
                />
                <SummaryDetail
                    label="Net Heat/Move"
                    tooltip="The amount of heat gained (or lost) per single tile move."
                    value={partsState.totalHeatGenPerMove - partsState.totalHeatDissipationPerMove}
                />
                <SummaryDetail
                    label="Volley Time"
                    tooltip="The amount of TUs per volley. For melee this assumes no followups."
                    value={partsState.tusPerVolley}
                />
                <SummaryDetail
                    label="Net Energy/Volley"
                    tooltip="The amount of energy gained (or lost) per full volley. For melee this assumes no followups."
                    value={partsState.totalEnergyGenPerVolley - partsState.totalEnergyUsePerVolley}
                />
                <SummaryDetail
                    label="Net Heat/Volley"
                    tooltip="The amount of heat gained (or lost) per full volley. For melee this assumes no followups."
                    value={partsState.totalHeatGenPerVolley - partsState.totalHeatDissipationPerVolley}
                />
            </div>
        </>
    );
}

function TitleSection({ content, title, tooltip }: { content?: ReactNode; title: string; tooltip: string }) {
    return (
        <div className="build-grid-container">
            <SoloLabel className="build-label-header" label={title} tooltip={tooltip} />
            {content}
        </div>
    );
}

export default function BuildPage() {
    const [_, setLocation] = useLocation();
    const pageState = getPageState();

    const totalPartsState = calculatePartsState(pageState);

    function updatePageState(newPageState: BuildPageState) {
        console.log(newPageState);

        const serializablePageState = getSerializedPageState(newPageState);
        const location = getLocationFromState("/build", serializablePageState, skipLocationMember);
        setLocation(location, { replace: true });
    }

    return (
        <div className="page-content">
            <div className="page-input-group">
                <LabeledInput
                    label="Depth"
                    value={pageState.depth}
                    onChange={(val) => {
                        updatePageState({ ...pageState, depth: val });
                    }}
                    placeholder="-10"
                    tooltip="The current depth. Affects core integrity and heat dissipation."
                />
                <LabeledInput
                    label="Bonus Energy Gen"
                    value={pageState.bonusEnergyGen}
                    onChange={(val) => {
                        updatePageState({ ...pageState, bonusEnergyGen: val });
                    }}
                    placeholder="0"
                    tooltip="The amount of additional innate energy generation Cogmind has from alien artifacts."
                />
                <LabeledInput
                    label="Bonus Heat Dissipation"
                    value={pageState.bonusHeatDissipation}
                    onChange={(val) => {
                        updatePageState({ ...pageState, bonusHeatDissipation: val });
                    }}
                    placeholder="0"
                    tooltip="The amount of additional innate heat dissipation Cogmind has from alian artifacts (not including the standard depth bonus)."
                />
                <Button
                    tooltip="Resets all filters to their default (unfiltered) state"
                    className="flex-grow-0"
                    onClick={() => updatePageState({})}
                >
                    Reset
                </Button>
            </div>
            <div className="page-input-group">
                <LabeledExclusiveButtonGroup
                    buttons={partInfoButtons}
                    label="Part Info"
                    onValueChanged={(val) => {
                        updatePageState({ ...pageState, partInfo: val });
                    }}
                    selected={pageState.partInfo}
                />
            </div>
            <SummarySection partsState={totalPartsState} />
            <CoreSection pageState={pageState} partsState={totalPartsState} />
            <SlotSection
                pageState={pageState}
                partsState={totalPartsState}
                slot="Power"
                updatePageState={updatePageState}
            />
            <SlotSection
                pageState={pageState}
                partsState={totalPartsState}
                slot="Propulsion"
                updatePageState={updatePageState}
            />
            <SlotSection
                pageState={pageState}
                partsState={totalPartsState}
                slot="Utility"
                updatePageState={updatePageState}
            />
            <SlotSection
                pageState={pageState}
                partsState={totalPartsState}
                slot="Weapon"
                updatePageState={updatePageState}
            />
        </div>
    );
}
