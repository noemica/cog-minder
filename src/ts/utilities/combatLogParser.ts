import { JsonBot } from "../types/botTypes";
import { CombatLogDamageEntry, CombatLogEntry } from "../types/combatLogTypes";
import { getBotByAllyName, getBotByName, getBotByShortName } from "./botUtilities";
import { parseIntOrDefault } from "./common";
import { getItemByName, isKnownItem } from "./itemUtilities";

// Match 1: First part of bot name
const alliedBotNameRegex = /^(\w*) .*$/;

// Don't match anything, currently not using for anything except to detect known
// lines that we ignore
const baseHitRegex = /^Base Hit%: .*$/;

// Non-match 1: Bot doing the hacking
// Non-match 2: Hack status
// Non-match 3: Target bot and end result
const botHackRegex = /^(?:.*) (?:hacks|fails to hack) (?:.*)$/;

// Non-match 1: Bot repelling hacking attempt
const botHackRepelledRegex = /^(?:.*) repels hacking attempt$/;

// Match 1: Bot and part
// Non-match: Type of critical
const criticalPartRemovedRegex = /^(.*) (?:blasted off|knocked off|severed)$/;

// Non-match: bot that corrupted
const botCorruptedRegex = /^(?:.*) system corrupted$/;

// Match 1: Bot destroyed
const botDestroyedRegex = /^(.*) destroyed$/;

// Match 1: Bot that melted
const botMeltedRegex = /^(.*) melted|(.*) instant meltdown$/;

// Non-match: Amount of heat transferred
const cogmindMeltdownRegex = /^Suffered critical hit: Meltdown \(\+(?:.*)\)$/;

// Match 1: Target, includes Bot and Part
// Match 2: Regular or overflow damage
// Match 3: Damage dealt
// Match 4: Critical type (optional)
const damageRegex = /^(.*) (overflow dmg|damaged): (\d*)(?: \(Crit: (.*)\))?$/;

// Non-match 1: Target
const damageInsufficientToPenetrateRegex = /^Damage insufficient to overcome (?:.*)$/;

// Non-match 1: Part doing deflecting
const deflectedRegex = /^Deflected by (?:.*)$/

// Non-match 1: Target disabled, includes Bot and Part
const disabledRegex = /^(?:.*) disabled \(Disruption\)$/;

// Match 1: Target, includes Bot and Part
const engineDetonateRegex = /^(.*) detonated$/;

// Non-match 1: Part doing intercepting
const interceptedRegex = /^Intercepted by (?:.*)$/;

// Non-match 1: Gunslinging target
const gunslingingRegex = /^Gunslinging -> (?:.*)$/;

// Match 1: Turn number
// Match 2: Indentation
// Match 3: Remainder of line
const lineStartRegex = /^(\d*)_( *)(.*?)(?: <x(\d*|\*)>)?$/;

// Non-match 1: Name of disabled machine
// Non-match 2: Way machine was disabled
const machineDisabledRegex = /^(?:.*) (?:breached|damaged|disabled)$/;

// Non-match: Name of the exploding machine
const machineExplosionRegex = /^(.*) explodes$/;

// Non-match 1: Non-Cogmind bot being penetrated by projectile
// Non-match 2: Cogmind being penetrated by projectile
const penetrationRegex = /^(?:.* penetrates .*)|(?:Penetrated by .*)$/;

// Non-match 1: Bot and shielding part preventing disruption
const preventedDisruptionRegex = /^(?:.*) prevented disruption$/;

// Non-match 1: Bot and shielding part preventing critical
const shieldingPreventedCritRegex = /^(?:.*) prevented critical effect$/;

// Match 1: Target, includes Bot and Part
// Match 2: Critical type (optional)
const targetDestroyedRegex = /^(.*) destroyed(?: \(Crit: (.*)\))?$/;

// Non-match: Name of trap that short circuited
// This happens from AOE EM traps
const trapShortCircuited = /^(?:.*) short circuited$/;

// Non-match 1: Type of trap triggered
// Non-match 2: Name of bot that triggered trap (optional)
const trapTriggeredRegex = /^(?:.*) triggered(?: by (?:.*))?$/;

