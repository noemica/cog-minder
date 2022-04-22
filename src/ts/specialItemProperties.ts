import { SpecialItemProperty } from "./itemTypes";

export const specialItemProperties: { [name: string]: SpecialItemProperty | undefined } = {
    // Actuator
    Microactuators: { active: "Part Active", trait: { kind: "Actuator", amount: 0.2 } },
    Nanoactuators: { active: "Part Active", trait: { kind: "Actuator", amount: 0.3 } },
    Femtoactuators: { active: "Part Active", trait: { kind: "Actuator", amount: 0.5 } },

    // Airborne Speed doubling
    "ST Field Compressor": { active: "Part Active", trait: { kind: "AirborneSpeedDoubling" } },
    "Zio. Metafield Generator": { active: "Part Active", trait: { kind: "AirborneSpeedDoubling" } },

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
    Superbattery: { active: "Always", trait: { kind: "EnergyStorage", storage: 1500 } },

    // Fusion compressor
    "Fusion Compressor": { active: "Part Active", trait: { kind: "FusionCompressor", energyPerTurn: 20 } },
    "Imp. Fusion Compressor": { active: "Part Active", trait: { kind: "FusionCompressor", energyPerTurn: 30 } },

    // Heat dissipation
    "Cooling System": { active: "Part Active", trait: { kind: "HeatDissipation", dissipation: 22 } },
    "Imp. Cooling System": { active: "Part Active", trait: { kind: "HeatDissipation", dissipation: 27 } },
    "Adv. Cooling System": { active: "Part Active", trait: { kind: "HeatDissipation", dissipation: 31 } },
    "Exp. Cooling System": { active: "Part Active", trait: { kind: "HeatDissipation", dissipation: 38 } },
    "Heat Sink": { active: "Part Active", trait: { kind: "HeatDissipation", dissipation: 10 } },
    "Imp. Heat Sink": { active: "Part Active", trait: { kind: "HeatDissipation", dissipation: 14 } },
    "Adv. Heat Sink": { active: "Part Active", trait: { kind: "HeatDissipation", dissipation: 19 } },
    "Exp. Heat Sink": { active: "Part Active", trait: { kind: "HeatDissipation", dissipation: 26 } },
    "Active Cooling Armor": { active: "Part Active", trait: { kind: "HeatDissipation", dissipation: 60 } },
    "2N-1CE's Frost Array": { active: "Part Active", trait: { kind: "HeatDissipation", dissipation: 100 } },

    // Mass support
    "Weight Redist. System": { active: "Part Active", trait: { kind: "MassSupport", support: 6 } },
    "Adv. Weight Redist. System": { active: "Part Active", trait: { kind: "MassSupport", support: 9 } },
    "Gravity Neutralizer": { active: "Part Active", trait: { kind: "MassSupport", support: 12 } },
    "Adv. Gravity Neutralizer": { active: "Part Active", trait: { kind: "MassSupport", support: 16 } },
    "Quantum Shading Machine": { active: "Part Active", trait: { kind: "MassSupport", support: 20 } },
    "Adv. Quantum Shading Machine": { active: "Part Active", trait: { kind: "MassSupport", support: 25 } },
    "Asb. Suspension Frame": { active: "Part Active", trait: { kind: "MassSupport", support: 20 } },

    // Metafiber
    "Asb. Metafiber Network": { active: "Part Active", trait: { kind: "Metafiber" } },

    // Ranged weapon cycling
    "Weapon Cycler": { active: "Part Active", trait: { kind: "RangedWeaponCycling", amount: 0.15 } },
    "Imp. Weapon Cycler": { active: "Part Active", trait: { kind: "RangedWeaponCycling", amount: 0.2 } },
    "Adv. Weapon Cycler": { active: "Part Active", trait: { kind: "RangedWeaponCycling", amount: 0.25 } },
    "Exp. Weapon Cycler": { active: "Part Active", trait: { kind: "RangedWeaponCycling", amount: 0.3 } },
    "Launcher Loader": { active: "Part Active", trait: { kind: "RangedWeaponCycling", amount: 0.5 } },
    "Quantum Capacitor": { active: "Part Active", trait: { kind: "RangedWeaponCycling", amount: 0.5 } },

    // Power amplifiers
    "Power Amplifier": { active: "Always", trait: { kind: "PowerAmplifier", percent: 0.2 } },
    "Adv. Power Amplifier": { active: "Always", trait: { kind: "PowerAmplifier", percent: 0.3 } },
    "Exp. Power Amplifier": { active: "Always", trait: { kind: "PowerAmplifier", percent: 0.4 } },

    // Weapon regen
    "Sigix Broadsword": {
        active: "Part Active",
        trait: { kind: "WeaponRegen", energyPerTurn: 5, integrityPerTurn: 2 },
    },
};
