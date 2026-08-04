import { SpecialItemProperty, SpecialPropertyAlwaysActive, SpecialPropertyPartActiveActive } from "../types/itemTypes";
import * as itemTypes from "../types/itemTypes";

export const specialItemProperties: { [name: string]: SpecialItemProperty | undefined } = {
    // Ablative armor
    "Mak. Ablative Armor": { active: SpecialPropertyAlwaysActive, trait: { kind: itemTypes.AblativeArmorIndex } },

    // Actuator
    Microactuators: { active: SpecialPropertyPartActiveActive, trait: { kind: itemTypes.ActuatorIndex, amount: 0.2 } },
    Nanoactuators: { active: SpecialPropertyPartActiveActive, trait: { kind: itemTypes.ActuatorIndex, amount: 0.3 } },
    Femtoactuators: { active: SpecialPropertyPartActiveActive, trait: { kind: itemTypes.ActuatorIndex, amount: 0.5 } },

    // Actuator Arrays
    "Actuator Array": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.ActuatorArrayIndex, amount: 10 },
    },
    "Imp. Actuator Array": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.ActuatorArrayIndex, amount: 12 },
    },
    "Adv. Actuator Array": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.ActuatorArrayIndex, amount: 16 },
    },
    "Exp. Actuator Array": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.ActuatorArrayIndex, amount: 20 },
    },

    // Airborne Speed doubling
    "Zio. Metafield Generator": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.AirborneSpeedDoublingIndex },
    },
    "ST Field Compressor": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.AirborneSpeedDoublingIndex },
    },

    // Antimissile
    "Point Defense System": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.AntimissileChanceIndex, chance: 8 },
    },
    "Imp. Point Defense System": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.AntimissileChanceIndex, chance: 16 },
    },
    "Adv. Point Defense System": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.AntimissileChanceIndex, chance: 24 },
    },
    "Cep. Antimissile System": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.AntimissileChanceIndex, chance: 48 },
    },

    // Combat Suite
    "Asb. Combat Suite": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.CombatSuiteIndex, core: 8, rangedAvoid: 8, targeting: 8 },
    },

    // Core Analyzer
    "Core Analyzer": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.CoreAnalyzerIndex, bonus: 6 },
    },
    "Exp. Core Analyzer": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.CoreAnalyzerIndex, bonus: 8 },
    },

    // Corruption ignore %
    "Dynamic Insulation System": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.CorruptionIgnoreIndex, chance: 50 },
    },
    "Imp. Dynamic Insulation System": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.CorruptionIgnoreIndex, chance: 67 },
    },
    "Adv. Dynamic Insulation System": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.CorruptionIgnoreIndex, chance: 75 },
    },

    // Corruption prevent
    "Corruption Screen": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.CorruptionPreventIndex, amount: 8 },
    },
    "Imp. Corruption Screen": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.CorruptionPreventIndex, amount: 15 },
    },
    "Adv. Corruption Screen": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.CorruptionPreventIndex, amount: 20 },
    },

    // Corruption reduction
    "Corruption Guard": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.CorruptionReduceIndex, amount: 8 },
    },
    "Imp. Corruption Guard": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.CorruptionReduceIndex, amount: 12 },
    },
    "Exp. Corruption Guard": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.CorruptionReduceIndex, amount: 20 },
    },

    // Critical immunity
    "Graphene Brace": { active: SpecialPropertyAlwaysActive, trait: { kind: itemTypes.CriticalImmunityIndex } },

    // Cryofiber Web
    "Cryofiber Web": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.CryofiberWebIndex, sideEffectNegationPercentage: 25, temperatureReduction: 100 },
    },
    "Imp. Cryofiber Web": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.CryofiberWebIndex, sideEffectNegationPercentage: 30, temperatureReduction: 150 },
    },
    "Adv. Cryofiber Web": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.CryofiberWebIndex, sideEffectNegationPercentage: 35, temperatureReduction: 200 },
    },
    "Exp. Cryofiber Web": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.CryofiberWebIndex, sideEffectNegationPercentage: 55, temperatureReduction: 400 },
    },

    // Damage reduction
    "Shield Generator": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.DamageReductionIndex, multiplier: 0.75, ratio: 6, remote: false },
    },
    "Imp. Shield Generator": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.DamageReductionIndex, multiplier: 0.75, ratio: 5, remote: false },
    },
    "Adv. Shield Generator": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.DamageReductionIndex, multiplier: 0.75, ratio: 4, remote: false },
    },
    "Exp. Shield Generator": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.DamageReductionIndex, multiplier: 0.75, ratio: 2, remote: false },
    },
    "Remote Shield": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.DamageReductionIndex, multiplier: 0.75, ratio: 6, remote: true },
    },
    "Imp. Remote Shield": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.DamageReductionIndex, multiplier: 0.75, ratio: 5, remote: true },
    },
    "Adv. Remote Shield": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.DamageReductionIndex, multiplier: 0.75, ratio: 4, remote: true },
    },
    "Exp. Remote Shield": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.DamageReductionIndex, multiplier: 0.75, ratio: 2, remote: true },
    },
    "Force Field": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.DamageReductionIndex, multiplier: 0.5, ratio: 7, remote: false },
    },
    "Imp. Force Field": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.DamageReductionIndex, multiplier: 0.5, ratio: 6, remote: false },
    },
    "Adv. Force Field": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.DamageReductionIndex, multiplier: 0.5, ratio: 5, remote: false },
    },
    "Exp. Force Field": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.DamageReductionIndex, multiplier: 0.5, ratio: 3, remote: false },
    },
    "Remote Force Field": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.DamageReductionIndex, multiplier: 0.5, ratio: 8, remote: true },
    },
    "Imp. Remote Force Field": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.DamageReductionIndex, multiplier: 0.5, ratio: 7, remote: true },
    },
    "Adv. Remote Force Field": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.DamageReductionIndex, multiplier: 0.5, ratio: 6, remote: true },
    },
    "QV-33N's Drone Shield": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.DamageReductionIndex, multiplier: 0.5, ratio: 4, remote: true },
    },
    "AEGIS Remote Shield": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.DamageReductionIndex, multiplier: 0.5, ratio: 2, remote: true },
    },
    "Cep. Energy Mantle": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.DamageReductionIndex, multiplier: 0.5, ratio: 1, remote: true },
    },
    "7V-RTL's Ultimate Field": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.DamageReductionIndex, multiplier: 0.25, ratio: 3, remote: false },
    },
    "Vortex Field Projector": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.DamageReductionIndex, multiplier: 0.25, ratio: 1, remote: false },
    },

    // Damage resists
    // EM
    "Insulated Plating": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Electromagnetic: 15 } },
    },
    "Med. Insulated Plating": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Electromagnetic: 20 } },
    },
    "Hvy. Insulated Plating": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Electromagnetic: 30 } },
    },
    "EM Shield": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Electromagnetic: 25 } },
    },
    "Adv. EM Shield": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Electromagnetic: 50 } },
    },
    "Exp. EM Shield": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Electromagnetic: 75 } },
    },
    "Damper Plating": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Electromagnetic: 90 } },
    },
    "Superdense Plating": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Kinetic: 25 } },
    },
    // Explosive
    "Shock Absorption System": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Explosive: 25 } },
    },
    "Imp. Shock Absorption System": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Explosive: 50 } },
    },
    "Exp. Shock Absorption System": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Explosive: 75 } },
    },
    "8R-AWN's Armor/EX": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Explosive: 90 } },
    },
    // Kinetic
    "Mak. Kinetic Plating": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Kinetic: 20 } },
    },
    "Focal Shield": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Kinetic: 20 } },
    },
    "Reactive Plating": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Kinetic: 20 } },
    },
    "Imp. Focal Shield": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Kinetic: 25 } },
    },
    "Adv. Focal Shield": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Kinetic: 30 } },
    },
    "Exp. Focal Shield": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Kinetic: 30 } },
    },
    "Med. Reactive Plating": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Kinetic: 30 } },
    },
    "Hvy. Reactive Plating": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Kinetic: 40 } },
    },
    // Thermal
    "Mak. Thermal Plating": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Thermal: 10 } },
    },
    "Thermal Defense Suite": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Thermal: 20 } },
    },
    "Reflective Plating": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Thermal: 10 } },
    },
    "Med. Reflective Plating": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Thermal: 15 } },
    },
    "Thermal Shield": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Thermal: 20 } },
    },
    "Imp. Thermal Defense Suite": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Thermal: 25 } },
    },
    "Imp. Thermal Shield": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Thermal: 25 } },
    },
    "Hvy. Reflective Plating": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Thermal: 25 } },
    },
    "Adv. Thermal Defense Suite": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Thermal: 30 } },
    },
    "Adv. Thermal Shield": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Thermal: 30 } },
    },
    "Exp. Thermal Defense Suite": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Thermal: 30 } },
    },
    "Exp. Thermal Shield": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Thermal: 30 } },
    },
    "Thermal Barrier": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Thermal: 50 } },
    },
    "Cep. Beam Splitter": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Thermal: 75 } },
    },
    "8R-AWN's Armor/TH": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.DamageResistsIndex, resists: { Thermal: 90 } },
    },
    // All
    "Asb. Alloy Armor": {
        active: SpecialPropertyAlwaysActive,
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
        active: SpecialPropertyPartActiveActive,
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
        active: SpecialPropertyAlwaysActive,
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
        active: SpecialPropertyAlwaysActive,
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
        active: SpecialPropertyAlwaysActive,
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
        active: SpecialPropertyAlwaysActive,
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
    "EM Disruption Field": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.CorruptionMaximumIndex, amount: 10 },
    },
    "Adv. EM Disruption Field": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.CorruptionMaximumIndex, amount: 6 },
    },
    "Exp. EM Disruption Field": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.CorruptionMaximumIndex, amount: 3 },
    },

    // Energy filter
    "Energy Filter": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.EnergyFilterIndex, percent: 0.3 },
    },
    "Prc. Energy Filter": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.EnergyFilterIndex, percent: 0.5 },
    },

    // Energy storage
    "Sml. Battery": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.EnergyStorageIndex, storage: 100 },
    },
    "Med. Battery": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.EnergyStorageIndex, storage: 150 },
    },
    "Lrg. Battery": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.EnergyStorageIndex, storage: 200 },
    },
    "Com. Battery": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.EnergyStorageIndex, storage: 200 },
    },
    "Hcp. Battery": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.EnergyStorageIndex, storage: 250 },
    },
    "Energy Well": { active: SpecialPropertyAlwaysActive, trait: { kind: itemTypes.EnergyStorageIndex, storage: 350 } },
    "Imp. Energy Well": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.EnergyStorageIndex, storage: 400 },
    },
    "Adv. Energy Well": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.EnergyStorageIndex, storage: 500 },
    },
    "Exp. Energy Well": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.EnergyStorageIndex, storage: 600 },
    },
    "Asb. Biocell Array": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.EnergyStorageIndex, storage: 1000 },
    },
    "Zio. Biocell": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.EnergyStorageIndex, storage: 600 },
    },
    "V4-D3R's Forcewell": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.EnergyStorageIndex, storage: 750 },
    },
    "Zio. Biocell Array": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.EnergyStorageIndex, storage: 750 },
    },
    "Cep. Chromion Battery": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.EnergyStorageIndex, storage: 800 },
    },
    Superbattery: { active: SpecialPropertyAlwaysActive, trait: { kind: itemTypes.EnergyStorageIndex, storage: 1500 } },

    // Hardlight Generator
    "Hardlight Generator": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.HardlightGeneratorIndex, amount: 4 },
    },
    "Imp. Hardlight Generator": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.HardlightGeneratorIndex, amount: 6 },
    },
    "Adv. Hardlight Generator": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.HardlightGeneratorIndex, amount: 8 },
    },
    "Exp. Hardlight Generator": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.HardlightGeneratorIndex, amount: 10 },
    },
    "Cep. Hardlight Director": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.HardlightGeneratorIndex, amount: 14 },
    },

    // Heat dissipation
    "2N-1CE's Frost Array": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.HeatDissipationIndex, dissipation: 100, heatSink: false },
    },
    "Active Cooling Armor": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.HeatDissipationIndex, dissipation: 60, heatSink: false },
    },
    "Asb. Nanovents": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.HeatDissipationIndex, dissipation: 15, heatSink: false },
    },
    "Coolant Network": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.HeatDissipationIndex, dissipation: 90, heatSink: false },
    },
    "Mak. Coolant Network": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.HeatDissipationIndex, dissipation: 110, heatSink: false },
    },
    "Cooling System": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.HeatDissipationIndex, dissipation: 22, heatSink: false },
    },
    "Imp. Cooling System": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.HeatDissipationIndex, dissipation: 27, heatSink: false },
    },
    "Adv. Cooling System": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.HeatDissipationIndex, dissipation: 31, heatSink: false },
    },
    "Sfc. Cooling System": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.HeatDissipationIndex, dissipation: 35, heatSink: false },
    },
    "Exp. Cooling System": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.HeatDissipationIndex, dissipation: 38, heatSink: false },
    },
    "Heat Sink": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.HeatDissipationIndex, dissipation: 10, heatSink: true },
    },
    "Imp. Heat Sink": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.HeatDissipationIndex, dissipation: 14, heatSink: true },
    },
    "Adv. Heat Sink": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.HeatDissipationIndex, dissipation: 19, heatSink: true },
    },
    "Exp. Heat Sink": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.HeatDissipationIndex, dissipation: 26, heatSink: true },
    },
    "Cep. Phasing Heat Sink": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.HeatDissipationIndex, dissipation: 36, heatSink: true },
    },

    // Injectors
    "Disposable Heat Sink": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.InjectorIndex, dissipation: 50 },
    },
    "Coolant Injector": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.InjectorIndex, dissipation: 65 },
    },
    "Imp. Coolant Injector": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.InjectorIndex, dissipation: 80 },
    },
    "Adv. Coolant Injector": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.InjectorIndex, dissipation: 100 },
    },
    "Exp. Coolant Injector": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.InjectorIndex, dissipation: 120 },
    },

    // Kinecellerators
    Kinecellerator: {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.KinecelleratorIndex, amount: 30 },
    },
    "Imp. Kinecellerator": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.KinecelleratorIndex, amount: 40 },
    },
    "Adv. Kinecellerator": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.KinecelleratorIndex, amount: 50 },
    },
    "Exp. Kinecellerator": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.KinecelleratorIndex, amount: 66 },
    },

    // Mass support
    "Weight Redist. System": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.MassSupportIndex, support: 6 },
    },
    "Adv. Weight Redist. System": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.MassSupportIndex, support: 9 },
    },
    "Gravity Neutralizer": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.MassSupportIndex, support: 12 },
    },
    "Adv. Gravity Neutralizer": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.MassSupportIndex, support: 16 },
    },
    "Quantum Shading Machine": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.MassSupportIndex, support: 20 },
    },
    "Adv. Quantum Shading Machine": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.MassSupportIndex, support: 25 },
    },
    "Asb. Suspension Frame": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.MassSupportIndex, support: 20 },
    },
    "Cep. Dimensional Manipulator": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.MassSupportIndex, support: 30 },
    },

    // Matter storage
    "Sml. Matter Pod": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.MatterStorageIndex, storage: 50 },
    },
    "Med. Matter Pod": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.MatterStorageIndex, storage: 100 },
    },
    "Lrg. Matter Pod": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.MatterStorageIndex, storage: 150 },
    },
    "Hcp. Matter Pod": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.MatterStorageIndex, storage: 200 },
    },
    "Com. Matter Pod": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.MatterStorageIndex, storage: 150 },
    },
    "Matter Compressor": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.MatterStorageIndex, storage: 250 },
    },
    "Imp. Matter Compressor": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.MatterStorageIndex, storage: 300 },
    },
    "Adv. Matter Compressor": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.MatterStorageIndex, storage: 400 },
    },
    "Exp. Matter Compressor": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.MatterStorageIndex, storage: 500 },
    },
    "YI-UF0's Bottomless Matter Pit": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.MatterStorageIndex, storage: 1500 },
    },

    // Melee analysis
    "Melee Analysis Suite": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.MeleeAnalysisIndex, accuracy: 5, minDamage: 2 },
    },
    "Imp. Melee Analysis Suite": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.MeleeAnalysisIndex, accuracy: 6, minDamage: 3 },
    },
    "Adv. Melee Analysis Suite": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.MeleeAnalysisIndex, accuracy: 8, minDamage: 4 },
    },
    "Exp. Melee Analysis Suite": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.MeleeAnalysisIndex, accuracy: 12, minDamage: 6 },
    },

    // Metafiber
    "Asb. Metafiber Network": { active: SpecialPropertyPartActiveActive, trait: { kind: itemTypes.MetafiberIndex } },

    // Microdissipator
    "Mak. Microdissipator Network": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.MicrodissipatorIndex },
    },

    // Launcher Guidance
    "Launcher Guidance Computer": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.LauncherGuidanceIndex, bonus: 20 },
    },
    "Imp. Launcher Guidance Computer": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.LauncherGuidanceIndex, bonus: 30 },
    },
    "Adv. Launcher Guidance Computer": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.LauncherGuidanceIndex, bonus: 40 },
    },

    // Power amplifiers
    "Power Amplifier": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.PowerAmplifierIndex, percent: 0.2 },
    },
    "Adv. Power Amplifier": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.PowerAmplifierIndex, percent: 0.3 },
    },
    "Exp. Power Amplifier": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.PowerAmplifierIndex, percent: 0.4 },
    },

    // Ranged avoid/phase shifters
    "Phase Shifter": { active: SpecialPropertyPartActiveActive, trait: { kind: itemTypes.RangedAvoidIndex, avoid: 5 } },
    "Imp. Phase Shifter": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.RangedAvoidIndex, avoid: 10 },
    },
    "Adv. Phase Shifter": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.RangedAvoidIndex, avoid: 15 },
    },
    "Exp. Phase Shifter": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.RangedAvoidIndex, avoid: 20 },
    },
    "Cep. Phase Shift Module": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.RangedAvoidIndex, avoid: 20 },
    },

    // Ranged weapon cycling
    "Weapon Cycler": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.RangedWeaponCyclingIndex, amount: 0.15 },
    },
    "Imp. Weapon Cycler": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.RangedWeaponCyclingIndex, amount: 0.2 },
    },
    "Adv. Weapon Cycler": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.RangedWeaponCyclingIndex, amount: 0.25 },
    },
    "Exp. Weapon Cycler": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.RangedWeaponCyclingIndex, amount: 0.3 },
    },
    "Launcher Loader": { active: SpecialPropertyPartActiveActive, trait: { kind: itemTypes.LauncherLoaderIndex } },
    "Mni. Quantum Capacitor": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.MniQuantumCapacitorIndex },
    },
    "Quantum Capacitor": { active: SpecialPropertyPartActiveActive, trait: { kind: itemTypes.QuantumCapacitorIndex } },

    // Reaction control systems
    "Reaction Control System": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.ReactionControlSystemIndex, chance: 8 },
    },
    "Imp. Reaction Control System": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.ReactionControlSystemIndex, chance: 10 },
    },
    "Adv. Reaction Control System": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.ReactionControlSystemIndex, chance: 12 },
    },
    "Exp. Reaction Control System": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.ReactionControlSystemIndex, chance: 14 },
    },
    "Cep. Reaction Jets": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.ReactionControlSystemIndex, chance: 18 },
    },

    // Recoil reduction
    "Recoil Stabilizer": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.RecoilReductionIndex, reduction: 4 },
    },
    "Adv. Recoil Stabilizer": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.RecoilReductionIndex, reduction: 6 },
    },
    "Cep. Recoil Nullifier": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.RecoilReductionIndex, reduction: 99 },
    },

    // Rocket Booster
    "Rocket Booster": { active: SpecialPropertyPartActiveActive, trait: { kind: itemTypes.RocketBoosterIndex } },

    // Particle charging
    "Particle Charger": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.ParticleChargingIndex, percent: 15 },
    },
    "Imp. Particle Charger": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.ParticleChargingIndex, percent: 20 },
    },
    "Adv. Particle Charger": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.ParticleChargingIndex, percent: 25 },
    },
    "Particle Accelerator": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.ParticleChargingIndex, percent: 30 },
    },
    "Imp. Particle Accelerator": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.ParticleChargingIndex, percent: 40 },
    },
    "Adv. Particle Accelerator": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.ParticleChargingIndex, percent: 50 },
    },

    // Salvage targeting
    "Salvage Targeting Computer": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.SalvageTargetingIndex, amount: 1 },
    },
    "Imp. Salvage Targeting Computer": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.SalvageTargetingIndex, amount: 2 },
    },
    "Adv. Salvage Targeting Computer": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.SalvageTargetingIndex, amount: 3 },
    },
    "Mak. Salvage Targeting Computer": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.SalvageTargetingIndex, amount: 4 },
    },
    "Exp. Salvage Targeting Computer": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.SalvageTargetingIndex, amount: 5 },
    },

    // Self-damage reduction
    "1C-UTU's Buckler": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.SelfReductionIndex, shielding: 0.5 },
    },
    "Powered Armor": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.SelfReductionIndex, shielding: 0.5 },
    },
    "Imp. Powered Armor": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.SelfReductionIndex, shielding: 0.5 },
    },
    "Adv. Powered Armor": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.SelfReductionIndex, shielding: 0.5 },
    },
    "Exp. Powered Armor": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.SelfReductionIndex, shielding: 0.5 },
    },

    // Shieldings
    "Core Shielding": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.ShieldingIndex, shielding: 0.2, slot: "Core" },
    },
    "Imp. Core Shielding": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.ShieldingIndex, shielding: 0.3, slot: "Core" },
    },
    "Exp. Core Shielding": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.ShieldingIndex, shielding: 0.4, slot: "Core" },
    },
    "Cep. Core Shell": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.ShieldingIndex, shielding: 0.9, slot: "Core" },
    },
    "Power Shielding": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.ShieldingIndex, shielding: 0.33, slot: "Power" },
    },
    "Imp. Power Shielding": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.ShieldingIndex, shielding: 0.66, slot: "Power" },
    },
    "Exp. Power Shielding": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.ShieldingIndex, shielding: 0.9, slot: "Power" },
    },
    "Propulsion Shielding": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.ShieldingIndex, shielding: 0.33, slot: "Propulsion" },
    },
    "Imp. Propulsion Shielding": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.ShieldingIndex, shielding: 0.66, slot: "Propulsion" },
    },
    "Exp. Propulsion Shielding": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.ShieldingIndex, shielding: 0.9, slot: "Propulsion" },
    },
    "Utility Shielding": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.ShieldingIndex, shielding: 0.33, slot: "Utility" },
    },
    "Imp. Utility Shielding": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.ShieldingIndex, shielding: 0.66, slot: "Utility" },
    },
    "Exp. Utility Shielding": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.ShieldingIndex, shielding: 0.9, slot: "Utility" },
    },
    "Weapon Shielding": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.ShieldingIndex, shielding: 0.33, slot: "Weapon" },
    },
    "Imp. Weapon Shielding": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.ShieldingIndex, shielding: 0.66, slot: "Weapon" },
    },
    "Exp. Weapon Shielding": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.ShieldingIndex, shielding: 0.9, slot: "Weapon" },
    },
    "Zio. Weapon Casing": {
        active: SpecialPropertyAlwaysActive,
        trait: { kind: itemTypes.ShieldingIndex, shielding: 1, slot: "Weapon" },
    },

    // Target Analyzers
    "Target Analyzer": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.TargetAnalyzerIndex, bonus: 5 },
    },
    "Imp. Target Analyzer": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.TargetAnalyzerIndex, bonus: 6 },
    },
    "Adv. Target Analyzer": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.TargetAnalyzerIndex, bonus: 8 },
    },
    "Exp. Target Analyzer": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.TargetAnalyzerIndex, bonus: 10 },
    },

    // Targeting
    "Targeting Computer": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.TargetingIndex, bonus: 5 },
    },
    "Imp. Targeting Computer": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.TargetingIndex, bonus: 6 },
    },
    "Adv. Targeting Computer": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.TargetingIndex, bonus: 8 },
    },
    "Exp. Targeting Computer": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.TargetingIndex, bonus: 12 },
    },

    // Thunder Legs
    "Thunder Leg": { active: SpecialPropertyPartActiveActive, trait: { kind: itemTypes.ThunderLegIndex } },
    "Imp. Thunder Leg": { active: SpecialPropertyPartActiveActive, trait: { kind: itemTypes.ThunderLegIndex } },

    // Turbovents
    "Cep. Turbovents": { active: SpecialPropertyPartActiveActive, trait: { kind: itemTypes.TurboventsIndex } },

    // Weapon regen
    "Sigix Broadsword": {
        active: SpecialPropertyPartActiveActive,
        trait: { kind: itemTypes.WeaponRegenIndex, energyPerTurn: 5, integrityPerTurn: 2 },
    },
};
