import { ReactNode } from "react";

import {
    HeatTransfer,
    Item,
    ItemRatingCategory,
    PowerItem,
    PropulsionItem,
    Spectrum,
    UtilityItem,
    WeaponItem,
} from "../../types/itemTypes";
import { parseIntOrDefault } from "../../utilities/common";
import DetailsValueLine, {
    DetailsEmptyLine,
    DetailsItemArtLine,
    DetailsItemImages,
    DetailsItemTitleLine,
    DetailsProjectileSummaryLine,
    DetailsRangeLine,
    DetailsSummaryLine,
    DetailsTextLine,
    DetailsTextValueLine,
} from "./Details";

import "./Details.less";

function getDamageValue(item: WeaponItem) {
    const damageString = item.damage as string;
    const damageArray = damageString
        .split("-")
        .map((s) => s.trim())
        .map((s) => parseInt(s));
    return damageArray.reduce((sum, val) => sum + val, 0) / damageArray.length;
}

function getDelayString(item: WeaponItem) {
    if (item.delay === undefined) {
        return undefined;
    } else {
        if (item.delay > 0) {
            return "+" + item.delay;
        }

        return item.delay.toString();
    }
}

function getExplosionValue(item: WeaponItem) {
    const damageString = item.explosionDamage as string;
    const damageArray = damageString
        .split("-")
        .map((s) => s.trim())
        .map((s) => parseInt(s));
    return damageArray.reduce((sum, val) => sum + val, 0) / damageArray.length;
}

function getHeatTransferString(heatTransfer: HeatTransfer | undefined) {
    if (heatTransfer === undefined) {
        return undefined;
    }

    return heatTransfer.replace("(", "(+");
}

function getPenetrationTextString(item: WeaponItem): string {
    const penetrationString = item.penetration;

    if (penetrationString === undefined) {
        return "";
    }

    const penetrationArray = penetrationString.split("/").map((s) => s.trim());

    return penetrationArray.join(" / ");
}

function getPenetrationValueClass(item: WeaponItem): string {
    if (item.penetration !== undefined) {
        return "";
    }

    return "details-dim-text";
}

function getPenetrationValue(item: WeaponItem): string {
    const penetrationString = item.penetration;

    if (penetrationString === undefined) {
        return "x0";
    }

    if (penetrationString === "Unlimited") {
        return "x*";
    }

    const penetrationArray = penetrationString.split("/").map((s) => s.trim());

    return "x" + penetrationArray.length;
}

function getRatingNode(item: Item) {
    switch (item.category) {
        case ItemRatingCategory.Alien:
            return <span className="rating-alien"> Alien </span>;

        case ItemRatingCategory.Prototype:
            return <span className="rating-prototype"> Prototype </span>;

        case ItemRatingCategory.None:
            return <span className="details-dim-text">Standard</span>;
    }
}

function getSchematicString(item: Item) {
    if (item.hackable) {
        return "Hackable";
    } else if (item.fabrication != null) {
        return "Not Hackable";
    }

    return undefined;
}

function getSchematicDepthString(item: Item) {
    function capRange(depth: number) {
        return Math.floor(Math.max(Math.min(10, depth), 1));
    }

    if (item.hackable) {
        let levelOneDepth = 11 - item.rating;
        let levelTwoDepth = levelOneDepth + 1;
        let levelThreeDepth = levelTwoDepth + 1;
        levelOneDepth = capRange(levelOneDepth);
        levelTwoDepth = capRange(levelTwoDepth);
        levelThreeDepth = capRange(levelThreeDepth);
        return `1/-${levelOneDepth}  2/-${levelTwoDepth}  3/-${levelThreeDepth}`;
    }

    return "";
}

function getSlotString(item: Item): ReactNode {
    let slotType = item.slot as string;

    if (slotType == "N/A") {
        // Take care of item special cases
        if (item.type == "Item" || item.type == "Trap") {
            slotType = "Inventory";
        } else {
            return <span className="details-dim-text">N/A</span>;
        }
    }

    if (item.size > 1) {
        return (
            <>
                {slotType} x{item.size}
            </>
        );
    }

    return slotType;
}

function getSpectrumString(spectrum: Spectrum | undefined) {
    if (spectrum === undefined) {
        return undefined;
    }

    return spectrum.replace(")", "%)");
}

