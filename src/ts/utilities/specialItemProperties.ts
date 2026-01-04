import { SpecialItemProperty } from "../types/itemTypes";

export const specialItemProperties: { [name: string]: SpecialItemProperty | undefined } = {
    // Actuator
    Microactuators: { active: "Part Active", trait: { kind: "Actuator", amount: 0.2 } },
    Nanoactuators: { active: "Part Active", trait: { kind: "Actuator", amount: 0.3 } },
    Femtoactuators: { active: "Part Active", trait: { kind: "Actuator", amount: 0.5 } },

    // Actuator Arrays
    "Actuator Array": { active: "Part Active", trait: { kind: "ActuatorArray", amount: 10 } },
    "Imp. Actuator Array": { active: "Part Active", trait: { kind: "ActuatorArray", amount: 12 } },
    "Adv. Actuator Array": { active: "Part Active", trait: { kind: "ActuatorArray", amount: 16 } },
    "Exp. Actuator Array": { active: "Part Active", trait: { kind: "ActuatorArray", amount: 20 } },

    // Airborne Speed doubling
    "Zio. Metafield Generator": { active: "Part Active", trait: { kind: "AirborneSpeedDoubling" } },
    "ST Field Compressor": { active: "Part Active", trait: { kind: "AirborneSpeedDoubling" } },

    // Antimissile
    "Point Defense System": { active: "Part Active", trait: { kind: "AntimissileChance", chance: 8 } },
    "Imp. Point Defense System": { active: "Part Active", trait: { kind: "AntimissileChance", chance: 16 } },
    "Adv. Point Defense System": { active: "Part Active", trait: { kind: "AntimissileChance", chance: 24 } },
    "Cep. Antimissile System": { active: "Part Active", trait: { kind: "AntimissileChance", chance: 48 } },

    // Combat Suite
    "Asb. Combat Suite": {
        active: "Part Active",
        trait: { kind: "CombatSuite", core: 8, rangedAvoid: 8, targeting: 8 },
    },

    // Core Analyzer
    "Core Analyzer": { active: "Part Active", trait: { kind: "CoreAnalyzer", bonus: 6 } },
    "Exp. Core Analyzer": { active: "Part Active", trait: { kind: "CoreAnalyzer", bonus: 8 } },

    // Corruption ignore %
    "Dynamic Insulation System": { active: "Part Active", trait: { kind: "CorruptionIgnore", chance: 50 } },
    "Imp. Dynamic Insulation System": { active: "Part Active", trait: { kind: "CorruptionIgnore", chance: 67 } },
    "Adv. Dynamic Insulation System": { active: "Part Active", trait: { kind: "CorruptionIgnore", chance: 75 } },

    // Corruption prevent
    "Corruption Screen": { active: "Part Active", trait: { kind: "CorruptionPrevent", amount: 8 } },
    "Imp. Corruption Screen": { active: "Part Active", trait: { kind: "CorruptionPrevent", amount: 15 } },
    "Adv. Corruption Screen": { active: "Part Active", trait: { kind: "CorruptionPrevent", amount: 20 } },

    // Corruption reduction
    "Corruption Guard": { active: "Part Active", trait: { kind: "CorruptionReduce", amount: 8 } },
    "Imp. Corruption Guard": { active: "Part Active", trait: { kind: "CorruptionReduce", amount: 12 } },
    "Exp. Corruption Guard": { active: "Part Active", trait: { kind: "CorruptionReduce", amount: 20 } },

    // Critical immunity
    "Graphene Brace": { active: "Always", trait: { kind: "CriticalImmunity" } },

    // Cryofiber Web
    "Cryofiber Web": { active: "Part Active", trait: { kind: "CryofiberWeb" } },
    "Imp. Cryofiber Web": { active: "Part Active", trait: { kind: "CryofiberWeb" } },
    "Adv. Cryofiber Web": { active: "Part Active", trait: { kind: "CryofiberWeb" } },
    "Exp. Cryofiber Web": { active: "Part Active", trait: { kind: "CryofiberWeb" } },

    // Damage reduction
    "Shield Generator": {
        active: "Part Active",
        trait: { kind: "DamageReduction", multiplier: 0.75, ratio: 6, remote: false },
    },
    "Imp. Shield Generator": {
        active: "Part Active",
        trait: { kind: "DamageReduction", multiplier: 0.75, ratio: 5, remote: false },
    },
    "Adv. Shield Generator": {
        active: "Part Active",
        trait: { kind: "DamageReduction", multiplier: 0.75, ratio: 4, remote: false },
    },
    "Exp. Shield Generator": {
        active: "Part Active",
        trait: { kind: "DamageReduction", multiplier: 0.75, ratio: 2, remote: false },
    },
    "Remote Shield": {
        active: "Part Active",
        trait: { kind: "DamageReduction", multiplier: 0.75, ratio: 6, remote: true },
    },
    "Imp. Remote Shield": {
        active: "Part Active",
        trait: { kind: "DamageReduction", multiplier: 0.75, ratio: 5, remote: true },
    },
    "Adv. Remote Shield": {
        active: "Part Active",
        trait: { kind: "DamageReduction", multiplier: 0.75, ratio: 4, remote: true },
    },
    "Exp. Remote Shield": {
        active: "Part Active",
        trait: { kind: "DamageReduction", multiplier: 0.75, ratio: 2, remote: true },
    },
    "Force Field": {
        active: "Part Active",
        trait: { kind: "DamageReduction", multiplier: 0.5, ratio: 7, remote: false },
    },
    "Imp. Force Field": {
        active: "Part Active",
        trait: { kind: "DamageReduction", multiplier: 0.5, ratio: 6, remote: false },
    },
    "Adv. Force Field": {
        active: "Part Active",
        trait: { kind: "DamageReduction", multiplier: 0.5, ratio: 5, remote: false },
    },
    "Exp. Force Field": {
        active: "Part Active",
        trait: { kind: "DamageReduction", multiplier: 0.5, ratio: 3, remote: false },
    },
    "Remote Force Field": {
        active: "Part Active",
        trait: { kind: "DamageReduction", multiplier: 0.5, ratio: 8, remote: true },
    },
    "Imp. Remote Force Field": {
        active: "Part Active",
        trait: { kind: "DamageReduction", multiplier: 0.5, ratio: 7, remote: true },
    },
    "Adv. Remote Force Field": {
        active: "Part Active",
        trait: { kind: "DamageReduction", multiplier: 0.5, ratio: 6, remote: true },
    },
    "QV-33N's Drone Shield": {
        active: "Part Active",
        trait: { kind: "DamageReduction", multiplier: 0.5, ratio: 4, remote: true },
    },
    "AEGIS Remote Shield": {
        active: "Part Active",
        trait: { kind: "DamageReduction", multiplier: 0.5, ratio: 2, remote: true },
    },
    "Cep. Energy Mantle": {
        active: "Part Active",
        trait: { kind: "DamageReduction", multiplier: 0.5, ratio: 1, remote: true },
    },
    "7V-RTL's Ultimate Field": {
        active: "Part Active",
        trait: { kind: "DamageReduction", multiplier: 0.25, ratio: 3, remote: false },
    },
    "Vortex Field Projector": {
        active: "Part Active",
        trait: { kind: "DamageReduction", multiplier: 0.25, ratio: 1, remote: false },
    },

    // Damage resists
    // EM
    "Insulated Plating": { active: "Always", trait: { kind: "DamageResists", resists: { Electromagnetic: 15 } } },
    "Med. Insulated Plating": { active: "Always", trait: { kind: "DamageResists", resists: { Electromagnetic: 20 } } },
    "Hvy. Insulated Plating": { active: "Always", trait: { kind: "DamageResists", resists: { Electromagnetic: 30 } } },
    "EM Shield": {
        active: "Part Active",
        trait: { kind: "DamageResists", resists: { Electromagnetic: 25 } },
    },
    "Adv. EM Shield": {
        active: "Part Active",
        trait: { kind: "DamageResists", resists: { Electromagnetic: 50 } },
    },
    "Exp. EM Shield": {
        active: "Part Active",
        trait: { kind: "DamageResists", resists: { Electromagnetic: 75 } },
    },
    "Damper Plating": { active: "Always", trait: { kind: "DamageResists", resists: { Electromagnetic: 90 } } },
    "Superdense Plating": { active: "Always", trait: { kind: "DamageResists", resists: { Kinetic: 25 } } },
    // Explosive
    "Shock Absorption System": { active: "Part Active", trait: { kind: "DamageResists", resists: { Explosive: 25 } } },
    "Imp. Shock Absorption System": {
        active: "Part Active",
        trait: { kind: "DamageResists", resists: { Explosive: 50 } },
    },
    "Exp. Shock Absorption System": {
        active: "Part Active",
        trait: { kind: "DamageResists", resists: { Explosive: 75 } },
    },
    "8R-AWN's Armor/EX": { active: "Always", trait: { kind: "DamageResists", resists: { Explosive: 90 } } },
    // Kinetic
    "Mak. Kinetic Plating": { active: "Always", trait: { kind: "DamageResists", resists: { Kinetic: 20 } } },
    "Focal Shield": { active: "Part Active", trait: { kind: "DamageResists", resists: { Kinetic: 20 } } },
    "Reactive Plating": { active: "Always", trait: { kind: "DamageResists", resists: { Kinetic: 20 } } },
    "Imp. Focal Shield": { active: "Part Active", trait: { kind: "DamageResists", resists: { Kinetic: 25 } } },
    "Adv. Focal Shield": { active: "Part Active", trait: { kind: "DamageResists", resists: { Kinetic: 30 } } },
    "Exp. Focal Shield": { active: "Part Active", trait: { kind: "DamageResists", resists: { Kinetic: 30 } } },
    "Med. Reactive Plating": { active: "Always", trait: { kind: "DamageResists", resists: { Kinetic: 30 } } },
    "Hvy. Reactive Plating": { active: "Always", trait: { kind: "DamageResists", resists: { Kinetic: 40 } } },
    // Thermal
    "Mak. Thermal Plating": { active: "Always", trait: { kind: "DamageResists", resists: { Thermal: 10 } } },
    "Thermal Defense Suite": { active: "Part Active", trait: { kind: "DamageResists", resists: { Thermal: 20 } } },
    "Reflective Plating": { active: "Always", trait: { kind: "DamageResists", resists: { Thermal: 10 } } },
    "Med. Reflective Plating": { active: "Always", trait: { kind: "DamageResists", resists: { Thermal: 15 } } },
    "Thermal Shield": { active: "Part Active", trait: { kind: "DamageResists", resists: { Thermal: 20 } } },
    "Imp. Thermal Defense Suite": { active: "Part Active", trait: { kind: "DamageResists", resists: { Thermal: 25 } } },
    "Imp. Thermal Shield": { active: "Part Active", trait: { kind: "DamageResists", resists: { Thermal: 25 } } },
    "Hvy. Reflective Plating": { active: "Always", trait: { kind: "DamageResists", resists: { Thermal: 25 } } },
    "Adv. Thermal Defense Suite": { active: "Part Active", trait: { kind: "DamageResists", resists: { Thermal: 30 } } },
    "Adv. Thermal Shield": { active: "Part Active", trait: { kind: "DamageResists", resists: { Thermal: 30 } } },
    "Exp. Thermal Defense Suite": { active: "Part Active", trait: { kind: "DamageResists", resists: { Thermal: 30 } } },
    "Exp. Thermal Shield": { active: "Part Active", trait: { kind: "DamageResists", resists: { Thermal: 30 } } },
    "Thermal Barrier": { active: "Part Active", trait: { kind: "DamageResists", resists: { Thermal: 50 } } },
    "Cep. Beam Splitter": { active: "Part Active", trait: { kind: "DamageResists", resists: { Thermal: 75 } } },
    "8R-AWN's Armor/TH": { active: "Always", trait: { kind: "DamageResists", resists: { Thermal: 90 } } },
    // All
    "Asb. Alloy Armor": {
        active: "Always",
        trait: {
            kind: "DamageResists",
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
            kind: "DamageResists",
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
            kind: "DamageResists",
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
            kind: "DamageResists",
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
    "Sigix Exoskeleton": {
        active: "Always",
        trait: {
            kind: "DamageResists",
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
    "EM Disruption Field": { active: "Part Active", trait: { kind: "CorruptionMaximum", amount: 10 } },
    "Adv. EM Disruption Field": { active: "Part Active", trait: { kind: "CorruptionMaximum", amount: 6 } },
    "Exp. EM Disruption Field": { active: "Part Active", trait: { kind: "CorruptionMaximum", amount: 3 } },

    // Energy filter
    "Energy Filter": { active: "Part Active", trait: { kind: "EnergyFilter", percent: 0.3 } },
    "Prc. Energy Filter": { active: "Part Active", trait: { kind: "EnergyFilter", percent: 0.5 } },

    // Energy storage
    "Sml. Battery": { active: "Always", trait: { kind: "EnergyStorage", storage: 100 } },
    "Med. Battery": { active: "Always", trait: { kind: "EnergyStorage", storage: 150 } },
    "Lrg. Battery": { active: "Always", trait: { kind: "EnergyStorage", storage: 200 } },
    "Com. Battery": { active: "Always", trait: { kind: "EnergyStorage", storage: 200 } },
    "Hcp. Battery": { active: "Always", trait: { kind: "EnergyStorage", storage: 250 } },
    "Energy Well": { active: "Always", trait: { kind: "EnergyStorage", storage: 350 } },
    "Imp. Energy Well": { active: "Always", trait: { kind: "EnergyStorage", storage: 400 } },
    "Adv. Energy Well": { active: "Always", trait: { kind: "EnergyStorage", storage: 500 } },
    "Exp. Energy Well": { active: "Always", trait: { kind: "EnergyStorage", storage: 600 } },
    "Asb. Biocell Array": { active: "Always", trait: { kind: "EnergyStorage", storage: 1000 } },
    "Zio. Biocell": { active: "Always", trait: { kind: "EnergyStorage", storage: 600 } },
    "Zio. Biocell Array": { active: "Always", trait: { kind: "EnergyStorage", storage: 750 } },
    "Cep. Chromion Battery": { active: "Always", trait: { kind: "EnergyStorage", storage: 800 } },
    Superbattery: { active: "Always", trait: { kind: "EnergyStorage", storage: 1500 } },

    // Hardlight Generator
    "Hardlight Generator": { active: "Part Active", trait: { kind: "HardlightGenerator", amount: 4 } },
    "Imp. Hardlight Generator": { active: "Part Active", trait: { kind: "HardlightGenerator", amount: 6 } },
    "Adv. Hardlight Generator": { active: "Part Active", trait: { kind: "HardlightGenerator", amount: 8 } },
    "Exp. Hardlight Generator": { active: "Part Active", trait: { kind: "HardlightGenerator", amount: 10 } },
    "Cep. Hardlight Director": { active: "Part Active", trait: { kind: "HardlightGenerator", amount: 14 } },

    // Heat dissipation
    "2N-1CE's Frost Array": { active: "Part Active", trait: { kind: "HeatDissipation", dissipation: 100 } },
    "Active Cooling Armor": { active: "Part Active", trait: { kind: "HeatDissipation", dissipation: 60 } },
    "Coolant Network": { active: "Part Active", trait: { kind: "HeatDissipation", dissipation: 90 } },
    "Cooling System": { active: "Part Active", trait: { kind: "HeatDissipation", dissipation: 22 } },
    "Imp. Cooling System": { active: "Part Active", trait: { kind: "HeatDissipation", dissipation: 27 } },
    "Adv. Cooling System": { active: "Part Active", trait: { kind: "HeatDissipation", dissipation: 31 } },
    "Exp. Cooling System": { active: "Part Active", trait: { kind: "HeatDissipation", dissipation: 38 } },
    "Heat Sink": { active: "Part Active", trait: { kind: "HeatDissipation", dissipation: 10 } },
    "Imp. Heat Sink": { active: "Part Active", trait: { kind: "HeatDissipation", dissipation: 14 } },
    "Adv. Heat Sink": { active: "Part Active", trait: { kind: "HeatDissipation", dissipation: 19 } },
    "Exp. Heat Sink": { active: "Part Active", trait: { kind: "HeatDissipation", dissipation: 26 } },
    "Cep. Phasing Heat sink": { active: "Part Active", trait: { kind: "HeatDissipation", dissipation: 36 } },

    // Injectors
    "Disposable Heat Sink": { active: "Part Active", trait: { kind: "Injector", dissipation: 50 } },
    "Coolant Injector": { active: "Part Active", trait: { kind: "Injector", dissipation: 65 } },
    "Imp. Coolant Injector": { active: "Part Active", trait: { kind: "Injector", dissipation: 80 } },
    "Adv. Coolant Injector": { active: "Part Active", trait: { kind: "Injector", dissipation: 100 } },
    "Exp. Coolant Injector": { active: "Part Active", trait: { kind: "Injector", dissipation: 120 } },

    // Kinecellerators
    Kinecellerator: { active: "Part Active", trait: { kind: "Kinecellerator", amount: 30 } },
    "Imp. Kinecellerator": { active: "Part Active", trait: { kind: "Kinecellerator", amount: 40 } },
    "Adv. Kinecellerator": { active: "Part Active", trait: { kind: "Kinecellerator", amount: 50 } },
    "Exp. Kinecellerator": { active: "Part Active", trait: { kind: "Kinecellerator", amount: 66 } },

    // Mass support
    "Weight Redist. System": { active: "Part Active", trait: { kind: "MassSupport", support: 6 } },
    "Adv. Weight Redist. System": { active: "Part Active", trait: { kind: "MassSupport", support: 9 } },
    "Gravity Neutralizer": { active: "Part Active", trait: { kind: "MassSupport", support: 12 } },
    "Adv. Gravity Neutralizer": { active: "Part Active", trait: { kind: "MassSupport", support: 16 } },
    "Quantum Shading Machine": { active: "Part Active", trait: { kind: "MassSupport", support: 20 } },
    "Adv. Quantum Shading Machine": { active: "Part Active", trait: { kind: "MassSupport", support: 25 } },
    "Asb. Suspension Frame": { active: "Part Active", trait: { kind: "MassSupport", support: 20 } },
    "Cep. Dimensional Manipulator": { active: "Part Active", trait: { kind: "MassSupport", support: 30 } },

    // Matter storage
    "Sml. Matter Pod": { active: "Always", trait: { kind: "MatterStorage", storage: 50 } },
    "Med. Matter Pod": { active: "Always", trait: { kind: "MatterStorage", storage: 100 } },
    "Lrg. Matter Pod": { active: "Always", trait: { kind: "MatterStorage", storage: 150 } },
    "Hcp. Matter Pod": { active: "Always", trait: { kind: "MatterStorage", storage: 200 } },
    "Com. Matter Pod": { active: "Always", trait: { kind: "MatterStorage", storage: 150 } },
    "Matter Compressor": { active: "Always", trait: { kind: "MatterStorage", storage: 250 } },
    "Imp. Matter Compressor": { active: "Always", trait: { kind: "MatterStorage", storage: 300 } },
    "Adv. Matter Compressor": { active: "Always", trait: { kind: "MatterStorage", storage: 400 } },
    "Exp. Matter Compressor": { active: "Always", trait: { kind: "MatterStorage", storage: 500 } },
    "YI-UF0's Bottomless Matter Pit": { active: "Always", trait: { kind: "MatterStorage", storage: 1500 } },

    // Melee analysis
    "Melee Analysis Suite": { active: "Part Active", trait: { kind: "MeleeAnalysis", accuracy: 5, minDamage: 2 } },
    "Imp. Melee Analysis Suite": { active: "Part Active", trait: { kind: "MeleeAnalysis", accuracy: 6, minDamage: 3 } },
    "Adv. Melee Analysis Suite": { active: "Part Active", trait: { kind: "MeleeAnalysis", accuracy: 8, minDamage: 4 } },
    "Exp. Melee Analysis Suite": {
        active: "Part Active",
        trait: { kind: "MeleeAnalysis", accuracy: 12, minDamage: 6 },
    },

    // Metafiber
    "Asb. Metafiber Network": { active: "Part Active", trait: { kind: "Metafiber" } },

    // Launcher Guidance
    "Launcher Guidance Computer": { active: "Part Active", trait: { kind: "LauncherGuidance", bonus: 20 } },
    "Imp. Launcher Guidance Computer": { active: "Part Active", trait: { kind: "LauncherGuidance", bonus: 30 } },
    "Adv. Launcher Guidance Computer": { active: "Part Active", trait: { kind: "LauncherGuidance", bonus: 40 } },

    // Power amplifiers
    "Power Amplifier": { active: "Always", trait: { kind: "PowerAmplifier", percent: 0.2 } },
    "Adv. Power Amplifier": { active: "Always", trait: { kind: "PowerAmplifier", percent: 0.3 } },
    "Exp. Power Amplifier": { active: "Always", trait: { kind: "PowerAmplifier", percent: 0.4 } },

    // Ranged avoid/phase shifters
    "Phase Shifter": { active: "Part Active", trait: { kind: "RangedAvoid", avoid: 5 } },
    "Imp. Phase Shifter": { active: "Part Active", trait: { kind: "RangedAvoid", avoid: 10 } },
    "Adv. Phase Shifter": { active: "Part Active", trait: { kind: "RangedAvoid", avoid: 15 } },
    "Exp. Phase Shifter": { active: "Part Active", trait: { kind: "RangedAvoid", avoid: 20 } },
    "Cep. Phase Shift Module": { active: "Part Active", trait: { kind: "RangedAvoid", avoid: 20 } },

    // Ranged weapon cycling
    "Weapon Cycler": { active: "Part Active", trait: { kind: "RangedWeaponCycling", amount: 0.15 } },
    "Imp. Weapon Cycler": { active: "Part Active", trait: { kind: "RangedWeaponCycling", amount: 0.2 } },
    "Adv. Weapon Cycler": { active: "Part Active", trait: { kind: "RangedWeaponCycling", amount: 0.25 } },
    "Exp. Weapon Cycler": { active: "Part Active", trait: { kind: "RangedWeaponCycling", amount: 0.3 } },
    "Launcher Loader": { active: "Part Active", trait: { kind: "LauncherLoader" } },
    "Mni. Quantum Capacitor": { active: "Part Active", trait: { kind: "MniQuantumCapacitor" } },
    "Quantum Capacitor": { active: "Part Active", trait: { kind: "QuantumCapacitor" } },

    // Reaction control systems
    "Reaction Control System": {
        active: "Part Active",
        trait: { kind: "ReactionControlSystem", chance: 8 },
    },
    "Imp. Reaction Control System": {
        active: "Part Active",
        trait: { kind: "ReactionControlSystem", chance: 10 },
    },
    "Adv. Reaction Control System": {
        active: "Part Active",
        trait: { kind: "ReactionControlSystem", chance: 12 },
    },
    "Exp. Reaction Control System": {
        active: "Part Active",
        trait: { kind: "ReactionControlSystem", chance: 14 },
    },
    "Cep. Reaction Jets": {
        active: "Part Active",
        trait: { kind: "ReactionControlSystem", chance: 18 },
    },

    // Recoil reduction
    "Recoil Stabilizer": { active: "Part Active", trait: { kind: "RecoilReduction", reduction: 4 } },
    "Adv. Recoil Stabilizer": { active: "Part Active", trait: { kind: "RecoilReduction", reduction: 6 } },
    "Cep. Recoil Nullifier": { active: "Part Active", trait: { kind: "RecoilReduction", reduction: 99 } },

    // Particle charging
    "Particle Charger": { active: "Part Active", trait: { kind: "ParticleCharging", percent: 15 } },
    "Imp. Particle Charger": { active: "Part Active", trait: { kind: "ParticleCharging", percent: 20 } },
    "Adv. Particle Charger": { active: "Part Active", trait: { kind: "ParticleCharging", percent: 25 } },
    "Particle Accelerator": { active: "Part Active", trait: { kind: "ParticleCharging", percent: 30 } },
    "Imp. Particle Accelerator": { active: "Part Active", trait: { kind: "ParticleCharging", percent: 40 } },
    "Adv. Particle Accelerator": { active: "Part Active", trait: { kind: "ParticleCharging", percent: 50 } },

    // Salvage targeting
    "Salvage Targeting Computer": { active: "Part Active", trait: { kind: "SalvageTargeting", amount: 1 } },
    "Imp. Salvage Targeting Computer": { active: "Part Active", trait: { kind: "SalvageTargeting", amount: 2 } },
    "Adv. Salvage Targeting Computer": { active: "Part Active", trait: { kind: "SalvageTargeting", amount: 3 } },
    "Mak. Salvage Targeting Computer": { active: "Part Active", trait: { kind: "SalvageTargeting", amount: 4 } },
    "Exp. Salvage Targeting Computer": { active: "Part Active", trait: { kind: "SalvageTargeting", amount: 5 } },

    // Self-damage reduction
    "1C-UTU's Buckler": { active: "Part Active", trait: { kind: "SelfReduction", shielding: 0.5 } },
    "Powered Armor": { active: "Part Active", trait: { kind: "SelfReduction", shielding: 0.5 } },
    "Imp. Powered Armor": { active: "Part Active", trait: { kind: "SelfReduction", shielding: 0.5 } },
    "Adv. Powered Armor": { active: "Part Active", trait: { kind: "SelfReduction", shielding: 0.5 } },
    "Exp. Powered Armor": { active: "Part Active", trait: { kind: "SelfReduction", shielding: 0.5 } },

    // Shieldings
    "Core Shielding": { active: "Always", trait: { kind: "Shielding", shielding: 0.2, slot: "Core" } },
    "Imp. Core Shielding": { active: "Always", trait: { kind: "Shielding", shielding: 0.3, slot: "Core" } },
    "Exp. Core Shielding": { active: "Always", trait: { kind: "Shielding", shielding: 0.4, slot: "Core" } },
    "Cep. Core Shell": { active: "Always", trait: { kind: "Shielding", shielding: 0.9, slot: "Core" } },
    "Power Shielding": { active: "Always", trait: { kind: "Shielding", shielding: 0.33, slot: "Power" } },
    "Imp. Power Shielding": { active: "Always", trait: { kind: "Shielding", shielding: 0.66, slot: "Power" } },
    "Exp. Power Shielding": { active: "Always", trait: { kind: "Shielding", shielding: 0.9, slot: "Power" } },
    "Propulsion Shielding": { active: "Always", trait: { kind: "Shielding", shielding: 0.33, slot: "Propulsion" } },
    "Imp. Propulsion Shielding": {
        active: "Always",
        trait: { kind: "Shielding", shielding: 0.66, slot: "Propulsion" },
    },
    "Exp. Propulsion Shielding": { active: "Always", trait: { kind: "Shielding", shielding: 0.9, slot: "Propulsion" } },
    "Utility Shielding": { active: "Always", trait: { kind: "Shielding", shielding: 0.33, slot: "Utility" } },
    "Imp. Utility Shielding": { active: "Always", trait: { kind: "Shielding", shielding: 0.66, slot: "Utility" } },
    "Exp. Utility Shielding": { active: "Always", trait: { kind: "Shielding", shielding: 0.9, slot: "Utility" } },
    "Weapon Shielding": { active: "Always", trait: { kind: "Shielding", shielding: 0.33, slot: "Weapon" } },
    "Imp. Weapon Shielding": { active: "Always", trait: { kind: "Shielding", shielding: 0.66, slot: "Weapon" } },
    "Exp. Weapon Shielding": { active: "Always", trait: { kind: "Shielding", shielding: 0.9, slot: "Weapon" } },
    "Zio. Weapon Casing": { active: "Always", trait: { kind: "Shielding", shielding: 1, slot: "Weapon" } },

    // Target Analyzers
    "Target Analyzer": { active: "Part Active", trait: { kind: "TargetAnalyzer", bonus: 5 } },
    "Imp. Target Analyzer": { active: "Part Active", trait: { kind: "TargetAnalyzer", bonus: 6 } },
    "Adv. Target Analyzer": { active: "Part Active", trait: { kind: "TargetAnalyzer", bonus: 8 } },
    "Exp. Target Analyzer": { active: "Part Active", trait: { kind: "TargetAnalyzer", bonus: 10 } },

    // Targeting
    "Targeting Computer": { active: "Part Active", trait: { kind: "Targeting", bonus: 5 } },
    "Imp. Targeting Computer": { active: "Part Active", trait: { kind: "Targeting", bonus: 6 } },
    "Adv. Targeting Computer": { active: "Part Active", trait: { kind: "Targeting", bonus: 8 } },
    "Exp. Targeting Computer": { active: "Part Active", trait: { kind: "Targeting", bonus: 12 } },

    // Weapon regen
    "Sigix Broadsword": {
        active: "Part Active",
        trait: { kind: "WeaponRegen", energyPerTurn: 5, integrityPerTurn: 2 },
    },
};
