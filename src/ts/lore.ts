import * as lore from "../json/lore.json";
import * as jQuery from "jquery";
import "bootstrap";
import { createHeader, getSpoilersState, registerDisableAutocomplete, setSpoilersState } from "./commonJquery";
import { escapeHtml } from "./common";
import { Spoiler } from "./commonTypes";

const jq = jQuery.noConflict();
jq(function ($) {
    $(() => init());

    type JsonLoreEntry = {
        "Name/Number": string;
        Content: string;
    };

    type LoreGroup = {
        groupLevel: Spoiler;
        content: string;
        entries?: Record<string, Spoiler>;
    };

    const spoilerGroups: Record<string, LoreGroup> = {
        "0b10 Records": {
            content:
                "Various records kept by 0b10. Most are obtainable at regular 0b10-controlled terminals via query() hacks.",
            groupLevel: "None",
            entries: {
                Archives: "Spoilers",
                "Brute Force Hacks": "Spoilers",
                Cogmind: "Spoilers",
                "Containment Facilitator": "Spoilers",
                "Core Stripper": "Spoilers",
                "Derelict Prototype": "Spoilers",
                Disintegrator: "Spoilers",
                Dragon: "Spoilers",
                EMDS: "Spoilers",
                Extension: "Spoilers",
                "Gamma Refractor": "Redacted",
                "Heavy Quantum Rifle": "Spoilers",
                "Heroes of Zion": "Spoilers",
                "Hub_04(d)": "Spoilers",
                Hydra: "Spoilers",
                "Hypervelocity EM Gauss Rifle": "Spoilers",
                Knight: "Spoilers",
                "L-Cannon": "Redacted",
                "LRC Attachments": "Redacted",
                "LRC-V3": "Redacted",
                "MAIN.C": "Spoilers",
                "Matter Drive": "Spoilers",
                "Myomer Exoskeleton": "Spoilers",
                "Null Cannon": "Spoilers",
                "Omega Cannon": "Spoilers",
                "Particle Cleaver": "Spoilers",
                Perforator: "Spoilers",
                "Potential Cannon": "Spoilers",
                Quarantine: "Spoilers",
                "Regenerative Plating": "Spoilers",
                "SHELL Armor": "Spoilers",
                "Section 7": "Redacted",
                Shearcannon: "Redacted",
                Sheargun: "Redacted",
                Sigix: "Spoilers",
                "Sigix Access Protocol": "Spoilers",
                "Sigix Autopsy": "Spoilers",
                "Sigix Broadsword": "Spoilers",
                "Sigix Exoskeleton": "Redacted",
                "Sigix Technology": "Spoilers",
                "Slip Nodes": "Spoilers",
                "Tachyon Dispersion Ray": "Spoilers",
                Terminator: "Spoilers",
                Terrabomb: "Spoilers",
                Testing: "Spoilers",
                "Transdimensional Reconstructor": "Spoilers",
                Trojans: "Spoilers",
                Troll: "Spoilers",
                "Unknown Artifact": "Spoilers",
                Warlord: "Spoilers",
                "Warp Gun": "Spoilers",
                "Z-bomb Delivery System": "Spoilers",
            },
        },
        "Access_0 Records": {
            content:
                "Records obtainable in a terminal on the west side of Access 0. They are only accessible " +
                "with a very strong weapon to penetrate the shell or by acquiring the Architect " +
                "Data Core by destroying the Architect.",
            groupLevel: "Redacted",
        },
        "Archives Records": {
            content:
                "Records obtainable in the Archives map as part of the Extension branch. Only possible " +
                "during a rare event where Zhirov is present here instead of at his standard Lab.",
            groupLevel: "Spoilers",
        },
        "Cetus Records": {
            content: "Records obtainable via terminals in the Cetus map as part of the Extension branch.",
            groupLevel: "Spoilers",
        },
        "Exiles Records": {
            content: "Records obtainable via terminals in the Exiles map.",
            groupLevel: "None",
        },
        "Lab Records": {
            content:
                "Records obtainable via terminals in the secret Lab hidden on the west side of Armory. " +
                "Most records can only be decoded after using the Data Conduit machine on the Data Miner's map.",
            groupLevel: "Redacted",
        },
        "Oracle Records": {
            content: "Records obtainable on terminals on the Data Miner map.",
            groupLevel: "Spoilers",
        },
        "WAR.Sys Records": {
            content: "Records obtainable on terminals on the Warlord map.",
            groupLevel: "Spoilers",
        },
        "Zhirov Records": {
            content: "Records obtainable on terminals on the Zhirov map.",
            groupLevel: "Spoilers",
        },
        "5H-AD0 Dialogue": {
            content: "Dialogue obtainable by speaking with the rarely spawning bot 5H-AD0 in the Zion Deep Caves map.",
            groupLevel: "Spoilers",
        },
        "Architect Dialogue": {
            content: "Dialogue obtainable by speaking with the Architect in the Access 0 map.",
            groupLevel: "Redacted",
        },
        "Base Dialogue": {
            content: "Dialogue obtainable by speaking with various derelicts on the Warlord map.",
            groupLevel: "Spoilers",
        },
        "Data Miner Dialogue": {
            content: "Dialogue obtainable by speaking with the Data Miner on their map.",
            groupLevel: "Spoilers",
        },
        "EX-BIN Dialogue": {
            content: "Dialogue obtainable by speaking with the exile EX-BIN on the Exiles map.",
            groupLevel: "None",
            entries: {
                "2": "Spoilers",
            },
        },
        "EX-DEC Dialogue": {
            content: "Dialogue obtainable by speaking with the exile EX-DEC on the Exiles map.",
            groupLevel: "None",
            entries: {
                "2": "Spoilers",
            },
        },
        "EX-HEX Dialogue": {
            content: "Dialogue obtainable by speaking with the exile EX-HEX on various maps.",
            groupLevel: "None",
            entries: {
                "2": "Spoilers",
            },
        },
        "Exiles Dialogue": {
            content: "Dialogue obtainable by speaking with various Exile-aligned derelicts on the Exiles map.",
            groupLevel: "None",
        },
        "Imprinter Dialogue": {
            content: "Dialogue obtainable by speaking with the Imprinter on the Zion and Zion Deep Caves maps.",
            groupLevel: "Spoilers",
        },
        "MAIN.C Dialogue": {
            content: "Dialogue obtainable by speaking with MAIN.C on the Command map.",
            groupLevel: "Redacted",
        },
        "Revision 17 Dialogue": {
            content: "Dialogue obtainable by speaking with Revision 17 on various maps.",
            groupLevel: "Spoilers",
        },
        "Sigix Dialogue": {
            content:
                "Dialogue obtainable by speaking with the Sigix Warrior located in Quarantine after using a " +
                "Core Reset Matrix to decipher the messages on various maps.",
            groupLevel: "Spoilers",
            entries: {
                "2": "Redacted",
                "3": "Redacted",
            },
        },
        "Warlord Dialogue": {
            content: "Dialogue obtainable by speaking with Warlord on various maps.",
            groupLevel: "Spoilers",
            entries: {
                "6": "Redacted",
                "7": "Redacted",
                "8": "Redacted",
                "9": "Redacted",
                "10": "Redacted",
                "11": "Redacted",
            },
        },
        "Zhirov Dialogue": {
            content: "Dialogue obtainable by speaking with Zhirov on various maps.",
            groupLevel: "Spoilers",
            entries: {
                "8": "Redacted",
                "9": "Redacted",
            },
        },
        "Zion Dialogue": {
            content: "Dialogue obtainable by speaking with various bots on the Zion map.",
            groupLevel: "Spoilers",
        },
        "Common Analysis": {
            content:
                "Analyses about regular 0b10 bots, obtainable at regular 0b10-controlled terminals via analysis() hacks.",
            groupLevel: "None",
        },
        "Derelict Analysis": {
            content:
                "Analyses about derelict bots, obtainable at regular 0b10-controlled terminals via analysis() hacks.",
            groupLevel: "None",
        },
        "Prototype Analysis": {
            content:
                "Analyses about prototype 0b10 bots, obtainable at regular 0b10-controlled terminals via analysis() hacks.",
            groupLevel: "Spoilers",
        },
    };

    // Initialize the page state
    function init() {
        createHeader("Lore", $("#headerContainer"));
        registerDisableAutocomplete($(document));

        // Set initial state
        resetInput();

        // Register handlers
        $("#spoilersDropdown > button").on("click", (e) => {
            const state = $(e.target).text();
            $("#spoilers").text(state);
            setSpoilersState(state);
            ($("#spoilersDropdown > button") as any).tooltip("hide");
            updateLoreTables();
        });
        $("#reset").on("click", () => {
            ($("#reset") as any).tooltip("hide");
            resetInput();
        });
        $("#nameNumberInput").on("input", updateLoreTables);
        $("#contentInput").on("input", updateLoreTables);
        $("#groupInput").on("input", updateLoreTables);

        // Enable tooltips
        ($('[data-toggle="tooltip"]') as any).tooltip();
    }

    // Resets all filters
    function resetInput() {
        // Reset text inputs
        $("#nameNumberInput").val("");
        $("#contentInput").val("");
        $("#groupInput").val("");

        updateLoreTables();
    }

    // Updates all lore tables based on the spoiler level and user inputs
    function updateLoreTables() {
        // Remove old tables
        const tableBody = $("#loreTableBody");
        (tableBody.find('[data-toggle="tooltip"]') as any).tooltip("dispose");
        tableBody.empty();

        const nameValue = ($("#nameNumberInput").val() as string).toLowerCase();
        const filterName = nameValue.length > 0;
        const contentValue = ($("#contentInput").val() as string).toLowerCase();
        const filterContent = contentValue.length > 0;
        const groupValue = ($("#groupInput").val() as string).toLowerCase();
        const filterGroup = groupValue.length > 0;
        const spoilerLevel = getSpoilersState();

        const tableHtml = Object.keys(lore)
            .map((groupName) => {
                if (groupName === "default") {
                    // Not sure why this "default" pops up but it messes things up
                    // Maybe an artifact of being imported as a JSON file
                    return "";
                }

                // Filter group name
                if (filterGroup && !groupName.toLowerCase().includes(groupValue)) {
                    return "";
                }

                let loreGroup: LoreGroup | undefined;

                // Filter group by spoiler category
                if (groupName in spoilerGroups) {
                    loreGroup = spoilerGroups[groupName];
                    if (spoilerLevel === "None" && loreGroup.groupLevel !== "None") {
                        return "";
                    } else if (spoilerLevel === "Spoilers" && loreGroup.groupLevel === "Redacted") {
                        return "";
                    }
                }

                const group = lore[groupName];
                const groupRows = Object.keys(group)
                    .map((idx) => {
                        return group[idx] as JsonLoreEntry;
                    })
                    .filter((entry) => {
                        // Filter by entry name
                        if (filterName && !entry["Name/Number"].toLowerCase().includes(nameValue)) {
                            return false;
                        }

                        // Filter by entry content
                        if (filterContent && !entry["Content"].toLowerCase().includes(contentValue)) {
                            return false;
                        }

                        // Filter by spoiler level
                        if (
                            loreGroup !== undefined &&
                            loreGroup.entries !== undefined &&
                            entry["Name/Number"] in loreGroup.entries
                        ) {
                            const spoilerEntry = loreGroup.entries[entry["Name/Number"]];
                            if (spoilerLevel === "None" && spoilerEntry !== "None") {
                                return false;
                            } else if (spoilerLevel === "Spoilers" && spoilerEntry === "Redacted") {
                                return false;
                            }
                        }

                        return true;
                    });

                // Hide group entirely if all entries are filtered out
                if (groupRows.length === 0) {
                    return "";
                }

                // Create html rows
                const groupRowsHtml = groupRows
                    .map((entry) => {
                        const name = entry["Name/Number"];
                        const content = escapeHtml(entry["Content"]);

                        const row = `<tr><td>${name}</td><td>${content}</td></tr>`;

                        return row;
                    })
                    .join("");

                const groupTitleRowHtml =
                    `<tr><td class="lore-category-row">${groupName}</td><td>` +
                    `${loreGroup?.content === undefined ? "" : loreGroup.content}</td></tr>`;

                return groupTitleRowHtml + groupRowsHtml;
            })
            .join("");
        tableBody.append($(tableHtml) as any);
        (tableBody.find('[data-toggle="tooltip"]') as any).tooltip();
    }
});