function signedStringOrUndefined(val: number | undefined): string | undefined {
    if (val === undefined) {
        return undefined;
    }

    if (val > 0) {
        return "+" + val;
    }

    return val.toString();
}

function splitEffectDescription(val: string) {
    const lines = val.split("\n");

    const nodes = lines.map((l, i) => (
        <span key={i} className="details-description">
            &nbsp;{l}
        </span>
    ));
    return <>{nodes}</>;
}

function CannonGunPartDetails({ item }: { item: WeaponItem }) {
    return (
        <>
            <DetailsEmptyLine />
            <DetailsSummaryLine text="Shot" />
            <DetailsRangeLine
                category="Range"
                colorScheme="HighGood"
                maxValue={20}
                value={item.range}
                valueString={item.range.toString()}
            />
            <DetailsRangeLine
                category="Energy"
                colorScheme="LowGood"
                defaultValueString="-0"
                maxValue={50}
                tooltipOverride="Energy (Gun)"
                value={item.shotEnergy}
                valueString={"-" + item.shotEnergy}
            />
            <DetailsRangeLine
                category="Matter"
                colorScheme="LowGood"
                defaultValueString="-0"
                maxValue={25}
                tooltipOverride="Matter (Gun)"
                value={item.shotMatter}
                valueString={"-" + item.shotMatter}
            />
            <DetailsRangeLine
                category="Heat"
                colorScheme="LowGood"
                defaultValueString="+0"
                maxValue={100}
                value={item.shotHeat}
                valueString={"+" + item.shotHeat}
            />
            <DetailsValueLine category="Recoil" defaultValue="0" valueString={item.recoil?.toString()} />
            <DetailsValueLine
                category="Targeting"
                defaultValue="0"
                valueString={signedStringOrUndefined(item.targeting)}
                unitString="%"
            />
            <DetailsValueLine category="Delay" valueString={getDelayString(item)} defaultValue="0" />
            <DetailsRangeLine
                category="Stability"
                colorScheme="HighGood"
                defaultValueString="N/A"
                maxValue={100}
                value={item.overloadStability}
                valueString={item.overloadStability === undefined ? undefined : item.overloadStability + "%"}
            />
            {item.waypoints === undefined ? (
                <DetailsValueLine category="Arc" valueString={item.arc?.toString()} defaultValue="N/A" />
            ) : (
                <DetailsValueLine category="Waypoints" valueString={item.waypoints} />
            )}
            <DetailsEmptyLine />
            <DetailsProjectileSummaryLine category="Projectile" item={item} />
            <DetailsRangeLine
                category="Damage"
                colorScheme="Green"
                maxValue={100}
                value={getDamageValue(item)}
                valueString={item.damage}
            />
            <DetailsTextLine category="Type" content={item.damageType} />
            <DetailsTextValueLine
                category="Critical"
                value={item.critical?.toString()}
                textNode={item.criticalType?.toString()}
                defaultValueString="0"
                unitString="%"
            />
            <DetailsTextValueLine
                category="Penetration"
                textNode={getPenetrationTextString(item)}
                value={getPenetrationValue(item)}
                valueClass={getPenetrationValueClass(item)}
            />
            {item.heatTransfer === undefined ? (
                <DetailsTextLine category="Spectrum" content={getSpectrumString(item.spectrum)} defaultContent="N/A" />
            ) : (
                <DetailsTextLine category="Heat Transfer" content={getHeatTransferString(item.heatTransfer)} />
            )}
            <DetailsRangeLine
                category="Disruption"
                colorScheme="Green"
                maxValue={50}
                defaultValueString="0"
                value={item.disruption}
                valueString={item.disruption?.toString()}
                unitString="%"
            />
            <DetailsValueLine category="Salvage" valueString={signedStringOrUndefined(item.salvage)} defaultValue="0" />
        </>
    );
}

