import { SpecialItemProperty } from "./itemTypes";

export const specialItemProperties: { [name: string]: SpecialItemProperty | undefined } = {
    // Actuator
    "Microactuators": { active: "Part Active", trait: { kind: "Actuator", amount: .2 } },
    "Nanoactuators": { active: "Part Active", trait: { kind: "Actuator", amount: .3 } },
    "Femtoactuators": { active: "Part Active", trait: { kind: "Actuator", amount: .5 } },

    // Energy storage
    "Sml. Battery": { active: "Always", trait: { kind: "EnergyStorage", storage: 100 } },
    "Med. Battery": { active: "Always", trait: { kind: "EnergyStorage", storage: 200 } },
    "Lrg. Battery": { active: "Always", trait: { kind: "EnergyStorage", storage: 300 } },
    "Com. Battery": { active: "Always", trait: { kind: "EnergyStorage", storage: 300 } },
    "Hcp. Battery": { active: "Always", trait: { kind: "EnergyStorage", storage: 400 } },
    "Energy Well": { active: "Always", trait: { kind: "EnergyStorage", storage: 500 } },
    "Imp. Energy Well": { active: "Always", trait: { kind: "EnergyStorage", storage: 600 } },
    "Adv. Energy Well": { active: "Always", trait: { kind: "EnergyStorage", storage: 800 } },
    "Exp. Energy Well": { active: "Always", trait: { kind: "EnergyStorage", storage: 1000 } },
    "Asb. Biocell Array": { active: "Always", trait: { kind: "EnergyStorage", storage: 1000 } },
    "Zio. Biocell": { active: "Always", trait: { kind: "EnergyStorage", storage: 1000 } },
    "Zio. Biocell Array": { active: "Always", trait: { kind: "EnergyStorage", storage: 1200 } },
    "Superbattery": { active: "Always", trait: { kind: "EnergyStorage", storage: 2000 } },

    // Heat dissipation
    "Cooling System": { active: "Part Active", trait: { kind: "HeatDissipation", dissipation: 22 } },
    "Imp. Cooling System": { active: "Part Active", trait: { kind: "HeatDissipation", dissipation: 27 } },
    "Adv. Cooling System": { active: "Part Active", trait: { kind: "HeatDissipation", dissipation: 31 } },
    "Exp. Cooling System": { active: "Part Active", trait: { kind: "HeatDissipation", dissipation: 38 } },
    "Heat Sink": { active: "Part Active", trait: { kind: "HeatDissipation", dissipation: 10 } },
    "Imp. Heat Sink": { active: "Part Active", trait: { kind: "HeatDissipation", dissipation: 14 } },
    "Adv. Heat Sink": { active: "Part Active", trait: { kind: "HeatDissipation", dissipation: 19 } },
    "Exp. Heat Sink": { active: "Part Active", trait: { kind: "HeatDissipation", dissipation: 26 } },

    // Mass support
    "Weight Redist. System": { active: "Part Active", trait: { kind: "MassSupport", support: 6 } },
    "Adv. Weight Redist. System": { active: "Part Active", trait: { kind: "MassSupport", support: 9 } },
    "Gravity Neutralizing Apparatus": { active: "Part Active", trait: { kind: "MassSupport", support: 12 } },
    "Inertial Stasis Machine": { active: "Part Active", trait: { kind: "MassSupport", support: 16 } },
    "Quantum Shading Machine": { active: "Part Active", trait: { kind: "MassSupport", support: 20 } },
    "Dimensional Manipulator": { active: "Part Active", trait: { kind: "MassSupport", support: 25 } },
    "Asb. Suspension Frame": { active: "Part Active", trait: { kind: "MassSupport", support: 10 } },

    // Ranged weapon cycling
    "Weapon Cycler": { active: "Part Active", trait: { kind: "RangedWeaponCycling", amount: .15 } },
    "Imp. Weapon Cycler": { active: "Part Active", trait: { kind: "RangedWeaponCycling", amount: .2 } },
    "Adv. Weapon Cycler": { active: "Part Active", trait: { kind: "RangedWeaponCycling", amount: .25 } },
    "Exp. Weapon Cycler": { active: "Part Active", trait: { kind: "RangedWeaponCycling", amount: .3 } },
    "Launcher Loader": { active: "Part Active", trait: { kind: "RangedWeaponCycling", amount: .5 } },
    "Quantum Capacitor": { active: "Part Active", trait: { kind: "RangedWeaponCycling", amount: .5 } },

    // Weapon regen
    "Sigix Broadsword": { active: "Part Active", trait: { kind: "WeaponRegen", energyPerTurn: 5, integrityPerTurn: 2 } },
}