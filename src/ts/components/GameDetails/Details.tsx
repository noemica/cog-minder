import { ReactNode } from "react";

import { Bot } from "../../types/botTypes";
import { Item, WeaponItem } from "../../types/itemTypes";
import {
    getBotImageNames,
    getItemAsciiArtImageName,
    getItemSpriteImageNames,
    rootDirectory,
} from "../../utilities/common";
import { ButtonLink } from "../Buttons/Button";
import TextTooltip from "../Popover/TextTooltip";

import "./Details.less";

export type DetailsRangeLineProps = {
    category: string;
    valueString?: string;
    value?: number;
    defaultValueString?: string;
    minValue?: number;
    maxValue?: number;
    colorScheme: ColorScheme;
    unitString?: string;
    tooltipOverride?: string;
};

const TooltipTexts = {
    //General Item Stats
    Type: "General classification of this item.",
    Mass: "Mass of an attached item contributes to a robot's total mass and affects its movement speed. Items held in inventory do not count towards total mass for movement calculation purposes.",
    Slot: "Type of slot the part can be attached to, if applicable. Larger items may occupy multiple slots, both in the inventory and when attached.",
    Integrity:
        "Integrity reflects the amount of damage a part can sustain before it is destroyed or rendered useless. Maximum integrity for a part type that cannot be repaired is preceded by a *.",
    Coverage:
        "Coverage is a relative indicator of how likely this part is to be hit by a successful incoming attack compared to other attached parts. For example, a part with 100 coverage is twice as likely to be hit as another part with a value of 50. Armor, protective and large parts tend to have higher coverage values while small subsystems provide less coverage but are therefore less likely to be damaged.",
    Fragile:
        "Fragile parts are destroyed if removed after attaching them for use. While attached, these are also marked with a colon next ot their letter in the parts list, as a reminder.",
    State: "Current state of this item.",
    Heat: "Heat produced each turn while this part is active.",
    Rating: "Rating is a relative indicator of the item's usefulness and/or value. When comparing items, the quickest and easiest method is to go with whatever has the highest rating. However, prototypes are almost always better than common parts with a similar rating (generally implying a +1 to their listed rating).",
    "Stability (Engine)":
        "Stability represents the ability of this power source to generate energy while overloaded without suffering any negative side-effects. Overloading doubles output and heat. If N/A, this power source cannot be overloaded; only cooled power sources support overloading.",
    Matter: "Matter consumed each turn by this part while active.",
    Energy: "Energy consumed each turn by this part while active.",
    Storage:
        "Energy storage capacity of this power source. Excess energy can be stored, but requires additional utilities.",
    Supply: "Energy generated each turn by this power source.",

    // Bot Stats
    Class: "Robots are divided into classes based on their purpose.",
    Size: "Robot size category determines their likeliness of being struck by both targeted and stray shots, as well as their chance to suffer knockback. Smaller robots do not necessarily occupy their entire position, see the manual under Combat > Targeting for more about how this affects lines of fire.",
    "Rating (Bot)":
        "Rating summarizes the robot's overall effectiveness in combat situations, thus highly-rated robots are far more dangerous.",
    Profile:
        "The amount of space this bot takes up within the 9x9 subgrid within each single tile that is used to determine aiming and projectile behavior. RD = round and SQ = square. Smaller profile sizes mean that it is harder to hit bots around corners but easier to aim around them. Smaller profile bots are also less likely to be hit by stray projectiles.",
    Tier: "On average, corresponds to the depth that the bot will appear in. For example, a rating 4 bot will typically begin to appear in -7 Factory.",
    Threat: "Internal game stat that is used to determine the color of bot sprites. Lower threat levels are the lightest colored, while higher threat levels are the darkest colored.",
    Value: "The amount of score that will be obtained if the bot is destroyed.",
    "Energy Generation":
        "The amount of energy this bot generates per turn, not taking upkeep into account. This also includes any hidden energy generation bonuses that a bot may have hardcoded.",
    "Heat Dissipation":
        "The amount of heat this bot dissipates per turn, including cooling utilities and hidden innate dissipation bonus that a bot may have hardcoded.",
    "Visual Range": "The distance a bot can see.",
    Memory: "The base number of actions a bot will take before it loses tracking of a hostile. This number can be affected by corruption and ECM Suites.",
    "Spot %":
        "The chance that a bot will become aware of a bot moving through their line of sight even when not on their turn.",
    Movement: "The type of movement and speed this bot moves at by default.",
    Overloaded: "The type of movement and speed this bot moves at when overloading.",
    "Core Integrity": "The amount of integrity a bot's core has.",
    "Core Exposure": "The exposure of a bot's core.",
    "Salvage Potential":
        "By default, a bot will drop matter in the given range. Salvage affects how much matter is actually dropped.",
    "Inventory Size":
        "Space that a bot may carry additional inventory in. Most bots do not carry or pick up parts even with inventory space.",
    Schematic: "Whether a schematic is hackable or not.",
    "Min Terminal/Depth":
        "The minimum terminal level required in order to hack for this schematic. Higher level terminals can hack for higher rating schematics, but the hacks will be more difficult to perform.",
    Time: "The amount of time it takes to fabricate at a Fabricator of level 1/2/3.",
    Components: "The listed part is required and is consumed as part of the fabrication process.",

    // Resistances/immunities
    Resistance:
        "Depending on their design, robot may be more or less likely to be affected by a certain type of damage. Negative resistances represent a weakness, and therefore greater damage from that source. For example, 25% resistance would decrease the damage from an incoming attack of that type by 25%, while -25% would instead increase the damage sustained by 25%.",
    Coring: "Immune to any core-affecting effects from critical strikes, including Destroy, Blast, Smash, and Phase.",
    Dismemberment:
        "Immune to the part-severing effects of Blade Traps, Segregators, Tearclaws, Core Strippers, and Blast/Sever/Sunder critical effects.",
    "Disruption Immunity": "Immune to core disruption from electromagnetic sources.",
    Hacking: "Immune to remote hacking by Programmers. Cannot be rewired while core disrupted.",
    "Hacking/RIF":
        "Immune to remote hacking by Programmers, and not accessible via RIF. Cannot be rewired while core disrupted.",
    Jamming: "Immune to transmission jamming",
    "Meltdown Immunity":
        "Immune to meltdown destruction and other side effects of overheating, as well as the Meltdown critical effect.",

    // Damage Types
    Kinetic:
        "Ballistic weapons generally have a longer effective range and more destructive critical strikes, but suffer from less predictable damage and high recoil. Kinetic cannon hits also blast usable matter off target robots and have a chance to cause knockback depending on damage, range, and size of target.",
    Thermal:
        "Thermal weapons generally have a shorter effective range, but benefit from a more easily predictable damage potential and little or no recoil. Thermal damage also generally transfers heat to the target, and may cause meltdowns in hot enough targets.",
    Phasic: "Phasic weapons inflict a static amount of damage to targets, and are only resistable via energy-based shields.",
    Entropic:
        "Entropic weapons are capable of inflicting significant, if variable, damage over long ranges, and cannot be resisted by anything but energy-based shields. However, the weapon itself is always damaged in the firing process.",
    Piercing:
        "Piercing melee weapons inflict less collateral damage, but get double the melee momentum damage bonus and are more likely to hit a robot's core (+8% to exposure, a <half_stack> effect when factored alongside Core Analyzers).",
    Slashing:
        "Slashing melee weapons are generally very damaging, and most are also capable of severing components from a target without destroying them.",
    Smashing:
        "Impact melee weapons have a damage-equivalent chance to cause knockback, and ignore coverage thus are effective at destroying fragile systems. By ignoring coverage, there is an equal chance for an attack to hit any given part, where each slot of a multislot part also has a separate and equivalent chance to be hit. A target's core also counts as one slot for that purpose. For every component crushed by an impact, its owner's system is significantly corrupted (+25-150%), though electromagnetic resistance can help mitigate this effect. (Cogmind is less susceptible to corruption caused in this manner.)",
    Electromagnetic:
        "Electromagnetic weapons have less of an impact on integrity, but are capable of corrupting a target's computer systems. Anywhere from 50 to 150% of damage done is also applied as system corruption. (Cogmind is less susceptible to EM-caused corruption, but still has a damage% chance to suffer 1 point of system corruption per hit.) EM-based explosions only deal half damage to inactive items lying on the ground, but can also corrupt them.",
    Explosive:
        "While powerful, explosives generally spread damage across each target in the area of effect. Explosions also tend to reduce the amount of salvage remaining after destroying a target.",

    // General Weapon Stats
    Range: "Maximum effective range.",
    "Energy (Gun)": "Energy required to fire this weapon.",
    "Energy (Melee)": "Energy required to attack with this weapon.",
    "Matter (Gun)": "Matter consumed when firing this weapon.",
    "Matter (Melee)": "Matter consumed when attacking with this weapon.",
    "Heat (Gun)":
        "Heat produced by firing this weapon. This value is averaged over the number of turns it takes to fire, and therefore not applied all at once.",
    "Heat (Melee)": "Heat produced by attack with this weapon.",
    Recoil: "Recoil causes any other weapons fired in the same volley to suffer this penalty to their accuracy.",
    Targeting:
        "This is a direct modifier to the weapon's accuracy calculation when firing. Some weapons are inherently easier or more difficult to accurately target with.",
    Delay: "This is a direct modifier to the time it takes to fire the weapon. Some weapons are inherently faster or slower to fire.",
    "Delay (Melee)":
        "This is a direct modifier to the time it takes to attack with this weapon. Some weapons are inherently faster or slower to attack with.",
    Stability:
        "Stability represents the ability of this weapon to fire while overloaded without suffering any negative side-effects. Overloading doubles damage and energy cost, and generates triple the heat. If N/A, this weapon cannot be overloaded; only some energy weapons support overloading. While overloaded, heat transfer is one level higher than usual where applicable.",
    Waypoints:
        "Guided weapons fire projectiles that follow a set path designated by a number of waypoints up to this value. Guided projectiles always hit their target. If N/A, this weapon only supports direct firing.",
    Arc: "Total angle within which projectiles are randomly distributed around the target, spreading them along an arc of a circle centered on the shot origin. Improved targeting has no effect on the spread, which is always centered around the line of fire.",

    // Projectile Stats (damage type is never absent, thus not present)
    Damage: "Range of potential damage at the point of impact.",
    Critical:
        "Some weapons have a chance to inflict a critical strike, of which there are a variety of types, each with their own context help containing details.",
    Penetration:
        "Chance this projectile may penetrate each consecutive object it hits, e.g. 100 / 80 / 50 may pass through up to three objects, with a 100% chance for the first, followed by 80% and 50% for the remaining two. Huge robots count as a single object for penetration purposes.",
    Spectrum:
        "Range of electromagnetic spectrum, with narrower ranges more likely to trigger chain explosions in power sources. (Cogmind's power sources are immune to this effect from projectiles.)",
    Salvage:
        "Amount by which the salvage potential of a given robot is affected each time hit by this weapon. While usually negative, reducing the amount of usable salvage, some special weapons may increase salvage by disabling a robot with minimal collateral damage.",
    Disruption:
        "Chance this projectile may temporarily disable an active part on impact. If a robot core is struck, there is half this chance the entire robot may be disabled.",
    "Heat Transfer":
        "Relative heat transferred to a target, where each projectile impact heats it up separately. Also the chance to melt a part on a robot that is already overheating at the time of heat transfer. Overloaded thermal weapons transfer heat at one level higher than their normal amount.",
    Radius: "Maximum radius of the explosion from its origin",
    Falloff:
        "Amount of damage potential lost per space as the explosion expands from its origin. While targeting, this falloff is represented visually by the AOE color's brightness relative to the origin (this feature can be toggled via Explosion Predictions option).",
    Chunks: "AOE damage is often spread across each target in the area of effect, dividing the damage into separate chunks before affecting a robot, where each chunk of damage selects its own target part (though they may overlap). SOme explosive effects have a static number of chunks, while others randomly select from within a range for each attack.",

    // Propulsion stats
    "Time/Move":
        "The amount of time required to move one space when unburdened and using only this type of propulsion. Where multiple active propulsion modules have different values, the average is used.",
    "Mod/Extra":
        "Each flight or hover module beyond the first reduces the movement time cost by this amount, therefore increasing speed as more are attached. If not all active propulsion have the same modifier, their average value is used. Time/Move cannot normally be reduced below 20 when hovering, or 10 when flying.",
    Drag: "Inactive non-airborne propulsion modify the movement time cost by this amount while airborne. However, inactive propulsion has no adverse effect on the speed of non-airborne propulsion, including core movement.",
    "Energy Move": "Energy consumed by this part each move, if active.",
    "Heat Move": "Heat produced by this part each move, if active.",
    Support: "Mass supported by this part, if active.",
    Penalty:
        "Movement time penalty for being overweight, applied once if overweight at all. Penalty values for multiple different propulsion modules are averaged for calculation purposes. Further exceeding the mass support limit gradually continues to reduce speed depending on the amount of excess mass.",
    Burnout:
        "Burnout represents the rate at which this propulsion's integrity will deteriorate while overloaded, indicated as a percent chance per move to lose one point of integrity. Overloading boosts performance: speed is calculated as if there is two of this part active at once, support is increased 50%, energy costs doubled, and heat generation tripled. If N/A, this propulsion cannot be overloaded; in general only cooled hover and flight units support overloading. If moving at the normal maximum speed for the current propulsion type, each overloaded hover/flight unit further reduces final movement time by 1, to a value no better than 5.",
    // TODO b15 7 turns
    "High Siege":
        "Entering or exiting siege mode requires 5 turns. During the transition, and for as long as the mode is active, Cogmind is immobile and tht treads cannot be disabled or removed. While in siege mode, non-melee attacks have +20% accuracy, coverage for all armor and heavy treads is doubled, any treads in siege mode get a free 25% damage reduction, no weapons suffer from recoil effects, and Cogmind is immune to instant part destruction from critical hits. Treads capable of High siege mode instead give +30% accuracy and have 50% damage resist.",
    Siege: "Entering or exiting siege mode requires 5 turns. During the transition, and for as long as the mode is active, Cogmind is immobile and tht treads cannot be disabled or removed. While in siege mode, non-melee attacks have +20% accuracy, coverage for all armor and heavy treads is doubled, any treads in siege mode get a free 25% damage reduction, no weapons suffer from recoil effects, and Cogmind is immune to instant part destruction from critical hits. Treads capable of High siege mode instead give +30% accuracy and have 50% damage resist.",
    Martial:
        "Entering or exiting martial mode requires 3 turns. During the transition, and for as long as the mode is active, Cogmind movement speed is halved and the exoskeleton cannot be disabled or removed. While in martial mode, will automatically use an active melee weapon to attack any hostile that moves into an adjacent position at 33% of the normal time cost (no follow-ups). Also a 10% chance to use the melee weapon to deflect each incoming projectile, with a second melee weapon adding 5%, and an additional 2% for each after that. For example, three melee weapons have a collective 17% chance to deflect each projectile. Melee weapons successfully deflecting projectiles in this manner have a 50% chance to take 1 damage each time. While in this mode, Cogmind is also immune to knockback and cancels out all recoil from firing ranged weapons. Activate the exoskeleton a second time to begin changing its martial state.",
    Shielding:
        "Entering or exiting shielding mode requires 4 turns. During this transition, and for as long as the mode is active, Cogmind is immobile and the leg cannot be disabled or removed. While in shielding mode, coverage for this leg is doubled, and it gains a 50% chance to glance each incoming projectile that would otherwise hit it, instead taking no damage. Activate the leg a second time to begin changing its shielding state.",

    // Weapon Criticals
    Blast: "Chance for this weapon to apply the same amount of damage to the core or a second part, ignoring coverage, and if not destroyed then the second part is knocked to the ground.",
    Burn: "Chance for this weapon to inflict triple its normal amount of heat transfer.",
    Corrupt:
        "Chance for this weapon to automatically maximize the amount of system corruption inflicted on the target. If target is Cogmind, the amount of corruption is randomized from 1-10% of the damage.",
    Destroy:
        "Chance for this weapon to instantly destroy the hit component, or even a robot core. (Cogmind is less susceptible to this effect, which can only destroy those parts which are already below 33% integrity when hit.) Armor is immune to this effect, instead taking an additional 20% damage.",
    Detonate: "Chance for this weapon to detonate an engine, regardless of what part was hit.",
    Meltdown:
        "Chance for this weapon to instantly cause robot meltdown regardless of what part was hit. (Cogmind is less susceptible to this effect, instead gaining damage*10 extra heat.)",
    Impale: "Chance for this weapon to inflict twice as much damage and further delay both attacker and target's next opportunity to act by 1 turn. The attacker is not delayed if this effect is a property of a non-melee weapon.",
    Phase: "Chance for this weapon to cause an equal amount of damage to target's core. On a direct core hit, instead damages a random part by the same amount.",
    Sever: "Chance for this weapon to sever target part. On a core hit, slightly damages and severs a random part.",
    Smash: "Chance for this weapon to instantly destroy the hit component, or even a robot core. (Cogmind is less susceptible to this effect, which can only destroy those parts which are already below 33% integrity when hit.) Armor is immune to this effect, instead taking an additional 20% damage. On smashing a part, an equal amount of damage is then applied as overflow damage, although unlike regular overflow damage this may be absorbed by any shielding protecting the secondary target.",
    Sunder: "Chance for this weapon to also knock target part to the ground. On a core hit, knocks 1~2 other parts to the ground without causing collateral damage.",

    // Locations
    "Available depths": "The depth or depths that this map can appear on.",
    Branch: "Whether this location is a main floor or a branch floor."
};