function LauncherPartDetails({ item }: { item: WeaponItem }) {
    return (
        <>
            <DetailsEmptyLine />
            <DetailsSummaryLine text="Shot" />
            <DetailsRangeLine
                category="Range"
                colorScheme="HighGood"
                maxValue={20}
                value={item.range}
                valueString={item.range.toString()}
            />
            <DetailsRangeLine
                category="Energy"
                colorScheme="LowGood"
                defaultValueString="-0"
                maxValue={50}
                tooltipOverride="Energy (Gun)"
                value={item.shotEnergy}
                valueString={"-" + item.shotEnergy}
            />
            <DetailsRangeLine
                category="Matter"
                colorScheme="LowGood"
                defaultValueString="-0"
                maxValue={25}
                tooltipOverride="Matter (Gun)"
                value={item.shotMatter}
                valueString={"-" + item.shotMatter}
            />
            <DetailsRangeLine
                category="Heat"
                colorScheme="LowGood"
                defaultValueString="+0"
                maxValue={100}
                value={item.shotHeat}
                valueString={"+" + item.shotHeat}
            />
            <DetailsValueLine category="Recoil" defaultValue="0" valueString={item.recoil?.toString()} />
            <DetailsValueLine
                category="Targeting"
                defaultValue="0"
                valueString={signedStringOrUndefined(item.targeting)}
                unitString="%"
            />
            <DetailsValueLine category="Delay" valueString={getDelayString(item)} defaultValue="0" />
            <DetailsRangeLine
                category="Stability"
                colorScheme="HighGood"
                defaultValueString="N/A"
                maxValue={100}
                value={item.overloadStability}
                valueString={item.overloadStability === undefined ? undefined : item.overloadStability + "%"}
            />
            {item.waypoints === undefined ? (
                <DetailsValueLine category="Arc" valueString={item.arc?.toString()} defaultValue="N/A" />
            ) : (
                <DetailsValueLine category="Waypoints" valueString={item.waypoints} />
            )}
            <DetailsEmptyLine />
            <DetailsProjectileSummaryLine category="Explosion" item={item} />
            <DetailsRangeLine
                category="Radius"
                colorScheme="Green"
                maxValue={8}
                value={item.explosionRadius}
                valueString={item.explosionRadius?.toString()}
            />
            <DetailsRangeLine
                category="Damage"
                colorScheme="Green"
                maxValue={100}
                value={getExplosionValue(item)}
                valueString={item.explosionDamage}
            />
            <DetailsValueLine
                category=" Falloff"
                valueString={item.falloff === undefined ? undefined : "-" + item.falloff}
            />
            <DetailsValueLine
                category=" Chunks"
                valueString={
                    item.minChunks === undefined && item.maxChunks === undefined
                        ? "1"
                        : `${item.minChunks}-${item.maxChunks}`
                }
            />
            <DetailsTextLine category="Type" content={item.explosionType} />
            {item.explosionHeatTransfer === undefined ? (
                <DetailsTextLine
                    category="Spectrum"
                    content={getSpectrumString(item.explosionSpectrum)}
                    defaultContent="N/A"
                />
            ) : (
                <DetailsTextLine category="Heat Transfer" content={getHeatTransferString(item.explosionHeatTransfer)} />
            )}
            <DetailsRangeLine
                category="Disruption"
                colorScheme="Green"
                maxValue={50}
                value={item.explosionDisruption}
                valueString={item.explosionDisruption?.toString()}
                unitString="%"
                defaultValueString="0"
            />
            <DetailsValueLine
                category="Salvage"
                valueString={signedStringOrUndefined(item.explosionSalvage)}
                defaultValue="0"
            />
        </>
    );
}

