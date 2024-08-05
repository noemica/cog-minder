import { ReactNode, useMemo } from "react";

import { ItemType, WeaponItem } from "../../../types/itemTypes";
import {
    BotBehavior,
    ExternalDamageReduction,
    SiegeState,
    SimulatorEndCondition,
    SneakAttackStrategy,
} from "../../../types/simulatorTypes";
import { canShowSpoiler } from "../../../utilities/common";
import Button from "../../Buttons/Button";
import { ExclusiveButtonDefinition } from "../../Buttons/ExclusiveButtonGroup";
import useBotData from "../../Effects/useBotData";
import useItemData from "../../Effects/useItemData";
import { useSpoilers } from "../../Effects/useLocalStorageValue";
import { LabeledExclusiveButtonGroup, LabeledInput, LabeledSelect, SoloLabel } from "../../LabeledItem/LabeledItem";
import BotPopoverButton from "../../Popover/BotPopover";
import ItemPopoverButton from "../../Popover/ItemPopover";
import { SelectOptionType } from "../../Selectpicker/Select";
import { CombatType, SimulatorPageState, WeaponState, XAxisType, YesNoType } from "./SimulatorPage";

const botBehaviorButtons: ExclusiveButtonDefinition<BotBehavior>[] = [
    {
        value: "Stand/Fight",
    },
    {
        value: "Siege/Fight",
    },
    {
        value: "Already Sieged/Fight",
    },
    {
        value: "Running",
    },
    {
        value: "Run When Hit",
    },
];

const combatTypeButtons: ExclusiveButtonDefinition<CombatType>[] = [
    {
        value: "Ranged",
    },
    {
        value: "Melee",
    },
];

const damageReductionOptions: SelectOptionType<ExternalDamageReduction>[] = [
    {
        value: "None",
        label: "No damage reduction",
    },
    {
        value: "Remote Shield",
        label: "Remote Shield (25%)",
    },
    {
        value: "Stasis Trap",
        label: "Stasis Trap (25%)",
    },
    {
        value: "Phase Wall",
        label: "Phase Wall (50%)",
    },
    {
        value: "Remote Force Field",
        label: "Remote Force Field (50%)",
    },
    {
        value: "Stasis Bubble",
        label: "Stasis Bubble (50%)",
    },
];

const baseEndSimulationConditionOptions: SelectOptionType<SimulatorEndCondition>[] = [
    {
        value: "Kill",
    },
    {
        value: "Kill or Core Disrupt",
    },
    {
        value: "Kill or No Power",
    },
    {
        value: "Kill or No Weapons",
    },
];

const architectEndSimulationConditionOptions = [...baseEndSimulationConditionOptions];
architectEndSimulationConditionOptions.push({
    value: "Tele",
    label: "Architect Tele (80% integrity, 1 weapon, or 1 prop)",
});

const haulerEndSimulationConditionOptions = [...baseEndSimulationConditionOptions];
haulerEndSimulationConditionOptions.push({ value: "Kill or No TNC" });

const siegeOptions: SelectOptionType<SiegeState>[] = [
    {
        value: "No Siege",
    },
    {
        value: "In Siege Mode",
    },
    {
        value: "In High Siege Mode",
    },
    {
        value: "Entering Siege Mode",
    },
    {
        value: "Entering High Siege Mode",
    },
];

const sneakAttackOptions: SelectOptionType<SneakAttackStrategy>[] = [
    {
        value: "None",
    },
    {
        value: "First Only",
    },
    {
        value: "All",
    },
];

const xAxisButtons: ExclusiveButtonDefinition<XAxisType>[] = [
    {
        value: "Volleys",
    },
    {
        value: "Time",
    },
];

const yesNoButtons: ExclusiveButtonDefinition<YesNoType>[] = [
    {
        value: "No",
    },
    {
        value: "Yes",
    },
];

const meleeItemTypes: ItemType[] = ["Impact Weapon", "Piercing Weapon", "Slashing Weapon", "Special Melee Weapon"];

const rangedItemTypes: ItemType[] = [
    "Ballistic Cannon",
    "Ballistic Gun",
    "Energy Cannon",
    "Energy Gun",
    "Launcher",
    "Special Weapon",
];

