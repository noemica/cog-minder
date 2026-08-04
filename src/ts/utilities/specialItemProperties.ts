import { SpecialItemProperty } from "../types/itemTypes";
import * as itemTypes from "../types/itemTypes";

export const specialItemProperties: { [name: string]: SpecialItemProperty | undefined } = {
    // Ablative armor
    "Mak. Ablative Armor": { active: "Always", trait: { kind: itemTypes.AblativeArmorIndex } },

    // Actuator
    Microactuators: { active: "Part Active", trait: { kind: itemTypes.ActuatorIndex, amount: 0.2 } },
    Nanoactuators: { active: "Part Active", trait: { kind: itemTypes.ActuatorIndex, amount: 0.3 } },
    Femtoactuators: { active: "Part Active", trait: { kind: itemTypes.ActuatorIndex, amount: 0.5 } },

    // Actuator Arrays
    "Actuator Array": { active: "Part Active", trait: { kind: itemTypes.ActuatorArrayIndex, amount: 10 } },
    "Imp. Actuator Array": { active: "Part Active", trait: { kind: itemTypes.ActuatorArrayIndex, amount: 12 } },
    "Adv. Actuator Array": { active: "Part Active", trait: { kind: itemTypes.ActuatorArrayIndex, amount: 16 } },
    "Exp. Actuator Array": { active: "Part Active", trait: { kind: itemTypes.ActuatorArrayIndex, amount: 20 } },

    // Airborne Speed doubling
    "Zio. Metafield Generator": { active: "Part Active", trait: { kind: itemTypes.AirborneSpeedDoublingIndex } },
    "ST Field Compressor": { active: "Part Active", trait: { kind: itemTypes.AirborneSpeedDoublingIndex } },

    // Antimissile
    "Point Defense System": { active: "Part Active", trait: { kind: itemTypes.AntimissileChanceIndex, chance: 8 } },
    "Imp. Point Defense System": {
        active: "Part Active",
        trait: { kind: itemTypes.AntimissileChanceIndex, chance: 16 },
    },
    "Adv. Point Defense System": {
        active: "Part Active",
        trait: { kind: itemTypes.AntimissileChanceIndex, chance: 24 },
    },
    "Cep. Antimissile System": { active: "Part Active", trait: { kind: itemTypes.AntimissileChanceIndex, chance: 48 } },

    // Combat Suite
    "Asb. Combat Suite": {
        active: "Part Active",
        trait: { kind: itemTypes.CombatSuiteIndex, core: 8, rangedAvoid: 8, targeting: 8 },
    },

    // Core Analyzer
    "Core Analyzer": { active: "Part Active", trait: { kind: itemTypes.CoreAnalyzerIndex, bonus: 6 } },
    "Exp. Core Analyzer": { active: "Part Active", trait: { kind: itemTypes.CoreAnalyzerIndex, bonus: 8 } },

    // Corruption ignore %
    "Dynamic Insulation System": {
        active: "Part Active",
        trait: { kind: itemTypes.CorruptionIgnoreIndex, chance: 50 },
    },
    "Imp. Dynamic Insulation System": {
        active: "Part Active",
        trait: { kind: itemTypes.CorruptionIgnoreIndex, chance: 67 },
    },
    "Adv. Dynamic Insulation System": {
        active: "Part Active",
        trait: { kind: itemTypes.CorruptionIgnoreIndex, chance: 75 },
    },

    // Corruption prevent
    "Corruption Screen": { active: "Part Active", trait: { kind: itemTypes.CorruptionPreventIndex, amount: 8 } },
    "Imp. Corruption Screen": { active: "Part Active", trait: { kind: itemTypes.CorruptionPreventIndex, amount: 15 } },
    "Adv. Corruption Screen": { active: "Part Active", trait: { kind: itemTypes.CorruptionPreventIndex, amount: 20 } },

    // Corruption reduction
    "Corruption Guard": { active: "Part Active", trait: { kind: itemTypes.CorruptionReduceIndex, amount: 8 } },
    "Imp. Corruption Guard": { active: "Part Active", trait: { kind: itemTypes.CorruptionReduceIndex, amount: 12 } },
    "Exp. Corruption Guard": { active: "Part Active", trait: { kind: itemTypes.CorruptionReduceIndex, amount: 20 } },

    // Critical immunity
    "Graphene Brace": { active: "Always", trait: { kind: itemTypes.CriticalImmunityIndex } },

    // Cryofiber Web
    "Cryofiber Web": {
        active: "Part Active",
        trait: { kind: itemTypes.CryofiberWebIndex, sideEffectNegationPercentage: 25, temperatureReduction: 100 },
    },
    "Imp. Cryofiber Web": {
        active: "Part Active",
        trait: { kind: itemTypes.CryofiberWebIndex, sideEffectNegationPercentage: 30, temperatureReduction: 150 },
    },
    "Adv. Cryofiber Web": {
        active: "Part Active",
        trait: { kind: itemTypes.CryofiberWebIndex, sideEffectNegationPercentage: 35, temperatureReduction: 200 },
    },
    "Exp. Cryofiber Web": {
        active: "Part Active",
        trait: { kind: itemTypes.CryofiberWebIndex, sideEffectNegationPercentage: 55, temperatureReduction: 400 },
    },

    // Damage reduction
    "Shield Generator": {
        active: "Part Active",
        trait: { kind: itemTypes.DamageReductionIndex, multiplier: 0.75, ratio: 6, remote: false },
    },
    "Imp. Shield Generator": {
        active: "Part Active",
        trait: { kind: itemTypes.DamageReductionIndex, multiplier: 0.75, ratio: 5, remote: false },
    },
    "Adv. Shield Generator": {
        active: "Part Active",
        trait: { kind: itemTypes.DamageReductionIndex, multiplier: 0.75, ratio: 4, remote: false },
    },
    "Exp. Shield Generator": {
        active: "Part Active",
        trait: { kind: itemTypes.DamageReductionIndex, multiplier: 0.75, ratio: 2, remote: false },
    },
    "Remote Shield": {
        active: "Part Active",
        trait: { kind: itemTypes.DamageReductionIndex, multiplier: 0.75, ratio: 6, remote: true },
    },
    "Imp. Remote Shield": {
        active: "Part Active",
        trait: { kind: itemTypes.DamageReductionIndex, multiplier: 0.75, ratio: 5, remote: true },
    },
    "Adv. Remote Shield": {
        active: "Part Active",
        trait: { kind: itemTypes.DamageReductionIndex, multiplier: 0.75, ratio: 4, remote: true },
    },
    "Exp. Remote Shield": {
        active: "Part Active",
        trait: { kind: itemTypes.DamageReductionIndex, multiplier: 0.75, ratio: 2, remote: true },
    },
    "Force Field": {
        active: "Part Active",
        trait: { kind: itemTypes.DamageReductionIndex, multiplier: 0.5, ratio: 7, remote: false },
    },
    "Imp. Force Field": {
        active: "Part Active",
        trait: { kind: itemTypes.DamageReductionIndex, multiplier: 0.5, ratio: 6, remote: false },
    },
    "Adv. Force Field": {
        active: "Part Active",
        trait: { kind: itemTypes.DamageReductionIndex, multiplier: 0.5, ratio: 5, remote: false },
    },
    "Exp. Force Field": {
        active: "Part Active",
        trait: { kind: itemTypes.DamageReductionIndex, multiplier: 0.5, ratio: 3, remote: false },
    },
    "Remote Force Field": {
        active: "Part Active",
        trait: { kind: itemTypes.DamageReductionIndex, multiplier: 0.5, ratio: 8, remote: true },
    },
    "Imp. Remote Force Field": {
        active: "Part Active",
        trait: { kind: itemTypes.DamageReductionIndex, multiplier: 0.5, ratio: 7, remote: true },
    },
    "Adv. Remote Force Field": {
        active: "Part Active",
        trait: { kind: itemTypes.DamageReductionIndex, multiplier: 0.5, ratio: 6, remote: true },
    },
    "QV-33N's Drone Shield": {
        active: "Part Active",
        trait: { kind: itemTypes.DamageReductionIndex, multiplier: 0.5, ratio: 4, remote: true },
    },
    "AEGIS Remote Shield": {
        active: "Part Active",
        trait: { kind: itemTypes.DamageReductionIndex, multiplier: 0.5, ratio: 2, remote: true },
    },
    "Cep. Energy Mantle": {
        active: "Part Active",
        trait: { kind: itemTypes.DamageReductionIndex, multiplier: 0.5, ratio: 1, remote: true },
    },
    "7V-RTL's Ultimate Field": {
        active: "Part Active",
        trait: { kind: itemTypes.DamageReductionIndex, multiplier: 0.25, ratio: 3, remote: false },
    },
    "Vortex Field Projector": {
        active: "Part Active",
        trait: { kind: itemTypes.DamageReductionIndex, multiplier: 0.25, ratio: 1, remote: false },
    },

    // Damage resists
    // EM
    "Insulated Plating": {
        active: "Always",
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Electromagnetic: 15 } },
    },
    "Med. Insulated Plating": {
        active: "Always",
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Electromagnetic: 20 } },
    },
    "Hvy. Insulated Plating": {
        active: "Always",
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Electromagnetic: 30 } },
    },
    "EM Shield": {
        active: "Part Active",
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Electromagnetic: 25 } },
    },
    "Adv. EM Shield": {
        active: "Part Active",
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Electromagnetic: 50 } },
    },
    "Exp. EM Shield": {
        active: "Part Active",
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Electromagnetic: 75 } },
    },
    "Damper Plating": {
        active: "Always",
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Electromagnetic: 90 } },
    },
    "Superdense Plating": { active: "Always", trait: { kind: itemTypes.DamageResistsIndex, resists: { Kinetic: 25 } } },
    // Explosive
    "Shock Absorption System": {
        active: "Part Active",
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Explosive: 25 } },
    },
    "Imp. Shock Absorption System": {
        active: "Part Active",
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Explosive: 50 } },
    },
    "Exp. Shock Absorption System": {
        active: "Part Active",
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Explosive: 75 } },
    },
    "8R-AWN's Armor/EX": {
        active: "Always",
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Explosive: 90 } },
    },
    // Kinetic
    "Mak. Kinetic Plating": {
        active: "Always",
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Kinetic: 20 } },
    },
    "Focal Shield": { active: "Part Active", trait: { kind: itemTypes.DamageResistsIndex, resists: { Kinetic: 20 } } },
    "Reactive Plating": { active: "Always", trait: { kind: itemTypes.DamageResistsIndex, resists: { Kinetic: 20 } } },
    "Imp. Focal Shield": {
        active: "Part Active",
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Kinetic: 25 } },
    },
    "Adv. Focal Shield": {
        active: "Part Active",
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Kinetic: 30 } },
    },
    "Exp. Focal Shield": {
        active: "Part Active",
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Kinetic: 30 } },
    },
    "Med. Reactive Plating": {
        active: "Always",
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Kinetic: 30 } },
    },
    "Hvy. Reactive Plating": {
        active: "Always",
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Kinetic: 40 } },
    },
    // Thermal
    "Mak. Thermal Plating": {
        active: "Always",
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Thermal: 10 } },
    },
    "Thermal Defense Suite": {
        active: "Part Active",
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Thermal: 20 } },
    },
    "Reflective Plating": { active: "Always", trait: { kind: itemTypes.DamageResistsIndex, resists: { Thermal: 10 } } },
    "Med. Reflective Plating": {
        active: "Always",
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Thermal: 15 } },
    },
    "Thermal Shield": {
        active: "Part Active",
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Thermal: 20 } },
    },
    "Imp. Thermal Defense Suite": {
        active: "Part Active",
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Thermal: 25 } },
    },
    "Imp. Thermal Shield": {
        active: "Part Active",
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Thermal: 25 } },
    },
    "Hvy. Reflective Plating": {
        active: "Always",
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Thermal: 25 } },
    },
    "Adv. Thermal Defense Suite": {
        active: "Part Active",
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Thermal: 30 } },
    },
    "Adv. Thermal Shield": {
        active: "Part Active",
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Thermal: 30 } },
    },
    "Exp. Thermal Defense Suite": {
        active: "Part Active",
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Thermal: 30 } },
    },
    "Exp. Thermal Shield": {
        active: "Part Active",
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Thermal: 30 } },
    },
    "Thermal Barrier": {
        active: "Part Active",
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Thermal: 50 } },
    },
    "Cep. Beam Splitter": {
        active: "Part Active",
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Thermal: 75 } },
    },
    "8R-AWN's Armor/TH": { active: "Always", trait: { kind: itemTypes.DamageResistsIndex, resists: { Thermal: 90 } } },
    // All
    "Asb. Alloy Armor": {
        active: "Always",
        trait: {
            kind: itemTypes.DamageResistsIndex,
            resists: {
                Electromagnetic: 15,
                Explosive: 15,
                Impact: 15,
                Kinetic: 15,
                Piercing: 15,
                Slashing: 15,
                Thermal: 15,
            },
        },
    },
    "ME-RLN's Chromatic Screen": {
        active: "Part Active",
        trait: {
            kind: itemTypes.DamageResistsIndex,
            resists: {
                Electromagnetic: 20,
                Explosive: 20,
                Impact: 20,
                Kinetic: 20,
                Piercing: 20,
                Slashing: 20,
                Thermal: 20,
            },
        },
    },
    "Zio. Shade Carapace": {
        active: "Always",
        trait: {
            kind: itemTypes.DamageResistsIndex,
            resists: {
                Electromagnetic: 20,
                Explosive: 20,
                Impact: 20,
                Kinetic: 20,
                Piercing: 20,
                Slashing: 20,
                Thermal: 20,
            },
        },
    },
    "Zio. Shade Armor": {
        active: "Always",
        trait: {
            kind: itemTypes.DamageResistsIndex,
            resists: {
                Electromagnetic: 30,
                Explosive: 30,
                Impact: 30,
                Kinetic: 30,
                Piercing: 30,
                Slashing: 30,
                Thermal: 30,
            },
        },
    },
    "Sfc. Absorption Layer": {
        active: "Always",
        trait: {
            kind: itemTypes.DamageResistsIndex,
            resists: {
                Electromagnetic: 50,
                Explosive: 50,
                Impact: 50,
                Kinetic: 50,
                Piercing: 50,
                Slashing: 50,
                Thermal: 50,
            },
        },
    },
    "Sigix Exoskeleton": {
        active: "Always",
        trait: {
            kind: itemTypes.DamageResistsIndex,
            resists: {
                Electromagnetic: 50,
                Explosive: 50,
                Impact: 50,
                Kinetic: 50,
                Piercing: 50,
                Slashing: 50,
                Thermal: 50,
            },
        },
    },

    // Em disruption fields
    "EM Disruption Field": { active: "Part Active", trait: { kind: itemTypes.CorruptionMaximumIndex, amount: 10 } },
    "Adv. EM Disruption Field": { active: "Part Active", trait: { kind: itemTypes.CorruptionMaximumIndex, amount: 6 } },
    "Exp. EM Disruption Field": { active: "Part Active", trait: { kind: itemTypes.CorruptionMaximumIndex, amount: 3 } },

    // Energy filter
    "Energy Filter": { active: "Part Active", trait: { kind: itemTypes.EnergyFilterIndex, percent: 0.3 } },
    "Prc. Energy Filter": { active: "Part Active", trait: { kind: itemTypes.EnergyFilterIndex, percent: 0.5 } },

    // Energy storage
    "Sml. Battery": { active: "Always", trait: { kind: itemTypes.EnergyStorageIndex, storage: 100 } },
    "Med. Battery": { active: "Always", trait: { kind: itemTypes.EnergyStorageIndex, storage: 150 } },
    "Lrg. Battery": { active: "Always", trait: { kind: itemTypes.EnergyStorageIndex, storage: 200 } },
    "Com. Battery": { active: "Always", trait: { kind: itemTypes.EnergyStorageIndex, storage: 200 } },
    "Hcp. Battery": { active: "Always", trait: { kind: itemTypes.EnergyStorageIndex, storage: 250 } },
    "Energy Well": { active: "Always", trait: { kind: itemTypes.EnergyStorageIndex, storage: 350 } },
    "Imp. Energy Well": { active: "Always", trait: { kind: itemTypes.EnergyStorageIndex, storage: 400 } },
    "Adv. Energy Well": { active: "Always", trait: { kind: itemTypes.EnergyStorageIndex, storage: 500 } },
    "Exp. Energy Well": { active: "Always", trait: { kind: itemTypes.EnergyStorageIndex, storage: 600 } },
    "Asb. Biocell Array": { active: "Always", trait: { kind: itemTypes.EnergyStorageIndex, storage: 1000 } },
    "Zio. Biocell": { active: "Always", trait: { kind: itemTypes.EnergyStorageIndex, storage: 600 } },
    "V4-D3R's Forcewell": { active: "Always", trait: { kind: itemTypes.EnergyStorageIndex, storage: 750 } },
    "Zio. Biocell Array": { active: "Always", trait: { kind: itemTypes.EnergyStorageIndex, storage: 750 } },
    "Cep. Chromion Battery": { active: "Always", trait: { kind: itemTypes.EnergyStorageIndex, storage: 800 } },
    Superbattery: { active: "Always", trait: { kind: itemTypes.EnergyStorageIndex, storage: 1500 } },

    // Hardlight Generator
    "Hardlight Generator": { active: "Part Active", trait: { kind: itemTypes.HardlightGeneratorIndex, amount: 4 } },
    "Imp. Hardlight Generator": {
        active: "Part Active",
        trait: { kind: itemTypes.HardlightGeneratorIndex, amount: 6 },
    },
    "Adv. Hardlight Generator": {
        active: "Part Active",
        trait: { kind: itemTypes.HardlightGeneratorIndex, amount: 8 },
    },
    "Exp. Hardlight Generator": {
        active: "Part Active",
        trait: { kind: itemTypes.HardlightGeneratorIndex, amount: 10 },
    },
    "Cep. Hardlight Director": {
        active: "Part Active",
        trait: { kind: itemTypes.HardlightGeneratorIndex, amount: 14 },
    },

    // Heat dissipation
    "2N-1CE's Frost Array": {
        active: "Part Active",
        trait: { kind: itemTypes.HeatDissipationIndex, dissipation: 100, heatSink: false },
    },
    "Active Cooling Armor": {
        active: "Part Active",
        trait: { kind: itemTypes.HeatDissipationIndex, dissipation: 60, heatSink: false },
    },
    "Asb. Nanovents": {
        active: "Part Active",
        trait: { kind: itemTypes.HeatDissipationIndex, dissipation: 15, heatSink: false },
    },
    "Coolant Network": {
        active: "Part Active",
        trait: { kind: itemTypes.HeatDissipationIndex, dissipation: 90, heatSink: false },
    },
    "Mak. Coolant Network": {
        active: "Part Active",
        trait: { kind: itemTypes.HeatDissipationIndex, dissipation: 110, heatSink: false },
    },
    "Cooling System": {
        active: "Part Active",
        trait: { kind: itemTypes.HeatDissipationIndex, dissipation: 22, heatSink: false },
    },
    "Imp. Cooling System": {
        active: "Part Active",
        trait: { kind: itemTypes.HeatDissipationIndex, dissipation: 27, heatSink: false },
    },
    "Adv. Cooling System": {
        active: "Part Active",
        trait: { kind: itemTypes.HeatDissipationIndex, dissipation: 31, heatSink: false },
    },
    "Sfc. Cooling System": {
        active: "Part Active",
        trait: { kind: itemTypes.HeatDissipationIndex, dissipation: 35, heatSink: false },
    },
    "Exp. Cooling System": {
        active: "Part Active",
        trait: { kind: itemTypes.HeatDissipationIndex, dissipation: 38, heatSink: false },
    },
    "Heat Sink": {
        active: "Part Active",
        trait: { kind: itemTypes.HeatDissipationIndex, dissipation: 10, heatSink: true },
    },
    "Imp. Heat Sink": {
        active: "Part Active",
        trait: { kind: itemTypes.HeatDissipationIndex, dissipation: 14, heatSink: true },
    },
    "Adv. Heat Sink": {
        active: "Part Active",
        trait: { kind: itemTypes.HeatDissipationIndex, dissipation: 19, heatSink: true },
    },
    "Exp. Heat Sink": {
        active: "Part Active",
        trait: { kind: itemTypes.HeatDissipationIndex, dissipation: 26, heatSink: true },
    },
    "Cep. Phasing Heat Sink": {
        active: "Part Active",
        trait: { kind: itemTypes.HeatDissipationIndex, dissipation: 36, heatSink: true },
    },

    // Injectors
    "Disposable Heat Sink": { active: "Part Active", trait: { kind: itemTypes.InjectorIndex, dissipation: 50 } },
    "Coolant Injector": { active: "Part Active", trait: { kind: itemTypes.InjectorIndex, dissipation: 65 } },
    "Imp. Coolant Injector": { active: "Part Active", trait: { kind: itemTypes.InjectorIndex, dissipation: 80 } },
    "Adv. Coolant Injector": { active: "Part Active", trait: { kind: itemTypes.InjectorIndex, dissipation: 100 } },
    "Exp. Coolant Injector": { active: "Part Active", trait: { kind: itemTypes.InjectorIndex, dissipation: 120 } },

    // Kinecellerators
    Kinecellerator: { active: "Part Active", trait: { kind: itemTypes.KinecelleratorIndex, amount: 30 } },
    "Imp. Kinecellerator": { active: "Part Active", trait: { kind: itemTypes.KinecelleratorIndex, amount: 40 } },
    "Adv. Kinecellerator": { active: "Part Active", trait: { kind: itemTypes.KinecelleratorIndex, amount: 50 } },
    "Exp. Kinecellerator": { active: "Part Active", trait: { kind: itemTypes.KinecelleratorIndex, amount: 66 } },

    // Mass support
    "Weight Redist. System": { active: "Part Active", trait: { kind: itemTypes.MassSupportIndex, support: 6 } },
    "Adv. Weight Redist. System": { active: "Part Active", trait: { kind: itemTypes.MassSupportIndex, support: 9 } },
    "Gravity Neutralizer": { active: "Part Active", trait: { kind: itemTypes.MassSupportIndex, support: 12 } },
    "Adv. Gravity Neutralizer": { active: "Part Active", trait: { kind: itemTypes.MassSupportIndex, support: 16 } },
    "Quantum Shading Machine": { active: "Part Active", trait: { kind: itemTypes.MassSupportIndex, support: 20 } },
    "Adv. Quantum Shading Machine": { active: "Part Active", trait: { kind: itemTypes.MassSupportIndex, support: 25 } },
    "Asb. Suspension Frame": { active: "Part Active", trait: { kind: itemTypes.MassSupportIndex, support: 20 } },
    "Cep. Dimensional Manipulator": { active: "Part Active", trait: { kind: itemTypes.MassSupportIndex, support: 30 } },

    // Matter storage
    "Sml. Matter Pod": { active: "Always", trait: { kind: itemTypes.MatterStorageIndex, storage: 50 } },
    "Med. Matter Pod": { active: "Always", trait: { kind: itemTypes.MatterStorageIndex, storage: 100 } },
    "Lrg. Matter Pod": { active: "Always", trait: { kind: itemTypes.MatterStorageIndex, storage: 150 } },
    "Hcp. Matter Pod": { active: "Always", trait: { kind: itemTypes.MatterStorageIndex, storage: 200 } },
    "Com. Matter Pod": { active: "Always", trait: { kind: itemTypes.MatterStorageIndex, storage: 150 } },
    "Matter Compressor": { active: "Always", trait: { kind: itemTypes.MatterStorageIndex, storage: 250 } },
    "Imp. Matter Compressor": { active: "Always", trait: { kind: itemTypes.MatterStorageIndex, storage: 300 } },
    "Adv. Matter Compressor": { active: "Always", trait: { kind: itemTypes.MatterStorageIndex, storage: 400 } },
    "Exp. Matter Compressor": { active: "Always", trait: { kind: itemTypes.MatterStorageIndex, storage: 500 } },
    "YI-UF0's Bottomless Matter Pit": {
        active: "Always",
        trait: { kind: itemTypes.MatterStorageIndex, storage: 1500 },
    },

    // Melee analysis
    "Melee Analysis Suite": {
        active: "Part Active",
        trait: { kind: itemTypes.MeleeAnalysisIndex, accuracy: 5, minDamage: 2 },
    },
    "Imp. Melee Analysis Suite": {
        active: "Part Active",
        trait: { kind: itemTypes.MeleeAnalysisIndex, accuracy: 6, minDamage: 3 },
    },
    "Adv. Melee Analysis Suite": {
        active: "Part Active",
        trait: { kind: itemTypes.MeleeAnalysisIndex, accuracy: 8, minDamage: 4 },
    },
    "Exp. Melee Analysis Suite": {
        active: "Part Active",
        trait: { kind: itemTypes.MeleeAnalysisIndex, accuracy: 12, minDamage: 6 },
    },

    // Metafiber
    "Asb. Metafiber Network": { active: "Part Active", trait: { kind: itemTypes.MetafiberIndex } },

    // Microdissipator
    "Mak. Microdissipator Network": { active: "Part Active", trait: { kind: itemTypes.MicrodissipatorIndex } },

    // Launcher Guidance
    "Launcher Guidance Computer": {
        active: "Part Active",
        trait: { kind: itemTypes.LauncherGuidanceIndex, bonus: 20 },
    },
    "Imp. Launcher Guidance Computer": {
        active: "Part Active",
        trait: { kind: itemTypes.LauncherGuidanceIndex, bonus: 30 },
    },
    "Adv. Launcher Guidance Computer": {
        active: "Part Active",
        trait: { kind: itemTypes.LauncherGuidanceIndex, bonus: 40 },
    },

    // Power amplifiers
    "Power Amplifier": { active: "Always", trait: { kind: itemTypes.PowerAmplifierIndex, percent: 0.2 } },
    "Adv. Power Amplifier": { active: "Always", trait: { kind: itemTypes.PowerAmplifierIndex, percent: 0.3 } },
    "Exp. Power Amplifier": { active: "Always", trait: { kind: itemTypes.PowerAmplifierIndex, percent: 0.4 } },

    // Ranged avoid/phase shifters
    "Phase Shifter": { active: "Part Active", trait: { kind: itemTypes.RangedAvoidIndex, avoid: 5 } },
    "Imp. Phase Shifter": { active: "Part Active", trait: { kind: itemTypes.RangedAvoidIndex, avoid: 10 } },
    "Adv. Phase Shifter": { active: "Part Active", trait: { kind: itemTypes.RangedAvoidIndex, avoid: 15 } },
    "Exp. Phase Shifter": { active: "Part Active", trait: { kind: itemTypes.RangedAvoidIndex, avoid: 20 } },
    "Cep. Phase Shift Module": { active: "Part Active", trait: { kind: itemTypes.RangedAvoidIndex, avoid: 20 } },

    // Ranged weapon cycling
    "Weapon Cycler": { active: "Part Active", trait: { kind: itemTypes.RangedWeaponCyclingIndex, amount: 0.15 } },
    "Imp. Weapon Cycler": { active: "Part Active", trait: { kind: itemTypes.RangedWeaponCyclingIndex, amount: 0.2 } },
    "Adv. Weapon Cycler": { active: "Part Active", trait: { kind: itemTypes.RangedWeaponCyclingIndex, amount: 0.25 } },
    "Exp. Weapon Cycler": { active: "Part Active", trait: { kind: itemTypes.RangedWeaponCyclingIndex, amount: 0.3 } },
    "Launcher Loader": { active: "Part Active", trait: { kind: itemTypes.LauncherLoaderIndex } },
    "Mni. Quantum Capacitor": { active: "Part Active", trait: { kind: itemTypes.MniQuantumCapacitorIndex } },
    "Quantum Capacitor": { active: "Part Active", trait: { kind: itemTypes.QuantumCapacitorIndex } },

    // Reaction control systems
    "Reaction Control System": {
        active: "Part Active",
        trait: { kind: itemTypes.ReactionControlSystemIndex, chance: 8 },
    },
    "Imp. Reaction Control System": {
        active: "Part Active",
        trait: { kind: itemTypes.ReactionControlSystemIndex, chance: 10 },
    },
    "Adv. Reaction Control System": {
        active: "Part Active",
        trait: { kind: itemTypes.ReactionControlSystemIndex, chance: 12 },
    },
    "Exp. Reaction Control System": {
        active: "Part Active",
        trait: { kind: itemTypes.ReactionControlSystemIndex, chance: 14 },
    },
    "Cep. Reaction Jets": {
        active: "Part Active",
        trait: { kind: itemTypes.ReactionControlSystemIndex, chance: 18 },
    },

    // Recoil reduction
    "Recoil Stabilizer": { active: "Part Active", trait: { kind: itemTypes.RecoilReductionIndex, reduction: 4 } },
    "Adv. Recoil Stabilizer": { active: "Part Active", trait: { kind: itemTypes.RecoilReductionIndex, reduction: 6 } },
    "Cep. Recoil Nullifier": { active: "Part Active", trait: { kind: itemTypes.RecoilReductionIndex, reduction: 99 } },

    // Rocket Booster
    "Rocket Booster": { active: "Part Active", trait: { kind: itemTypes.RocketBoosterIndex } },

    // Particle charging
    "Particle Charger": { active: "Part Active", trait: { kind: itemTypes.ParticleChargingIndex, percent: 15 } },
    "Imp. Particle Charger": { active: "Part Active", trait: { kind: itemTypes.ParticleChargingIndex, percent: 20 } },
    "Adv. Particle Charger": { active: "Part Active", trait: { kind: itemTypes.ParticleChargingIndex, percent: 25 } },
    "Particle Accelerator": { active: "Part Active", trait: { kind: itemTypes.ParticleChargingIndex, percent: 30 } },
    "Imp. Particle Accelerator": {
        active: "Part Active",
        trait: { kind: itemTypes.ParticleChargingIndex, percent: 40 },
    },
    "Adv. Particle Accelerator": {
        active: "Part Active",
        trait: { kind: itemTypes.ParticleChargingIndex, percent: 50 },
    },

    // Salvage targeting
    "Salvage Targeting Computer": {
        active: "Part Active",
        trait: { kind: itemTypes.SalvageTargetingIndex, amount: 1 },
    },
    "Imp. Salvage Targeting Computer": {
        active: "Part Active",
        trait: { kind: itemTypes.SalvageTargetingIndex, amount: 2 },
    },
    "Adv. Salvage Targeting Computer": {
        active: "Part Active",
        trait: { kind: itemTypes.SalvageTargetingIndex, amount: 3 },
    },
    "Mak. Salvage Targeting Computer": {
        active: "Part Active",
        trait: { kind: itemTypes.SalvageTargetingIndex, amount: 4 },
    },
    "Exp. Salvage Targeting Computer": {
        active: "Part Active",
        trait: { kind: itemTypes.SalvageTargetingIndex, amount: 5 },
    },

    // Self-damage reduction
    "1C-UTU's Buckler": { active: "Part Active", trait: { kind: itemTypes.SelfReductionIndex, shielding: 0.5 } },
    "Powered Armor": { active: "Part Active", trait: { kind: itemTypes.SelfReductionIndex, shielding: 0.5 } },
    "Imp. Powered Armor": { active: "Part Active", trait: { kind: itemTypes.SelfReductionIndex, shielding: 0.5 } },
    "Adv. Powered Armor": { active: "Part Active", trait: { kind: itemTypes.SelfReductionIndex, shielding: 0.5 } },
    "Exp. Powered Armor": { active: "Part Active", trait: { kind: itemTypes.SelfReductionIndex, shielding: 0.5 } },

    // Shieldings
    "Core Shielding": { active: "Always", trait: { kind: itemTypes.ShieldingIndex, shielding: 0.2, slot: "Core" } },
    "Imp. Core Shielding": {
        active: "Always",
        trait: { kind: itemTypes.ShieldingIndex, shielding: 0.3, slot: "Core" },
    },
    "Exp. Core Shielding": {
        active: "Always",
        trait: { kind: itemTypes.ShieldingIndex, shielding: 0.4, slot: "Core" },
    },
    "Cep. Core Shell": { active: "Always", trait: { kind: itemTypes.ShieldingIndex, shielding: 0.9, slot: "Core" } },
    "Power Shielding": { active: "Always", trait: { kind: itemTypes.ShieldingIndex, shielding: 0.33, slot: "Power" } },
    "Imp. Power Shielding": {
        active: "Always",
        trait: { kind: itemTypes.ShieldingIndex, shielding: 0.66, slot: "Power" },
    },
    "Exp. Power Shielding": {
        active: "Always",
        trait: { kind: itemTypes.ShieldingIndex, shielding: 0.9, slot: "Power" },
    },
    "Propulsion Shielding": {
        active: "Always",
        trait: { kind: itemTypes.ShieldingIndex, shielding: 0.33, slot: "Propulsion" },
    },
    "Imp. Propulsion Shielding": {
        active: "Always",
        trait: { kind: itemTypes.ShieldingIndex, shielding: 0.66, slot: "Propulsion" },
    },
    "Exp. Propulsion Shielding": {
        active: "Always",
        trait: { kind: itemTypes.ShieldingIndex, shielding: 0.9, slot: "Propulsion" },
    },
    "Utility Shielding": {
        active: "Always",
        trait: { kind: itemTypes.ShieldingIndex, shielding: 0.33, slot: "Utility" },
    },
    "Imp. Utility Shielding": {
        active: "Always",
        trait: { kind: itemTypes.ShieldingIndex, shielding: 0.66, slot: "Utility" },
    },
    "Exp. Utility Shielding": {
        active: "Always",
        trait: { kind: itemTypes.ShieldingIndex, shielding: 0.9, slot: "Utility" },
    },
    "Weapon Shielding": {
        active: "Always",
        trait: { kind: itemTypes.ShieldingIndex, shielding: 0.33, slot: "Weapon" },
    },
    "Imp. Weapon Shielding": {
        active: "Always",
        trait: { kind: itemTypes.ShieldingIndex, shielding: 0.66, slot: "Weapon" },
    },
    "Exp. Weapon Shielding": {
        active: "Always",
        trait: { kind: itemTypes.ShieldingIndex, shielding: 0.9, slot: "Weapon" },
    },
    "Zio. Weapon Casing": { active: "Always", trait: { kind: itemTypes.ShieldingIndex, shielding: 1, slot: "Weapon" } },

    // Target Analyzers
    "Target Analyzer": { active: "Part Active", trait: { kind: itemTypes.TargetAnalyzerIndex, bonus: 5 } },
    "Imp. Target Analyzer": { active: "Part Active", trait: { kind: itemTypes.TargetAnalyzerIndex, bonus: 6 } },
    "Adv. Target Analyzer": { active: "Part Active", trait: { kind: itemTypes.TargetAnalyzerIndex, bonus: 8 } },
    "Exp. Target Analyzer": { active: "Part Active", trait: { kind: itemTypes.TargetAnalyzerIndex, bonus: 10 } },

    // Targeting
    "Targeting Computer": { active: "Part Active", trait: { kind: itemTypes.TargetingIndex, bonus: 5 } },
    "Imp. Targeting Computer": { active: "Part Active", trait: { kind: itemTypes.TargetingIndex, bonus: 6 } },
    "Adv. Targeting Computer": { active: "Part Active", trait: { kind: itemTypes.TargetingIndex, bonus: 8 } },
    "Exp. Targeting Computer": { active: "Part Active", trait: { kind: itemTypes.TargetingIndex, bonus: 12 } },

    // Thunder Legs
    "Thunder Leg": { active: "Part Active", trait: { kind: itemTypes.ThunderLegIndex } },
    "Imp. Thunder Leg": { active: "Part Active", trait: { kind: itemTypes.ThunderLegIndex } },

    // Turbovents
    "Cep. Turbovents": { active: "Part Active", trait: { kind: itemTypes.TurboventsIndex } },

    // Weapon regen
    "Sigix Broadsword": {
        active: "Part Active",
        trait: { kind: itemTypes.WeaponRegenIndex, energyPerTurn: 5, integrityPerTurn: 2 },
    },
};