function MeleeWeaponPartDetails({ item }: { item: WeaponItem }) {
    return (
        <>
            <DetailsEmptyLine />
            <DetailsSummaryLine text="Attack" />
            <DetailsRangeLine
                category="Energy"
                colorScheme="LowGood"
                defaultValueString="-0"
                maxValue={50}
                tooltipOverride="Energy (Melee)"
                value={item.shotEnergy}
                valueString={"-" + item.shotEnergy}
            />
            <DetailsRangeLine
                category="Matter"
                colorScheme="LowGood"
                defaultValueString="-0"
                maxValue={25}
                tooltipOverride="Matter (Melee)"
                value={item.shotMatter}
                valueString={"-" + item.shotMatter}
            />
            <DetailsRangeLine
                category="Heat"
                colorScheme="LowGood"
                defaultValueString="+0"
                maxValue={100}
                value={item.shotHeat}
                valueString={"+" + item.shotHeat}
            />
            <DetailsValueLine
                category="Targeting"
                defaultValue="0"
                valueString={signedStringOrUndefined(item.targeting)}
                unitString="%"
            />
            <DetailsValueLine category="Delay" tooltipOverride="Delay (Melee)" valueString={getDelayString(item)} defaultValue="0" />
            <DetailsEmptyLine />
            <DetailsSummaryLine text="Hit" />
            <DetailsRangeLine
                category="Damage"
                colorScheme="Green"
                maxValue={100}
                value={getDamageValue(item)}
                valueString={item.damage}
            />
            <DetailsTextLine category="Type" content={item.damageType} />
            <DetailsTextValueLine
                category="Critical"
                value={item.critical?.toString()}
                textNode={item.criticalType?.toString()}
                defaultValueString="0"
                unitString="%"
            />
            <DetailsRangeLine
                category="Disruption"
                colorScheme="Green"
                maxValue={50}
                defaultValueString="0"
                value={item.disruption}
                valueString={item.disruption?.toString()}
                unitString="%"
            />
            <DetailsValueLine category="Salvage" valueString={signedStringOrUndefined(item.salvage)} defaultValue="0" />
        </>
    );
}

function PowerPartDetails({ item }: { item: PowerItem }) {
    return (
        <>
            <DetailsEmptyLine />
            <DetailsSummaryLine text="Active Upkeep" />
            <DetailsRangeLine category="Energy" colorScheme="LowGood" defaultValueString="-0" valueString="-0" />
            <DetailsRangeLine
                category="Matter"
                colorScheme="LowGood"
                maxValue={25}
                defaultValueString="-0"
                value={item.matterUpkeep}
                valueString={item.matterUpkeep === undefined ? undefined : "-" + item.matterUpkeep}
            />
            <DetailsRangeLine
                category="Heat"
                colorScheme="LowGood"
                maxValue={20}
                defaultValueString="+0"
                value={item.heatGeneration}
                valueString={"+" + item.heatGeneration}
            />
            <DetailsEmptyLine />
            <DetailsSummaryLine text="Power" />
            <DetailsRangeLine
                category="Supply"
                colorScheme="Green"
                maxValue={30}
                defaultValueString="+0"
                value={item.energyGeneration}
                valueString={
                    item.energyGeneration === undefined || item.energyGeneration === 0
                        ? undefined
                        : "+" + item.energyGeneration
                }
            />
            <DetailsRangeLine
                category="Storage"
                colorScheme="HighGood"
                maxValue={100}
                defaultValueString="0"
                value={item.energyStorage}
                valueString={item.energyStorage?.toString()}
            />
            <DetailsRangeLine
                category="Stability"
                tooltipOverride="Stability (Engine)"
                colorScheme="HighGood"
                maxValue={100}
                defaultValueString="N/A"
                value={item.powerStability}
                valueString={item.powerStability + "%"}
            />
        </>
    );
}

function PropulsionPartDetails({ item }: { item: PropulsionItem }) {
    return (
        <>
            <DetailsEmptyLine />
            <DetailsSummaryLine text="Active Upkeep" />
            <DetailsRangeLine
                category="Energy"
                colorScheme="LowGood"
                maxValue={20}
                defaultValueString="-0"
                value={item.energyUpkeep}
                valueString={"-" + item.energyUpkeep}
            />
            <DetailsRangeLine category="Matter" colorScheme="LowGood" defaultValueString="-0" value={0} />
            <DetailsRangeLine
                category="Heat"
                colorScheme="LowGood"
                maxValue={20}
                defaultValueString="+0"
                value={item.heatGeneration}
                valueString={"+" + item.heatGeneration}
            />
            <DetailsEmptyLine />
            <DetailsSummaryLine text="Propulsion" />
            <DetailsRangeLine
                category="Time/Move"
                colorScheme="LowGood"
                maxValue={150}
                value={item.timePerMove}
                valueString={item.timePerMove.toString()}
            />
            {item.modPerExtra === undefined ? (
                <DetailsValueLine category="Drag" valueString={item.drag?.toString() ?? "0"} />
            ) : (
                <DetailsValueLine category=" Mod/Extra" valueString={item.modPerExtra.toString()} />
            )}
            <DetailsRangeLine
                category="Energy"
                colorScheme="LowGood"
                maxValue={10}
                defaultValueString="-0"
                value={item.energyPerMove}
                valueString={"-" + item.energyPerMove}
            />
            <DetailsRangeLine
                category="Heat"
                colorScheme="LowGood"
                maxValue={10}
                defaultValueString="+0"
                value={item.heatPerMove}
                valueString={"+" + item.heatPerMove}
            />
            <DetailsRangeLine
                category="Support"
                colorScheme="HighGood"
                maxValue={20}
                defaultValueString="+0"
                value={item.support}
                valueString={item.support.toString()}
            />
            <DetailsRangeLine
                category=" Penalty"
                colorScheme="LowGood"
                maxValue={60}
                defaultValueString="0"
                value={item.penalty}
                valueString={item.penalty?.toString()}
            />
            {item.type === "Treads" ? (
                <DetailsTextLine category="Siege" content={item.siege} defaultContent="N/A" />
            ) : (
                <DetailsRangeLine
                    category="Burnout"
                    colorScheme="LowGood"
                    defaultValueString="N/A"
                    maxValue={100}
                    value={parseIntOrDefault(item.burnout, 0)}
                    valueString={item.burnout}
                />
            )}
        </>
    );
}