// Color schemes
export type ColorScheme = "LowGood" | "HighGood" | "Green" | "Red";
type ColorSchemeColors = "Low" | "MidLow" | "MidHigh" | "High";
const colorSchemes: Record<ColorScheme, Record<ColorSchemeColors, string>> = {
    LowGood: {
        Low: "details-range-green",
        MidLow: "details-range-yellow",
        MidHigh: "details-range-orange",
        High: "details-range-red",
    },
    HighGood: {
        Low: "details-range-red",
        MidLow: "details-range-orange",
        MidHigh: "details-range-yellow",
        High: "details-range-green",
    },
    Green: {
        Low: "details-range-green",
        MidLow: "details-range-green",
        MidHigh: "details-range-green",
        High: "details-range-green",
    },
    Red: {
        Low: "details-range-red",
        MidLow: "details-range-red",
        MidHigh: "details-range-red",
        High: "details-range-red",
    },
};

export function DetailsBotImages({ bot }: { bot: Bot }) {
    return (
        <pre className="details-sprites">
            {getBotImageNames(bot).map((imageName, i) => (
                <img key={i} src={imageName} />
            ))}
        </pre>
    );
}

export function DetailsBotTitleLine({ bot }: { bot: Bot }) {
    return <pre className="details-title">{bot.name}</pre>;
}