// Non-match: ??? unknown damage source
const questionRegex = /^\?\?\?$/;

// Non-match 1: Part doing redirecting
const redirectedRegex = /^Redirected by (?:.*)$/

// Match 1: Unknown / Prototype / Alien
// Match 2: Part type
const unknownPartRegex =
    /(Unknown|Prototype|Alien) (Engine|Power Core|Reactor|Flight Unit|Hover Unit|Leg|Treads|Wheel|Armor|Device|Hackware|Storage|Processor|Ballistic Cannon|Ballistic Gun|Energy Cannon|Energy Gun|Impact Weapon|Launcher|Piercing Weapon|Slashing Weapon|Special Ranged Weapon|Special Weapon)/;

// Match 1: Attacker if not Cogmind (optional)
// Match 2: Weapon
// Non-match: Follow-up (optional)
// Match 3: Sneak attack (optional)
// Non-match: Individual weapon accuracy modifiers (optional)
// Match 4: Accuracy
// Match 5: Projectiles hit for multi-projectile weapons (optional)
// Match 6: Projectiles total for multi-projectile weapons (optional)
// Match 7: Hit/Miss for single projectile weapons
const weaponAttackRegex =
    /^(?:([^:]*): )?(.*?) (?:follow-up )?(sneak attack )?\((?:[^=)]*=)?(\d+)%\) (?:(\d*)\/(\d*) )?(\w*)$/;

// Match 1: The derelict class
const derelictRegex = /^\w{2}-\w{3}\((\w)\)$/;

// For any multi-tier derelict there is no way to know which specific kind is
// being referenced. All below default to the lowest tier of bot
const derelictClasses: Map<string, string> = new Map([
    ["u", "Artisan"],
    ["T", "Borebot"],
    ["Y", "Bouncer"],
    ["l", "Butcher (5)"],
    // Can't tell Commanders, Sappers, and Thugs apart, but Thugs are most common
    // ["g", "Commander"],
    // ["g", "Sapper"],
    ["O", "Cobbler"],
    ["k", "Decomposer"],
    ["q", "Demented"],
    ["D", "Dragon"],
    ["E", "Elite (4)"],
    ["i", "Fireman (5)"],
    ["F", "Furnace"],
    ["h", "Guerrilla (5)"],
    // ["h", "Ranger"],
    // Can't tell Guerrillas and Rangers apart
    ["H", "Hydra"],
    ["x", "Infiltrator (6)"],
    // Can't tell Infiltrators and Explorers apart
    //["x", "Explorer"],
    ["K", "Knight"],
    ["B", "Marauder (6)"],
    ["d", "Martyr (5)"],
    ["M", "Mutant (5)"],
    ["r", "Packrat"],
    ["t", "Parasite"],
    // Can't tell Bolteaters and Packrats apart
    // ["r", "Bolteater"],
    ["S", "Samaritan"],
    ["b", "Savage (5)"],
    ["j", "Scrapper (3)"],
    ["R", "Subdweller"],
    ["m", "Surgeon (4)"],
    ["f", "Thief"],
    ["g", "Thug (5)"],
    ["c", "Tinkerer"],
    // Can't tell Tinkerers and Scientists apart
    ["c", "Scientist"],
    ["L", "Troll"],
    ["s", "Wasp (5)"],
    ["p", "Wizard (5)"],
    // Can't tell Gurus and Wizards apart
    //["p", "Guru"],
    ["A", "Z-Courier"],
    ["Z", "Z-Heavy (5)"],
    ["o", "Z-Technician"],
    // Can't tell Zionites and Z-Lights apart
    // ["z", "Z-Light (5)"],
    ["z", "Zionite"],
]);

// Match 1: The Protovariant class
const protovariantRegex = /^P(\w)-\w{10}$/;

