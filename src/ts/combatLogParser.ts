import { CombatLogEntry, CombatLogDamageEntry } from "./types/combatTypes";
import { getBotByName, getBotByShortName } from "./utilities/botUtilities";
import { parseIntOrDefault } from "./utilities/common";
import { isKnownItem } from "./utilities/itemUtilities";

type PartialParsedLine = {
    indent: number;
    remainingText: string;
    turn: number;
};

type ParserState = {
    currentEntry: CombatLogEntry;
    lines: PartialParsedLine[];
    lineIndex: number;

    entries: CombatLogEntry[];
};

// Match 1: Beginning of string, includes Bot and Part
// Match 2: Damage dealt
const damageRegex = /(.*) damaged: (\d*)/;

// Match 1: Beginning of string, includes Bot and Part
// Match 2: Critical type (optional)
const destroyedRegex = /(.*) destroyed(?: Crit: (.*))?/;

// Match 1: Turn number
// Match 2: Indentation
// Match 3: Remainder of line
const lineStartRegex = /(\d*)_( *)(.*)/;

// Match 1: Attacher if not Cogmind (optional)
// Match 2: Weapon
// Non-match: Individual weapon accuracy modifiers (optional)
// Match 3: Accuracy
// Match 4: Projectiles hit for multi-projectile weapons (optional)
// Match 5: Projectiles total for multi-projectile weapons (optional)
// Match 6: Hit/Miss for single projectile weapons
const weaponAttackRegex = /(?:([^:]*): )?(.*) \((?:[^=)]*=)?(\d+)%\) (?:(\d*)\/(\d*) )?(\w*)/;

// Parses a combat log string into an array of combat log entries
export function parseLog(logText: string): CombatLogEntry[] {
    const lines: PartialParsedLine[] = logText.split("\n").map((l) => {
        const result = lineStartRegex.exec(l)!;
        return {
            indent: result[2].length,
            remainingText: result[3],
            turn: parseIntOrDefault(result[1], 0),
        };
    });

    const state: ParserState = {
        lines: lines,
        lineIndex: 0,
        currentEntry: createEmptyLogEntry(),
        entries: [],
    };

    while (state.lineIndex < state.lines.length) {
        parseLogEntry(state);
    }

    return state.entries;
}

function createEmptyLogEntry(): CombatLogEntry {
    return {
        damageEntries: [],
        projectilesHit: 0,
        projectilesTotal: 0,
        sourceEntity: "Unknown",
        sourceWeapon: "Unknown",
        weaponAccuracy: 0,
        sneakAttack: false,
        turn: 0,
    };
}

function parseLogEntry(state: ParserState) {
    const line = state.lines[state.lineIndex];
    state.lineIndex += 1;

    if (line.indent === 1) {
        // TODO: handle machine explosions
        return;
    }

    state.currentEntry = createEmptyLogEntry();
    state.currentEntry.turn = line.turn;

    const weaponAttackResult = weaponAttackRegex.exec(line.remainingText);
    if (weaponAttackResult === null) {
        // TODO: what other things can trigger this
        console.log(`Skipped non-attack text ${line.remainingText}`);
        return;
    }

    if (weaponAttackResult[1] !== undefined) {
        // TODO: map to proper bot names
        state.currentEntry.sourceEntity = weaponAttackResult[1];
    } else {
        state.currentEntry.sourceEntity = "Cogmind";
    }

    state.currentEntry.sourceWeapon = weaponAttackResult[2];
    state.currentEntry.weaponAccuracy = parseIntOrDefault(weaponAttackResult[3], 0);

    if (weaponAttackResult[4] !== undefined && weaponAttackResult[5] !== undefined) {
        // Multi-projectile weapons state the number of projectiles
        // that hit like x/y here
        state.currentEntry.projectilesHit = parseIntOrDefault(weaponAttackResult[4], 0);
        state.currentEntry.projectilesTotal = parseIntOrDefault(weaponAttackResult[5], 0);
    } else {
        // Single-projectile weapons state Hit or Miss
        state.currentEntry.projectilesTotal = 1;
        state.currentEntry.projectilesHit = weaponAttackResult[6] === "Hit" ? 1 : 0;
    }

    while (state.lineIndex < state.lines.length && state.lines[state.lineIndex].indent > line.indent) {
        // Parse damage entries while at a greater indent level
        parseDamageEntry(state);
    }

    for (const damageEntry of state.currentEntry.damageEntries) {
        if (damageEntry.damagedPart === "core") {
            // For consistency with parts, capitalize "core"
            // even though it isn't capitalized in the log
            damageEntry.damagedPart = "Core";
        }
    }

    state.entries.push(state.currentEntry);
}

function parseDamageEntry(state: ParserState) {
    const line = state.lines[state.lineIndex];
    state.lineIndex += 1;

    const damageEntry: CombatLogDamageEntry = {
        damagedEntity: "",
        damagedPart: "",
        criticalHitType: undefined,
        damageDealt: undefined,
        damageOverflow: false,
        targetDestroyed: false,
    };

    const damageResult = damageRegex.exec(line.remainingText);
    if (damageResult !== null) {
        // Found damage but no destroyed part/bot
        const damage = parseIntOrDefault(damageResult[2], 0);
        const damagedTarget = damageResult[1];

        if (isKnownItem(damagedTarget) || damagedTarget === "core") {
            // If we're a known part then it means Cogmind's part was hit
            damageEntry.damagedEntity = "Cogmind";
            damageEntry.damagedPart = damagedTarget;
            damageEntry.damageDealt = damage;

            state.currentEntry.damageEntries.push(damageEntry);
        } else {
            // Non-Cogmind bot was hit, split name/weapon out
            const { botName, partName } = splitBotAndPart(damagedTarget);
            damageEntry.damagedEntity = botName;
            damageEntry.damagedPart = partName;
            damageEntry.damageDealt = damage;

            state.currentEntry.damageEntries.push(damageEntry);
        }

        return;
    }

    const destroyedResult = destroyedRegex.exec(line.remainingText);
    if (destroyedResult !== null) {
        // Found target destruction, but no damage number available
        const damagedTarget = destroyedResult[1];
        const critical = destroyedResult[2];

        const { botName, partName } = splitBotAndPart(damagedTarget);
        damageEntry.damagedEntity = botName;
        damageEntry.damagedPart = partName;
        damageEntry.criticalHitType = critical;
        damageEntry.targetDestroyed = true;

        state.currentEntry.damageEntries.push(damageEntry);
    }
}

// Attempts to split a bot and part from a combat log line.
// There's no explicit distinction between bot end and part start
// so the best we can do here is try to guess based on known bots/parts.
// Ideally every bot would be known by the parser, but sometimes there
// are custom naming schemes going on that might not be the most obvious
// to follow.
function splitBotAndPart(line: string): { botName: string; partName: string } {
    const split = line.split(" ");

    let bot = getBotByShortName(split[0]);
    if (bot !== undefined) {
        // Matched short name
        return { botName: bot.Name, partName: split.slice(1).join(" ") };
    }

    bot = getBotByName(split[0]);
    if (bot !== undefined) {
        // Matched full name
        return { botName: bot.Name, partName: split.slice(1).join(" ") };
    }

    // TODO: other styles
    return { botName: "Unknown", partName: "Unknown" };
}