export function DetailsEmptyLine() {
    return <pre className="details-line"> </pre>;
}

export function DetailsItemArtLine({ part }: { part: Item }) {
    return (
        <div className="item-art-image-container">
            <img src={getItemAsciiArtImageName(part)} />
        </div>
    );
}

export function DetailsItemImages({ part }: { part: Item }) {
    return (
        <pre className="details-sprites">
            {getItemSpriteImageNames(part).map((imageName, i) => (
                <img key={i} src={imageName} />
            ))}
        </pre>
    );
}

const extraNumRegex = /(?:Disposable|Unstable) \((\d*)\)/;
export function DetailsItemTitleLine({ part }: { part: Item }) {
    let extraNumText = "";
    if (part.specialTrait !== undefined) {
        let result = extraNumRegex.exec(part.specialTrait);
        if (result !== null) {
            extraNumText = ` (${result[1]})`;
        }
    }

    return (
        <pre className="details-title details-item-image-title">
            {part.name}
            {extraNumText}
        </pre>
    );
}

export function DetailsTextLine({
    category,
    content,
    defaultContent,
    tooltipOverride,
}: {
    category: string;
    content?: string | ReactNode;
    defaultContent?: string;
    tooltipOverride?: string;
}) {
    if (content === undefined && defaultContent) {
        content = <span className="details-dim-text">{defaultContent}</span>;
    }

    if (content === undefined) {
        return <pre className="details-line"> {category}</pre>;
    }

    const numSpaces = 23 - 1 - category.length;

    return wrapInToolTipIfExists(
        <pre className="details-line">
            {" "}
            {category}
            {" ".repeat(numSpaces)}
            {content}
        </pre>,
        tooltipOverride || (content as string),
        category,
    );
}