function UtilityPartDetails({ item }: { item: UtilityItem }) {
    return (
        <>
            <DetailsEmptyLine />
            <DetailsSummaryLine text="Active Upkeep" />
            <DetailsRangeLine
                category="Energy"
                colorScheme="LowGood"
                defaultValueString="-0"
                maxValue={20}
                value={item.energyUpkeep}
                valueString={"-" + item.energyUpkeep}
            />
            <DetailsRangeLine
                category="Matter"
                colorScheme="LowGood"
                defaultValueString="-0"
                maxValue={25}
                value={item.matterUpkeep}
                valueString={"-" + item.matterUpkeep}
            />
            <DetailsRangeLine
                category="Heat"
                colorScheme="LowGood"
                defaultValueString="+0"
                maxValue={20}
                value={item.heatGeneration}
                valueString={"+" + item.heatGeneration}
            />
        </>
    );
}

function SpecialMeleeWeaponPartDetails({ item }: { item: WeaponItem }) {
    return (
        <>
            <DetailsEmptyLine />
            <DetailsSummaryLine text="Attack" />
            <DetailsRangeLine
                category="Energy"
                colorScheme="LowGood"
                defaultValueString="-0"
                maxValue={50}
                tooltipOverride="Energy (Melee)"
                value={item.shotEnergy}
                valueString={"-" + item.shotEnergy}
            />
            <DetailsRangeLine
                category="Matter"
                colorScheme="LowGood"
                defaultValueString="-0"
                maxValue={25}
                tooltipOverride="Matter (Melee)"
                value={item.shotMatter}
                valueString={"-" + item.shotMatter}
            />
            <DetailsRangeLine
                category="Heat"
                colorScheme="LowGood"
                defaultValueString="+0"
                maxValue={100}
                value={item.shotHeat}
                valueString={"+" + item.shotHeat}
            />
            <DetailsValueLine
                category="Targeting"
                defaultValue="0"
                valueString={signedStringOrUndefined(item.targeting)}
                unitString="%"
            />
            <DetailsValueLine category="Delay" tooltipOverride="Delay (Melee)" valueString={getDelayString(item)} defaultValue="0" />
        </>
    );
}

