import { CombatLogEntry } from "../types/combatTypes";

export const cogmindMissedShotLog = `00001_ Base Hit%: 60-10s-10m-13mt-10ft=17
00001_  Lgt. Assault Rifle (17%) Miss`;

export const cogmindMissedShotEntries: CombatLogEntry[] = [
    {
        damageEntries: [],
        projectilesHit: 0,
        projectilesTotal: 1,
        sourceEntity: "Cogmind",
        sourceWeapon: "Lgt. Assault Rifle",
        sneakAttack: false,
        turn: 1,
        weaponAccuracy: 17,
    },
];

export const cogmindHitPartLog = `00001_ Base Hit%: 60+12r+10m=82
00001_  Assault Rifle (82%) Hit
00001_   G-34 Aluminum Leg damaged: 12`;

export const cogmindHitPartEntries: CombatLogEntry[] = [
    {
        damageEntries: [
            {
                damagedEntity: "G-34 Mercenary",
                damagedPart: "Aluminum Leg",
                criticalHitType: undefined,
                damageDealt: 12,
                damageOverflow: false,
                targetDestroyed: false,
            },
        ],
        projectilesHit: 1,
        projectilesTotal: 1,
        sourceEntity: "Cogmind",
        sourceWeapon: "Assault Rifle",
        sneakAttack: false,
        turn: 1,
        weaponAccuracy: 82,
    },
];

export const cogmindHitCoreLog = `00001_ Base Hit%: 70=69
00001_  Axe (69%) Hit
00001_   Drone core damaged: 32`;

export const cogmindHitCoreEntries: CombatLogEntry[] = [
    {
        damageEntries: [
            {
                damagedEntity: "Drone",
                damagedPart: "Core",
                criticalHitType: undefined,
                damageDealt: 32,
                damageOverflow: false,
                targetDestroyed: false,
            },
        ],
        projectilesHit: 1,
        projectilesTotal: 1,
        sourceEntity: "Cogmind",
        sourceWeapon: "Axe",
        sneakAttack: false,
        turn: 1,
        weaponAccuracy: 69,
    },
];

export const cogmindDestroyedPartLog = `00001_ Base Hit%: 60+24u+10m-10mt=84
00001_  Omega Cannon (84+20=94%) Hit
00001_   L-61 Lgt. Antimatter Reactor destroyed`;

export const cogmindDestroyedPartEntries: CombatLogEntry[] = [
    {
        damageEntries: [
            {
                damagedEntity: "L-61 Swordsman",
                damagedPart: "Lgt. Antimatter Reactor",
                criticalHitType: undefined,
                damageDealt: undefined,
                damageOverflow: false,
                targetDestroyed: true,
            },
        ],
        projectilesHit: 1,
        projectilesTotal: 1,
        sourceEntity: "Cogmind",
        sourceWeapon: "Omega Cannon",
        sneakAttack: false,
        turn: 1,
        weaponAccuracy: 94,
    },
];