export function DetailsTextLineDim({
    category,
    text,
    tooltipOverride,
}: {
    category: string;
    text: string;
    tooltipOverride?: string;
}) {
    const numSpaces = 23 - 1 - category.length;

    return wrapInToolTipIfExists(
        <pre className="details-line">
            {" "}
            {category}
            {" ".repeat(numSpaces)}
            <span className="details-dim-text">{text}</span>
        </pre>,
        tooltipOverride || text,
        category,
    );
}

export function DetailsTextNode({
    category,
    categoryLength,
    content,
}: {
    category: ReactNode;
    categoryLength: number;
    content?: string | ReactNode;
}) {
    if (content === undefined) {
        return <pre className="details-line"> {category}</pre>;
    }

    const numSpaces = 23 - 1 - categoryLength;

    return (
        <pre className="details-line">
            {" "}
            {category}
            {" ".repeat(numSpaces)}
            {content}
        </pre>
    );
}

export type DetailsTextValueLineProps = {
    category: string;
    defaultValueString?: string;
    textNode: string | ReactNode;
    unitString?: string;
    value: string | undefined;
    valueClass?: string;
    tooltipOverride?: string;
};

export function DetailsTextValueLine({
    category,
    defaultValueString,
    textNode,
    unitString,
    valueClass,
    value,
    tooltipOverride,
}: DetailsTextValueLineProps) {
    if (value === undefined) {
        value = defaultValueString || "";
        valueClass = "details-dim-text";
    }

    if (unitString !== undefined) {
        value += unitString;
    }

    const numSpaces = 23 - 1 - 1 - category.length - value.length;

    let valueNode: ReactNode;
    if (valueClass !== undefined) {
        valueNode = <span className={valueClass}>{value}</span>;
    } else {
        valueNode = <>{value}</>;
    }

    const result = (
        <pre className="details-line">
            {" "}
            {category}
            {" ".repeat(numSpaces)}
            {valueNode} {textNode}
        </pre>
    );

    return wrapInToolTipIfExists(result, tooltipOverride || textNode?.toString(), category);
}

