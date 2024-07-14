import { ReactNode } from "react";

import { Bot } from "../../types/botTypes";
import { Item, WeaponItem } from "../../types/itemTypes";
import { getBotImageName, getItemAsciiArtImageName, getItemSpriteImageName } from "../../utilities/common";

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

import TextTooltip from "../Popover/TextTooltip";

const TooltipTexts = {
    //General Item Stats
    "Type": "General classification of this item.",
    "Mass": "Mass of an attached item contributes to a robot's total mass and affects its movement speed. Items held in inventory do not count towards total mass for movement calculation purposes.",   "Slot": "Type of slot the part can be attached to, if applicable. Larger items may occupy multiple slots, both in the inventory and when attached.",
    "Integrity": "Integrity reflects the amount of damage a part can sustain before it is destroyed or rendered useless. Maximum integrity for a part type that cannot be repaired is preceded by a *.",
    "Coverage": "Coverage is a relative indicator of how likely this part is to be hit by a successful incoming attack compared to other attached parts. For example, a part with 100 coverage is twice as likely to be hit as another part with a value of 50. Armor, protective and large parts tend to have higher coverage values while small subsystems provide less coverage but are therefore less likely to be damaged.",
    "Heat": "Heat produced each turn while this part is active.",
    "Rating": "Rating is a relative indicator of the item's usefulness and/or value. When comparing items, the quickest and easiest method is to go with whatever has the highest rating. However, prototypes are almost always better than common parts with a similar rating (generally implying a +1 to their listed rating).",
    "Stability (Engine)": "Stability represents the ability of this power source to generate energy while overloaded without suffering any negative side-effects. Overloading doubles output and heat. If N/A, this power source cannot be overloaded; only cooled power sources support overloading.",
    "Matter": "Matter consumed each turn by this part while active.",
    "Energy": "Energy consumed each turn by this part while active.",
    "Storage": "Energy storage capacity of this power source. Excess energy can be stored, but requires additional utilities.",
    "Supply": "Energy generated each turn by this power source.",
    // Bot Stats
    "Class": "Robots are divided into classes based on their purpose.",
    "Size": "Robot size category determines their likeliness of being struck by both targeted and stray shots, as well as their chance to suffer knockback. Smaller robots do not necessarily occupy their entire position, see the manual under Combat > Targeting for more about how this affects lines of fire.",
    "Rating (Bot)": "Rating summarizes the robot's overall effectiveness in combat situations, thus highly-rated robots are far more dangerous.",
    // Damage Types
    "Kinetic": "Ballistic weapons generally have a longer effective range and more destructive critical strikes, but suffer from less predictable damage and high recoil. Kinetic cannon hits also blast usable matter off target robots and have a chance to cause knockback depending on damage, range, and size of target.",
    "Thermal": "Thermal weapons generally have a shorter effective range, but benefit from a more easily predictable damage potential and little or no recoil. Thermal damage also generally transfers heat to the target, and may cause meltdowns in hot enough targets.",
    "Phasic": "Phasic weapons inflict a static amount of damage to targets, and are only resistable via energy-based shields.",
    "Entropic": "Entropic weapons are capable of inflicting significant, if variable, damage over long ranges, and cannot be resisted by anything but energy-based shields. However, the weapon itself is always damaged in the firing process.",
    "Piercing": "Piercing melee weapons inflict less collateral damage, but get double the melee momentum damage bonus and are more likely to hit a robot's core (+8% to exposure, a <half_stack> effect when factored alongside Core Analyzers).",
    "Slashing": "Slashing melee weapons are generally very damaging, and most are also capable of severing components from a target without destroying them.",
    "Smashing": "Impact melee weapons have a damage-equivalent chance to cause knockback, and ignore coverage thus are effective at destroying fragile systems. By ignoring coverage, there is an equal chance for an attack to hit any given part, where each slot of a multislot part also has a separate and equivalent chance to be hit. A target's core also counts as one slot for that purpose. For every component crushed by an impact, its owner's system is significantly corrupted (+25-150%), though electromagnetic resistance can help mitigate this effect. (Cogmind is less susceptible to corruption caused in this manner.)",
    "Electromagnetic": "Electromagnetic weapons have less of an impact on integrity, but are capable of corrupting a target's computer systems. Anywhere from 50 to 150% of damage done is also applied as system corruption. (Cogmind is less susceptible to EM-caused corruption, but still has a damage% chance to suffer 1 point of system corruption per hit.) EM-based explosions only deal half damage to inactive items lying on the ground, but can also corrupt them.",
    "Explosive": "While powerful, explosives generally spread damage across each target in the area of effect. Explosions also tend to reduce the amount of salvage remaining after destroying a target.",
    // General Weapon Stats
    "Range": "Maximum effective range.",
    "Energy (Gun)": "Energy required to fire this weapon.",
    "Energy (Melee)": "Energy required to attack with this weapon.",
    "Matter (Gun)": "Matter consumed when firing this weapon.",
    "Matter (Melee)": "Matter consumed when attacking with this weapon.",
    "Heat (Gun)": "Heat produced by firing this weapon. This value is averaged over the number of turns it takes to fire, and therefore not applied all at once.",
    "Heat (Melee)": "Heat produced by attack with this weapon.",
    "Recoil": "Recoil causes any other weapons fired in the same volley to suffer this penalty to their accuracy.",
    "Targeting": "This is a direct modifier to the weapon's accuracy calculation when firing. Some weapons are inherently easier or more difficult to accurately target with.",
    "Delay": "This is a direct modifier to the time it takes to fire the weapon. Some weapons are inherently faster or slower to fire.",
    "Delay (Melee)": "This is a direct modifier to the time it takes to attack with this weapon. Some weapons are inherently faster or slower to attack with.",
    "Stability": "Stability represents the ability of this weapon to fire while overloaded without suffering any negative side-effects. Overloading doubles damage and energy cost, and generates triple the heat. If N/A, this weapon cannot be overloaded; only some energy weapons support overloading. While overloaded, heat transfer is one level higher than usual where applicable.",
    "Arc": "Total angle within which projectiles are randomly distributed around the target, spreading them along an arc of a circle centered on the shot origin. Improved targeting has no effect on the spread, which is always centered around the line of fire.",
    // Projectile Stats (damage type is never absent, thus not present)
    "Damage": "Range of potential damage at the point of impact.",
    "Critical": "Some weapons have a chance to inflict a critical strike, of which there are a variety of types, each with their own context help containing details.",
    "Penetration": "Chance this projectile may penetrate each consecutive object it hits, e.g. 100 / 80 / 50 may pass through up to three objects, with a 100% chance for the first, followed by 80% and 50% for the remaining two. Huge robots count as a single object for penetration purposes.",
    "Spectrum": "Range of electromagnetic spectrum, with narrower ranges more likely to trigger chain explosions in power sources. (Cogmind's power sources are immune to this effect from projectiles.)",
    "Salvage": "Amount by which the salvage potential of a given robot is affected each time hit by this weapon. While usually negative, reducing the amount of usable salvage, some special weapons may increase salvage by disabling a robot with minimal collateral damage.",
    "Disruption": "Chance this projectile may temporarily disable an active part on impact. If a robot core is struck, there is half this chance the entire robot may be disabled.",
    "Heat Transfer": "Relative heat transferred to a target, where each projectile impact heats it up separately. Also the chance to melt a part on a robot that is already overheating at the time of heat transfer. Overloaded thermal weapons transfer heat at one level higher than their normal amount.",
    // Weapon Criticals
    "Destroy": "Chance for this weapon to instantly destroy the hit component, or even a robot core. (Cogmind is less susceptible to this effect, which can only destroy those parts which are already below 33% integrity when hit.) Armor is immune to this effect, instead taking an additional 20% damage.",
    "Meltdown": "Chance for this weapon to instantly cause robot meltdown regardless of what part was hit. (Cogmind is less susceptible to this effect, instead gaining damage*10 extra heat.)",
    "Burn": "Chance for this weapon to inflict triple its normal amount of heat transfer.",
    "Impale": "Chance for this weapon to inflict twice as much damage and further delay both attacker and target's next opportunity to act by 1 turn. The attacker is not delayed if this effect is a property of a non-melee weapon.",
    "Sever": "Chance for this weapon to sever target part. On a core hit, slightly damages and severs a random part.",
    "Corrupt": "Chance for this weapon to automatically maximize the amount of system corruption inflicted on the target. If target is Cogmind, the amount of corruption is randomized from 1-10% of the damage.",
    "Blast": "Chance for this weapon to apply the same amount of damage to the core or a second part, ignoring coverage, and if not destroyed then the second part is knocked to the ground.",
    "Smash": "Chance for this weapon to instantly destroy the hit component, or even a robot core. (Cogmind is less susceptible to this effect, which can only destroy those parts which are already below 33% integrity when hit.) Armor is immune to this effect, instead taking an additional 20% damage. On smashing a part, an equal amount of damage is then applied as overflow damage, although unlike regular overflow damage this may be absorbed by any shielding protecting the secondary target.",
    "Detonate": "Chance for this weapon to detonate an engine, regardless of what part was hit.",
}   

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

