import { describe, expect, test, vi } from "vitest";

import { parseCombatLog } from "../utilities/combatLogParser";
import * as td from "./combatLogParserTestData";

describe("Combat log parser", () => {
    // Total misses
    test("Cogmind missing a shot", () => {
        expect(parseCombatLog(td.cogmindMissedShotLog)).toEqual(td.cogmindMissedShotEntries);
    });

    test("A known non-Cogmind bot missing a shot", () => {
        expect(parseCombatLog(td.botMissedShotLog)).toEqual(td.botMissedShotEntries);
    });

    // Hitting a part
    test("Cogmind hitting a known part on a known bot", () => {
        expect(parseCombatLog(td.cogmindHitBotPartLog)).toEqual(td.cogmindHitBotPartEntries);
    });

    test("Cogmind hitting a known part on a known bot with a studied part", () => {
        expect(parseCombatLog(td.cogmindHitBotPartLogWithStudyLog)).toEqual(td.cogmindHitBotPartLogWithStudyEntries);
    });

    test("Cogmind hitting a known part on a known bot with a multi-projectile weapon", () => {
        expect(parseCombatLog(td.cogmindHitBotPartMultiLog)).toEqual(td.cogmindHitBotPartMultiEntries);
    });

    test("Cogmind hitting a known part on a known bot with a sneak attack", () => {
        expect(parseCombatLog(td.cogmindHitBotPartSneakAttackLog)).toEqual(td.cogmindHitBotPartSneakAttackEntries);
    });

    test("Cogmind hitting a known part on a known bot with a burn critical", () => {
        expect(parseCombatLog(td.cogmindHitBotPartBurnCriticalLog)).toEqual(td.cogmindHitBotPartBurnCriticalEntries);
    });

    test("Cogmind hitting a known part on a known bot with a phase critical", () => {
        expect(parseCombatLog(td.cogmindHitBotPartPhaseCriticalLog)).toEqual(td.cogmindHitBotPartPhaseCriticalEntries);
    });

    test("A known non-Cogmind bot hitting a part on Cogmind", () => {
        expect(parseCombatLog(td.botHitCogmindPartLog)).toEqual(td.botHitCogmindPartEntries);
    });

    test("A known non-Cogmind bot hitting a studied part on Cogmind", () => {
        expect(parseCombatLog(td.botHitCogmindStudiedPartLog)).toEqual(td.botHitCogmindStudiedPartEntries);
    });

    test("A known non-Cogmind bot hitting a part on Cogmind with a multi-projectile weapon", () => {
        expect(parseCombatLog(td.botHitCogmindPartMultiLog)).toEqual(td.botHitCogmindPartMultiEntries);
    });

    test("An unknown non-Cogmind bot hitting a part on Cogmind", () => {
        expect(parseCombatLog(td.unknownBotHitCogmindPartLog)).toEqual(td.unknownBotHitCogmindPartEntries);
    });

    test("A known non-Cogmind bot hitting a part on Cogmind with an unknown but determinable weapon", () => {
        expect(parseCombatLog(td.botHitCogmindUnknownDeterminablePartLog)).toEqual(
            td.botHitCogmindUnknownDeterminablePartEntries,
        );
    });

    test("A known non-Cogmind bot hitting a part on Cogmind with an unknown but undeterminable weapon", () => {
        expect(parseCombatLog(td.botHitCogmindUnknownUndeterminablePartLog)).toEqual(
            td.botHitCogmindUnknownUndeterminablePartEntries,
        );
    });

    // Hitting core
    test("Cogmind hitting core on a known bot", () => {
        expect(parseCombatLog(td.cogmindHitBotCoreLog)).toEqual(td.cogmindHitBotCoreEntries);
    });

    test("A known non-Cogmind bot hitting core on Cogmind", () => {
        expect(parseCombatLog(td.botHitCogmindCoreLog)).toEqual(td.botHitCogmindCoreEntries);
    });

    // Missing into something
    test("Cogmind missing into a a known part on a non-targeted bot", () => {
        expect(parseCombatLog(td.cogmindMissIntoBotPartLog)).toEqual(td.cogmindMissIntoBotPartEntries);
    });

    test("Cogmind missing into a a known part on a non-targeted bot", () => {
        expect(parseCombatLog(td.botMissIntoOtherBotPartLog)).toEqual(td.botMissIntoOtherBotPartEntries);
    });

    // Part destruction/removal
    test("Cogmind destroying a known part on a known bot", () => {
        expect(parseCombatLog(td.cogmindDestroyedBotPartLog)).toEqual(td.cogmindDestroyedBotPartEntries);
    });

    test("Cogmind destroying a known part on a known bot with a destroy critical", () => {
        expect(parseCombatLog(td.cogmindDestroyedBotPartCriticalLog)).toEqual(
            td.cogmindDestroyedBotPartCriticalEntries,
        );
    });

    test("Cogmind blasting a known part off of a known bot with a blast critical", () => {
        expect(parseCombatLog(td.cogmindBlastedBotPartCriticalLog)).toEqual(td.cogmindBlastedBotPartCriticalEntries);
    });

    test("Cogmind destroying a known part on a known bot with a smash critical", () => {
        expect(parseCombatLog(td.cogmindSmashedBotPartCriticalLog)).toEqual(td.cogmindSmashedBotPartCriticalEntries);
    });

    test("Cogmind knocking off a known part on a known bot with a sunder critical", () => {
        expect(parseCombatLog(td.cogmindSunderedBotPartCriticalLog)).toEqual(td.cogmindSunderedBotPartCriticalEntries);
    });

    test("Cogmind severing a known part off of a known bot with a sever critical", () => {
        expect(parseCombatLog(td.cogmindSeveredBotPartCriticalLog)).toEqual(td.cogmindSeveredBotPartCriticalEntries);
    });

    test("Cogmind severing a known part off of a known bot with a sever critical on core", () => {
        expect(parseCombatLog(td.cogmindSeveredBotCoreCriticalLog)).toEqual(td.cogmindSeveredBotCoreCriticalEntries);
    });

    test("Cogmind detonating a known engine off of a known bot with a detonate critical", () => {
        expect(parseCombatLog(td.cogmindDetonatedBotCriticalLog)).toEqual(td.cogmindDetonatedBotCriticalEntries);
    });

    test("A known non-Cogmind bot destroying a part on Cogmind", () => {
        expect(parseCombatLog(td.botDestroyedCogmindPartLog)).toEqual(td.botDestroyedCogmindPartEntries);
    });

    test("An unknown non-Cogmind bot destroying a part on Cogmind", () => {
        expect(parseCombatLog(td.unknownBotDestroyedCogmindPartLog)).toEqual(td.unknownBotDestroyedCogmindPartEntries);
    });

    // Bot destruction
    test("Cogmind destroying a known bot", () => {
        expect(parseCombatLog(td.cogmindDestroyedBotLog)).toEqual(td.cogmindDestroyedBotEntries);
    });

    test("Cogmind destroying multiple known bots with a launcher", () => {
        expect(parseCombatLog(td.cogmindDestroyedBotsLauncherLog)).toEqual(td.cogmindDestroyedBotsLauncherEntries);
    });

    test("Cogmind destroying a known bot with a destroy critical", () => {
        expect(parseCombatLog(td.cogmindDestroyedBotCriticalLog)).toEqual(td.cogmindDestroyedBotCriticalEntries);
    });

    test("Cogmind destroying a known bot with a meltdown critical", () => {
        expect(parseCombatLog(td.cogmindDestroyedBotMeltdownCriticalLog)).toEqual(
            td.cogmindDestroyedBotMeltdownCriticalEntries,
        );
    });

    test("Cogmind destroying a known bot with a meltdown critical on a part", () => {
        expect(parseCombatLog(td.cogmindDestroyedBotMeltdownPartCriticalLog)).toEqual(
            td.cogmindDestroyedBotMeltdownPartCriticalEntries,
        );
    });

    // AOE
    test("Cogmind hitting self with a launcher", () => {
        expect(parseCombatLog(td.cogmindSelfLauncherLog)).toEqual(td.cogmindSelfLauncherEntries);
    });

    test("A machine explosion hitting a known bot and Cogmind", () => {
        expect(parseCombatLog(td.machineExplosionLog)).toEqual(td.machineExplosionEntries);
    });

    // Unknown things
    test("Cogmind hitting an unknown prototype part on a known bot", () => {
        expect(parseCombatLog(td.cogmindHitBotPrototypePartLog)).toEqual(td.cogmindHitBotPrototypePartEntries);
    });

    test("Cogmind hitting a known part on a known bot with an unknown weapon", () => {
        expect(parseCombatLog(td.cogmindHitBotPartUnknownWeaponLog)).toEqual(td.cogmindHitBotPartUnknownWeaponEntries);
    });

    test("Cogmind hitting a known part on an unknown bot", () => {
        expect(parseCombatLog(td.cogmindHitUnknownBotPartLog)).toEqual(td.cogmindHitUnknownBotPartEntries);
    });

    test("Cogmind hitting core on an unknown bot", () => {
        expect(parseCombatLog(td.cogmindHitUnknownBotCoreLog)).toEqual(td.cogmindHitUnknownBotCoreEntries);
    });

    test("Cogmind hitting an unknown part on an unknown bot", () => {
        expect(parseCombatLog(td.cogmindHitUnknownBotUnknownPartLog)).toEqual(
            td.cogmindHitUnknownBotUnknownPartEntries,
        );
    });

    // Allied bots
    test("An allied bot hitting a known part on a hostile bot", () => {
        expect(parseCombatLog(td.alliedBotHitBotPartLog)).toEqual(td.alliedBotHitBotPartEntries);
    });

    test("A hostile bot hitting a known part on an allied bot", () => {
        expect(parseCombatLog(td.hostileBotHitAlliedBotPartLog)).toEqual(td.hostileBotHitAlliedBotPartEntries);
    });

    // Bot naming
    test("A friendly Derelict hitting a known part on a known hostile bot", () => {
        expect(parseCombatLog(td.derelictHitBotPartLog)).toEqual(td.derelictHitBotPartEntries);
    });

    test("A hostile Assembled hitting a known part on Cogmind", () => {
        expect(parseCombatLog(td.assembledHitCogmindPartLog)).toEqual(td.assembledHitCogmindPartEntries);
    });

    // Long entry
    test("An extended 2 tile-long entry", () => {
        expect(parseCombatLog(td.multiLineLog)).toEqual(td.multiLineEntries);
    });

    // Invalid data
    test("Invalid data", () => {
        // Temporarily disable console logging to avoid nuisance test output
        vi.spyOn(console, "log").mockImplementation(() => undefined);
        expect(parseCombatLog(td.invalidDataLog)).toEqual([]);
        vi.restoreAllMocks();
    });

    test("Invalid data mixed with valid data", () => {
        // Temporarily disable console logging to avoid nuisance test output
        vi.spyOn(console, "log").mockImplementation(() => undefined);
        expect(parseCombatLog(td.invalidDataInValidDataLog)).toEqual(td.invalidDataInValidDataEntries);
        vi.restoreAllMocks();
    });
});