export function DetailsRangeLine({
    category,
    colorScheme,
    maxValue = 0,
    minValue = 0,
    defaultValueString = "",
    unitString = "",
    value,
    valueString,
    tooltipOverride,
}: DetailsRangeLineProps) {
    let valueNode: ReactNode;
    if (valueString === undefined || value === undefined) {
        valueString = defaultValueString;
        value = 0;
        valueNode = <span className="details-dim-text">{defaultValueString + unitString}</span>;
    } else {
        valueNode = <>{valueString + unitString}</>;
    }

    // Determine bars and spacing
    const maxBars = 22;
    const numSpaces = 23 - 1 - 1 - category.length - (valueString as string).length - unitString.length;
    let valuePercentage: number;
    if (maxValue - minValue === 0) {
        valuePercentage = 1;
    } else {
        valuePercentage = value / (maxValue - minValue);
    }

    let fullBars = Math.min(Math.floor(maxBars * valuePercentage), 22);

    // Always round away from 0
    // This allows for things like 1/100 to show 1 bar rather than 0
    if (fullBars === 0 && value != minValue) {
        fullBars = 1;
    }

    if (minValue === maxValue) {
        fullBars = 0;
    }
    const emptyBars = maxBars - fullBars;

    // Determine color
    let colorClass: string;
    if (valuePercentage < 0.25) {
        colorClass = colorSchemes[colorScheme].Low;
    } else if (valuePercentage < 0.5) {
        colorClass = colorSchemes[colorScheme].MidLow;
    } else if (valuePercentage < 0.75) {
        colorClass = colorSchemes[colorScheme].MidHigh;
    } else {
        colorClass = colorSchemes[colorScheme].High;
    }

    // Create bars HTML string
    let barsNode: ReactNode;
    if (emptyBars > 0) {
        barsNode = (
            <>
                <span className={colorClass}>{"▮".repeat(fullBars)}</span>
                <span className="details-range-dim">{"▯".repeat(emptyBars)}</span>
            </>
        );
    } else {
        barsNode = <span className={colorClass}>{"▮".repeat(fullBars)}</span>;
    }

    // Return full HTML
    return wrapInToolTipIfExists(
        <pre className="details-line">
            <span> {category}</span>
            {" ".repeat(numSpaces)}
            {valueNode} {barsNode}
        </pre>,
        tooltipOverride || value?.toString(),
        category,
    );
}