const specialBotRegexes: { name: string; regex: RegExp }[] = [
    // Note: Can't tell Assembled 4 vs 7 apart but 4 is more common so use that
    { name: "Assembled (4)", regex: /^as-\d+$/ },
    { name: "Assembler", regex: /^AS-\d+$/ },
    { name: "Enhanced Q-Series", regex: /^EQ-\d{3}$/ },
    { name: "Golem", regex: /^AG-\d+$/ },
    { name: "Lugger", regex: /^Lugger \d{3}$/ },
    { name: "Q-Series", regex: /^Q\d{3}-\w$/ },
    { name: "Scrapoid (3)", regex: /^\w{5}-D/ }, //0[Depth][Map]##-D
    { name: "Scraphulk (6)", regex: /^\w{5}-K/ }, // 0[Depth][Map]##-K
    { name: "V-Series", regex: /^V\d{3}-\w$/ },
    { name: "Warlord (Command)", regex: /^ZY-L1N$/ },
    { name: "Z-Experimental (8)", regex: /^Z-Ex$/ },
    { name: "Z-Imprinter", regex: /^Z-Im$/ },
];

type PartialParsedLine = {
    indent: number;
    remainingText: string;
    turn: number;
};

// Class holding current combat log parser state
class ParserState {
    private currentEntry: CombatLogEntry;
    private lines: PartialParsedLine[];
    private lineIndex: number;
    public entries: CombatLogEntry[];

    constructor(lines: PartialParsedLine[]) {
        this.currentEntry = createEmptyLogEntry();
        this.lines = lines;
        this.lineIndex = 0;
        this.entries = [];
    }

    public parseAllLogEntries() {
        let line: PartialParsedLine | null;
        while ((line = this.getNextLine()) && line !== null) {
            this.parseLogEntry(line);
        }
    }

    private getNextLine(): PartialParsedLine | null {
        const line = this.peekNextLine();
        if (line !== null) {
            this.lineIndex += 1;
        }

        return line;
    }

    // Tries to parse a damage entry out of the line
    private parseDamageEntry(line: PartialParsedLine): boolean {
        const damageResult = damageRegex.exec(line.remainingText);
        if (damageResult === null) {
            return false;
        }

        // Found damage but no destroyed part/bot
        const damagedTarget = damageResult[1];
        const damage = parseIntOrDefault(damageResult[3], 0);
        const overflow = damageResult[2] === "overflow dmg";
        const critical = damageResult[4] ?? undefined;
        const damageEntry = createEmptyDamageLogEntry();

        if (ignoreTarget(damagedTarget)) {
            // Ignore this damage entry
            return true;
        }

        if (isKnownItem(damagedTarget) || damagedTarget.toLowerCase() === "core") {
            // If we're a known part then it means Cogmind was hit
            damageEntry.damagedEntity = "Cogmind";
            damageEntry.damagedPart = damagedTarget.toLowerCase() === "core" ? "Core" : damagedTarget;
        } else if (damagedTarget.endsWith("+") && isKnownItem(damagedTarget.slice(0, damagedTarget.length - 1))) {
            // Known studied part and Cogmind was hit
            // Remove the + from the part name
            damageEntry.damagedEntity = "Cogmind";
            damageEntry.damagedPart = damagedTarget.slice(0, damagedTarget.length - 1);
        } else {
            // Non-Cogmind bot was hit, split name/weapon out
            const { botName, partName } = splitBotAndPart(damagedTarget);
            damageEntry.damagedEntity = botName;
            damageEntry.damagedPart = partName;
        }

        damageEntry.damageOverflow = overflow;
        damageEntry.damageDealt = damage;
        damageEntry.criticalHitType = critical;

        this.currentEntry.damageEntries.push(damageEntry);

        const nextLine = this.peekNextLine();
        if (nextLine !== null && nextLine.indent >= line.indent) {
            // Check if the bot was destroyed as a result of this damage
            const botDestroyedResult = botDestroyedRegex.exec(nextLine.remainingText);
            const botMeltedResult = botMeltedRegex.exec(nextLine.remainingText);

            if (botDestroyedResult !== null || botMeltedResult !== null) {
                // Bot was also destroyed after the damage
                if (damageEntry.damagedPart === "Core") {
                    // Damage directly destroyed core, or followed-up damage did
                    this.getNextLine();
                    damageEntry.targetDestroyed = true;
                } else if (botMeltedResult !== null) {
                    // Found a meltdown but current hit didn't target core
                    // Create a new damage entry targeting core so the bot
                    // is counted as properly being destroyed
                    this.getNextLine();
                    const meltedEntry = createEmptyDamageLogEntry();
                    meltedEntry.damagedEntity = damageEntry.damagedEntity;
                    meltedEntry.damagedPart = "Core";
                    meltedEntry.targetDestroyed = true;
                    this.currentEntry.damageEntries.push(meltedEntry);
                } else {
                    // Unrelated damage following the previous damage hit core and
                    // destroyed the bot, create a new damage entry for it
                    this.parseDestroyedTarget(this.getNextLine()!);
                }
            }
        }

        return true;
    }

