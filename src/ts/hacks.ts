import * as jQuery from "jquery";
import * as popper from "popper.js";
import "bootstrap";
import { getSpoilersState, resetButtonGroup } from "./commonJquery";
import { parseIntOrDefault, setSpoilersState, Spoiler } from "./common";

const jq = jQuery.noConflict();
jq(function ($) {
    $((document) => init());

    // An enum to represent the hack's indirect potential
    enum Indirect {
        Always = "Always",
        Sometimes = "Sometimes",
        Never = "Never",
    }

    // An individual hack can can be performed
    type Hack = {
        name: string;
        baseChance: number;
        indirect: Indirect;
        level1DirectOnly?: boolean;
        spoilerLevel?: Spoiler;
    };

    // A machine category with a list of hacks
    type Machine = {
        dataCoreApplies: boolean;
        name: string;
        hacks: Hack[];
    }

    // All machine/hack data
    const allMachines: Machine[] = [
        {
            name: "Fabricator",
            dataCoreApplies: false,
            hacks: [
                { name: "Build - part rating 1", baseChance: 67, indirect: Indirect.Never },
                { name: "Build - part rating 2", baseChance: 64, indirect: Indirect.Never },
                { name: "Build - part rating 2*", baseChance: 60, indirect: Indirect.Never },
                { name: "Build - part rating 3", baseChance: 61, indirect: Indirect.Never },
                { name: "Build - part rating 3*", baseChance: 55, indirect: Indirect.Never },
                { name: "Build - part rating 4", baseChance: 58, indirect: Indirect.Never },
                { name: "Build - part rating 4*", baseChance: 50, indirect: Indirect.Never },
                { name: "Build - part rating 5", baseChance: 55, indirect: Indirect.Never },
                { name: "Build - part rating 5*", baseChance: 45, indirect: Indirect.Never },
                { name: "Build - part rating 6", baseChance: 52, indirect: Indirect.Never },
                { name: "Build - part rating 6*", baseChance: 40, indirect: Indirect.Never },
                { name: "Build - part rating 7", baseChance: 49, indirect: Indirect.Never },
                { name: "Build - part rating 7*", baseChance: 35, indirect: Indirect.Never },
                { name: "Build - part rating 8", baseChance: 46, indirect: Indirect.Never },
                { name: "Build - part rating 8*", baseChance: 30, indirect: Indirect.Never },
                { name: "Build - part rating 9", baseChance: 43, indirect: Indirect.Never },
                { name: "Build - part rating 9*", baseChance: 25, indirect: Indirect.Never },
                { name: "Build - robot tier 1", baseChance: 46, indirect: Indirect.Never },
                { name: "Build - robot tier 2", baseChance: 42, indirect: Indirect.Never },
                { name: "Build - robot tier 3", baseChance: 38, indirect: Indirect.Never },
                { name: "Build - robot tier 4", baseChance: 34, indirect: Indirect.Never },
                { name: "Build - robot tier 5", baseChance: 30, indirect: Indirect.Never },
                { name: "Build - robot tier 6", baseChance: 26, indirect: Indirect.Never },
                { name: "Build - robot tier 7", baseChance: 22, indirect: Indirect.Never },
                { name: "Build - robot tier 8", baseChance: 18, indirect: Indirect.Never },
                { name: "Build - robot tier 9", baseChance: 14, indirect: Indirect.Never },
                { name: "Force(Download)", baseChance: 80, indirect: Indirect.Always, spoilerLevel: Spoiler.Spoilers },
                { name: "Force(Overload)", baseChance: 80, indirect: Indirect.Always, spoilerLevel: Spoiler.Spoilers },
                { name: "Load([Part Name])", baseChance: 90, indirect: Indirect.Never },
                { name: "Network(Status)", baseChance: 90, indirect: Indirect.Never },
                { name: "Trojan(Haulers)", baseChance: 50, indirect: Indirect.Always, spoilerLevel: Spoiler.Spoilers },
                { name: "Trojan(Prioritize)", baseChance: 30, indirect: Indirect.Always, spoilerLevel: Spoiler.Spoilers },
                { name: "Trojan(Report)", baseChance: 80, indirect: Indirect.Always, spoilerLevel: Spoiler.Spoilers },
                { name: "Trojan(Siphon)", baseChance: 50, indirect: Indirect.Always, spoilerLevel: Spoiler.Spoilers },
            ],
        },
        {
            name: "Garrison",
            dataCoreApplies: false,
            hacks: [
                { name: "Couplers", baseChance: 40, indirect: Indirect.Never },
                { name: "Force(Eject)", baseChance: 80, indirect: Indirect.Always, spoilerLevel: Spoiler.Spoilers },
                { name: "Force(Jam)", baseChance: 80, indirect: Indirect.Always, spoilerLevel: Spoiler.Spoilers },
                { name: "Seal", baseChance: 30, indirect: Indirect.Never },
                { name: "Trojan(Broadcast)", baseChance: 70, indirect: Indirect.Always, spoilerLevel: Spoiler.Spoilers },
                { name: "Trojan(Decoy)", baseChance: 70, indirect: Indirect.Always, spoilerLevel: Spoiler.Spoilers },
                { name: "Trojan(Intercept)", baseChance: 50, indirect: Indirect.Always, spoilerLevel: Spoiler.Spoilers },
                { name: "Trojan(Redirect)", baseChance: 30, indirect: Indirect.Always, spoilerLevel: Spoiler.Spoilers },
                { name: "Trojan(Reprogram)", baseChance: 20, indirect: Indirect.Always, spoilerLevel: Spoiler.Spoilers },
                { name: "Trojan(Restock)", baseChance: 70, indirect: Indirect.Always, spoilerLevel: Spoiler.Spoilers },
                { name: "Trojan(Watchers)", baseChance: 50, indirect: Indirect.Always, spoilerLevel: Spoiler.Spoilers },
                { name: "Unlock", baseChance: 60, indirect: Indirect.Never },
            ],
        },
        {
            name: "Recycling",
            dataCoreApplies: false,
            hacks: [
                { name: "Force(Tunnel)", baseChance: 80, indirect: Indirect.Always, spoilerLevel: Spoiler.Spoilers },
                { name: "Retrieve(Components)", baseChance: 40, indirect: Indirect.Never },
                { name: "Retrieve(Matter)", baseChance: 60, indirect: Indirect.Never },
                { name: "Recycle([Part Name])", baseChance: 85, indirect: Indirect.Never },
                { name: "Recycling(Report)", baseChance: 90, indirect: Indirect.Never },
                { name: "Recycling(Process)", baseChance: 80, indirect: Indirect.Never },
                { name: "Recycling(Process)", baseChance: 80, indirect: Indirect.Never },
                { name: "Trojan(Mask)", baseChance: 40, indirect: Indirect.Always, spoilerLevel: Spoiler.Spoilers },
                { name: "Trojan(Monitor)", baseChance: 70, indirect: Indirect.Always, spoilerLevel: Spoiler.Spoilers },
                { name: "Trojan(Recyclers)", baseChance: 70, indirect: Indirect.Always, spoilerLevel: Spoiler.Spoilers },
                { name: "Trojan(Reject)", baseChance: 70, indirect: Indirect.Always, spoilerLevel: Spoiler.Spoilers },
            ],
        },
        {
            name: "Repair Station",
            dataCoreApplies: false,
            hacks: [
                { name: "Scan([Part Name])", baseChance: 80, indirect: Indirect.Never },
                { name: "Repair - rating 1", baseChance: 67, indirect: Indirect.Never },
                { name: "Repair - rating 2", baseChance: 64, indirect: Indirect.Never },
                { name: "Repair - rating 2*", baseChance: 60, indirect: Indirect.Never },
                { name: "Repair - rating 3", baseChance: 61, indirect: Indirect.Never },
                { name: "Repair - rating 3*", baseChance: 55, indirect: Indirect.Never },
                { name: "Repair - rating 4", baseChance: 58, indirect: Indirect.Never },
                { name: "Repair - rating 4*", baseChance: 50, indirect: Indirect.Never },
                { name: "Repair - rating 5", baseChance: 55, indirect: Indirect.Never },
                { name: "Repair - rating 5*", baseChance: 45, indirect: Indirect.Never },
                { name: "Repair - rating 6", baseChance: 52, indirect: Indirect.Never },
                { name: "Repair - rating 6*", baseChance: 40, indirect: Indirect.Never },
                { name: "Repair - rating 7", baseChance: 49, indirect: Indirect.Never },
                { name: "Repair - rating 7*", baseChance: 35, indirect: Indirect.Never },
                { name: "Repair - rating 8", baseChance: 46, indirect: Indirect.Never },
                { name: "Repair - rating 8*", baseChance: 30, indirect: Indirect.Never },
                { name: "Repair - rating 9", baseChance: 43, indirect: Indirect.Never },
                { name: "Refit", baseChance: 35, indirect: Indirect.Never },
                { name: "Trojan(Mechanics)", baseChance: 70, indirect: Indirect.Always, spoilerLevel: Spoiler.Spoilers },
            ],
        },
        {
            name: "Scanalyzer",
            dataCoreApplies: false,
            hacks: [
                { name: "Insert([Part Name])", baseChance: 80, indirect: Indirect.Never },
                { name: "Scanalyze - rating 1", baseChance: 95, indirect: Indirect.Never },
                { name: "Scanalyze - rating 2", baseChance: 90, indirect: Indirect.Never },
                { name: "Scanalyze - rating 2*", baseChance: 84, indirect: Indirect.Never },
                { name: "Scanalyze - rating 3", baseChance: 85, indirect: Indirect.Never },
                { name: "Scanalyze - rating 3*", baseChance: 76, indirect: Indirect.Never },
                { name: "Scanalyze - rating 4", baseChance: 80, indirect: Indirect.Never },
                { name: "Scanalyze - rating 4*", baseChance: 68, indirect: Indirect.Never },
                { name: "Scanalyze - rating 5", baseChance: 75, indirect: Indirect.Never },
                { name: "Scanalyze - rating 5*", baseChance: 60, indirect: Indirect.Never },
                { name: "Scanalyze - rating 6", baseChance: 70, indirect: Indirect.Never },
                { name: "Scanalyze - rating 6*", baseChance: 52, indirect: Indirect.Never },
                { name: "Scanalyze - rating 7", baseChance: 65, indirect: Indirect.Never },
                { name: "Scanalyze - rating 7*", baseChance: 44, indirect: Indirect.Never },
                { name: "Scanalyze - rating 8", baseChance: 60, indirect: Indirect.Never },
                { name: "Scanalyze - rating 8*", baseChance: 36, indirect: Indirect.Never },
                { name: "Scanalyze - rating 9", baseChance: 55, indirect: Indirect.Never },
                { name: "Scanalyze - rating 9*", baseChance: 28, indirect: Indirect.Never },
                { name: "Trojan(Researchers)", baseChance: 50, indirect: Indirect.Always, spoilerLevel: Spoiler.Spoilers },
            ],
        },
        {
            name: "Terminal",
            dataCoreApplies: true,
            hacks: [
                { name: "Access(Branch)", baseChance: 30, indirect: Indirect.Sometimes },
                { name: "Access(Emergency)", baseChance: 60, indirect: Indirect.Sometimes },
                { name: "Access(Main)", baseChance: 20, indirect: Indirect.Sometimes },
                { name: "Alert(Check)", baseChance: 80, indirect: Indirect.Sometimes },
                { name: "Alert(Purge)", baseChance: 50, indirect: Indirect.Sometimes },
                { name: "Analysis([Bot Name]) - tier 1", baseChance: 54, indirect: Indirect.Sometimes },
                { name: "Analysis([Bot Name]) - tier 2", baseChance: 48, indirect: Indirect.Sometimes },
                { name: "Analysis([Bot Name]) - tier 3", baseChance: 42, indirect: Indirect.Sometimes },
                { name: "Analysis([Bot Name]) - tier 4", baseChance: 36, indirect: Indirect.Sometimes },
                { name: "Analysis([Bot Name]) - tier 5", baseChance: 30, indirect: Indirect.Sometimes },
                { name: "Analysis([Bot Name]) - tier 6", baseChance: 24, indirect: Indirect.Sometimes },
                { name: "Analysis([Bot Name]) - tier 7", baseChance: 18, indirect: Indirect.Sometimes },
                { name: "Analysis([Bot Name]) - tier 8", baseChance: 12, indirect: Indirect.Sometimes },
                { name: "Analysis([Bot Name]) - tier 9", baseChance: 6, indirect: Indirect.Sometimes },
                { name: "Analysis([Bot Name]) - tier 10", baseChance: 0, indirect: Indirect.Sometimes },
                { name: "Control(Protovariants)", baseChance: 60, indirect: Indirect.Sometimes, spoilerLevel: Spoiler.Spoilers },
                { name: "Enumerate(Assaults)", baseChance: 30, indirect: Indirect.Sometimes },
                { name: "Enumerate(Exterminations)", baseChance: 30, indirect: Indirect.Sometimes },
                { name: "Enumerate(Garrison)", baseChance: 40, indirect: Indirect.Sometimes },
                { name: "Enumerate(Garrison)", baseChance: 40, indirect: Indirect.Sometimes },
                { name: "Enumerate(Guards)", baseChance: 30, indirect: Indirect.Sometimes },
                { name: "Enumerate(Intercept)", baseChance: 20, indirect: Indirect.Sometimes },
                { name: "Enumerate(Investigations)", baseChance: 50, indirect: Indirect.Sometimes },
                { name: "Enumerate(Maintenance)", baseChance: 70, indirect: Indirect.Sometimes },
                { name: "Enumerate(Patrols)", baseChance: 30, indirect: Indirect.Sometimes },
                { name: "Enumerate(Reinforcements)", baseChance: 20, indirect: Indirect.Sometimes },
                { name: "Enumerate(Squads)", baseChance: 60, indirect: Indirect.Sometimes },
                { name: "Enumerate(Surveillance)", baseChance: 30, indirect: Indirect.Sometimes },
                { name: "Enumerate(Transport)", baseChance: 50, indirect: Indirect.Sometimes },
                { name: "Force(Sabotage)", baseChance: 60, indirect: Indirect.Always, spoilerLevel: Spoiler.Spoilers },
                { name: "Force(Search)", baseChance: 80, indirect: Indirect.Always, spoilerLevel: Spoiler.Spoilers },
                { name: "Index(Fabricators)", baseChance: 40, indirect: Indirect.Sometimes },
                { name: "Index(Garrisons)", baseChance: 10, indirect: Indirect.Sometimes },
                { name: "Index(Machines)", baseChance: 0, indirect: Indirect.Sometimes },
                { name: "Index(Recycling Units)", baseChance: 40, indirect: Indirect.Sometimes },
                { name: "Index(Repair Stations)", baseChance: 20, indirect: Indirect.Sometimes },
                { name: "Index(Scanalyzers)", baseChance: 30, indirect: Indirect.Sometimes },
                { name: "Index(Terminals)", baseChance: 50, indirect: Indirect.Sometimes },
                { name: "Inventory(Component)", baseChance: 30, indirect: Indirect.Sometimes },
                { name: "Inventory(Prototype)", baseChance: 10, indirect: Indirect.Sometimes },
                { name: "Layout(Zone)", baseChance: 50, indirect: Indirect.Sometimes },
                { name: "Manifests", baseChance: 50, indirect: Indirect.Sometimes },
                { name: "Traps(Disarm)", baseChance: 45, indirect: Indirect.Sometimes },
                { name: "Traps(Locate)", baseChance: 60, indirect: Indirect.Sometimes },
                { name: "Traps(Reprogram)", baseChance: 30, indirect: Indirect.Sometimes },
                { name: "Prototypes", baseChance: 50, indirect: Indirect.Sometimes },
                { name: "Recall(Assault)", baseChance: 0, indirect: Indirect.Sometimes },
                { name: "Recall(Investigation)", baseChance: 30, indirect: Indirect.Sometimes },
                { name: "Recall(Extermination)", baseChance: 10, indirect: Indirect.Sometimes },
                { name: "Recall(Reinforcements)", baseChance: 20, indirect: Indirect.Sometimes },
                { name: "Schematic([Part Name]) - rating 1", baseChance: 41, indirect: Indirect.Sometimes },
                { name: "Schematic([Part Name]) - rating 2", baseChance: 37, indirect: Indirect.Sometimes },
                { name: "Schematic([Part Name]) - rating 2*", baseChance: 31, indirect: Indirect.Sometimes },
                { name: "Schematic([Part Name]) - rating 3", baseChance: 33, indirect: Indirect.Sometimes },
                { name: "Schematic([Part Name]) - rating 3*", baseChance: 24, indirect: Indirect.Sometimes },
                { name: "Schematic([Part Name]) - rating 4", baseChance: 29, indirect: Indirect.Sometimes },
                { name: "Schematic([Part Name]) - rating 4*", baseChance: 17, indirect: Indirect.Sometimes },
                { name: "Schematic([Part Name]) - rating 5", baseChance: 25, indirect: Indirect.Sometimes },
                { name: "Schematic([Part Name]) - rating 5*", baseChance: 10, indirect: Indirect.Sometimes },
                { name: "Schematic([Part Name]) - rating 6", baseChance: 21, indirect: Indirect.Sometimes },
                { name: "Schematic([Part Name]) - rating 6*", baseChance: 3, indirect: Indirect.Sometimes },
                { name: "Schematic([Part Name]) - rating 7", baseChance: 17, indirect: Indirect.Sometimes },
                { name: "Schematic([Part Name]) - rating 7*", baseChance: -4, indirect: Indirect.Sometimes },
                { name: "Schematic([Part Name]) - rating 8", baseChance: 13, indirect: Indirect.Sometimes },
                { name: "Schematic([Part Name]) - rating 8*", baseChance: -11, indirect: Indirect.Sometimes },
                { name: "Schematic([Part Name]) - rating 9", baseChance: 9, indirect: Indirect.Sometimes },
                { name: "Schematic([Part Name]) - rating 9*", baseChance: -18, indirect: Indirect.Sometimes },
                { name: "Schematic([Bot Name]) - tier 1", baseChance: 44, indirect: Indirect.Sometimes },
                { name: "Schematic([Bot Name]) - tier 2", baseChance: 38, indirect: Indirect.Sometimes },
                { name: "Schematic([Bot Name]) - tier 3", baseChance: 32, indirect: Indirect.Sometimes },
                { name: "Schematic([Bot Name]) - tier 4", baseChance: 26, indirect: Indirect.Sometimes },
                { name: "Schematic([Bot Name]) - tier 5", baseChance: 20, indirect: Indirect.Sometimes },
                { name: "Schematic([Bot Name]) - tier 6", baseChance: 14, indirect: Indirect.Sometimes },
                { name: "Schematic([Bot Name]) - tier 7", baseChance: 8, indirect: Indirect.Sometimes },
                { name: "Schematic([Bot Name]) - tier 8", baseChance: 2, indirect: Indirect.Sometimes },
                { name: "Schematic([Bot Name]) - tier 9", baseChance: -4, indirect: Indirect.Sometimes },
                { name: "Traps(Disarm)", baseChance: 45, indirect: Indirect.Sometimes },
                { name: "Trojan(Assimilate)", baseChance: 40, indirect: Indirect.Always, spoilerLevel: Spoiler.Spoilers },
                { name: "Trojan(Botnet)", baseChance: 50, indirect: Indirect.Always, spoilerLevel: Spoiler.Spoilers },
                { name: "Trojan(Detonate)", baseChance: 20, indirect: Indirect.Always, spoilerLevel: Spoiler.Spoilers },
                { name: "Trojan(Disrupt)", baseChance: 30, indirect: Indirect.Always, spoilerLevel: Spoiler.Spoilers },
                { name: "Trojan(Operators)", baseChance: 40, indirect: Indirect.Always, spoilerLevel: Spoiler.Spoilers },
                { name: "Trojan(Track)", baseChance: 70, indirect: Indirect.Always, spoilerLevel: Spoiler.Spoilers },
            ],
        },
        {
            name: "Terminal - Door",
            dataCoreApplies: false,
            hacks: [
                { name: "Open - Access surface exit", baseChance: 7, indirect: Indirect.Never, level1DirectOnly: true, spoilerLevel: Spoiler.Spoilers },
                { name: "Open - Access Command backdoors", baseChance: 30, indirect: Indirect.Never, level1DirectOnly: true, spoilerLevel: Spoiler.Redacted },
                { name: "Open - Command Main.C door", baseChance: 60, indirect: Indirect.Never, level1DirectOnly: true, spoilerLevel: Spoiler.Redacted },
                { name: "Open - Extension A7 cell", baseChance: 30, indirect: Indirect.Never, level1DirectOnly: true, spoilerLevel: Spoiler.Spoilers },
                { name: "Open - Extension derelict cell", baseChance: 30, indirect: Indirect.Never, level1DirectOnly: true, spoilerLevel: Spoiler.Spoilers },
                { name: "Open - Factory Extension exit", baseChance: 60, indirect: Indirect.Never, level1DirectOnly: true, spoilerLevel: Spoiler.Spoilers },
                { name: "Open - Quarantine Sigix Terminator vault", baseChance: 30, indirect: Indirect.Never, level1DirectOnly: true, spoilerLevel: Spoiler.Spoilers },
                { name: "Open - Quarantine Sigix Warrior chamber", baseChance: 30, indirect: Indirect.Never, level1DirectOnly: true, spoilerLevel: Spoiler.Spoilers },
                { name: "Open - Research Quarantine exit", baseChance: 30, indirect: Indirect.Never, level1DirectOnly: true, spoilerLevel: Spoiler.Spoilers },
                { name: "Open - Section 7 L2 lab backdoor", baseChance: 30, indirect: Indirect.Never, level1DirectOnly: true, spoilerLevel: Spoiler.Redacted },
                { name: "Open - Section 7 LRC cache", baseChance: 60, indirect: Indirect.Never, level1DirectOnly: true, spoilerLevel: Spoiler.Redacted },
                { name: "Open - Section 7 Terrabomb vault", baseChance: 60, indirect: Indirect.Never, level1DirectOnly: true, spoilerLevel: Spoiler.Redacted },
                { name: "Open - Section 7 TR vault", baseChance: 60, indirect: Indirect.Never, level1DirectOnly: true, spoilerLevel: Spoiler.Redacted },
                { name: "Open - Section 7 Matter Drive vault", baseChance: 30, indirect: Indirect.Never, level1DirectOnly: true, spoilerLevel: Spoiler.Redacted },
                { name: "Open - Storage low value vault", baseChance: 80, indirect: Indirect.Never, level1DirectOnly: true },
                { name: "Open - Storage medium value vault", baseChance: 60, indirect: Indirect.Never, level1DirectOnly: true },
                { name: "Open - Storage high value vault", baseChance: 30, indirect: Indirect.Never, level1DirectOnly: true },
            ],
        },
    ];

    // Updates all hacking tables based on the spoiler level and user inputs
    function updateHackTables() {
        // Remove old tables
        const tableBody = $("#hacksTableBody");
        tableBody.empty();

        const hackBonus = parseIntOrDefault($("#offensiveBonus").val(), 0);

        const numBotnets = parseIntOrDefault($("#botnets").val(), 0);
        let botnetBonus = 0;
        if (numBotnets === 1) {
            botnetBonus = 6;
        }
        else if (numBotnets === 2) {
            botnetBonus = 9;
        }
        else if (numBotnets > 2) {
            botnetBonus = 9 + numBotnets - 2;
        }

        const numOperators = parseIntOrDefault($("#operators").val(), 0);
        let operatorBonus = 0;
        if (numOperators === 1) {
            operatorBonus = 10;
        }
        else if (numOperators === 2) {
            operatorBonus = 15;
        }
        else if (numOperators === 3) {
            operatorBonus = 17;
        }
        else if (numOperators > 3) {
            operatorBonus = 17 + numOperators - 3;
        }

        let corruptionPenalty = Math.floor(parseIntOrDefault($("#corruption").val(), 0) / 3);
        const hackModifier = hackBonus + botnetBonus + operatorBonus - corruptionPenalty;

        const nameValue = ($("#name").val() as string).toLowerCase();
        const filterName = nameValue.length > 0;
        const dataCoreActive = $("#dataCoreYes").hasClass("active");
        const spoilerLevel = getSpoilersState();

        const tableHtml = allMachines.map(machine => {
            const hackRows = machine.hacks.filter(hack => {
                // Determine which hacks to show
                if (filterName && !hack.name.toLowerCase().includes(nameValue)) {
                    return false;
                }

                if (spoilerLevel === Spoiler.Redacted) {
                    return true;
                }
                else if (spoilerLevel === Spoiler.Spoilers) {
                    return hack.spoilerLevel !== Spoiler.Redacted;
                }
                else {
                    return hack.spoilerLevel === Spoiler.None || hack.spoilerLevel === undefined;
                }
            }).map(hack => {
                const direct = hack.indirect !== Indirect.Always;
                const indirect = hack.indirect !== Indirect.Never;
                // Calculate the hack chances for direct/indirect hacks at
                // all terminal levels and apply hacking modifier
                // Indirect penalty is 15 per security level on top of the
                // standard security level penalty, level penalty is 100% for
                // level 1 terminal, 50% for level 2, and 25% for level 3
                let hackValues: (number | null)[];
                if (hack.level1DirectOnly) {
                    // Special case of restricted level 1 terminals with only 1 hack
                    hackValues = [hack.baseChance, null, null, null, null, null];
                }
                else {
                    hackValues = [
                        direct ? hack.baseChance : null,
                        indirect ? hack.baseChance - (direct ? 15 : 0) : null,
                        direct ? Math.floor(hack.baseChance / 2) : null,
                        indirect ? Math.floor(hack.baseChance / 2) - (direct ? 30 : 0) : null,
                        direct ? Math.floor(hack.baseChance / 4) : null,
                        indirect ? Math.floor(hack.baseChance / 4) - (direct ? 45 : 0) : null,
                    ];
                }

                const hackCells = hackValues.map(percentage => {
                    if (percentage === null) {
                        return null;
                    }

                    if (machine.dataCoreApplies && dataCoreActive && percentage > 0) {
                        // If data core applies and is active then multiply the
                        // base percentage by 1.5, only if > 0
                        percentage = Math.floor(percentage * 1.5);
                    }

                    return percentage + hackModifier;
                }).map(percentage => percentage === null ? "<td />" : `<td>${percentage}%</td>`)
                    .join("");

                const row = `<tr><td>${hack.name}</td>${hackCells}</tr>`;

                return row;
            }).join("");

            // Hide machines with all results filtered out
            const visible = hackRows.length > 0;
            const machineRow = `<tr><td class="hack-category-row${visible ? "" : " not-visible"}">${machine.name}</td></tr>`;

            return machineRow + hackRows;
        }).join("");

        tableBody.append($(tableHtml));
    }

    // Initialize the page state
    function init() {
        // Load spoilers saved state
        $("#spoilers").text(getSpoilersState());

        // Set initial state
        resetInput();

        // Register handlers
        $("#spoilersDropdown > button").on("click", (e) => {
            const state = $(e.target).text();
            $("#spoilers").text(state);
            setSpoilersState(state);
            ($("#spoilersDropdown > button") as any).tooltip("hide");
            updateHackTables();
        });
        $("#reset").on("click", () => {
            ($("#reset") as any).tooltip("hide");
            resetInput();
        });
        $("#name").on("input", updateHackTables);
        $("#dataCoreContainer > label > input").on("change", () => {
            updateHackTables();
        });
        $("#offensiveBonus").on("input", updateHackTables);
        $("#corruption").on("input", updateHackTables);
        $("#operators").on("input", updateHackTables);
        $("#botnets").on("input", updateHackTables);

        // Enable tooltips
        ($('[data-toggle="tooltip"]') as any).tooltip();
    }

    // Resets all filters
    function resetInput() {
        // Reset text inputs
        $("#name").val("");
        $("#offensiveBonus").val("");
        $("#corruption").val("");
        $("#operators").val("");
        $("#botnets").val("");

        // Reset button groups
        resetButtonGroup($("#dataCoreContainer"));

        updateHackTables();
    }
});