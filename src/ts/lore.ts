import lore from "../json/lore.json";
import * as jQuery from "jquery";
import "bootstrap";
import { createHeader, getSpoilerState, registerDisableAutocomplete, setSpoilerState } from "./utilities/commonJquery";
import { escapeHtml } from "./utilities/common";
import { Spoiler } from "./types/commonTypes";

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
                Archives: "Spoiler",
                "Brute Force Hacks": "Spoiler",
                Cogmind: "Spoiler",
                "Containment Facilitator": "Spoiler",
                "Core Stripper": "Spoiler",
                "Derelict Prototype": "Spoiler",
                Disintegrator: "Spoiler",
                Dragon: "Spoiler",
                EMDS: "Spoiler",
                Extension: "Spoiler",
                "Gamma Refractor": "Redacted",
                "Heavy Quantum Rifle": "Spoiler",
                "Heroes of Zion": "Spoiler",
                "Hub_04(d)": "Spoiler",
                Hydra: "Spoiler",
                "Hypervelocity EM Gauss Rifle": "Spoiler",
                Knight: "Spoiler",
                "L-Cannon": "Redacted",
                "LRC Attachments": "Redacted",
                "LRC-V3": "Redacted",
                "MAIN.C": "Spoiler",
                "Matter Drive": "Spoiler",
                "Myomer Exoskeleton": "Spoiler",
                "Null Cannon": "Spoiler",
                "Omega Cannon": "Spoiler",
                "Particle Cleaver": "Spoiler",
                Perforator: "Spoiler",
                "Potential Cannon": "Spoiler",
                Quarantine: "Spoiler",
                "Regenerative Plating": "Spoiler",
                "SHELL Armor": "Spoiler",
                "Section 7": "Redacted",
                Shearcannon: "Redacted",
                Sheargun: "Redacted",
                Sigix: "Spoiler",
                "Sigix Access Protocol": "Spoiler",
                "Sigix Autopsy": "Spoiler",
                "Sigix Broadsword": "Spoiler",
                "Sigix Exoskeleton": "Redacted",
                "Sigix Technology": "Spoiler",
                "Slip Nodes": "Spoiler",
                "Tachyon Dispersion Ray": "Spoiler",
                Terminator: "Spoiler",
                Terrabomb: "Spoiler",
                Testing: "Spoiler",
                "Transdimensional Reconstructor": "Spoiler",
                Trojans: "Spoiler",
                Troll: "Spoiler",
                "Unknown Artifact": "Spoiler",
                Warlord: "Spoiler",
                "Warp Gun": "Spoiler",
                "Z-bomb Delivery System": "Spoiler",
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
            groupLevel: "Spoiler",
        },
        "Cetus Records": {
            content: "Records obtainable via terminals in the Cetus map as part of the Extension branch.",
            groupLevel: "Spoiler",
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
            groupLevel: "Spoiler",
        },
        "WAR.Sys Records": {
            content: "Records obtainable on terminals on the Warlord map.",
            groupLevel: "Spoiler",
        },
        "Zhirov Records": {
            content: "Records obtainable on terminals on the Zhirov map.",
            groupLevel: "Spoiler",
        },
        "5H-AD0 Dialogue": {
            content: "Dialogue obtainable by speaking with the rarely spawning bot 5H-AD0 in the Zion Deep Caves map.",
            groupLevel: "Spoiler",
        },
        "Architect Dialogue": {
            content: "Dialogue obtainable by speaking with the Architect in the Access 0 map.",
            groupLevel: "Redacted",
        },
        "Base Dialogue": {
            content: "Dialogue obtainable by speaking with various derelicts on the Warlord map.",
            groupLevel: "Spoiler",
        },
        "Data Miner Dialogue": {
            content: "Dialogue obtainable by speaking with the Data Miner on their map.",
            groupLevel: "Spoiler",
        },
        "EX-BIN Dialogue": {
            content: "Dialogue obtainable by speaking with the exile EX-BIN on the Exiles map.",
            groupLevel: "None",
            entries: {
                "2": "Spoiler",
            },
        },
        "EX-DEC Dialogue": {
            content: "Dialogue obtainable by speaking with the exile EX-DEC on the Exiles map.",
            groupLevel: "None",
            entries: {
                "2": "Spoiler",
            },
        },
        "EX-HEX Dialogue": {
            content: "Dialogue obtainable by speaking with the exile EX-HEX on various maps.",
            groupLevel: "None",
            entries: {
                "2": "Spoiler",
            },
        },
        "Exiles Dialogue": {
            content: "Dialogue obtainable by speaking with various Exile-aligned derelicts on the Exiles map.",
            groupLevel: "None",
        },
        "Imprinter Dialogue": {
            content: "Dialogue obtainable by speaking with the Imprinter on the Zion and Zion Deep Caves maps.",
            groupLevel: "Spoiler",
        },
        "MAIN.C Dialogue": {
            content: "Dialogue obtainable by speaking with MAIN.C on the Command map.",
            groupLevel: "Redacted",
        },
        "Revision 17 Dialogue": {
            content: "Dialogue obtainable by speaking with Revision 17 on various maps.",
            groupLevel: "Spoiler",
        },
        "Sigix Dialogue": {
            content:
                "Dialogue obtainable by speaking with the Sigix Warrior located in Quarantine after using a " +
                "Core Reset Matrix to decipher the messages on various maps.",
            groupLevel: "Spoiler",
            entries: {
                "2": "Redacted",
                "3": "Redacted",
            },
        },
        "Warlord Dialogue": {
            content: "Dialogue obtainable by speaking with Warlord on various maps.",
            groupLevel: "Spoiler",
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
            groupLevel: "Spoiler",
            entries: {
                "8": "Redacted",
                "9": "Redacted",
            },
        },
        "Zion Dialogue": {
            content: "Dialogue obtainable by speaking with various bots on the Zion map.",
            groupLevel: "Spoiler",
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
            groupLevel: "Spoiler",
        },
    };

    // Initialize the page state
    function init() {
        createHeader("Lore", $("#headerContainer"));
        registerDisableAutocomplete($(document));

        // Set initial state
        resetInput();

        // Register handlers
        $("#spoilerDropdown > button").on("click", (e) => {
            const state = $(e.target).text();
            $("#spoilers").text(state);
            setSpoilerState(state);
            ($("#spoilerDropdown > button") as any).tooltip("hide");
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
        const spoilerLevel = getSpoilerState();

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
                    } else if (spoilerLevel === "Spoiler" && loreGroup.groupLevel === "Redacted") {
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
                            } else if (spoilerLevel === "Spoiler" && spoilerEntry === "Redacted") {
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

                        const row = `<tr><td>${name}</td><td class="sans-serif-font">${content}</td></tr>`;

                        return row;
                    })
                    .join("");

                const groupTitleRowHtml =
                    `<tr><td class="lore-category-row">${groupName}</td><td class="sans-serif-font">` +
                    `${loreGroup?.content === undefined ? "" : loreGroup.content}</td></tr>`;

                return groupTitleRowHtml + groupRowsHtml;
            })
            .join("");
        tableBody.append($(tableHtml) as any);
        (tableBody.find('[data-toggle="tooltip"]') as any).tooltip();
    }
});