    // Tries to parse a destroyed part/bot into a damage entry
    private parseDestroyedTarget(line: PartialParsedLine): boolean {
        const destroyedResult = targetDestroyedRegex.exec(line.remainingText);
        if (destroyedResult === null) {
            return false;
        }

        // Found target destruction, but no damage number available
        const damagedTarget = destroyedResult[1];
        const critical = destroyedResult[2];
        const damageEntry = createEmptyDamageLogEntry();

        if (ignoreTarget(damagedTarget)) {
            // Ignore this damage entry
            return true;
        }

        let botName: string;
        let partName: string;

        if (isKnownItem(damagedTarget)) {
            // If we're a known part then it means Cogmind's part was destroyed
            botName = "Cogmind";
            partName = damagedTarget;
        } else {
            // Non-Cogmind bot was hit, split name/weapon out
            ({ botName, partName } = splitBotAndPart(damagedTarget));
        }

        damageEntry.damagedEntity = botName;
        damageEntry.damagedPart = partName;
        damageEntry.criticalHitType = critical;
        damageEntry.targetDestroyed = true;
        this.currentEntry.damageEntries.push(damageEntry);

        return true;
    }

    // Tries to parse a line into an engine detonation entry
    private parseEngineDetonated(line: PartialParsedLine): boolean {
        const detonateResult = engineDetonateRegex.exec(line.remainingText);
        if (detonateResult === null) {
            return false;
        }

        // Found an engine detonation, parse the engine part out
        const { botName, partName } = splitBotAndPart(detonateResult[1]);

        const damageEntry = createEmptyDamageLogEntry();
        damageEntry.damagedEntity = botName;
        damageEntry.damagedPart = partName;
        damageEntry.targetDestroyed = true;
        this.currentEntry.damageEntries.push(damageEntry);

        return true;
    }

    private ignoredRegexes = [
        baseHitRegex,
        botCorruptedRegex,
        botHackRegex,
        botHackRepelledRegex,
        botMeltedRegex,
        cogmindMeltdownRegex,
        criticalPartRemovedRegex,
        damageInsufficientToPenetrateRegex,
        deflectedRegex,
        disabledRegex,
        gunslingingRegex,
        interceptedRegex,
        machineDisabledRegex,
        penetrationRegex,
        preventedDisruptionRegex,
        redirectedRegex,
        shieldingPreventedCritRegex,
        trapShortCircuited,
        trapTriggeredRegex,
    ];
    // Tries to parse all currently ignored lines
    private parseIgnoredLine(line: PartialParsedLine): boolean {
        for (const regex of this.ignoredRegexes) {
            const result = regex.exec(line.remainingText);

            if (result !== null) {
                return true;
            }
        }

        // Maybe do something with this
        return false;
    }

    // Tries to parse a line into a new combat log entry
    private parseLogEntry(line: PartialParsedLine) {
        this.currentEntry = createEmptyLogEntry();
        const currentEntry = this.currentEntry;
        currentEntry.turn = line.turn;

        if (this.parseWeaponAttack(line)) {
            return;
        }

        if (this.parseMachineExplosion(line)) {
            return;
        }

        if (this.parseDamageEntry(line) || this.parseDestroyedTarget(line)) {
            // Found damage/destroyed part coming from an unknown source
            // Add a dedicated damage entry from an unknown source
            currentEntry.projectilesHit = 1;
            currentEntry.projectilesTotal = 1;
            this.entries.push(currentEntry);
            return;
        }

        if (this.parseIgnoredLine(line)) {
            // These line types are currently ignored
            return;
        }

        // TODO: what other things can trigger this
        if (line.remainingText.length > 0) {
            console.log(`Skipped non-recognized text ${line.remainingText}`);
        }

        return;
    }

