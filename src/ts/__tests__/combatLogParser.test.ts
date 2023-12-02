import { parseLog } from "../combatLogParser";
import {
    cogmindDestroyedPartEntries,
    cogmindDestroyedPartLog,
    cogmindHitCoreEntries,
    cogmindHitCoreLog,
    cogmindHitPartEntries,
    cogmindHitPartLog,
    cogmindMissedShotEntries,
    cogmindMissedShotLog,
} from "./combatLogParserTestData";
import { describe, test, expect } from "vitest";

describe("Combat log parser", () => {
    test("Cogmind missing a shot", () => {
        expect(parseLog(cogmindMissedShotLog)).toEqual(cogmindMissedShotEntries);
    });

    test("Cogmind hitting an Aluminum Leg on a G-34 Mercenary", () => {
        expect(parseLog(cogmindHitPartLog)).toEqual(cogmindHitPartEntries);
    });

    test("Cogmind hitting Core on a Drone", () => {
        expect(parseLog(cogmindHitCoreLog)).toEqual(cogmindHitCoreEntries);
    });

    test("Cogmind destroying a Lgt. Antimatter Reactor on a L-61 Swordsman", () => {
        expect(parseLog(cogmindDestroyedPartLog)).toEqual(cogmindDestroyedPartEntries);
    });
});
