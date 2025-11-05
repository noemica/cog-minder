import { JsonHack } from "../types/hackTypes";

export function calculateHackPercentages(hack: JsonHack) {
    const direct = hack.Indirect !== "Always";
    const indirect = hack.Indirect !== "Never";
    
    // Calculate the hack chances for direct/indirect hacks at
    // all terminal levels and apply hacking modifier
    // Indirect penalty is 15 per security level on top of the
    // standard security level penalty, level penalty is 100% for
    // level 1 terminal, 50% for level 2, and 25% for level 3
    let hackValues: (number | undefined)[];
    if (hack.Level1DirectOnly) {
        // Special case of restricted level 1 terminals with only 1 hack
        hackValues = [hack.BaseChance, undefined, undefined, undefined, undefined, undefined];
    } else {
        hackValues = [
            direct ? hack.BaseChance : undefined,
            indirect ? hack.BaseChance - (direct ? 15 : 0) : undefined,
            direct ? Math.floor(hack.BaseChance / 2) : undefined,
            indirect ? Math.floor(hack.BaseChance / 2) - (direct ? 30 : 0) : undefined,
            direct ? Math.floor(hack.BaseChance / 4) : undefined,
            indirect ? Math.floor(hack.BaseChance / 4) - (direct ? 45 : 0) : undefined,
        ];
    }

    return hackValues;
}