function SpecialWeaponPartDetails({ item }: { item: WeaponItem }) {
    let damageNode: ReactNode | undefined;

    if (item.damage !== undefined) {
        // Only some special weapons have damage
        damageNode = (
            <>
                {" "}
                <DetailsEmptyLine />
                <DetailsProjectileSummaryLine category="Projectile" item={item} />
                <DetailsRangeLine
                    category="Damage"
                    colorScheme="Green"
                    maxValue={100}
                    value={getDamageValue(item)}
                    valueString={item.damage}
                />
                <DetailsTextLine category="Type" content={item.damageType} />
                <DetailsTextValueLine
                    category="Critical"
                    value={item.critical?.toString()}
                    textNode={item.criticalType?.toString()}
                    defaultValueString="0"
                    unitString="%"
                />
                <DetailsTextValueLine
                    category="Penetration"
                    textNode={getPenetrationTextString(item)}
                    value={getPenetrationValue(item)}
                    valueClass={getPenetrationValueClass(item)}
                />
                {item.heatTransfer === undefined ? (
                    <DetailsTextLine
                        category="Spectrum"
                        content={getSpectrumString(item.spectrum)}
                        defaultContent="N/A"
                    />
                ) : (
                    <DetailsTextLine category="Heat Transfer" content={getHeatTransferString(item.heatTransfer)} />
                )}
                <DetailsRangeLine
                    category="Disruption"
                    colorScheme="Green"
                    maxValue={50}
                    defaultValueString="0"
                    value={item.disruption}
                    valueString={item.disruption?.toString()}
                    unitString="%"
                />
                <DetailsValueLine
                    category="Salvage"
                    valueString={signedStringOrUndefined(item.salvage)}
                    defaultValue="0"
                />
            </>
        );
    } else if (item.explosionDamage !== undefined) {
        damageNode = (
            <>
                <DetailsEmptyLine />
                <DetailsProjectileSummaryLine category="Explosion" item={item} />
                <DetailsRangeLine
                    category="Radius"
                    colorScheme="Green"
                    maxValue={8}
                    value={item.explosionRadius}
                    valueString={item.explosionRadius?.toString()}
                />
                <DetailsRangeLine
                    category="Damage"
                    colorScheme="Green"
                    maxValue={100}
                    value={getExplosionValue(item)}
                    valueString={item.explosionDamage}
                />
                <DetailsValueLine
                    category=" Falloff"
                    valueString={item.falloff === undefined ? undefined : "-" + item.falloff}
                />
                <DetailsTextLine category="Type" content={item.explosionType} />
                {item.explosionHeatTransfer === undefined ? (
                    <DetailsTextLine
                        category="Spectrum"
                        content={getSpectrumString(item.explosionSpectrum)}
                        defaultContent="N/A"
                    />
                ) : (
                    <DetailsTextLine
                        category="Heat Transfer"
                        content={getHeatTransferString(item.explosionHeatTransfer)}
                    />
                )}
                <DetailsRangeLine
                    category="Disruption"
                    colorScheme="Green"
                    maxValue={50}
                    value={item.explosionDisruption}
                    valueString={item.explosionDisruption?.toString()}
                    unitString="%"
                    defaultValueString="0"
                />
            </>
        );
    }

    return (
        <>
            <DetailsEmptyLine />
            <DetailsSummaryLine text="Shot" />
            <DetailsRangeLine
                category="Range"
                colorScheme="HighGood"
                maxValue={20}
                value={item.range}
                valueString={item.range.toString()}
            />
            <DetailsRangeLine
                category="Energy"
                colorScheme="LowGood"
                defaultValueString="-0"
                maxValue={50}
                tooltipOverride="Energy (Gun)"
                value={item.shotEnergy}
                valueString={"-" + item.shotEnergy}
            />
            <DetailsRangeLine
                category="Matter"
                colorScheme="LowGood"
                defaultValueString="-0"
                maxValue={25}
                tooltipOverride="Matter (Gun)"
                value={item.shotMatter}
                valueString={"-" + item.shotMatter}
            />
            <DetailsRangeLine
                category="Heat"
                colorScheme="LowGood"
                defaultValueString="+0"
                maxValue={100}
                value={item.shotHeat}
                valueString={"+" + item.shotHeat}
            />
            <DetailsValueLine category="Recoil" defaultValue="0" valueString={item.recoil?.toString()} />
            <DetailsValueLine
                category="Targeting"
                defaultValue="0"
                valueString={signedStringOrUndefined(item.targeting)}
                unitString="%"
            />
            <DetailsValueLine category="Delay" valueString={getDelayString(item)} defaultValue="0" />
            <DetailsRangeLine
                category="Stability"
                colorScheme="HighGood"
                defaultValueString="N/A"
                maxValue={100}
                value={item.overloadStability}
                valueString={item.overloadStability === undefined ? undefined : item.overloadStability + "%"}
            />
            {item.waypoints === undefined ? (
                <DetailsValueLine category="Arc" valueString={item.arc?.toString()} defaultValue="N/A" />
            ) : (
                <DetailsValueLine category="Waypoints" valueString={item.waypoints} />
            )}
            {damageNode}
        </>
    );
}

