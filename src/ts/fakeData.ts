import { CombatLogEntry } from "./types/combatLogTypes";

export const fakeData: CombatLogEntry[] = [
    {
        sourceEntity: "Cogmind",
        sourceWeapon: "Lgt. Assault Rifle",
        weaponAccuracy: 94,
        projectilesTotal: 1,
        projectilesHit: 1,
        damageEntries: [
            {
                damagedEntity: "S-10 Pest",
                damagedPart: "Core",
                damageDealt: 10,
            },
        ],
    },
    {
        sourceEntity: "Cogmind",
        sourceWeapon: "Lgt. Assault Rifle",
        weaponAccuracy: 70,
        projectilesTotal: 1,
        projectilesHit: 1,
        damageEntries: [
            {
                damagedEntity: "S-10 Pest",
                damagedPart: "Core",
                damageDealt: 10,
            },
        ],
    },
    {
        sourceEntity: "Cogmind",
        sourceWeapon: "Lgt. Assault Rifle",
        weaponAccuracy: 70,
        projectilesTotal: 1,
        projectilesHit: 0,
        damageEntries: [],
    },
    {
        sourceEntity: "S-10 Pest",
        sourceWeapon: "Lgt. Assault Rifle",
        weaponAccuracy: 70,
        projectilesTotal: 1,
        projectilesHit: 0,
        damageEntries: [
            {
                damagedEntity: "Cogmind",
                damagedPart: "Core",
                damageDealt: 6,
            },
        ],
    },
    {
        sourceEntity: "S-10 Pest",
        sourceWeapon: "Lgt. Assault Rifle",
        weaponAccuracy: 68,
        projectilesTotal: 1,
        projectilesHit: 0,
        damageEntries: [
            {
                damagedEntity: "Cogmind",
                damagedPart: "Core",
                damageDealt: 8,
            },
        ],
    },
    {
        sourceEntity: "Cogmind",
        sourceWeapon: "Multirail",
        weaponAccuracy: 70,
        projectilesTotal: 3,
        projectilesHit: 3,
        damageEntries: [
            {
                damagedEntity: "G-34 Mercenary",
                damagedPart: "Core",
                damageDealt: 16,
            },
            {
                damagedEntity: "G-34 Mercenary",
                damagedPart: "Sml. Laser",
                damageDealt: 14,
            },
            {
                damagedEntity: "G-34 Mercenary",
                damagedPart: "Sml. Laser",
                targetDestroyed: true,
                damageDealt: 18,
                criticalHitType: "Destroy",
            },
        ],
    },
    {
        sourceEntity: "Cogmind",
        sourceWeapon: "Mni. Grenade Launcher",
        weaponAccuracy: 70,
        projectilesTotal: 1,
        projectilesHit: 1,
        damageEntries: [
            {
                damagedEntity: "S-27 Virus",
                damagedPart: "Core",
                damageDealt: 30,
            },
            {
                damagedEntity: "S-27 Virus",
                damagedPart: "Lgt. Assault Rifle",
                damageDealt: 45,
            },
            {
                damagedEntity: "S-27 Virus",
                damagedPart: "VTOL Module",
                damageDealt: 16,
            },
            {
                damagedEntity: "S-27 Virus",
                damagedPart: "VTOL Module",
                targetDestroyed: true,
            },
            {
                damagedEntity: "S-27 Virus",
                damagedPart: "Core",
                damageOverflow: true,
                damageDealt: 7,
            },
        ],
    },
    {
        sourceEntity: "S-10 Pest",
        sourceWeapon: "Lgt. Assault Rifle",
        weaponAccuracy: 69,
        projectilesTotal: 1,
        projectilesHit: 0,
        damageEntries: [
            {
                damagedEntity: "Cogmind",
                damagedPart: "Imp. Light Armor Plating",
                damageDealt: 8,
            },
        ],
    },
    {
        sourceEntity: "Cogmind",
        sourceWeapon: "Mni. Grenade Launcher",
        weaponAccuracy: 70,
        projectilesTotal: 1,
        projectilesHit: 0,
        damageEntries: [
            {
                damagedEntity: "S-27 Virus",
                damagedPart: "Core",
                targetDestroyed: true,
                damageDealt: 34,
            },
            {
                damagedEntity: "Cogmind",
                damagedPart: "Imp. Light Armor Plating",
                damageDealt: 15,
            },
            {
                damagedEntity: "Cogmind",
                damagedPart: "Core",
                damageDealt: 15,
            },
        ],
    },
    {
        sourceEntity: "Y-45 Defender",
        sourceWeapon: "Beam Rifle",
        weaponAccuracy: 70,
        projectilesTotal: 1,
        projectilesHit: 1,
        damageEntries: [
            {
                damagedEntity: "Cogmind",
                damagedPart: "Imp. Light Armor Plating",
                targetDestroyed: true,
                damageDealt: 14,
            },
        ],
    },
    {
        sourceEntity: "D-53 Grenadier",
        sourceWeapon: "Mni. Grenade Launcher",
        weaponAccuracy: 95,
        projectilesTotal: 1,
        projectilesHit: 1,
        damageEntries: [
            {
                damagedEntity: "Cogmind",
                damagedPart: "Ion Engine",
                targetDestroyed: true,
                damageDealt: 20,
            },
            {
                damagedEntity: "Cogmind",
                damagedPart: "Imp. Light Armor Plating",
                damageOverflow: true,
                damageDealt: 7,
            },
            {
                damagedEntity: "Cogmind",
                damagedPart: "Core",
                damageDealt: 30,
            },
        ],
    },
    {
        sourceEntity: "Cogmind",
        sourceWeapon: "Katana",
        weaponAccuracy: 100,
        projectilesTotal: 1,
        projectilesHit: 1,
        sneakAttack: true,
        damageEntries: [
            {
                damagedEntity: "H-61 Shepherd",
                damagedPart: "Core",
                damageDealt: 30,
            },
        ],
    },
    {
        sourceEntity: "Cogmind",
        sourceWeapon: "Katana",
        weaponAccuracy: 100,
        projectilesTotal: 1,
        projectilesHit: 1,
        sneakAttack: true,
        damageEntries: [
            {
                damagedEntity: "R-06 Scavenger",
                damagedPart: "Core",
                damageDealt: 60,
                targetDestroyed: true,
            },
        ],
    },
    {
        sourceEntity: "G-50 Soldier",
        sourceWeapon: "Hvy. Laser",
        weaponAccuracy: 70,
        projectilesTotal: 1,
        projectilesHit: 1,
        damageEntries: [
            {
                damagedEntity: "Cogmind",
                damagedPart: "Enh. Autogun",
                damageDealt: 18,
                criticalHitType: "Burn",
            },
        ],
    },
    {
        sourceEntity: "Cogmind",
        sourceWeapon: "Lgt. Assault Rifle",
        weaponAccuracy: 70,
        projectilesTotal: 1,
        projectilesHit: 1,
        damageEntries: [
            {
                damagedEntity: "W-16 Scout",
                damagedPart: "Core",
                damageDealt: 6,
            },
        ],
    },
    {
        sourceEntity: "Cogmind",
        sourceWeapon: "Lgt. Assault Rifle",
        weaponAccuracy: 70,
        projectilesTotal: 1,
        projectilesHit: 1,
        damageEntries: [
            {
                damagedEntity: "K-01 Serf",
                damagedPart: "Core",
                damageDealt: 6,
            },
        ],
    },
    {
        sourceEntity: "Cogmind",
        sourceWeapon: "Assault Rifle",
        weaponAccuracy: 70,
        projectilesTotal: 1,
        projectilesHit: 1,
        damageEntries: [
            {
                damagedEntity: "U-05 Engineer",
                damagedPart: "Core",
                damageDealt: 12,
            },
        ],
    },
    {
        sourceEntity: "Cogmind",
        sourceWeapon: "Assault Rifle",
        weaponAccuracy: 70,
        projectilesTotal: 1,
        projectilesHit: 1,
        damageEntries: [
            {
                damagedEntity: "M-13 Machinist",
                damagedPart: "Core",
                damageDealt: 11,
            },
        ],
    },
    {
        sourceEntity: "Cogmind",
        sourceWeapon: "Assault Rifle",
        weaponAccuracy: 70,
        projectilesTotal: 1,
        projectilesHit: 1,
        damageEntries: [
            {
                damagedEntity: "M-14 Sweeper",
                damagedPart: "Core",
                damageDealt: 12,
            },
        ],
    },
    {
        sourceEntity: "Cogmind",
        sourceWeapon: "Assault Rifle",
        weaponAccuracy: 70,
        projectilesTotal: 1,
        projectilesHit: 1,
        damageEntries: [
            {
                damagedEntity: "A-02 Transporter",
                damagedPart: "Lgt. Treads",
                damageDealt: 13,
            },
        ],
    },
    {
        sourceEntity: "Cogmind",
        sourceWeapon: "Plasma Rifle",
        weaponAccuracy: 82,
        projectilesTotal: 1,
        projectilesHit: 1,
        damageEntries: [
            {
                damagedEntity: "Y-54 Guardian",
                damagedPart: "Lgt. Treads",
                damageDealt: 21,
            },
        ],
    },
    {
        sourceEntity: "Cogmind",
        sourceWeapon: "Flak Gun",
        weaponAccuracy: 82,
        projectilesTotal: 1,
        projectilesHit: 1,
        damageEntries: [
            {
                damagedEntity: "Y-64 Sentinel",
                damagedPart: "Imp. Treads",
                damageDealt: 21,
            },
        ],
    },
    {
        sourceEntity: "Cogmind",
        sourceWeapon: "Vortex Shotgun",
        weaponAccuracy: 50,
        projectilesTotal: 3,
        projectilesHit: 2,
        damageEntries: [
            {
                damagedEntity: "H-66 Slayer",
                damagedPart: "Core",
                damageDealt: 26,
            },
            {
                damagedEntity: "H-66 Slayer",
                damagedPart: "Gauss Rifle",
                damageDealt: 30,
            },
        ],
    },
];