    // Tries to parse a machine explosion line into a new combat log entry
    private parseMachineExplosion(line: PartialParsedLine): boolean {
        const machineExplosionResult = machineExplosionRegex.exec(line.remainingText);
        if (machineExplosionResult === null) {
            return false;
        }

        const currentEntry = this.currentEntry;
        currentEntry.sourceEntity = machineExplosionResult[1];
        currentEntry.sourceWeapon = "Explosion";

        this.parseNestedLines(line);

        this.entries.push(currentEntry);
        return true;
    }

    // Tries to parse nested lines underneath the given line to add onto a
    // base damage source
    private parseNestedLines(line: PartialParsedLine) {
        let nextLine: PartialParsedLine | null;
        while ((nextLine = this.peekNextLine()) && nextLine !== null && nextLine.indent > line.indent) {
            // Continue to parse entries while at a greater indent level
            const line = this.getNextLine()!;
            if (this.parseDamageEntry(line)) {
                continue;
            } else if (this.parseDestroyedTarget(line)) {
                continue;
            } else if (this.parseEngineDetonated(line)) {
                continue;
            } else if (this.parseMachineExplosion(line)) {
                continue;
            } else if (this.parseWeaponAttack(line)) {
                continue;
            } else if (this.parseIgnoredLine(line)) {
                // These line types are unused
                continue;
            } else {
                console.log(`Skipped non-recognized nested text ${line.remainingText}`);
            }
        }
    }

    // Tries to parse a weapon attack and all subsequent indented lines
    // into a single combat log entry
    private parseWeaponAttack(line: PartialParsedLine): boolean {
        const currentEntry = this.currentEntry;

        const weaponAttackResult = weaponAttackRegex.exec(line.remainingText);
        if (weaponAttackResult === null) {
            const questionResult = questionRegex.exec(line.remainingText);
            if (questionResult === null) {
                return false;
            }

            // Found a ??? source of damage
            currentEntry.sourceEntity = "Unknown";
            currentEntry.sourceWeapon = "Unknown";
            currentEntry.projectilesHit = 1;
            currentEntry.projectilesTotal = 1;
        } else {
            let bot: JsonBot | undefined = undefined;
            if (weaponAttackResult[1] !== undefined) {
                bot = tryGetBot(weaponAttackResult[1]);
                currentEntry.sourceEntity = bot === undefined ? "Unknown" : bot.Name;
            } else {
                currentEntry.sourceEntity = "Cogmind";
            }

            currentEntry.sourceWeapon = weaponAttackResult[2];
            if (currentEntry.sourceWeapon.endsWith("+")) {
                // Remove the study + from the weapon
                currentEntry.sourceWeapon = currentEntry.sourceWeapon.slice(0, currentEntry.sourceWeapon.length - 1);
            }

            if (bot !== undefined) {
                // If the part is an unknown part, see if we can determine
                // what it is based on the type of part
                const unknownPart = tryGetUnknownPart(currentEntry.sourceWeapon, bot);
                if (unknownPart !== undefined) {
                    currentEntry.sourceWeapon = unknownPart;
                }
            }

            if (weaponAttackResult[3] !== undefined) {
                currentEntry.sneakAttack = true;
            }

            currentEntry.weaponAccuracy = parseIntOrDefault(weaponAttackResult[4], 0);

            if (weaponAttackResult[5] !== undefined && weaponAttackResult[6] !== undefined) {
                // Multi-projectile weapons state the number of projectiles
                // that hit like x/y here
                currentEntry.projectilesHit = parseIntOrDefault(weaponAttackResult[5], 0);
                currentEntry.projectilesTotal = parseIntOrDefault(weaponAttackResult[6], 0);
            } else {
                // Single-projectile weapons state Hit or Miss
                currentEntry.projectilesHit = weaponAttackResult[7] === "Hit" ? 1 : 0;
                currentEntry.projectilesTotal = 1;
            }
        }

        this.parseNestedLines(line);

        this.entries.push(currentEntry);
        return true;
    }

