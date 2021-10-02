import * as jQuery from "jquery";
import "bootstrap";
import { createHeader, getSpoilersState, registerDisableAutocomplete, resetButtonGroup } from "./commonJquery";
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
        description: string;
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
                { name: "Build - part rating 1", description: "Initiate build process for currently loaded schematic.", baseChance: 67, indirect: Indirect.Never },
                { name: "Build - part rating 2", description: "Initiate build process for currently loaded schematic.", baseChance: 64, indirect: Indirect.Never },
                { name: "Build - part rating 2*", description: "Initiate build process for currently loaded schematic.", baseChance: 60, indirect: Indirect.Never },
                { name: "Build - part rating 3", description: "Initiate build process for currently loaded schematic.", baseChance: 61, indirect: Indirect.Never },
                { name: "Build - part rating 3*", description: "Initiate build process for currently loaded schematic.", baseChance: 55, indirect: Indirect.Never },
                { name: "Build - part rating 4", description: "Initiate build process for currently loaded schematic.", baseChance: 58, indirect: Indirect.Never },
                { name: "Build - part rating 4*", description: "Initiate build process for currently loaded schematic.", baseChance: 50, indirect: Indirect.Never },
                { name: "Build - part rating 5", description: "Initiate build process for currently loaded schematic.", baseChance: 55, indirect: Indirect.Never },
                { name: "Build - part rating 5*", description: "Initiate build process for currently loaded schematic.", baseChance: 45, indirect: Indirect.Never },
                { name: "Build - part rating 6", description: "Initiate build process for currently loaded schematic.", baseChance: 52, indirect: Indirect.Never },
                { name: "Build - part rating 6*", description: "Initiate build process for currently loaded schematic.", baseChance: 40, indirect: Indirect.Never },
                { name: "Build - part rating 7", description: "Initiate build process for currently loaded schematic.", baseChance: 49, indirect: Indirect.Never },
                { name: "Build - part rating 7*", description: "Initiate build process for currently loaded schematic.", baseChance: 35, indirect: Indirect.Never },
                { name: "Build - part rating 8", description: "Initiate build process for currently loaded schematic.", baseChance: 46, indirect: Indirect.Never },
                { name: "Build - part rating 8*", description: "Initiate build process for currently loaded schematic.", baseChance: 30, indirect: Indirect.Never },
                { name: "Build - part rating 9", description: "Initiate build process for currently loaded schematic.", baseChance: 43, indirect: Indirect.Never },
                { name: "Build - part rating 9*", description: "Initiate build process for currently loaded schematic.", baseChance: 25, indirect: Indirect.Never },
                { name: "Build - robot tier 1", description: "Initiate build process for currently loaded schematic.", baseChance: 46, indirect: Indirect.Never },
                { name: "Build - robot tier 2", description: "Initiate build process for currently loaded schematic.", baseChance: 42, indirect: Indirect.Never },
                { name: "Build - robot tier 3", description: "Initiate build process for currently loaded schematic.", baseChance: 38, indirect: Indirect.Never },
                { name: "Build - robot tier 4", description: "Initiate build process for currently loaded schematic.", baseChance: 34, indirect: Indirect.Never },
                { name: "Build - robot tier 5", description: "Initiate build process for currently loaded schematic.", baseChance: 30, indirect: Indirect.Never },
                { name: "Build - robot tier 6", description: "Initiate build process for currently loaded schematic.", baseChance: 26, indirect: Indirect.Never },
                { name: "Build - robot tier 7", description: "Initiate build process for currently loaded schematic.", baseChance: 22, indirect: Indirect.Never },
                { name: "Build - robot tier 8", description: "Initiate build process for currently loaded schematic.", baseChance: 18, indirect: Indirect.Never },
                { name: "Build - robot tier 9", description: "Initiate build process for currently loaded schematic.", baseChance: 14, indirect: Indirect.Never },
                { name: "Force(Download)", description: "Save the current schematic in the player's list of schematic. Also, locks the machine and summons an investigation squad like all force hacks.", baseChance: 80, indirect: Indirect.Always, spoilerLevel: "Spoilers" },
                { name: "Force(Overload)", description: "Render the fabricator inoperable, but cause it to send high corruption-causing arcs of electromagnetic energy at nearby bots for a short while. Also, locks the machine and summons an investigation squad like all force hacks.", baseChance: 80, indirect: Indirect.Always, spoilerLevel: "Spoilers" },
                { name: "Load([Part Name])", description: "Upload a part or robot schematic to prepare for fabrication.", baseChance: 90, indirect: Indirect.Never },
                { name: "Network(Status)", description: "Query system for fabrication network status, including current matter reserves.", baseChance: 90, indirect: Indirect.Never },
                { name: "Trojan(Haulers)", description: "Continuously report the position of all Hauler class robots on the current floor.", baseChance: 50, indirect: Indirect.Always, spoilerLevel: "Spoilers" },
                { name: "Trojan(Prioritize)", description: "Double the speed of fabrication for the current fabricator.", baseChance: 30, indirect: Indirect.Always, spoilerLevel: "Spoilers" },
                { name: "Trojan(Report)", description: "Enable a periodic (~500 turns) broadcast of floor-wide fabricator matter allocations and the total matter allocated.", baseChance: 80, indirect: Indirect.Always, spoilerLevel: "Spoilers" },
                { name: "Trojan(Siphon)", description: "Reduce the amount of matter used for fabrication by 25% on this fabricator.", baseChance: 50, indirect: Indirect.Always, spoilerLevel: "Spoilers" },
            ],
        },
        {
            name: "Garrison",
            dataCoreApplies: false,
            hacks: [
                { name: "Couplers", description: "Query system for current list of installed relay couplers.", baseChance: 40, indirect: Indirect.Never },
                { name: "Force(Eject)", description: "Eject all relay couplers installed in this garrison to the floor. Also, locks the machine and summons an investigation squad like all force hacks.", baseChance: 80, indirect: Indirect.Always, spoilerLevel: "Spoilers" },
                { name: "Force(Jam)", description: "Seal this garrison's access door, preventing squad dispatches from this location and slowing extermination squad response times across the entire floor. Also, locks the machine and summons an investigation squad like all force hacks.", baseChance: 80, indirect: Indirect.Always, spoilerLevel: "Spoilers" },
                { name: "Seal", description: "Seal this garrison's access door, preventing squad dispatches from this location and slowing extermination squad response times across the entire floor.", baseChance: 30, indirect: Indirect.Never },
                { name: "Trojan(Broadcast)", description: "Enable reporting of any garrison dispatch type, robot composition, and position on the floor.", baseChance: 70, indirect: Indirect.Always, spoilerLevel: "Spoilers" },
                { name: "Trojan(Decoy)", description: "Redirect the next dispatch's target to another location, includes dispatches with otherwise perfect tracking like exterminations and assaults.", baseChance: 70, indirect: Indirect.Always, spoilerLevel: "Spoilers" },
                { name: "Trojan(Intercept)", description: "Reduce nearby MAIN.C-controlled bot accuracy by 15%.", baseChance: 50, indirect: Indirect.Always, spoilerLevel: "Spoilers" },
                { name: "Trojan(Redirect)", description: "Redirect all dispatch targets to another location, includes dispatches with otherwise perfect tracking like exterminations and assaults. Each dispatch after the first has an increasing 25% chance of removing the hack, dispatching an extra investigation squad, and disabling the garrison machine.", baseChance: 30, indirect: Indirect.Always, spoilerLevel: "Spoilers" },
                { name: "Trojan(Reprogram)", description: "Reprogram the next dispatch to be allied but noncontrollable to Cogmind (purple color). Doesn't work against special dispatches like Lightnings.", baseChance: 20, indirect: Indirect.Always, spoilerLevel: "Spoilers" },
                { name: "Trojan(Restock)", description: "Dispatches a programmer to the current garrison carrying relay couplers.", baseChance: 70, indirect: Indirect.Always, spoilerLevel: "Spoilers" },
                { name: "Trojan(Watchers)", description: "Continuously report the position of all Watcher class robots on the current floor.", baseChance: 50, indirect: Indirect.Always, spoilerLevel: "Spoilers" },
                { name: "Unlock", description: "Open the entrance to this garrison.", baseChance: 60, indirect: Indirect.Never },
            ],
        },
        {
            name: "Recycling",
            dataCoreApplies: false,
            hacks: [
                { name: "Force(Tunnel)", description: "Reveal the location of a random 0b10-controlled floor. Also, locks the machine and summons an investigation squad like all force hacks.", baseChance: 80, indirect: Indirect.Always, spoilerLevel: "Spoilers" },
                { name: "Retrieve(Components)", description: "Eject up to 10 of the parts contained within.", baseChance: 40, indirect: Indirect.Never },
                { name: "Retrieve(Matter)", description: "Eject all local matter reserves.", baseChance: 60, indirect: Indirect.Never },
                { name: "Recycle([Part Name])", description: "Insert a part to prepare for recycling.", baseChance: 85, indirect: Indirect.Never },
                { name: "Recycling(Report)", description: "Query systems for current inventory and local matter reserves.", baseChance: 90, indirect: Indirect.Never },
                { name: "Recycling(Process)", description: "Initiate recycling process, breaking down all contained parts into matter.", baseChance: 80, indirect: Indirect.Never },
                { name: "Trojan(Mask)", description: "Prevent Recycler robots from picking up any parts in a 15-tile square area around the machine.", baseChance: 40, indirect: Indirect.Always, spoilerLevel: "Spoilers" },
                { name: "Trojan(Monitor)", description: "Enable reporting of any parts inserted into this machine, as well as their integrity.", baseChance: 70, indirect: Indirect.Always, spoilerLevel: "Spoilers" },
                { name: "Trojan(Recyclers)", description: "Continuously report the position of all Recycler class robots on the current floor.", baseChance: 70, indirect: Indirect.Always, spoilerLevel: "Spoilers" },
                { name: "Trojan(Reject)", description: "Prevent parts from being deposited into the recycling machine. Instead, any inserted parts are deposited onto the floor.", baseChance: 70, indirect: Indirect.Always, spoilerLevel: "Spoilers" },
            ],
        },
        {
            name: "Repair Station",
            dataCoreApplies: false,
            hacks: [
                { name: "Scan([Part Name])", description: "Scan a damaged part to prepare for repairs.", baseChance: 80, indirect: Indirect.Never },
                { name: "Repair - rating 1", description: "Initiate repair process for the last scanned part.", baseChance: 67, indirect: Indirect.Never },
                { name: "Repair - rating 2", description: "Initiate repair process for the last scanned part.", baseChance: 64, indirect: Indirect.Never },
                { name: "Repair - rating 2*", description: "Initiate repair process for the last scanned part.", baseChance: 60, indirect: Indirect.Never },
                { name: "Repair - rating 3", description: "Initiate repair process for the last scanned part.", baseChance: 61, indirect: Indirect.Never },
                { name: "Repair - rating 3*", description: "Initiate repair process for the last scanned part.", baseChance: 55, indirect: Indirect.Never },
                { name: "Repair - rating 4", description: "Initiate repair process for the last scanned part.", baseChance: 58, indirect: Indirect.Never },
                { name: "Repair - rating 4*", description: "Initiate repair process for the last scanned part.", baseChance: 50, indirect: Indirect.Never },
                { name: "Repair - rating 5", description: "Initiate repair process for the last scanned part.", baseChance: 55, indirect: Indirect.Never },
                { name: "Repair - rating 5*", description: "Initiate repair process for the last scanned part.", baseChance: 45, indirect: Indirect.Never },
                { name: "Repair - rating 6", description: "Initiate repair process for the last scanned part.", baseChance: 52, indirect: Indirect.Never },
                { name: "Repair - rating 6*", description: "Initiate repair process for the last scanned part.", baseChance: 40, indirect: Indirect.Never },
                { name: "Repair - rating 7", description: "Initiate repair process for the last scanned part.", baseChance: 49, indirect: Indirect.Never },
                { name: "Repair - rating 7*", description: "Initiate repair process for the last scanned part.", baseChance: 35, indirect: Indirect.Never },
                { name: "Repair - rating 8", description: "Initiate repair process for the last scanned part.", baseChance: 46, indirect: Indirect.Never },
                { name: "Repair - rating 8*", description: "Initiate repair process for the last scanned part.", baseChance: 30, indirect: Indirect.Never },
                { name: "Repair - rating 9", description: "Initiate repair process for the last scanned part.", baseChance: 43, indirect: Indirect.Never },
                { name: "Refit", description: "Analyze build configuration and attach backup components to restore vital functionality.", baseChance: 35, indirect: Indirect.Never },
                { name: "Trojan(Mechanics)", description: "Continuously report the position of all Mechanic class robots on the current floor.", baseChance: 70, indirect: Indirect.Always, spoilerLevel: "Spoilers" },
            ],
        },
        {
            name: "Scanalyzer",
            dataCoreApplies: false,
            hacks: [
                { name: "Insert([Part Name])", description: "Insert and scan a part to prepare for analysis.", baseChance: 80, indirect: Indirect.Never },
                { name: "Scanalyze - rating 1", description: "Analyze the contained part to obtain its schematic for use at a Fabricator.", baseChance: 95, indirect: Indirect.Never },
                { name: "Scanalyze - rating 2", description: "Analyze the contained part to obtain its schematic for use at a Fabricator.", baseChance: 90, indirect: Indirect.Never },
                { name: "Scanalyze - rating 2*", description: "Analyze the contained part to obtain its schematic for use at a Fabricator.", baseChance: 84, indirect: Indirect.Never },
                { name: "Scanalyze - rating 3", description: "Analyze the contained part to obtain its schematic for use at a Fabricator.", baseChance: 85, indirect: Indirect.Never },
                { name: "Scanalyze - rating 3*", description: "Analyze the contained part to obtain its schematic for use at a Fabricator.", baseChance: 76, indirect: Indirect.Never },
                { name: "Scanalyze - rating 4", description: "Analyze the contained part to obtain its schematic for use at a Fabricator.", baseChance: 80, indirect: Indirect.Never },
                { name: "Scanalyze - rating 4*", description: "Analyze the contained part to obtain its schematic for use at a Fabricator.", baseChance: 68, indirect: Indirect.Never },
                { name: "Scanalyze - rating 5", description: "Analyze the contained part to obtain its schematic for use at a Fabricator.", baseChance: 75, indirect: Indirect.Never },
                { name: "Scanalyze - rating 5*", description: "Analyze the contained part to obtain its schematic for use at a Fabricator.", baseChance: 60, indirect: Indirect.Never },
                { name: "Scanalyze - rating 6", description: "Analyze the contained part to obtain its schematic for use at a Fabricator.", baseChance: 70, indirect: Indirect.Never },
                { name: "Scanalyze - rating 6*", description: "Analyze the contained part to obtain its schematic for use at a Fabricator.", baseChance: 52, indirect: Indirect.Never },
                { name: "Scanalyze - rating 7", description: "Analyze the contained part to obtain its schematic for use at a Fabricator.", baseChance: 65, indirect: Indirect.Never },
                { name: "Scanalyze - rating 7*", description: "Analyze the contained part to obtain its schematic for use at a Fabricator.", baseChance: 44, indirect: Indirect.Never },
                { name: "Scanalyze - rating 8", description: "Analyze the contained part to obtain its schematic for use at a Fabricator.", baseChance: 60, indirect: Indirect.Never },
                { name: "Scanalyze - rating 8*", description: "Analyze the contained part to obtain its schematic for use at a Fabricator.", baseChance: 36, indirect: Indirect.Never },
                { name: "Scanalyze - rating 9", description: "Analyze the contained part to obtain its schematic for use at a Fabricator.", baseChance: 55, indirect: Indirect.Never },
                { name: "Scanalyze - rating 9*", description: "Analyze the contained part to obtain its schematic for use at a Fabricator.", baseChance: 28, indirect: Indirect.Never },
                { name: "Trojan(Researchers)", description: "Continuously report the position of all Researcher class robots on the current floor.", baseChance: 50, indirect: Indirect.Always, spoilerLevel: "Spoilers" },
            ],
        },
        {
            name: "Terminal",
            dataCoreApplies: true,
            hacks: [
                { name: "Access(Branch)", description: "Locate all branch access points in and out of this floor.", baseChance: 30, indirect: Indirect.Sometimes },
                { name: "Access(Emergency)", description: "Locate all nearby hidden doors.", baseChance: 60, indirect: Indirect.Sometimes },
                { name: "Access(Main)", description: "Locate all main access points in and out of this floor.", baseChance: 20, indirect: Indirect.Sometimes },
                { name: "Alert(Check)", description: "Query system for current alert level.", baseChance: 80, indirect: Indirect.Sometimes },
                { name: "Alert(Purge)", description: "Lower the alert level by 150 influence.", baseChance: 50, indirect: Indirect.Sometimes },
                { name: "Analysis([Bot Name]) - tier 1", description: "Download Complex 0b10 records about the given robot variant, conferring +5% to hit and +10-% damage against it, a -5% to its accuracy when under fire from one. When manually hacking for analyses, a general robot class name can be entered nistead of a specific variant in order to automatically choose a variant relevant at the current depth.", baseChance: 54, indirect: Indirect.Sometimes },
                { name: "Analysis([Bot Name]) - tier 2", description: "Download Complex 0b10 records about the given robot variant, conferring +5% to hit and +10-% damage against it, a -5% to its accuracy when under fire from one. When manually hacking for analyses, a general robot class name can be entered nistead of a specific variant in order to automatically choose a variant relevant at the current depth.", baseChance: 48, indirect: Indirect.Sometimes },
                { name: "Analysis([Bot Name]) - tier 3", description: "Download Complex 0b10 records about the given robot variant, conferring +5% to hit and +10-% damage against it, a -5% to its accuracy when under fire from one. When manually hacking for analyses, a general robot class name can be entered nistead of a specific variant in order to automatically choose a variant relevant at the current depth.", baseChance: 42, indirect: Indirect.Sometimes },
                { name: "Analysis([Bot Name]) - tier 4", description: "Download Complex 0b10 records about the given robot variant, conferring +5% to hit and +10-% damage against it, a -5% to its accuracy when under fire from one. When manually hacking for analyses, a general robot class name can be entered nistead of a specific variant in order to automatically choose a variant relevant at the current depth.", baseChance: 36, indirect: Indirect.Sometimes },
                { name: "Analysis([Bot Name]) - tier 5", description: "Download Complex 0b10 records about the given robot variant, conferring +5% to hit and +10-% damage against it, a -5% to its accuracy when under fire from one. When manually hacking for analyses, a general robot class name can be entered nistead of a specific variant in order to automatically choose a variant relevant at the current depth.", baseChance: 30, indirect: Indirect.Sometimes },
                { name: "Analysis([Bot Name]) - tier 6", description: "Download Complex 0b10 records about the given robot variant, conferring +5% to hit and +10-% damage against it, a -5% to its accuracy when under fire from one. When manually hacking for analyses, a general robot class name can be entered nistead of a specific variant in order to automatically choose a variant relevant at the current depth.", baseChance: 24, indirect: Indirect.Sometimes },
                { name: "Analysis([Bot Name]) - tier 7", description: "Download Complex 0b10 records about the given robot variant, conferring +5% to hit and +10-% damage against it, a -5% to its accuracy when under fire from one. When manually hacking for analyses, a general robot class name can be entered nistead of a specific variant in order to automatically choose a variant relevant at the current depth.", baseChance: 18, indirect: Indirect.Sometimes },
                { name: "Analysis([Bot Name]) - tier 8", description: "Download Complex 0b10 records about the given robot variant, conferring +5% to hit and +10-% damage against it, a -5% to its accuracy when under fire from one. When manually hacking for analyses, a general robot class name can be entered nistead of a specific variant in order to automatically choose a variant relevant at the current depth.", baseChance: 12, indirect: Indirect.Sometimes },
                { name: "Analysis([Bot Name]) - tier 9", description: "Download Complex 0b10 records about the given robot variant, conferring +5% to hit and +10-% damage against it, a -5% to its accuracy when under fire from one. When manually hacking for analyses, a general robot class name can be entered nistead of a specific variant in order to automatically choose a variant relevant at the current depth.", baseChance: 6, indirect: Indirect.Sometimes },
                { name: "Analysis([Bot Name]) - tier 10", description: "Download Complex 0b10 records about the given robot variant, conferring +5% to hit and +10-% damage against it, a -5% to its accuracy when under fire from one. When manually hacking for analyses, a general robot class name can be entered nistead of a specific variant in order to automatically choose a variant relevant at the current depth.", baseChance: 0, indirect: Indirect.Sometimes },
                { name: "Control(Protovariants)", description: "Scan local network for vulnerable protovariant control systems to overload and turn against complex 0b10. Also dispatches a supression assault squad to the protovariant location.", baseChance: 60, indirect: Indirect.Sometimes, spoilerLevel: "Spoilers" },
                { name: "Enumerate(Assaults)", description: "Query system for a list of all assault squads and their current positions.", baseChance: 30, indirect: Indirect.Sometimes },
                { name: "Enumerate(Coupling)", description: "Query system for a list of all coupling squads and their current positions.", baseChance: 30, indirect: Indirect.Sometimes },
                { name: "Enumerate(Exterminations)", description: "Query system for a list of all extermination squads and their current positions.", baseChance: 30, indirect: Indirect.Sometimes },
                { name: "Enumerate(Garrison)", description: "Query system for a list of all garrison squads and their current positions.", baseChance: 40, indirect: Indirect.Sometimes },
                { name: "Enumerate(Guards)", description: "Query system for a list of all nearby security squads and their current positions.", baseChance: 30, indirect: Indirect.Sometimes },
                { name: "Enumerate(Intercept)", description: "Query system for a list of all intercept squads and their current position.", baseChance: 20, indirect: Indirect.Sometimes },
                { name: "Enumerate(Investigations)", description: "Query system for a list of all investigation squads and their current positions.", baseChance: 50, indirect: Indirect.Sometimes },
                { name: "Enumerate(Maintenance)", description: "Query system for a list of all registered maintenance bots and their current positions.", baseChance: 70, indirect: Indirect.Sometimes },
                { name: "Enumerate(Patrols)", description: "Query system for a list of all patrol squads and their current positions.", baseChance: 30, indirect: Indirect.Sometimes },
                { name: "Enumerate(Reinforcements)", description: "Query system for a list of all reinforcement squads and their current positions.", baseChance: 20, indirect: Indirect.Sometimes },
                { name: "Enumerate(Squads)", description: "Query system for a list of all active squads.", baseChance: 60, indirect: Indirect.Sometimes },
                { name: "Enumerate(Surveillance)", description: "Query system for a list of all surveillance squads and their current positions.", baseChance: 30, indirect: Indirect.Sometimes },
                { name: "Enumerate(Transport)", description: "Query system for a list of all transport squads and their current positions.", baseChance: 50, indirect: Indirect.Sometimes },
                { name: "Force(Sabotage)", description: "Attempt to cause a random explosive machine on the floor to detonate. This hack can succeed but fail to have any affect. Also, locks the machine and summons an investigation squad like all force hacks.", baseChance: 60, indirect: Indirect.Always, spoilerLevel: "Spoilers" },
                { name: "Force(Search)", description: "Locate all nearby interactive machines. Also, locks the machine and summons an investigation squad like all force hacks.", baseChance: 80, indirect: Indirect.Always, spoilerLevel: "Spoilers" },
                { name: "Index(Fabricators)", description: "Download coordinates for all Fabricators.", baseChance: 40, indirect: Indirect.Sometimes },
                { name: "Index(Garrisons)", description: "Download coordinates for all Garrisons.", baseChance: 10, indirect: Indirect.Sometimes },
                { name: "Index(Machines)", description: "Download coordinates for all interactive machines.", baseChance: 0, indirect: Indirect.Sometimes },
                { name: "Index(Recycling Units)", description: "Download coordinates for all Recycling Units.", baseChance: 40, indirect: Indirect.Sometimes },
                { name: "Index(Repair Stations)", description: "Download coordinates for all Repair Stations.", baseChance: 20, indirect: Indirect.Sometimes },
                { name: "Index(Scanalyzers)", description: "Download coordinates for all Scanalyzers.", baseChance: 30, indirect: Indirect.Sometimes },
                { name: "Index(Terminals)", description: "Download coordinates for all Terminals.", baseChance: 50, indirect: Indirect.Sometimes },
                { name: "Inventory(Component)", description: "Query system for the location of all non-prototype stockpiles, also revealing their dominant component.", baseChance: 30, indirect: Indirect.Sometimes },
                { name: "Inventory(Prototype)", description: "Query system for the location of all prototype stockpiles, also revealing their dominant component.", baseChance: 10, indirect: Indirect.Sometimes },
                { name: "Layout(Zone)", description: "Reval all nearby terrain belonging to this terminal's zone.", baseChance: 50, indirect: Indirect.Sometimes },
                { name: "Manifests", description: "Query system for a list of all transport squad contents, including whether each is escorted.", baseChance: 50, indirect: Indirect.Sometimes },
                { name: "Prototypes", description: "Download information about prototype parts, making it possible to identify them before use and distinguish between faulty and non-faulty versions.", baseChance: 50, indirect: Indirect.Sometimes },
                { name: "Recall(Assault)", description: "Instruct a random active assault squad to leave the floor.", baseChance: 0, indirect: Indirect.Sometimes },
                { name: "Recall(Investigation)", description: "Instruct a random active investigation squad to leave the floor.", baseChance: 30, indirect: Indirect.Sometimes },
                { name: "Recall(Extermination)", description: "Instruct a random active extermination squad to leave the floor.", baseChance: 10, indirect: Indirect.Sometimes },
                { name: "Recall(Reinforcements)", description: "Instruct a random active reinforcement squad to leave the floor.", baseChance: 20, indirect: Indirect.Sometimes },
                { name: "Schematic([Part Name]) - rating 1", description: "Download the given schematic, making it possible to build this part at a Fabricator. Review all known schematics from the status window.", baseChance: 41, indirect: Indirect.Sometimes },
                { name: "Schematic([Part Name]) - rating 2", description: "Download the given schematic, making it possible to build this part at a Fabricator. Review all known schematics from the status window.", baseChance: 37, indirect: Indirect.Sometimes },
                { name: "Schematic([Part Name]) - rating 2*", description: "Download the given schematic, making it possible to build this part at a Fabricator. Review all known schematics from the status window.", baseChance: 31, indirect: Indirect.Sometimes },
                { name: "Schematic([Part Name]) - rating 3", description: "Download the given schematic, making it possible to build this part at a Fabricator. Review all known schematics from the status window.", baseChance: 33, indirect: Indirect.Sometimes },
                { name: "Schematic([Part Name]) - rating 3*", description: "Download the given schematic, making it possible to build this part at a Fabricator. Review all known schematics from the status window.", baseChance: 24, indirect: Indirect.Sometimes },
                { name: "Schematic([Part Name]) - rating 4", description: "Download the given schematic, making it possible to build this part at a Fabricator. Review all known schematics from the status window.", baseChance: 29, indirect: Indirect.Sometimes },
                { name: "Schematic([Part Name]) - rating 4*", description: "Download the given schematic, making it possible to build this part at a Fabricator. Review all known schematics from the status window.", baseChance: 17, indirect: Indirect.Sometimes },
                { name: "Schematic([Part Name]) - rating 5", description: "Download the given schematic, making it possible to build this part at a Fabricator. Review all known schematics from the status window.", baseChance: 25, indirect: Indirect.Sometimes },
                { name: "Schematic([Part Name]) - rating 5*", description: "Download the given schematic, making it possible to build this part at a Fabricator. Review all known schematics from the status window.", baseChance: 10, indirect: Indirect.Sometimes },
                { name: "Schematic([Part Name]) - rating 6", description: "Download the given schematic, making it possible to build this part at a Fabricator. Review all known schematics from the status window.", baseChance: 21, indirect: Indirect.Sometimes },
                { name: "Schematic([Part Name]) - rating 6*", description: "Download the given schematic, making it possible to build this part at a Fabricator. Review all known schematics from the status window.", baseChance: 3, indirect: Indirect.Sometimes },
                { name: "Schematic([Part Name]) - rating 7", description: "Download the given schematic, making it possible to build this part at a Fabricator. Review all known schematics from the status window.", baseChance: 17, indirect: Indirect.Sometimes },
                { name: "Schematic([Part Name]) - rating 7*", description: "Download the given schematic, making it possible to build this part at a Fabricator. Review all known schematics from the status window.", baseChance: -4, indirect: Indirect.Sometimes },
                { name: "Schematic([Part Name]) - rating 8", description: "Download the given schematic, making it possible to build this part at a Fabricator. Review all known schematics from the status window.", baseChance: 13, indirect: Indirect.Sometimes },
                { name: "Schematic([Part Name]) - rating 8*", description: "Download the given schematic, making it possible to build this part at a Fabricator. Review all known schematics from the status window.", baseChance: -11, indirect: Indirect.Sometimes },
                { name: "Schematic([Part Name]) - rating 9", description: "Download the given schematic, making it possible to build this part at a Fabricator. Review all known schematics from the status window.", baseChance: 9, indirect: Indirect.Sometimes },
                { name: "Schematic([Part Name]) - rating 9*", description: "Download the given schematic, making it possible to build this part at a Fabricator. Review all known schematics from the status window.", baseChance: -18, indirect: Indirect.Sometimes },
                { name: "Schematic([Bot Name]) - tier 1", description: "Download the given schematic, making it possible to build this part at a Fabricator. Review all known schematics from the status window. When manually hacking for schematics, a general robot class name can be entered instead of a specific variant in order to automatically choose a variant relevant at the current depth.", baseChance: 44, indirect: Indirect.Sometimes },
                { name: "Schematic([Bot Name]) - tier 2", description: "Download the given schematic, making it possible to build this part at a Fabricator. Review all known schematics from the status window. When manually hacking for schematics, a general robot class name can be entered instead of a specific variant in order to automatically choose a variant relevant at the current depth.", baseChance: 38, indirect: Indirect.Sometimes },
                { name: "Schematic([Bot Name]) - tier 3", description: "Download the given schematic, making it possible to build this part at a Fabricator. Review all known schematics from the status window. When manually hacking for schematics, a general robot class name can be entered instead of a specific variant in order to automatically choose a variant relevant at the current depth.", baseChance: 32, indirect: Indirect.Sometimes },
                { name: "Schematic([Bot Name]) - tier 4", description: "Download the given schematic, making it possible to build this part at a Fabricator. Review all known schematics from the status window. When manually hacking for schematics, a general robot class name can be entered instead of a specific variant in order to automatically choose a variant relevant at the current depth.", baseChance: 26, indirect: Indirect.Sometimes },
                { name: "Schematic([Bot Name]) - tier 5", description: "Download the given schematic, making it possible to build this part at a Fabricator. Review all known schematics from the status window. When manually hacking for schematics, a general robot class name can be entered instead of a specific variant in order to automatically choose a variant relevant at the current depth.", baseChance: 20, indirect: Indirect.Sometimes },
                { name: "Schematic([Bot Name]) - tier 6", description: "Download the given schematic, making it possible to build this part at a Fabricator. Review all known schematics from the status window. When manually hacking for schematics, a general robot class name can be entered instead of a specific variant in order to automatically choose a variant relevant at the current depth.", baseChance: 14, indirect: Indirect.Sometimes },
                { name: "Schematic([Bot Name]) - tier 7", description: "Download the given schematic, making it possible to build this part at a Fabricator. Review all known schematics from the status window. When manually hacking for schematics, a general robot class name can be entered instead of a specific variant in order to automatically choose a variant relevant at the current depth.", baseChance: 8, indirect: Indirect.Sometimes },
                { name: "Schematic([Bot Name]) - tier 8", description: "Download the given schematic, making it possible to build this part at a Fabricator. Review all known schematics from the status window. When manually hacking for schematics, a general robot class name can be entered instead of a specific variant in order to automatically choose a variant relevant at the current depth.", baseChance: 2, indirect: Indirect.Sometimes },
                { name: "Schematic([Bot Name]) - tier 9", description: "Download the given schematic, making it possible to build this part at a Fabricator. Review all known schematics from the status window. When manually hacking for schematics, a general robot class name can be entered instead of a specific variant in order to automatically choose a variant relevant at the current depth.", baseChance: -4, indirect: Indirect.Sometimes },
                { name: "Traps(Disarm)", description: "Disarm a nearby random trap array, rendering all of its traps nonfunctional.", baseChance: 45, indirect: Indirect.Sometimes },
                { name: "Traps(Locate)", description: "Locate all nearby traps.", baseChance: 60, indirect: Indirect.Sometimes },
                { name: "Traps(Reprogram)", description: "Reprogram a nearby random trap array, causing it to target hostiles.", baseChance: 30, indirect: Indirect.Sometimes },
                { name: "Trojan(Assimilate)", description: "Causes any operator attempting to report Cogmind to instead become a controllable (blue) ally.", baseChance: 40, indirect: Indirect.Always, spoilerLevel: "Spoilers" },
                { name: "Trojan(Botnet)", description: "Increase the success rate of hacking attempts on all other machines on the floor. The first hack increases success by 6%, the second by 3%, and all others by 1%.", baseChance: 50, indirect: Indirect.Always, spoilerLevel: "Spoilers" },
                { name: "Trojan(Detonate)", description: "Rig a nearby explosive machine to detonate when a hostile passes nearby.", baseChance: 20, indirect: Indirect.Always, spoilerLevel: "Spoilers" },
                { name: "Trojan(Disrupt)", description: "Reduce the targeting of all nearby hostile robots by 10%.", baseChance: 30, indirect: Indirect.Always, spoilerLevel: "Spoilers" },
                { name: "Trojan(Operators)", description: "Continuously report the position of all Operator class robots on the current floor.", baseChance: 40, indirect: Indirect.Always, spoilerLevel: "Spoilers" },
                { name: "Trojan(Track)", description: "Continuously report the position of all robots within a short distance of the terminal. The radius is 6 for a level 1 terminal, 8 for a level 2, and 10 for a level 3.", baseChance: 70, indirect: Indirect.Always, spoilerLevel: "Spoilers" },
            ],
        },
        {
            name: "Terminal - Door",
            dataCoreApplies: false,
            hacks: [
                { name: "Open - Access surface exit", description: "Open the non-automatic door associated with this terminal.", baseChance: 7, indirect: Indirect.Never, level1DirectOnly: true, spoilerLevel: "Spoilers" },
                { name: "Open - Access Command backdoors", description: "Open the non-automatic door associated with this terminal.", baseChance: 30, indirect: Indirect.Never, level1DirectOnly: true, spoilerLevel: "Redacted" },
                { name: "Open - Command Main.C door", description: "Open the non-automatic door associated with this terminal.", baseChance: 60, indirect: Indirect.Never, level1DirectOnly: true, spoilerLevel: "Redacted" },
                { name: "Open - Command prototype cache", description: "Open the non-automatic door associated with this terminal.", baseChance: 10, indirect: Indirect.Never, level1DirectOnly: true, spoilerLevel: "Redacted" },
                { name: "Open - Extension A7 cell", description: "Open the non-automatic door associated with this terminal.", baseChance: 30, indirect: Indirect.Never, level1DirectOnly: true, spoilerLevel: "Spoilers" },
                { name: "Open - Extension derelict cell", description: "Open the non-automatic door associated with this terminal.", baseChance: 30, indirect: Indirect.Never, level1DirectOnly: true, spoilerLevel: "Spoilers" },
                { name: "Open - Factory Extension exit", description: "Open the non-automatic door associated with this terminal.", baseChance: 60, indirect: Indirect.Never, level1DirectOnly: true, spoilerLevel: "Spoilers" },
                { name: "Open - Quarantine Sigix Terminator vault", description: "Open the non-automatic door associated with this terminal.", baseChance: 30, indirect: Indirect.Never, level1DirectOnly: true, spoilerLevel: "Spoilers" },
                { name: "Open - Quarantine Sigix Warrior chamber", description: "Open the non-automatic door associated with this terminal.", baseChance: 30, indirect: Indirect.Never, level1DirectOnly: true, spoilerLevel: "Spoilers" },
                { name: "Open - Research Quarantine exit", description: "Open the non-automatic door associated with this terminal.", baseChance: 30, indirect: Indirect.Never, level1DirectOnly: true, spoilerLevel: "Spoilers" },
                { name: "Open - Section 7 L2 lab backdoor", description: "Open the non-automatic door associated with this terminal.", baseChance: 30, indirect: Indirect.Never, level1DirectOnly: true, spoilerLevel: "Redacted" },
                { name: "Open - Section 7 LRC cache", description: "Open the non-automatic door associated with this terminal.", baseChance: 60, indirect: Indirect.Never, level1DirectOnly: true, spoilerLevel: "Redacted" },
                { name: "Open - Section 7 Terrabomb vault", description: "Open the non-automatic door associated with this terminal.", baseChance: 60, indirect: Indirect.Never, level1DirectOnly: true, spoilerLevel: "Redacted" },
                { name: "Open - Section 7 TR vault", description: "Open the non-automatic door associated with this terminal.", baseChance: 60, indirect: Indirect.Never, level1DirectOnly: true, spoilerLevel: "Redacted" },
                { name: "Open - Section 7 Matter Drive vault", description: "Open the non-automatic door associated with this terminal.", baseChance: 30, indirect: Indirect.Never, level1DirectOnly: true, spoilerLevel: "Redacted" },
                { name: "Open - Storage low value vault", description: "Open the non-automatic door associated with this terminal.", baseChance: 80, indirect: Indirect.Never, level1DirectOnly: true },
                { name: "Open - Storage medium value vault", description: "Open the non-automatic door associated with this terminal.", baseChance: 60, indirect: Indirect.Never, level1DirectOnly: true },
                { name: "Open - Storage high value vault", description: "Open the non-automatic door associated with this terminal.", baseChance: 30, indirect: Indirect.Never, level1DirectOnly: true },
            ],
        },
    ];

    // Updates all hacking tables based on the spoiler level and user inputs
    function updateHackTables() {
        // Remove old tables
        const tableBody = $("#hacksTableBody");
        (tableBody.find('[data-toggle="tooltip"]') as any).tooltip("dispose");
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

                if (spoilerLevel === "Redacted") {
                    return true;
                }
                else if (spoilerLevel === "Spoilers") {
                    return hack.spoilerLevel !== "Redacted";
                }
                else {
                    return hack.spoilerLevel === "None" || hack.spoilerLevel === undefined;
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

                const row = `<tr><td data-toggle="tooltip" title="${hack.description}">${hack.name}</td>${hackCells}</tr>`;

                return row;
            }).join("");

            // Hide machines with all results filtered out
            const visible = hackRows.length > 0;
            const machineRow = `<tr><td class="hack-category-row${visible ? "" : " not-visible"}">${machine.name}</td></tr>`;

            return machineRow + hackRows;
        }).join("");

        tableBody.append($(tableHtml));
        (tableBody.find('[data-toggle="tooltip"]') as any).tooltip();
    }

    // Initialize the page state
    function init() {
        createHeader("Hacks", $("#headerContainer"));
        registerDisableAutocomplete($(document));

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