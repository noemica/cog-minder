import { CombatLogEntry } from "../types/combatLogTypes";

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

export const botMissedShotLog = `00001_ G-34: Sml. Laser (73%) Miss`;

export const botMissedShotEntries: CombatLogEntry[] = [
    {
        damageEntries: [],
        projectilesHit: 0,
        projectilesTotal: 1,
        sourceEntity: "G-34 Mercenary",
        sourceWeapon: "Sml. Laser",
        sneakAttack: false,
        turn: 1,
        weaponAccuracy: 73,
    },
];

export const cogmindHitBotPartLog = `00001_ Base Hit%: 60+12r+10m=82
00001_  Assault Rifle (82%) Hit
00001_   G-34 Aluminum Leg damaged: 12`;

export const cogmindHitBotPartEntries: CombatLogEntry[] = [
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

export const cogmindHitBotPartMultiLog = `00001_ Base Hit%: 60+6r+10m=73
00001_  Shotgun (100-5=94%) 2/2 Hit
00001_   A-02 Ion Engine damaged: 10 <x2>`;

export const cogmindHitBotPartMultiEntries: CombatLogEntry[] = [
    {
        damageEntries: [
            {
                damagedEntity: "A-02 Transporter",
                damagedPart: "Ion Engine",
                criticalHitType: undefined,
                damageDealt: 10,
                damageOverflow: false,
                targetDestroyed: false,
            },
            {
                damagedEntity: "A-02 Transporter",
                damagedPart: "Ion Engine",
                criticalHitType: undefined,
                damageDealt: 10,
                damageOverflow: false,
                targetDestroyed: false,
            },
        ],
        projectilesHit: 2,
        projectilesTotal: 2,
        sourceEntity: "Cogmind",
        sourceWeapon: "Shotgun",
        sneakAttack: false,
        turn: 1,
        weaponAccuracy: 94,
    },
];

export const cogmindHitBotPartSneakAttackLog = `00001_ Base Hit%: 70+10m=120
00001_  Katana sneak attack (100%) Hit
00001_   W-16 Hover Unit destroyed
00001_   W-16 Lgt. Ion Engine overflow dmg: 30`;

export const cogmindHitBotPartSneakAttackEntries: CombatLogEntry[] = [
    {
        damageEntries: [
            {
                damagedEntity: "W-16 Scout",
                damagedPart: "Hover Unit",
                criticalHitType: undefined,
                damageDealt: undefined,
                damageOverflow: false,
                targetDestroyed: true,
            },
            {
                damagedEntity: "W-16 Scout",
                damagedPart: "Lgt. Ion Engine",
                criticalHitType: undefined,
                damageDealt: 30,
                damageOverflow: true,
                targetDestroyed: false,
            },
        ],
        projectilesHit: 1,
        projectilesTotal: 1,
        sourceEntity: "Cogmind",
        sourceWeapon: "Katana",
        sneakAttack: true,
        turn: 1,
        weaponAccuracy: 100,
    },
];

export const cogmindHitBotPartBurnCriticalLog = `00001_ Base Hit%: 60+10m=70
00001_  Plasma Rifle (70%) Hit
00001_   B-48 core damaged: 21 (Crit: Burn)`;

export const cogmindHitBotPartBurnCriticalEntries: CombatLogEntry[] = [
    {
        damageEntries: [
            {
                damagedEntity: "B-48 Gladiator",
                damagedPart: "Core",
                criticalHitType: "Burn",
                damageDealt: 21,
                damageOverflow: false,
                targetDestroyed: false,
            },
        ],
        projectilesHit: 1,
        projectilesTotal: 1,
        sourceEntity: "Cogmind",
        sourceWeapon: "Plasma Rifle",
        sneakAttack: false,
        turn: 1,
        weaponAccuracy: 70,
    },
];

export const cogmindHitBotPartPhaseCriticalLog = `00001_ Base Hit%: 60+10s-5h+0ht+24u+10m=99
00001_  Zio. Alpha Cannon Mk. II (94%) Hit
00001_   A-15 Med. Treads damaged: 65 (Crit: Phase)
00001_   A-15 core damaged: 65
00001_    A-15 destroyed`;

export const cogmindHitBotPartPhaseCriticalEntries: CombatLogEntry[] = [
    {
        damageEntries: [
            {
                damagedEntity: "A-15 Conveyor",
                damagedPart: "Med. Treads",
                criticalHitType: "Phase",
                damageDealt: 65,
                damageOverflow: false,
                targetDestroyed: false,
            },
            {
                damagedEntity: "A-15 Conveyor",
                damagedPart: "Core",
                criticalHitType: undefined,
                damageDealt: 65,
                damageOverflow: false,
                targetDestroyed: true,
            },
        ],
        projectilesHit: 1,
        projectilesTotal: 1,
        sourceEntity: "Cogmind",
        sourceWeapon: "Zio. Alpha Cannon Mk. II",
        sneakAttack: false,
        turn: 1,
        weaponAccuracy: 94,
    },
];

export const botHitCogmindPartLog = `00001_  Y-64: KE Penetrator (72%) Hit
00001_   Imp. Treads damaged: 23`;

export const botHitCogmindPartEntries: CombatLogEntry[] = [
    {
        damageEntries: [
            {
                damagedEntity: "Cogmind",
                damagedPart: "Imp. Treads",
                criticalHitType: undefined,
                damageDealt: 23,
                damageOverflow: false,
                targetDestroyed: false,
            },
        ],
        projectilesHit: 1,
        projectilesTotal: 1,
        sourceEntity: "Y-64 Sentinel",
        sourceWeapon: "KE Penetrator",
        sneakAttack: false,
        turn: 1,
        weaponAccuracy: 72,
    },
];

export const botHitCogmindPartMultiLog = `00001_  Y-54: Gatling Laser (76%) 2/3 Hit
00001_   Arm. Treads damaged: 10
00001_   Core damaged: 10`;

export const botHitCogmindPartMultiEntries: CombatLogEntry[] = [
    {
        damageEntries: [
            {
                damagedEntity: "Cogmind",
                damagedPart: "Arm. Treads",
                criticalHitType: undefined,
                damageDealt: 10,
                damageOverflow: false,
                targetDestroyed: false,
            },
            {
                damagedEntity: "Cogmind",
                damagedPart: "Core",
                criticalHitType: undefined,
                damageDealt: 10,
                damageOverflow: false,
                targetDestroyed: false,
            },
        ],
        projectilesHit: 2,
        projectilesTotal: 3,
        sourceEntity: "Y-54 Guardian",
        sourceWeapon: "Gatling Laser",
        sneakAttack: false,
        turn: 1,
        weaponAccuracy: 76,
    },
];

export const unknownBotHitCogmindPartLog = `00001_  Omega Cannon damaged: 34`;

export const unknownBotHitCogmindPartEntries: CombatLogEntry[] = [
    {
        damageEntries: [
            {
                damagedEntity: "Cogmind",
                damagedPart: "Omega Cannon",
                criticalHitType: undefined,
                damageDealt: 34,
                damageOverflow: false,
                targetDestroyed: false,
            },
        ],
        projectilesHit: 1,
        projectilesTotal: 1,
        sourceEntity: "Unknown",
        sourceWeapon: "Unknown",
        sneakAttack: false,
        turn: 1,
        weaponAccuracy: undefined,
    },
];

export const cogmindHitBotCoreLog = `00001_ Base Hit%: 70=69
00001_  Axe (69%) Hit
00001_   Drone core damaged: 32`;

export const cogmindHitBotCoreEntries: CombatLogEntry[] = [
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

export const botHitCogmindCoreLog = `00001_ Y-64: Wave Gun (71%) Hit
00001_  Core damaged: 20`;

export const botHitCogmindCoreEntries: CombatLogEntry[] = [
    {
        damageEntries: [
            {
                damagedEntity: "Cogmind",
                damagedPart: "Core",
                criticalHitType: undefined,
                damageDealt: 20,
                damageOverflow: false,
                targetDestroyed: false,
            },
        ],
        projectilesHit: 1,
        projectilesTotal: 1,
        sourceEntity: "Y-64 Sentinel",
        sourceWeapon: "Wave Gun",
        sneakAttack: false,
        turn: 1,
        weaponAccuracy: 71,
    },
];

export const cogmindMissIntoBotPartLog = `00001_ Base Hit%: 63r+10m=73
00001_  Gauss Rifle (73%) Miss
00001_   R-06 Com. Wheel damaged: 17`;

export const cogmindMissIntoBotPartEntries: CombatLogEntry[] = [
    {
        damageEntries: [
            {
                damagedEntity: "R-06 Scavenger",
                damagedPart: "Com. Wheel",
                criticalHitType: undefined,
                damageDealt: 17,
                damageOverflow: false,
                targetDestroyed: false,
            },
        ],
        projectilesHit: 0,
        projectilesTotal: 1,
        sourceEntity: "Cogmind",
        sourceWeapon: "Gauss Rifle",
        sneakAttack: false,
        turn: 1,
        weaponAccuracy: 73,
    },
];

export const botMissIntoOtherBotPartLog = `00001_ G-67: Field Laser (63%) Miss
00001_  G-67 core damaged: 16`;

export const botMissIntoOtherBotPartEntries: CombatLogEntry[] = [
    {
        damageEntries: [
            {
                damagedEntity: "G-67 Veteran",
                damagedPart: "Core",
                criticalHitType: undefined,
                damageDealt: 16,
                damageOverflow: false,
                targetDestroyed: false,
            },
        ],
        projectilesHit: 0,
        projectilesTotal: 1,
        sourceEntity: "G-67 Veteran",
        sourceWeapon: "Field Laser",
        sneakAttack: false,
        turn: 1,
        weaponAccuracy: 63,
    },
];

export const cogmindDestroyedBotPartLog = `00001_ Base Hit%: 60+24u+10m-10mt=84
00001_  Omega Cannon (84+20=94%) Hit
00001_   L-61 Lgt. Antimatter Reactor destroyed`;

export const cogmindDestroyedBotPartEntries: CombatLogEntry[] = [
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

export const cogmindDestroyedBotPartCriticalLog = `00001_ Base Hit%: 60+10m=70
00001_  Adv. KE Penetrator (70%) Hit
00001_   Slug penetrates X-82 Rainmaker
00001_   X-82 Myomer Leg destroyed (Crit: Destroy)`;

export const cogmindDestroyedBotPartCriticalEntries: CombatLogEntry[] = [
    {
        damageEntries: [
            {
                damagedEntity: "X-82 Rainmaker",
                damagedPart: "Myomer Leg",
                criticalHitType: "Destroy",
                damageDealt: undefined,
                damageOverflow: false,
                targetDestroyed: true,
            },
        ],
        projectilesHit: 1,
        projectilesTotal: 1,
        sourceEntity: "Cogmind",
        sourceWeapon: "Adv. KE Penetrator",
        sneakAttack: false,
        turn: 1,
        weaponAccuracy: 70,
    },
];

export const cogmindBlastedBotPartCriticalLog = `00001_ Base Hit%: 60+0ht+30sg+10m-10mt=90
00001_  Assault Cannon (90%) Hit
00001_   L-41 Carbon-fiber Leg damaged: 24 (Crit: Blast)
00001_   L-41 Microactuators damaged: 24
00001_   L-41 Microactuators blasted off`;

export const cogmindBlastedBotPartCriticalEntries: CombatLogEntry[] = [
    {
        damageEntries: [
            {
                damagedEntity: "L-41 Fighter",
                damagedPart: "Carbon-fiber Leg",
                criticalHitType: "Blast",
                damageDealt: 24,
                damageOverflow: false,
                targetDestroyed: false,
            },
            {
                damagedEntity: "L-41 Fighter",
                damagedPart: "Microactuators",
                criticalHitType: undefined,
                damageDealt: 24,
                damageOverflow: false,
                targetDestroyed: false,
            },
        ],
        projectilesHit: 1,
        projectilesTotal: 1,
        sourceEntity: "Cogmind",
        sourceWeapon: "Assault Cannon",
        sneakAttack: false,
        turn: 1,
        weaponAccuracy: 90,
    },
];

export const cogmindSmashedBotPartCriticalLog = `00001_ Base Hit%: 70+10m=80
00001_  Thunder Hammer (80%) Hit
00001_   B-86 Adv. Cooling System destroyed (Crit: Smash)
00001_   B-86 Hvy. Reflective Plating overflow dmg: 84`;

export const cogmindSmashedBotPartCriticalEntries: CombatLogEntry[] = [
    {
        damageEntries: [
            {
                damagedEntity: "B-86 Titan",
                damagedPart: "Adv. Cooling System",
                criticalHitType: "Smash",
                damageDealt: undefined,
                damageOverflow: false,
                targetDestroyed: true,
            },
            {
                damagedEntity: "B-86 Titan",
                damagedPart: "Hvy. Reflective Plating",
                criticalHitType: undefined,
                damageDealt: 84,
                damageOverflow: true,
                targetDestroyed: false,
            },
        ],
        projectilesHit: 1,
        projectilesTotal: 1,
        sourceEntity: "Cogmind",
        sourceWeapon: "Thunder Hammer",
        sneakAttack: false,
        turn: 1,
        weaponAccuracy: 80,
    },
];

export const cogmindSunderedBotPartCriticalLog = `00001_ Base Hit%: 60+12r+10s+24ut+10m=116
00001_  Vortex Cannon (94%) Hit
00001_   Executioner Enh. Biometal Leg damaged: 70 (Crit: Sunder)
00001_   Executioner Enh. Biometal Leg knocked off`;

export const cogmindSunderedBotPartCriticalEntries: CombatLogEntry[] = [
    {
        damageEntries: [
            {
                damagedEntity: "Executioner",
                damagedPart: "Enh. Biometal Leg",
                criticalHitType: "Sunder",
                damageDealt: 70,
                damageOverflow: false,
                targetDestroyed: false,
            },
        ],
        projectilesHit: 1,
        projectilesTotal: 1,
        sourceEntity: "Cogmind",
        sourceWeapon: "Vortex Cannon",
        sneakAttack: false,
        turn: 1,
        weaponAccuracy: 94,
    },
];

export const cogmindSeveredBotPartCriticalLog = `00001_ Base Hit%: 70+10s+10m=90
00001_  Dual-blade Saw (90%) Hit
00001_   B-75 Imp. Cooling System damaged: 29 (Crit: Sever)
00001_   B-75 Imp. Cooling System severed`;

export const cogmindSeveredBotPartCriticalEntries: CombatLogEntry[] = [
    {
        damageEntries: [
            {
                damagedEntity: "B-75 Beast",
                damagedPart: "Imp. Cooling System",
                criticalHitType: "Sever",
                damageDealt: 29,
                damageOverflow: false,
                targetDestroyed: false,
            },
        ],
        projectilesHit: 1,
        projectilesTotal: 1,
        sourceEntity: "Cogmind",
        sourceWeapon: "Dual-blade Saw",
        sneakAttack: false,
        turn: 1,
        weaponAccuracy: 90,
    },
];

export const cogmindSeveredBotCoreCriticalLog = `00001_ Base Hit%: 70+10s+10m=90
00001_  Dual-blade Saw (90%) Hit
00001_   B-75 core damaged: 25 (Crit: Sever)
00001_   B-75 Rnf. Deuterium Engine damaged: 9
00001_   B-75 Rnf. Deuterium Engine severed`;

export const cogmindSeveredBotCoreCriticalEntries: CombatLogEntry[] = [
    {
        damageEntries: [
            {
                damagedEntity: "B-75 Beast",
                damagedPart: "Core",
                criticalHitType: "Sever",
                damageDealt: 25,
                damageOverflow: false,
                targetDestroyed: false,
            },
            {
                damagedEntity: "B-75 Beast",
                damagedPart: "Rnf. Deuterium Engine",
                criticalHitType: undefined,
                damageDealt: 9,
                damageOverflow: false,
                targetDestroyed: false,
            },
        ],
        projectilesHit: 1,
        projectilesTotal: 1,
        sourceEntity: "Cogmind",
        sourceWeapon: "Dual-blade Saw",
        sneakAttack: false,
        turn: 1,
        weaponAccuracy: 90,
    },
];

export const cogmindDetonatedBotCriticalLog = `00001_ Base Hit%: 60+10s+24u+10m=104
00001_  Vortex Rail (94%) Hit
00001_   Vortex penetrates B-90 Cyclops
00001_   B-90 Arm. Heavy Treads damaged: 44 (Crit: Detonate)
00001_   B-90 Rnf. Antimatter Reactor detonated
00001_   Vortex penetrates B-90 Cyclops
00001_   B-90 core damaged: 71`;

export const cogmindDetonatedBotCriticalEntries: CombatLogEntry[] = [
    {
        damageEntries: [
            {
                damagedEntity: "B-90 Cyclops",
                damagedPart: "Arm. Heavy Treads",
                criticalHitType: "Detonate",
                damageDealt: 44,
                damageOverflow: false,
                targetDestroyed: false,
            },
            {
                damagedEntity: "B-90 Cyclops",
                damagedPart: "Rnf. Antimatter Reactor",
                criticalHitType: undefined,
                damageDealt: undefined,
                damageOverflow: false,
                targetDestroyed: true,
            },
            {
                damagedEntity: "B-90 Cyclops",
                damagedPart: "Core",
                criticalHitType: undefined,
                damageDealt: 71,
                damageOverflow: false,
                targetDestroyed: false,
            },
        ],
        projectilesHit: 1,
        projectilesTotal: 1,
        sourceEntity: "Cogmind",
        sourceWeapon: "Vortex Rail",
        sneakAttack: false,
        turn: 1,
        weaponAccuracy: 94,
    },
];

export const botDestroyedCogmindPartLog = `00001_ S-27: Autogun (76%) Hit
00001_  Lgt. Armor Plating destroyed`;

export const botDestroyedCogmindPartEntries: CombatLogEntry[] = [
    {
        damageEntries: [
            {
                damagedEntity: "Cogmind",
                damagedPart: "Lgt. Armor Plating",
                criticalHitType: undefined,
                damageDealt: undefined,
                damageOverflow: false,
                targetDestroyed: true,
            },
        ],
        projectilesHit: 1,
        projectilesTotal: 1,
        sourceEntity: "S-27 Virus",
        sourceWeapon: "Autogun",
        sneakAttack: false,
        turn: 1,
        weaponAccuracy: 76,
    },
];

export const unknownBotDestroyedCogmindPartLog = `00001_ Exp. Core Analyzer destroyed`;

export const unknownBotDestroyedCogmindPartEntries: CombatLogEntry[] = [
    {
        damageEntries: [
            {
                damagedEntity: "Cogmind",
                damagedPart: "Exp. Core Analyzer",
                criticalHitType: undefined,
                damageDealt: undefined,
                damageOverflow: false,
                targetDestroyed: true,
            },
        ],
        projectilesHit: 1,
        projectilesTotal: 1,
        sourceEntity: "Unknown",
        sourceWeapon: "Unknown",
        sneakAttack: false,
        turn: 1,
        weaponAccuracy: undefined,
    },
];

export const cogmindDestroyedBotLog = `00001_ Base Hit%: 60+12r-10s+1ht+10m-10ft=62
00001_  Hvy. Assault Cannon (62%) Hit
00001_   S-10 core damaged: 47
00001_    S-10 destroyed`;

export const cogmindDestroyedBotEntries: CombatLogEntry[] = [
    {
        damageEntries: [
            {
                damagedEntity: "S-10 Pest",
                damagedPart: "Core",
                criticalHitType: undefined,
                damageDealt: 47,
                damageOverflow: false,
                targetDestroyed: true,
            },
        ],
        projectilesHit: 1,
        projectilesTotal: 1,
        sourceEntity: "Cogmind",
        sourceWeapon: "Hvy. Assault Cannon",
        sneakAttack: false,
        turn: 1,
        weaponAccuracy: 62,
    },
];

export const cogmindDestroyedBotsLauncherLog = `00001_ Base Hit%: 60-10s+24u-10m-13mt-10ft=40
00001_  Hvy. Rocket Launcher (40%) Hit
00001_   S-27 VTOL Module destroyed
00001_   S-27 core overflow dmg: 3
00001_   S-27 core damaged: 28
00001_    S-27 destroyed
00001_   S-27 core damaged: 78
00001_    S-27 destroyed
00001_   S-27 Autogun damaged: 75
00001_   S-27 core damaged: 25
00001_    S-27 destroyed`;

export const cogmindDestroyedBotsLauncherEntries: CombatLogEntry[] = [
    {
        damageEntries: [
            {
                damagedEntity: "S-27 Virus",
                damagedPart: "VTOL Module",
                criticalHitType: undefined,
                damageDealt: undefined,
                damageOverflow: false,
                targetDestroyed: true,
            },
            {
                damagedEntity: "S-27 Virus",
                damagedPart: "Core",
                criticalHitType: undefined,
                damageDealt: 3,
                damageOverflow: true,
                targetDestroyed: false,
            },
            {
                damagedEntity: "S-27 Virus",
                damagedPart: "Core",
                criticalHitType: undefined,
                damageDealt: 28,
                damageOverflow: false,
                targetDestroyed: true,
            },
            {
                damagedEntity: "S-27 Virus",
                damagedPart: "Core",
                criticalHitType: undefined,
                damageDealt: 78,
                damageOverflow: false,
                targetDestroyed: true,
            },
            {
                damagedEntity: "S-27 Virus",
                damagedPart: "Autogun",
                criticalHitType: undefined,
                damageDealt: 75,
                damageOverflow: false,
                targetDestroyed: false,
            },
            {
                damagedEntity: "S-27 Virus",
                damagedPart: "Core",
                criticalHitType: undefined,
                damageDealt: 25,
                damageOverflow: false,
                targetDestroyed: true,
            },
        ],
        projectilesHit: 1,
        projectilesTotal: 1,
        sourceEntity: "Cogmind",
        sourceWeapon: "Hvy. Rocket Launcher",
        sneakAttack: false,
        turn: 1,
        weaponAccuracy: 40,
    },
];

export const cogmindDestroyedBotCriticalLog = `00001_ Base Hit%: 60+12r+10s+10m=92
00001_  Hyp. Railgun (92%) Hit
00001_   HV Slug penetrates Y-72 Warden
00001_    Y-72 destroyed (Crit: Destroy)`;

export const cogmindDestroyedBotCriticalEntries: CombatLogEntry[] = [
    {
        damageEntries: [
            {
                damagedEntity: "Y-72 Warden",
                damagedPart: "Core",
                criticalHitType: "Destroy",
                damageDealt: undefined,
                damageOverflow: false,
                targetDestroyed: true,
            },
        ],
        projectilesHit: 1,
        projectilesTotal: 1,
        sourceEntity: "Cogmind",
        sourceWeapon: "Hyp. Railgun",
        sneakAttack: false,
        turn: 1,
        weaponAccuracy: 92,
    },
];

export const cogmindDestroyedBotMeltdownCriticalLog = `00001_ Base Hit%: 60+9r-6h+1ht+30sg+24u+10m-5ft=123
00001_  Disintegrator (123+10=94%) Hit
00001_   Beam penetrates P-80 Master
00001_   P-80 core damaged: 6 (Crit: Meltdown)
00001_    P-80 melted`;

export const cogmindDestroyedBotMeltdownCriticalEntries: CombatLogEntry[] = [
    {
        damageEntries: [
            {
                damagedEntity: "P-80 Master",
                damagedPart: "Core",
                criticalHitType: "Meltdown",
                damageDealt: 6,
                damageOverflow: false,
                targetDestroyed: true,
            },
        ],
        projectilesHit: 1,
        projectilesTotal: 1,
        sourceEntity: "Cogmind",
        sourceWeapon: "Disintegrator",
        sneakAttack: false,
        turn: 1,
        weaponAccuracy: 94,
    },
];

export const cogmindDestroyedBotMeltdownPartCriticalLog = `00001_ Base Hit%: 60+9r-6h+1ht+30sg+24u+10m-5ft=123
00001_  Disintegrator (123+10=94%) Hit
00001_   Beam penetrates P-80 Master
00001_   P-80 Gamma Rifle damaged: 6 (Crit: Meltdown)
00001_    P-80 melted`;

export const cogmindDestroyedBotMeltdownPartCriticalEntries: CombatLogEntry[] = [
    {
        damageEntries: [
            {
                damagedEntity: "P-80 Master",
                damagedPart: "Gamma Rifle",
                criticalHitType: "Meltdown",
                damageDealt: 6,
                damageOverflow: false,
                targetDestroyed: false,
            },
            {
                damagedEntity: "P-80 Master",
                damagedPart: "Core",
                criticalHitType: undefined,
                damageDealt: undefined,
                damageOverflow: false,
                targetDestroyed: true,
            },
        ],
        projectilesHit: 1,
        projectilesTotal: 1,
        sourceEntity: "Cogmind",
        sourceWeapon: "Disintegrator",
        sneakAttack: false,
        turn: 1,
        weaponAccuracy: 94,
    },
];

export const cogmindSelfLauncherLog = `00001_ Base Hit%: 60+9r+10im=79
00001_  Grenade Launcher (79+15=94%) Hit
00001_   Core damaged: 11
00001_   Grenade Launcher damaged: 11 <x2>`;

export const cogmindSelfLauncherEntries: CombatLogEntry[] = [
    {
        damageEntries: [
            {
                damagedEntity: "Cogmind",
                damagedPart: "Core",
                criticalHitType: undefined,
                damageDealt: 11,
                damageOverflow: false,
                targetDestroyed: false,
            },
            {
                damagedEntity: "Cogmind",
                damagedPart: "Grenade Launcher",
                criticalHitType: undefined,
                damageDealt: 11,
                damageOverflow: false,
                targetDestroyed: false,
            },
            {
                damagedEntity: "Cogmind",
                damagedPart: "Grenade Launcher",
                criticalHitType: undefined,
                damageDealt: 11,
                damageOverflow: false,
                targetDestroyed: false,
            },
        ],
        projectilesHit: 1,
        projectilesTotal: 1,
        sourceEntity: "Cogmind",
        sourceWeapon: "Grenade Launcher",
        sneakAttack: false,
        turn: 1,
        weaponAccuracy: 94,
    },
];

export const machineExplosionLog = `00001_ Nuclear Reactor explodes
00001_  U-05 destroyed
00001_  W-16 Hover Unit damaged: 14
00001_    W-16 destroyed
00001_  Ion Engine damaged: 9 <x2>
00001_  Lgt. Cannon damaged: 9`;

export const machineExplosionEntries: CombatLogEntry[] = [
    {
        damageEntries: [
            {
                damagedEntity: "U-05 Engineer",
                damagedPart: "Core",
                criticalHitType: undefined,
                damageDealt: undefined,
                damageOverflow: false,
                targetDestroyed: true,
            },
            {
                damagedEntity: "W-16 Scout",
                damagedPart: "Hover Unit",
                criticalHitType: undefined,
                damageDealt: 14,
                damageOverflow: false,
                targetDestroyed: false,
            },
            {
                damagedEntity: "W-16 Scout",
                damagedPart: "Core",
                criticalHitType: undefined,
                damageDealt: undefined,
                damageOverflow: false,
                targetDestroyed: true,
            },
            {
                damagedEntity: "Cogmind",
                damagedPart: "Ion Engine",
                criticalHitType: undefined,
                damageDealt: 9,
                damageOverflow: false,
                targetDestroyed: false,
            },
            {
                damagedEntity: "Cogmind",
                damagedPart: "Ion Engine",
                criticalHitType: undefined,
                damageDealt: 9,
                damageOverflow: false,
                targetDestroyed: false,
            },
            {
                damagedEntity: "Cogmind",
                damagedPart: "Lgt. Cannon",
                criticalHitType: undefined,
                damageDealt: 9,
                damageOverflow: false,
                targetDestroyed: false,
            },
        ],
        projectilesHit: 0,
        projectilesTotal: 0,
        sourceEntity: "Nuclear Reactor",
        sourceWeapon: "Explosion",
        sneakAttack: false,
        turn: 1,
        weaponAccuracy: undefined,
    },
];

export const cogmindHitBotPrototypePartLog = `00001_ Base Hit%: 60+15r-4h+1ht+24u+10m-5ft=100
00001_  Enh. Nova Cannon (94%) Hit
00001_   Combat Programmer Prototype Device damaged: 52`;

export const cogmindHitBotPrototypePartEntries: CombatLogEntry[] = [
    {
        damageEntries: [
            {
                damagedEntity: "Combat Programmer",
                damagedPart: "Prototype Device",
                criticalHitType: undefined,
                damageDealt: 52,
                damageOverflow: false,
                targetDestroyed: false,
            },
        ],
        projectilesHit: 1,
        projectilesTotal: 1,
        sourceEntity: "Cogmind",
        sourceWeapon: "Enh. Nova Cannon",
        sneakAttack: false,
        turn: 1,
        weaponAccuracy: 94,
    },
];

export const cogmindHitBotPartUnknownWeaponLog = `00001_ Base Hit%: 60+15r-4h+1ht+24u+10m-5ft=100
00001_  Wheel Launcher (94%) Hit
00001_   P-70 core damaged: 100
00001_    P-70 destroyed`;

export const cogmindHitBotPartUnknownWeaponEntries: CombatLogEntry[] = [
    {
        damageEntries: [
            {
                damagedEntity: "P-70 Sage",
                damagedPart: "Core",
                criticalHitType: undefined,
                damageDealt: 100,
                damageOverflow: false,
                targetDestroyed: true,
            },
        ],
        projectilesHit: 1,
        projectilesTotal: 1,
        sourceEntity: "Cogmind",
        sourceWeapon: "Wheel Launcher",
        sneakAttack: false,
        turn: 1,
        weaponAccuracy: 94,
    },
];

export const cogmindHitUnknownBotPartLog = `00001_ Base Hit%: 60+3r+24u+10m=97
00001_  Enh. Coil Gun (94%) Hit
00001_   M5-TRY Carbon-fiber Leg damaged: 28`;

export const cogmindHitUnknownBotPartEntries: CombatLogEntry[] = [
    {
        damageEntries: [
            {
                damagedEntity: "M5-TRY",
                damagedPart: "Carbon-fiber Leg",
                criticalHitType: undefined,
                damageDealt: 28,
                damageOverflow: false,
                targetDestroyed: false,
            },
        ],
        projectilesHit: 1,
        projectilesTotal: 1,
        sourceEntity: "Cogmind",
        sourceWeapon: "Enh. Coil Gun",
        sneakAttack: false,
        turn: 1,
        weaponAccuracy: 94,
    },
];

export const cogmindHitUnknownBotCoreLog = `00001_ Base Hit%: 60+3r+24u+10m=97
00001_  Enh. Coil Gun (94%) Hit
00001_   M5-TRY core damaged: 30`;

export const cogmindHitUnknownBotCoreEntries: CombatLogEntry[] = [
    {
        damageEntries: [
            {
                damagedEntity: "M5-TRY",
                damagedPart: "Core",
                criticalHitType: undefined,
                damageDealt: 30,
                damageOverflow: false,
                targetDestroyed: false,
            },
        ],
        projectilesHit: 1,
        projectilesTotal: 1,
        sourceEntity: "Cogmind",
        sourceWeapon: "Enh. Coil Gun",
        sneakAttack: false,
        turn: 1,
        weaponAccuracy: 94,
    },
];

export const cogmindHitUnknownBotUnknownPartLog = `00001_ Base Hit%: 60+3r+24u+10m=97
00001_  Enh. Coil Gun (94%) Hit
00001_   M5-TRY M5-TRY's Secret damaged: 29`;

export const cogmindHitUnknownBotUnknownPartEntries: CombatLogEntry[] = [
    {
        damageEntries: [
            {
                damagedEntity: "Unknown",
                damagedPart: "Unknown",
                criticalHitType: undefined,
                damageDealt: 29,
                damageOverflow: false,
                targetDestroyed: false,
            },
        ],
        projectilesHit: 1,
        projectilesTotal: 1,
        sourceEntity: "Cogmind",
        sourceWeapon: "Enh. Coil Gun",
        sneakAttack: false,
        turn: 1,
        weaponAccuracy: 94,
    },
];

export const alliedBotHitBotPartLog = `00001_  Enforcer 10a: Hvy. Laser (76%) Hit
00001_   G-73 Hvy. Laser damaged: 18`;

export const alliedBotHitBotPartEntries: CombatLogEntry[] = [
    {
        damageEntries: [
            {
                damagedEntity: "G-73 Enforcer",
                damagedPart: "Hvy. Laser",
                criticalHitType: undefined,
                damageDealt: 18,
                damageOverflow: false,
                targetDestroyed: false,
            },
        ],
        projectilesHit: 1,
        projectilesTotal: 1,
        sourceEntity: "G-73 Enforcer",
        sourceWeapon: "Hvy. Laser",
        sneakAttack: false,
        turn: 1,
        weaponAccuracy: 76,
    },
];

export const hostileBotHitAlliedBotPartLog = `00001_  S-43: Hvy. Machine Gun (75%) Hit
00001_   Electro 10a Biometal Leg damaged: 21`;

export const hostileBotHitAlliedBotPartEntries: CombatLogEntry[] = [
    {
        damageEntries: [
            {
                damagedEntity: "X-87 Electro",
                damagedPart: "Biometal Leg",
                criticalHitType: undefined,
                damageDealt: 21,
                damageOverflow: false,
                targetDestroyed: false,
            },
        ],
        projectilesHit: 1,
        projectilesTotal: 1,
        sourceEntity: "S-43 Plague",
        sourceWeapon: "Hvy. Machine Gun",
        sneakAttack: false,
        turn: 1,
        weaponAccuracy: 75,
    },
];

export const derelictHitBotPartLog = `00001_  W4-GNK(p): Hvy. Riot Gun (71%) 2/2 Hit
00001_   Y-72 core damaged: 12 <x2>`;

export const derelictHitBotPartEntries: CombatLogEntry[] = [
    {
        damageEntries: [
            {
                damagedEntity: "Y-72 Warden",
                damagedPart: "Core",
                criticalHitType: undefined,
                damageDealt: 12,
                damageOverflow: false,
                targetDestroyed: false,
            },
            {
                damagedEntity: "Y-72 Warden",
                damagedPart: "Core",
                criticalHitType: undefined,
                damageDealt: 12,
                damageOverflow: false,
                targetDestroyed: false,
            },
        ],
        projectilesHit: 2,
        projectilesTotal: 2,
        sourceEntity: "Wizard (5)",
        sourceWeapon: "Hvy. Riot Gun",
        sneakAttack: false,
        turn: 1,
        weaponAccuracy: 71,
    },
];

export const assembledHitCogmindPartLog = `00001_  as-55356: Asb. F-torch (79%) Hit
00001_   Core damaged: 11`;

export const assembledHitCogmindPartEntries: CombatLogEntry[] = [
    {
        damageEntries: [
            {
                damagedEntity: "Cogmind",
                damagedPart: "Core",
                criticalHitType: undefined,
                damageDealt: 11,
                damageOverflow: false,
                targetDestroyed: false,
            },
        ],
        projectilesHit: 1,
        projectilesTotal: 1,
        sourceEntity: "Assembled (4)",
        sourceWeapon: "Asb. F-torch",
        sneakAttack: false,
        turn: 1,
        weaponAccuracy: 79,
    },
];

export const multiLineLog = `00001_ Base Hit%: 70=69
00001_  Sigix Broadsword (69%) Hit
00001_   Enhanced Grunt Lyr. Medium Armor Plating damaged: 155 (Crit:
  Sever)
`;

export const multiLineEntries: CombatLogEntry[] = [
    {
        damageEntries: [
            {
                damagedEntity: "Enhanced Grunt",
                damagedPart: "Lyr. Medium Armor Plating",
                criticalHitType: "Sever",
                damageDealt: 155,
                damageOverflow: false,
                targetDestroyed: false,
            },
        ],
        projectilesHit: 1,
        projectilesTotal: 1,
        sourceEntity: "Cogmind",
        sourceWeapon: "Sigix Broadsword",
        sneakAttack: false,
        turn: 1,
        weaponAccuracy: 69,
    },
];

export const invalidDataLog = `some test invalid data
0123456789
none of this should crash
!@#$%^&*()`;

export const invalidDataInValidDataLog = `00001_ Base Hit%: 60-10s-10m-13mt-10ft=17
0123456789
none of this should crash or affect the output
!@#$%^&*()
00001_  should be an unrecognized line
00001_  Lgt. Assault Rifle (17%) Miss`;

export const invalidDataInValidDataEntries: CombatLogEntry[] = [
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