function WrapInToolTipIfExists(node: ReactNode, value?: string | number, category?: string | number) {
    if(value != null && value in TooltipTexts) {
        return (
            <TextTooltip tooltipText={TooltipTexts[value]}>
                <div>
                    {node}
                </div>
            </TextTooltip>
        )
    }
    else if(category != null && category in TooltipTexts) {
        return (
            <TextTooltip tooltipText={TooltipTexts[category]}>
                <div>
                    {node}
                </div>
            </TextTooltip>
        )
    }
    return node
}

export function DetailsBotTitleLine({ bot }: { bot: Bot }) {
    return (
        <pre className="details-title details-bot-image-title">
            {bot.name} [<img src={getBotImageName(bot)} />]
        </pre>
    );
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

export function DetailsItemTitleLine({ part }: { part: Item }) {
    return (
        <pre className="details-title details-item-image-title">
            {part.name} [<img src={getItemSpriteImageName(part)} />]
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

    return WrapInToolTipIfExists((
        <pre className="details-line">
            {" "}
            {category}
            {" ".repeat(numSpaces)}
            {content}
        </pre>
    ), tooltipOverride || content as string, category);
}

export function DetailsTextLineDim({ category, text }: { category: string; text: string }) {
    const numSpaces = 23 - 1 - category.length;
    return (
        <pre className="details-line">
            {" "}
            {category}
            {" ".repeat(numSpaces)}
            <span className="details-dim-text">{text}</span>
        </pre>
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
    tooltipOverride?: string
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

    return WrapInToolTipIfExists(result, tooltipOverride || textNode?.toString(), category)
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
    return WrapInToolTipIfExists((
        <pre className="details-line">
            <span> {category}</span>
            {" ".repeat(numSpaces)}
            {valueNode} {barsNode}
        </pre>
    ), tooltipOverride || value, category);
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
    return WrapInToolTipIfExists((
        <pre className="details-line">
            {" "}
            {category}
            {" ".repeat(numSpaces)}
            {valueNode}
        </pre>
    ), tooltipOverride || valueString, category);
}