    private peekNextLine(): PartialParsedLine | null {
        if (this.lineIndex < this.lines.length) {
            const line = this.lines[this.lineIndex];
            return line;
        } else {
            return null;
        }
    }
}

function createEmptyDamageLogEntry(): CombatLogDamageEntry {
    return {
        damagedEntity: "",
        damagedPart: "",
        criticalHitType: undefined,
        damageDealt: undefined,
        damageOverflow: false,
        targetDestroyed: false,
    };
}

function createEmptyLogEntry(): CombatLogEntry {
    return {
        damageEntries: [],
        projectilesHit: 0,
        projectilesTotal: 0,
        sourceEntity: "Unknown",
        sourceWeapon: "Unknown",
        weaponAccuracy: undefined,
        sneakAttack: false,
        turn: 0,
    };
}

const ignorableTargets = new Set(["Door", "Earth", "Reinforced Barrier", "Wall"]);
function ignoreTarget(target: string) {
    if (target.endsWith("Trap")) {
        // Don't care about damaging traps
        return true;
    }

    return ignorableTargets.has(target);
}

// Parses a combat log string into an array of combat log entries
export function parseCombatLog(logText: string): CombatLogEntry[] {
    const lines: PartialParsedLine[] = [];
    const splitLines = logText.split("\n");
    for (let i = 0; i < splitLines.length; i++) {
        let line = splitLines[i].trim();

        // If the next line is a continuation and wraps to the next line, wrap
        // it before processing anything else
        if (i + 1 < splitLines.length && splitLines[i + 1].startsWith(" ")) {
            line += " " + splitLines[i + 1].trim();
            i += 1;
        }

        const result = lineStartRegex.exec(line);

        if (result === null) {
            // Note: This shouldn't happen anymore now that lines are being
            // added on the previous iteration, but leaving just in case
            if (lines.length > 0 && line.length > 0) {
                // If a log line is long enough, it can wrap into the next one
                lines[lines.length - 1].remainingText += " " + line;
                continue;
            }

            if (line.length > 0 && !line.includes("Cogmind Combat Log")) {
                console.log(`Failed to parse log line ${line}`);
            }

            continue;
        }

        const turn = parseIntOrDefault(result[1], 0);
        const indent = result[2].length;
        const remainingText = result[3];
        const count = result[4] === undefined ? 1 : parseIntOrDefault(result[4], 1);

        // Push one entry for each time the log entry is repeated, by default only once
        // unless an x# is specified
        for (let i = 0; i < count; i++) {
            lines.push({
                indent: indent,
                remainingText: remainingText,
                turn: turn,
            });
        }
    }

    const state = new ParserState(lines);
    state.parseAllLogEntries();
    return state.entries;
}

// Attempts to split a bot and part from a combat log line.
// There's no explicit distinction between bot end and part start
// so the best we can do here is try to guess based on known bots/parts.
// Ideally every bot would be known by the parser, but sometimes there
// are custom naming schemes going on that might not be the most obvious
// to follow. If all else fails, we give up and go with unknown bot and part
function splitBotAndPart(line: string): { botName: string; partName: string } {
    const split = line.split(" ");

    // Try one split at a time, adding back the spaces if needed
    // Currently should max out at only 2 words
    for (let i = 1; i < split.length + 1; i++) {
        const bot = tryGetBot(split.slice(0, i).join(" "));
        if (bot !== undefined) {
            // Matched full or short name on first word
            let partName = split.slice(i).join(" ");

            // Capitalize core for consistency with parts
            // If part is not specified and we're expecting one then it means we
            // did hit core
            if (partName === "core" || partName === "") {
                partName = "Core";
            }

            // Strip + from
            if (partName.endsWith("+")) {
                partName = partName.slice(0, partName.length - 1);
            }

            // See if we can determine the unknown part from the type of part
            const unknownPart = tryGetUnknownPart(partName, bot);
            if (unknownPart !== undefined) {
                return { botName: bot.Name, partName: unknownPart };
            }

            return { botName: bot.Name, partName: partName };
        }
    }

    // Failed to find a known bot name, try the other way around and find a
    // known existing part instead
    for (let i = 1; i < split.length; i++) {
        let partName = split.slice(i).join(" ");
        if (partName.endsWith("+")) {
            partName = partName.slice(0, partName.length - 1);
        }

        const part = getItemByName(partName);
        if (part !== undefined || partName === "core" || partName === "Core") {
            const botName = split.slice(0, i).join(" ");

            // Capitalize core for consistency with parts
            if (partName === "core") {
                partName = "Core";
            }

            return { botName: botName, partName: partName };
        }
    }

    console.log(`Failed to split bot and part ${line}`);

    return { botName: "Unknown", partName: "Unknown" };
}