export function DetailsSummaryLine({ text }: { text: string }) {
    return <pre className="details-summary">{text}</pre>;
}

export function DetailsProjectileSummaryLine({ category, item }: { category: string; item: WeaponItem }) {
    if (item.projectileCount > 1) {
        return (
            <pre className="details-summary">
                {category}
                {" ".repeat(13)}
                <span className="projectile-num"> x{item.projectileCount} </span>
            </pre>
        );
    } else {
        return <DetailsSummaryLine text={category} />;
    }
}

export default function DetailsValueLine({
    category,
    defaultValue,
    unitString = "",
    valueString,
    tooltipOverride,
}: {
    category: string;
    defaultValue?: string;
    unitString?: string;
    valueString: string | undefined;
    tooltipOverride?: string;
}) {
    let valueNode: ReactNode;

    if (valueString === undefined) {
        if (defaultValue === undefined) {
            valueNode = "";
            valueString = "";
        } else {
            valueString = defaultValue + unitString;
            valueNode = <span className="details-dim-text">{valueString}</span>;
        }
    } else {
        valueString += unitString;
        valueNode = valueString;
    }

    const numSpaces = 23 - 1 - category.length - 1 - valueString.length;
    return wrapInToolTipIfExists(
        <pre className="details-line">
            {" "}
            {category}
            {" ".repeat(numSpaces)}
            {valueNode}
        </pre>,
        tooltipOverride || valueString,
        category,
    );
}

export function WikiLink({ wikiPage }: { wikiPage: string }) {
    return (
        <ButtonLink className="wiki-link-button" href={`~/${rootDirectory}/wiki/${wikiPage}`} tabIndex={-1}>
            Wiki
        </ButtonLink>
    );
}

function wrapInToolTipIfExists(node: ReactNode, value?: string, category?: string) {
    value = typeof value === "string" ? value.trim() : value;
    category = typeof category === "string" ? category.trim() : category;

    if (value && value in TooltipTexts) {
        return (
            <TextTooltip tooltipText={TooltipTexts[value]}>
                <div>{node}</div>
            </TextTooltip>
        );
    } else if (category && category in TooltipTexts) {
        return (
            <TextTooltip tooltipText={TooltipTexts[category]}>
                <div>{node}</div>
            </TextTooltip>
        );
    } else {
        console.log(`Missing category ${category}`);
        return node;
    }
}