export default function ItemDetails({ item }: { item: Item }) {
    let typeSpecificDetails: ReactNode = <></>;
    switch (item.slot) {
        case "Power":
            typeSpecificDetails = <PowerPartDetails item={item as PowerItem} />;
            break;

        case "Propulsion":
            typeSpecificDetails = <PropulsionPartDetails item={item as PropulsionItem} />;
            break;

        case "Utility":
            typeSpecificDetails = <UtilityPartDetails item={item as UtilityItem} />;
            break;

        case "Weapon":
            switch (item.type) {
                case "Ballistic Cannon":
                case "Ballistic Gun":
                case "Energy Cannon":
                case "Energy Gun":
                    typeSpecificDetails = <CannonGunPartDetails item={item as WeaponItem} />;
                    break;

                case "Launcher":
                    typeSpecificDetails = <LauncherPartDetails item={item as WeaponItem} />;
                    break;

                case "Special Melee Weapon":
                    typeSpecificDetails = <SpecialMeleeWeaponPartDetails item={item as WeaponItem} />;
                    break;

                case "Special Weapon":
                    typeSpecificDetails = <SpecialWeaponPartDetails item={item as WeaponItem} />;
                    break;

                case "Impact Weapon":
                case "Slashing Weapon":
                case "Piercing Weapon":
                    typeSpecificDetails = <MeleeWeaponPartDetails item={item as WeaponItem} />;
                    break;
            }
            break;
    }

    let effectDescriptionDetails: ReactNode | undefined;
    if (item.effect !== undefined || item.description !== undefined) {
        let effectDetails: ReactNode | undefined;
        let descriptionDetails: ReactNode | undefined;

        if (item.effect !== undefined) {
            effectDetails = splitEffectDescription(item.effect);
        }

        if (item.description !== undefined) {
            descriptionDetails = splitEffectDescription(item.description);
        }

        effectDescriptionDetails = (
            <>
                <DetailsEmptyLine />
                <DetailsSummaryLine text="Effect" />
                {effectDetails}
                {effectDetails !== undefined && descriptionDetails !== undefined ? <DetailsEmptyLine /> : undefined}
                {descriptionDetails}
            </>
        );
    }

    let fabricationDetails: ReactNode | undefined;
    if (item.fabrication !== undefined) {
        const fabStats = item.fabrication;
        fabricationDetails = (
            <>
                <DetailsEmptyLine />
                <DetailsSummaryLine
                    text={fabStats.number === "1" ? "Fabrication" : `Fabrication x${fabStats.number}`}
                />
                <DetailsTextLine category="Time" content={fabStats.time} />
                <DetailsTextLine category="Components" content="None" />
            </>
        );
    }

    return (
        <div className="part-details">
            <DetailsItemArtLine part={item} />
            <DetailsEmptyLine />
            <DetailsItemTitleLine part={item} />
            <DetailsItemImages part={item} />
            <DetailsSummaryLine text="Overview" />
            <DetailsTextLine category="Type" content={item.type} />
            <DetailsTextLine category="Slot" content={getSlotString(item)} />
            <DetailsRangeLine
                category="Mass"
                colorScheme="LowGood"
                maxValue={15}
                minValue={0}
                defaultValueString="N/A"
                value={item.mass}
                valueString={item.mass?.toString()}
            />
            <DetailsTextValueLine
                category="Rating"
                value={item.ratingString.replace("**", "").replace("*", "")}
                textNode={getRatingNode(item)}
            />
            <DetailsRangeLine
                category="Integrity"
                colorScheme="Green"
                maxValue={1}
                minValue={0}
                valueString={(item.noRepairs ? "*" : "") + item.integrity?.toString()}
                value={1}
            />
            <DetailsValueLine category="Coverage" valueString={item.coverage?.toString() ?? "0"} />
            <DetailsTextLine category="Schematic" content={getSchematicString(item)} defaultContent="N/A" />
            {item.hackable ? (
                <DetailsTextLine category=" Min Terminal/Depth" content={getSchematicDepthString(item)} />
            ) : (
                <DetailsEmptyLine />
            )}
            {typeSpecificDetails}
            {effectDescriptionDetails}
            {fabricationDetails}
        </div>
    );
}