// Attempts to get a bot definition from an existing bot name
function tryGetBot(botName: string) {
    // Short name is the first part of 0b10 bot names, like G-34
    let bot = getBotByShortName(botName);
    if (bot !== undefined) {
        return bot;
    }

    // Try by full name next
    bot = getBotByName(botName);
    if (bot !== undefined) {
        return bot;
    }

    // Try allied name, which is the second part of 0b10 bot names,
    // like Mercenary
    const allyNameResult = alliedBotNameRegex.exec(botName);
    if (allyNameResult !== null) {
        bot = getBotByAllyName(allyNameResult[1]);
        if (bot !== undefined) {
            return bot;
        }
    }

    // Try derelict regex
    const derelictResult = derelictRegex.exec(botName);
    if (derelictResult !== null) {
        const derelictBotName = derelictClasses.get(derelictResult[1]);
        if (derelictBotName === undefined) {
            console.log(`Unexpected derelict class ${derelictResult[1]}`);
            return undefined;
        } else {
            bot = getBotByName(derelictBotName);
            if (bot === undefined) {
                console.log(`Bad derelict name ${derelictBotName}`);
            }

            return bot;
        }
    }

    const protovariantResult = protovariantRegex.exec(botName);
    if (protovariantResult !== null) {
        const protovariantBotName = `Protovariant ${protovariantResult[1]}`;

        bot = getBotByName(protovariantBotName);
        if (bot === undefined) {
            console.log(`Bad protovariant name ${protovariantBotName}`);
        }

        return bot;
    }

    // Try other special cases
    for (const regex of specialBotRegexes) {
        const result = regex.regex.exec(botName);
        if (result !== null) {
            bot = getBotByName(regex.name);
            if (bot === undefined) {
                console.log(`Bad special bot name ${regex.name}`);
            }

            return bot;
        }
    }

    return undefined;
}

function tryGetUnknownPart(partName: string, bot: JsonBot) {
    const unknownResult = unknownPartRegex.exec(partName);

    if (unknownResult !== null) {
        // Found unknown part, see if we can determine what it is
        const isProto = unknownResult[1] === "Prototype";
        const isAlien = unknownResult[1] === "Alien";
        const matchingParts = new Set<string>();

        const allParts = bot.Components?.concat(bot.Armament || []) || [];
        for (const component of allParts) {
            if (typeof component === "string") {
                // Only support non-grouped types for now
                const part = getItemByName(component);

                if (part === undefined) {
                    continue;
                }

                let ratingMatch: boolean;
                if (isAlien) {
                    ratingMatch = part.Rating.includes("**");
                } else if (isProto) {
                    ratingMatch = part.Rating.includes("*");
                } else {
                    ratingMatch = !part.Rating.includes("*");
                }

                if (part.Type === unknownResult[2] && ratingMatch) {
                    // Found a part of the right part type and proto/non-proto category
                    matchingParts.add(part.Name);
                }
            }
        }

        // If there is only one possibility for the type of part, use that now
        // If there are no matches or multiple matches, we can't narrow it down
        if (matchingParts.size === 1) {
            return [...matchingParts][0];
        }
    }

    return undefined;
}
