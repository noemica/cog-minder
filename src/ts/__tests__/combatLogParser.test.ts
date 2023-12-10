import { parseLog } from "../combatLogParser";
import * as td from "./combatLogParserTestData";
import { describe, test, expect } from "vitest";

describe("Combat log parser", () => {
    // Total misses
    test("Cogmind missing a shot", () => {
        expect(parseLog(td.cogmindMissedShotLog)).toEqual(td.cogmindMissedShotEntries);
    });

    test("A known non-Cogmind bot missing a shot", () => {
        expect(parseLog(td.botMissedShotLog)).toEqual(td.botMissedShotEntries);
    });

    // Hitting a part
    test("Cogmind hitting a known part on a known bot", () => {
        expect(parseLog(td.cogmindHitBotPartLog)).toEqual(td.cogmindHitBotPartEntries);
    });

    test("Cogmind hitting a known part on a known bot with a multi-projectile weapon", () => {
        expect(parseLog(td.cogmindHitBotPartMultiLog)).toEqual(td.cogmindHitBotPartMultiEntries);
    });

    test("Cogmind hitting a known part on a known bot with a sneak attack", () => {
        expect(parseLog(td.cogmindHitBotPartSneakAttackLog)).toEqual(td.cogmindHitBotPartSneakAttackEntries);
    });

    test("Cogmind hitting a known part on a known bot with a burn critical", () => {
        expect(parseLog(td.cogmindHitBotPartBurnCriticalLog)).toEqual(td.cogmindHitBotPartBurnCriticalEntries);
    });
    test("Cogmind hitting a known part on a known bot with a phase critical", () => {
        expect(parseLog(td.cogmindHitBotPartPhaseCriticalLog)).toEqual(td.cogmindHitBotPartPhaseCriticalEntries);
    });

    test("A known non-Cogmind bot hitting a part on Cogmind", () => {
        expect(parseLog(td.botHitCogmindPartLog)).toEqual(td.botHitCogmindPartEntries);
    });

    test("A known non-Cogmind bot hitting a part on Cogmind with a multi-projectile weapon", () => {
        expect(parseLog(td.botHitCogmindPartMultiLog)).toEqual(td.botHitCogmindPartMultiEntries);
    });

    test("An unknown non-Cogmind bot hitting a part on Cogmind", () => {
        expect(parseLog(td.unknownBotHitCogmindPartLog)).toEqual(td.unknownBotHitCogmindPartEntries);
    });

    // Hitting core
    test("Cogmind hitting core on a known bot", () => {
        expect(parseLog(td.cogmindHitBotCoreLog)).toEqual(td.cogmindHitBotCoreEntries);
    });

    test("A known non-Cogmind bot hitting core on Cogmind", () => {
        expect(parseLog(td.botHitCogmindCoreLog)).toEqual(td.botHitCogmindCoreEntries);
    });

    // Missing into something
    test("Cogmind missing into a a known part on a non-targeted bot", () => {
        expect(parseLog(td.cogmindMissIntoBotPartLog)).toEqual(td.cogmindMissIntoBotPartEntries);
    });

    test("Cogmind missing into a a known part on a non-targeted bot", () => {
        expect(parseLog(td.botMissIntoOtherBotPartLog)).toEqual(td.botMissIntoOtherBotPartEntries);
    });

    // Part destruction/removal
    test("Cogmind destroying a known part on a known bot", () => {
        expect(parseLog(td.cogmindDestroyedBotPartLog)).toEqual(td.cogmindDestroyedBotPartEntries);
    });

    test("Cogmind destroying a known part on a known bot with a destroy critical", () => {
        expect(parseLog(td.cogmindDestroyedBotPartCriticalLog)).toEqual(td.cogmindDestroyedBotPartCriticalEntries);
    });

    test("Cogmind blasting a known part off of a known bot with a blast critical", () => {
        expect(parseLog(td.cogmindBlastedBotPartCriticalLog)).toEqual(td.cogmindBlastedBotPartCriticalEntries);
    });

    test("Cogmind destroying a known part on a known bot with a smash critical", () => {
        expect(parseLog(td.cogmindSmashedBotPartCriticalLog)).toEqual(td.cogmindSmashedBotPartCriticalEntries);
    });

    test("Cogmind knocking off a known part on a known bot with a sunder critical", () => {
        expect(parseLog(td.cogmindSunderedBotPartCriticalLog)).toEqual(td.cogmindSunderedBotPartCriticalEntries);
    });

    test("Cogmind severing a known part off of a known bot with a sever critical", () => {
        expect(parseLog(td.cogmindSeveredBotPartCriticalLog)).toEqual(td.cogmindSeveredBotPartCriticalEntries);
    });

    test("Cogmind severing a known part off of a known bot with a sever critical on core", () => {
        expect(parseLog(td.cogmindSeveredBotCoreCriticalLog)).toEqual(td.cogmindSeveredBotCoreCriticalEntries);
    });

    test("Cogmind detonating a known engine off of a known bot with a detonate critical", () => {
        expect(parseLog(td.cogmindDetonatedBotCriticalLog)).toEqual(td.cogmindDetonatedBotCriticalEntries);
    });

    test("A known non-Cogmind bot destroying a part on Cogmind", () => {
        expect(parseLog(td.botDestroyedCogmindPartLog)).toEqual(td.botDestroyedCogmindPartEntries);
    });

    test("An unknown non-Cogmind bot destroying a part on Cogmind", () => {
        expect(parseLog(td.unknownBotDestroyedCogmindPartLog)).toEqual(td.unknownBotDestroyedCogmindPartEntries);
    });

    // Bot destruction
    test("Cogmind destroying a known bot", () => {
        expect(parseLog(td.cogmindDestroyedBotLog)).toEqual(td.cogmindDestroyedBotEntries);
    });

    test("Cogmind destroying multiple known bots with a launcher", () => {
        expect(parseLog(td.cogmindDestroyedBotsLauncherLog)).toEqual(td.cogmindDestroyedBotsLauncherEntries);
    });

    test("Cogmind destroying a known bot with a destroy critical", () => {
        expect(parseLog(td.cogmindDestroyedBotCriticalLog)).toEqual(td.cogmindDestroyedBotCriticalEntries);
    });

    test("Cogmind destroying a known bot with a meltdown critical", () => {
        expect(parseLog(td.cogmindDestroyedBotMeltdownCriticalLog)).toEqual(
            td.cogmindDestroyedBotMeltdownCriticalEntries,
        );
    });

    test("Cogmind destroying a known bot with a meltdown critical on a part", () => {
        expect(parseLog(td.cogmindDestroyedBotMeltdownPartCriticalLog)).toEqual(
            td.cogmindDestroyedBotMeltdownPartCriticalEntries,
        );
    });

    // AOE
    test("Cogmind hitting self with a launcher", () => {
        expect(parseLog(td.cogmindSelfLauncherLog)).toEqual(td.cogmindSelfLauncherEntries);
    });

    test("A machine explosion hitting a known bot and Cogmind", () => {
        expect(parseLog(td.machineExplosionLog)).toEqual(td.machineExplosionEntries);
    });

    // Unknown things
    test("Cogmind hitting an unknown prototype part on a known bot", () => {
        expect(parseLog(td.cogmindHitBotPrototypePartLog)).toEqual(td.cogmindHitBotPrototypePartEntries);
    });

    test("Cogmind hitting a known part on a known bot with an unknown weapon", () => {
        expect(parseLog(td.cogmindHitBotPartUnknownWeaponLog)).toEqual(td.cogmindHitBotPartUnknownWeaponEntries);
    });

    test("Cogmind hitting a known part on an unknown bot", () => {
        expect(parseLog(td.cogmindHitUnknownBotPartLog)).toEqual(td.cogmindHitUnknownBotPartEntries);
    });

    test("Cogmind hitting core on an unknown bot", () => {
        expect(parseLog(td.cogmindHitUnknownBotCoreLog)).toEqual(td.cogmindHitUnknownBotCoreEntries);
    });

    test("Cogmind hitting an unknown part on an unknown bot", () => {
        expect(parseLog(td.cogmindHitUnknownBotUnknownPartLog)).toEqual(td.cogmindHitUnknownBotUnknownPartEntries);
    });

    // Allied bots
    test("An allied bot hitting a known part on a hostile bot", () => {
        expect(parseLog(td.alliedBotHitBotPartLog)).toEqual(td.alliedBotHitBotPartEntries);
    });

    test("A hostile bot hitting a known part on an allied bot", () => {
        expect(parseLog(td.hostileBotHitAlliedBotPartLog)).toEqual(td.hostileBotHitAlliedBotPartEntries);
    });

    // Bot naming
    test("A friendly Derelict hitting a known part on a known hostile bot", () => {
        expect(parseLog(td.derelictHitBotPartLog)).toEqual(td.derelictHitBotPartEntries);
    });

    test("A hostile Assembled hitting a known part on Cogmind", () => {
        expect(parseLog(td.assembledHitCogmindPartLog)).toEqual(td.assembledHitCogmindPartEntries);
    });
});