// List of weapons affected by the exoskeleton
const sigixWeapons = [
    "Core Cannon",
    "Core Stripper",
    "Modified Sigix Sheargun",
    "Sigix Broadsword",
    "Sigix Shearcannon",
    "Sigix Sheargun",
];

function WeaponRow({
    disabled,
    i,
    pageState,
    updatePageState,
    weaponInfo,
    weaponItem,
    weaponOptions,
}: {
    disabled: boolean;
    i: number;
    pageState: SimulatorPageState;
    updatePageState: (newPageState: SimulatorPageState) => void;
    weaponInfo: WeaponState;
    weaponItem: WeaponItem;
    weaponOptions: SelectOptionType[];
}) {
    let extraInput: ReactNode | undefined = undefined;
    const weaponState = pageState.weaponState![i];

    if (weaponItem.overloadStability) {
        // Add overload input
        extraInput = (
            <LabeledExclusiveButtonGroup
                label="Overload"
                disabled={disabled}
                buttons={yesNoButtons}
                tooltip="Whether to fire the weapon as overloaded (double damage). Does not take into account effects of additional heat generation or stability-related effects."
                selected={weaponState.overload || "No"}
                onValueChanged={(val) => {
                    const newWeaponState = [...pageState.weaponState!];
                    newWeaponState[i] = { ...weaponState, overload: val };

                    updatePageState({ ...pageState, weaponState: newWeaponState });
                }}
            />
        );
    } else if (sigixWeapons.includes(weaponItem.name)) {
        // Add Sigix Exoskeleton input
        extraInput = (
            <LabeledExclusiveButtonGroup
                label="Exoskeleton"
                disabled={disabled}
                buttons={yesNoButtons}
                tooltip="Whether a Sigix Exoskeleton is equipped (double damage on non-AOE Sigix weaponry)."
                selected={weaponState.exo || "No"}
                onValueChanged={(val) => {
                    const newWeaponState = [...pageState.weaponState!];
                    newWeaponState[i] = { ...weaponState, exo: val };

                    updatePageState({ ...pageState, weaponState: newWeaponState });
                }}
            />
        );
    }

    return (
        <div className="weapon-row">
            <div className="flex">
                <LabeledSelect
                    id={weaponInfo.id.toString()}
                    isDisabled={disabled}
                    className="weapon-select"
                    label="Weapon"
                    tooltip="Name of an equipped weapon to fire."
                    options={weaponOptions}
                    value={weaponOptions.find((option) => option.value === weaponInfo.name)}
                    onChange={(val) => {
                        const newWeaponState = [...pageState.weaponState!];
                        // When changing the name, keep the number but discard other special stats
                        newWeaponState[i] = { id: weaponState.id, name: val!.value, number: weaponState.number };

                        updatePageState({ ...pageState, weaponState: newWeaponState });
                    }}
                />
                <ItemPopoverButton item={weaponItem} tooltip="Show details about the part." text="?" />
            </div>
            <LabeledInput
                label="Number"
                disabled={disabled}
                className="flex-1-1"
                value={weaponInfo.number || ""}
                onChange={(val) => {
                    const newWeaponState = [...pageState.weaponState!];
                    newWeaponState[i] = { ...weaponState, number: val };

                    updatePageState({ ...pageState, weaponState: newWeaponState });
                }}
                placeholder="1"
                tooltip="How many weapons of this type to have equipped."
            />
            {extraInput}
            <Button
                tooltip="Deletes this weapon."
                disabled={disabled}
                onClick={() => {
                    // Remove the part at this index from the state
                    const newWeaponState = [...pageState.weaponState!];
                    newWeaponState.splice(newWeaponState.indexOf(weaponInfo), 1);

                    updatePageState({ ...pageState, weaponState: newWeaponState });
                }}
            >
                X
            </Button>
        </div>
    );
}

export default function SimulatorPageInput({
    pageState,
    simulationInProgress,
    updatePageState,
}: {
    pageState: SimulatorPageState;
    simulationInProgress: boolean;
    updatePageState: (newPageState: SimulatorPageState) => void;
}) {
    const botData = useBotData();
    const itemData = useItemData();
    const spoilers = useSpoilers();

    // Convert valid bot targets to select options
    const botOptions = useMemo(() => {
        return botData
            .getAllBotsSorted()
            .filter((bot) => canShowSpoiler(bot.spoiler, spoilers))
            .map<SelectOptionType>((bot) => {
                return {
                    value: bot.name,
                };
            });
    }, [spoilers]);

    // Convert valid weapon targets to select options
    const weaponOptions = useMemo(() => {
        return itemData
            .getAllItemsSorted()
            .filter((item) => {
                // Spoiler check
                if (!canShowSpoiler(item.spoiler, spoilers)) {
                    return false;
                }

                // Type check
                if (pageState.combatType === "Melee") {
                    if (!meleeItemTypes.includes(item.type)) {
                        return false;
                    }
                } else if (!rangedItemTypes.includes(item.type)) {
                    return false;
                }

                // Damage check, only show items that have normal damage
                const weapon = item as WeaponItem;
                if (weapon.damageType === "Special") {
                    return;
                }

                return true;
            })
            .map<SelectOptionType>((item) => {
                return { value: item.name };
            });
    }, [spoilers, pageState]);

    const botName = botData.getBotOrNull(pageState.botName || "") === null ? "G-34 Mercenary" : pageState.botName!;
    const bot = botData.getBot(botName);

    let endSimulationOptions: SelectOptionType<SimulatorEndCondition>[];

    // Determine special end conditions
    if (bot.name === "Architect") {
        endSimulationOptions = architectEndSimulationConditionOptions;
    } else if (bot.name === "A-15 Conveyor") {
        endSimulationOptions = haulerEndSimulationConditionOptions;
    } else {
        endSimulationOptions = baseEndSimulationConditionOptions;
    }

    const meleeInputs = (
        <>
            <div className="page-input-group">
                <SoloLabel
                    label="Melee Analysis Suites"
                    tooltip="The number of each type of Melee Analysis Suites equipped. Provides bonus accuracy and a minimum damage increase, but not more than the maximum damage for a weapon."
                />
                <LabeledInput
                    label="Standard"
                    disabled={simulationInProgress}
                    value={pageState.baseMas || ""}
                    onChange={(val) => updatePageState({ ...pageState, baseMas: val })}
                    placeholder="0"
                    tooltip="The amount of standard Melee Analysis Suites equipped. Each provides 5% accuracy and a minimum damage increase of 2."
                />
                <LabeledInput
                    label="Imp."
                    disabled={simulationInProgress}
                    value={pageState.impMas || ""}
                    onChange={(val) => updatePageState({ ...pageState, impMas: val })}
                    placeholder="0"
                    tooltip="The amount of Improved Melee Analysis Suites equipped. Each provides 6% accuracy and a minimum damage increase of 3."
                />
                <LabeledInput
                    label="Adv."
                    disabled={simulationInProgress}
                    value={pageState.advMas || ""}
                    onChange={(val) => updatePageState({ ...pageState, advMas: val })}
                    placeholder="0"
                    tooltip="The amount of Advanced Melee Analysis Suites equipped. Each provides 8% accuracy and a minimum damage increase of 4."
                />
                <LabeledInput
                    label="Exp."
                    disabled={simulationInProgress}
                    value={pageState.expMas || ""}
                    onChange={(val) => updatePageState({ ...pageState, expMas: val })}
                    placeholder="0"
                    tooltip="The amount of Experimental Melee Analysis Suites equipped. Each provides 12% accuracy and a minimum damage increase of 6."
                />
            </div>
            <div className="page-input-group">
                <SoloLabel
                    label="Force Boosters"
                    tooltip="The number of each type of Force Booster equipped. Provides a bonus to maximum damage and a decrease to accuracy. These utilities half_stack, so only the 2 highest ratings count."
                />
                <LabeledInput
                    label="Standard"
                    disabled={simulationInProgress}
                    value={pageState.baseForceBoosters || ""}
                    onChange={(val) => updatePageState({ ...pageState, baseForceBoosters: val })}
                    placeholder="0"
                    tooltip="The amount of standard Force Boosters equipped. Provides a maximum damage increase of 20% and a melee accuracy penalty of 4%."
                />
                <LabeledInput
                    label="Imp."
                    disabled={simulationInProgress}
                    value={pageState.impForceBoosters || ""}
                    onChange={(val) => updatePageState({ ...pageState, impForceBoosters: val })}
                    placeholder="0"
                    tooltip="The amount of Improved Force Boosters equipped. Provides a maximum damage increase of 30% and a melee accuracy penalty of 6%."
                />
                <LabeledInput
                    label="Adv."
                    disabled={simulationInProgress}
                    value={pageState.advForceBoosters || ""}
                    onChange={(val) => updatePageState({ ...pageState, advForceBoosters: val })}
                    placeholder="0"
                    tooltip="The amount of Advanced Force Boosters equipped. Provides a maximum damage increase of 40% and a melee accuracy penalty of 8%."
                />
            </div>
            <div className="page-input-group">
                <LabeledInput
                    label="Initial Momentum"
                    disabled={simulationInProgress}
                    value={pageState.initialMomentum || ""}
                    onChange={(val) => updatePageState({ ...pageState, initialMomentum: val })}
                    placeholder="0"
                    tooltip="The momentum bonus from movement for the first attack. This should be 0-3."
                />
                <LabeledInput
                    label="Bonus Momentum"
                    disabled={simulationInProgress}
                    value={pageState.bonusMomentum || ""}
                    onChange={(val) => updatePageState({ ...pageState, bonusMomentum: val })}
                    placeholder="0"
                    tooltip="The amount of bonus momentum from Reaction Control Systems (Always 0 or 1, no_stack)."
                />
                <LabeledInput
                    label="Speed"
                    disabled={simulationInProgress}
                    value={pageState.speed || ""}
                    onChange={(val) => updatePageState({ ...pageState, speed: val })}
                    placeholder="100"
                    tooltip="The speed of Cogmind. Higher speed provides increased momentum bonus damage."
                />
                <LabeledSelect
                    className="sneak-attack-select"
                    isDisabled={simulationInProgress}
                    label="Sneak Attacks"
                    isSearchable={false}
                    tooltip="Whether to perform sneak attacks or not. Sneak attacks provide a base hit chance of 120% and double damage."
                    options={sneakAttackOptions}
                    value={sneakAttackOptions.find((o) => o.value === pageState.sneakAttacks) || sneakAttackOptions[0]}
                    onChange={(val) => {
                        updatePageState({ ...pageState, sneakAttacks: val!.value });
                    }}
                />
            </div>
        </>
    );

    const rangedInputs = (
        <>
            <div className="page-input-group">
                <LabeledInput
                    label="Targeting"
                    disabled={simulationInProgress}
                    value={pageState.targeting || ""}
                    onChange={(val) => updatePageState({ ...pageState, targeting: val })}
                    placeholder="0%"
                    tooltip="The amount of targeting bonus from Targeting Computers or similar utilities (stacks). Base is 5%, Improved is 6%, Advanced is 8%, Experimental is 12%."
                />
                <LabeledInput
                    label="Recoil Reduction"
                    disabled={simulationInProgress}
                    value={pageState.recoilReduction || ""}
                    onChange={(val) => updatePageState({ ...pageState, recoilReduction: val })}
                    placeholder="0"
                    tooltip="The number of recoil reduction. Each tread slot has 1 recoil reduction, Recoil Stabilizers have 4, and Recoil Nullifiers have 6."
                />
                <LabeledInput
                    label="Distance"
                    disabled={simulationInProgress}
                    value={pageState.distance || ""}
                    onChange={(val) => updatePageState({ ...pageState, distance: val })}
                    placeholder="6+"
                    tooltip="The distance from the target. Each tile closer than 6 tiles away provides 3% accuracy up to 15% at 1 tile away."
                />
                <LabeledSelect
                    className="siege-select"
                    isDisabled={simulationInProgress}
                    label="Siege"
                    isSearchable={false}
                    tooltip="The type of siege mode active (if any). Siege mode removes all recoil and adds a 20% (standard) or 30% (high) bonus to targeting."
                    options={siegeOptions}
                    value={siegeOptions.find((o) => o.value === pageState.siege) || siegeOptions[0]}
                    onChange={(val) => {
                        updatePageState({ ...pageState, siege: val!.value });
                    }}
                />
            </div>
            <div className="page-input-group">
                <LabeledInput
                    label="Particle Charging"
                    disabled={simulationInProgress}
                    value={pageState.particleCharger || ""}
                    onChange={(val) => updatePageState({ ...pageState, particleCharger: val })}
                    placeholder="0%"
                    tooltip="The bonus from Particle Charger/Accelerators that are equipped (if any). Increases damage of energy gun/cannon weapons (half_stack). Base charger starts at 15%, going to 20%, 25%, 30%, 40%, and 50%."
                />
                <LabeledInput
                    label="Kinecellerator"
                    value={pageState.kinecellerator || ""}
                    disabled={simulationInProgress}
                    onChange={(val) => updatePageState({ ...pageState, kinecellerator: val })}
                    placeholder="0%"
                    tooltip="The bonus from a Kinecellerator that's equipped (if any). INcreases minimum damage of kinetic gun/cannon weapons. Base Kinecellerator starts at 30%, Improved at 40%, and Advanced at 50%."
                />
                <LabeledInput
                    label="Weapon Cycling"
                    disabled={simulationInProgress}
                    value={pageState.weaponCycling || ""}
                    onChange={(val) => updatePageState({ ...pageState, weaponCycling: val })}
                    placeholder="0%"
                    tooltip="The percentage of Weapon Cycling or similar utilities that are equipped (if any). Decreases overall volley time. Stacks up to 30%, though a Quantum Capacitor or Launcher Loader can go up to 50%."
                />
                <LabeledInput
                    label="Salvage Targeting"
                    disabled={simulationInProgress}
                    value={pageState.salvageTargeting || ""}
                    onChange={(val) => updatePageState({ ...pageState, salvageTargeting: val })}
                    placeholder="0%"
                    tooltip="The bonus of Salvage Targeting Computers that are equipped (if any). Increase salvage generated from Gun-type weapons that fire a single projectile (stacks). Base Salvage Targeting Computer starts at +1, Improved is +2, Advanced is +3, and Makeshift is +4."
                />
            </div>
        </>
    );

    const weaponRows = (
        <>
            {pageState.weaponState?.map((weaponInfo, i) => {
                const weaponItem = itemData.getItem(weaponInfo.name) as WeaponItem;

                return (
                    <WeaponRow
                        key={weaponInfo.id}
                        disabled={simulationInProgress}
                        pageState={pageState}
                        updatePageState={updatePageState}
                        weaponItem={weaponItem}
                        weaponInfo={weaponInfo}
                        weaponOptions={weaponOptions}
                        i={i}
                    />
                );
            })}
            <div className="new-weapon-row">
                <LabeledSelect
                    label="Weapon"
                    isDisabled={simulationInProgress}
                    className="weapon-select"
                    tooltip="Name of an equipped weapon to fire."
                    options={weaponOptions}
                    controlShouldRenderValue={false}
                    onChange={(val) => {
                        const weaponState = [...(pageState.weaponState || [])];

                        // New ID = highest of all numbers
                        const id = Math.max(0, ...weaponState.map((p) => p.id + 1));
                        weaponState.push({ name: val!.value, id });

                        updatePageState({ ...pageState, weaponState: weaponState });
                    }}
                />
            </div>
        </>
    );

    return (
        <>
            <div className="page-input-group">
                <LabeledExclusiveButtonGroup
                    label="Combat Type"
                    disabled={simulationInProgress}
                    buttons={combatTypeButtons}
                    className="flex-grow-0"
                    tooltip="The type of weapons to display. Melee and ranged weapons also have unique utilities and other settings."
                    selected={pageState.combatType}
                    onValueChanged={(val) => {
                        // When changing combat type, also clear out any weapons
                        updatePageState({ ...pageState, weaponState: [], combatType: val });
                    }}
                />
                <LabeledInput
                    label="Num Fights"
                    disabled={simulationInProgress}
                    value={pageState.numSimulations || ""}
                    onChange={(val) => updatePageState({ ...pageState, numSimulations: val })}
                    placeholder="100,000"
                    tooltip="The number of fights to simulate. High numbers will increase result accuracy but also increase time to calculate."
                />
                <LabeledSelect
                    className="enemy-behavior-select"
                    isDisabled={simulationInProgress}
                    label="Enemy Behavior"
                    tooltip="The behavior of the enemy when engaged in combat. THe default for most hostile combat bots is Stand/Fight, and the behavior of most non-combat bots will be RUn When Hit."
                    isSearchable={false}
                    options={botBehaviorButtons}
                    value={botBehaviorButtons.find((o) => o.value === pageState.enemyBehavior) || botBehaviorButtons[0]}
                    onChange={(val) => {
                        updatePageState({ ...pageState, enemyBehavior: val!.value });
                    }}
                />
                <Button
                    tooltip="Resets all values to their default state"
                    disabled={simulationInProgress}
                    className="flex-grow-0"
                    onClick={() => updatePageState({})}
                >
                    Reset
                </Button>
            </div>
            <div className="page-input-group">
                <div className="enemy-group">
                    <LabeledSelect
                        label="Enemy"
                        className="enemy-select"
                        isDisabled={simulationInProgress}
                        tooltip="The name of the enemy bot to fight."
                        options={botOptions}
                        value={botOptions.find((o) => o.value === botName)}
                        onChange={(val) => {
                            updatePageState({ ...pageState, botName: val!.value });
                        }}
                    />
                    <BotPopoverButton bot={bot} text="?" tooltip="Show details about the bot." />
                </div>
                <LabeledExclusiveButtonGroup
                    label="Analysis"
                    buttons={yesNoButtons}
                    disabled={simulationInProgress}
                    tooltip="Does Cogmind have the analysis for this bot? An analysis provides bonuses of 5% accuracy and 10% damage."
                    selected={pageState.analysis || "No"}
                    onValueChanged={(val) => {
                        updatePageState({ ...pageState, analysis: val });
                    }}
                />
                <LabeledSelect
                    label="Damage Reduction"
                    isDisabled={simulationInProgress}
                    className="damage-reduction-select"
                    tooltip="The type of external damage reduction (if any) for the enemy. Note: this does not stack with personal damage reduction utilities."
                    isSearchable={false}
                    options={damageReductionOptions}
                    value={
                        damageReductionOptions.find((o) => o.value === pageState.damageReduction) ||
                        damageReductionOptions[0]
                    }
                    onChange={(val) => {
                        updatePageState({ ...pageState, damageReduction: val!.value });
                    }}
                />
            </div>
            <div className="page-input-group">
                <LabeledInput
                    label="Corruption"
                    disabled={simulationInProgress}
                    value={pageState.corruption || ""}
                    onChange={(val) => updatePageState({ ...pageState, corruption: val })}
                    placeholder="0%"
                    tooltip="The amount of corruption that Cogmind currently has. Corruption reduces accuracy by 3% for every 1% of corruption."
                />
                <LabeledInput
                    label="Actions Since Moving"
                    disabled={simulationInProgress}
                    value={pageState.actionsSinceMoving || ""}
                    onChange={(val) => updatePageState({ ...pageState, actionsSinceMoving: val })}
                    placeholder="2+"
                    tooltip="The number of actions performed since Cogmind last moved. For melee, there is a +10% accuracy bonus gained after not moving for 2 turns. For ranged, there is an additional -10% penalty if the most recent action was a move. Basically, 0 turns since moving = -10%, 1 turn = 0%, 2 turns = 10%."
                />
                <LabeledExclusiveButtonGroup
                    label="On Legs"
                    disabled={simulationInProgress}
                    buttons={yesNoButtons}
                    tooltip="Is Cogmind on legs? If so, the number of tiles run in a row provide an additional 5% penalty per tile moved."
                    selected={pageState.onLegs || "No"}
                    onValueChanged={(val) => {
                        updatePageState({ ...pageState, onLegs: val });
                    }}
                />
                <LabeledInput
                    label="Tiles Run"
                    disabled={simulationInProgress}
                    value={pageState.tilesRun || ""}
                    onChange={(val) => updatePageState({ ...pageState, tilesRun: val })}
                    placeholder="0"
                    tooltip="The number of tiles Cogmind has been running for if on legs. There is a -5% penalty per tile moved for ranged weapons, up to a maximum of -15%."
                />
            </div>
            {pageState.combatType === "Melee" ? meleeInputs : rangedInputs}
            <div className="page-input-group last-pre-weapon-row">
                <LabeledInput
                    label="Armor Integrity Analyzer"
                    disabled={simulationInProgress}
                    value={pageState.armorIntegrityAnalyzer || ""}
                    onChange={(val) => updatePageState({ ...pageState, armorIntegrityAnalyzer: val })}
                    placeholder="0%"
                    tooltip="The type of armor integrity analyzer that's equipped (if any). Adds a chance of bypassing enemy armor. Values are 30% for basic, 40% for Improved, and 50% for Experimental."
                />
                <LabeledInput
                    label="Core Analyzer"
                    disabled={simulationInProgress}
                    value={pageState.coreAnalyzer || ""}
                    onChange={(val) => updatePageState({ ...pageState, coreAnalyzer: val })}
                    placeholder="0%"
                    tooltip="The bonus from one or more Core Analyzers that are equipped (if any). Increases core exposure by the specific amount (half_stack). Base Analyzer is 6% and Experimental is 8%, for a maximum of 12%."
                />
                <LabeledInput
                    label="Target Analyzer"
                    disabled={simulationInProgress}
                    value={pageState.targetAnalyzer || ""}
                    onChange={(val) => updatePageState({ ...pageState, targetAnalyzer: val })}
                    placeholder="0%"
                    tooltip="The bonus from one or more Target Analyzers that are equipped (if any). Increases critical hit % chance for weapons with a critical hit (half_stack). Base Analyzer is 5%, Improved is 6%, Advanced is 8%, and Experimental is 10%."
                />
                {pageState.combatType === "Melee" && (
                    <>
                        <LabeledInput
                            label="Actuator"
                            disabled={simulationInProgress}
                            value={pageState.actuator || ""}
                            onChange={(val) => updatePageState({ ...pageState, actuator: val })}
                            placeholder="0%"
                            tooltip="The bonus from actuator that's equipped (if any). Decreases volley time by a fixed percentage. Microactuators are 20%, Nanoacturators are 30%, and Femtoactuators are 50%."
                        />
                        <LabeledInput
                            label="Actuator Array"
                            disabled={simulationInProgress}
                            value={pageState.actuatorArray || ""}
                            onChange={(val) => updatePageState({ ...pageState, actuatorArray: val })}
                            placeholder="0%"
                            tooltip="The bonus from one or two actuator arrays equipped. Increases followup chance for all weapons (half_stack). Base Actuator Array is 10%, Improved is 12%, Advanced is 16%, and Experimental is 20%."
                        />
                    </>
                )}
            </div>
            {weaponRows}
            <div className="page-input-group">
                <LabeledExclusiveButtonGroup
                    label="X-Axis"
                    disabled={simulationInProgress}
                    className="flex-grow-0"
                    buttons={xAxisButtons}
                    tooltip="The type of x-axis to show on the graph."
                    selected={pageState.xAxis || "Volleys"}
                    onValueChanged={(val) => {
                        updatePageState({ ...pageState, xAxis: val });
                    }}
                />
                <LabeledExclusiveButtonGroup
                    label="Show Loot"
                    disabled={simulationInProgress}
                    className="flex-grow-0"
                    buttons={yesNoButtons}
                    tooltip="Whether or not to show estimated loot drops. Expected matter and part drop rate chance and integrity are shown. Crit off rate shows the % of the drop rate that was caused due to blast, sever, or sunder critical hits, if applicable."
                    selected={pageState.showLoot || "No"}
                    onValueChanged={(val) => {
                        updatePageState({ ...pageState, showLoot: val });
                    }}
                />
                <LabeledSelect
                    label="End Condition"
                    isDisabled={simulationInProgress}
                    tooltip="The scenario to occur before the simulation is ended."
                    isSearchable={false}
                    options={endSimulationOptions}
                    value={
                        endSimulationOptions.find((o) => o.value === pageState.endCondition) || endSimulationOptions[0]
                    }
                    onChange={(val) => {
                        updatePageState({ ...pageState, endCondition: val!.value });
                    }}
                />
            </div>
        </>
    );
}
