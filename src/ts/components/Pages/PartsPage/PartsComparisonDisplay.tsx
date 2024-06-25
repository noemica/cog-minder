import React, { ReactNode, useState } from "react";

import {
    Critical,
    DamageType,
    HeatTransfer,
    Item,
    ItemWithUpkeep,
    PowerItem,
    PropulsionItem,
    SiegeMode,
    Spectrum,
    WeaponItem,
} from "../../../types/itemTypes";
import { ItemData } from "../../../utilities/ItemData";
import { parseIntOrDefault } from "../../../utilities/common";
import Button from "../../Buttons/Button";
import ItemDetails from "../../GameDetails/ItemDetails";
import SelectWrapper, { SelectOptionType } from "../../Selectpicker/Select";
import { PartsPageState } from "./PartsPage";

import "./PartsPage.less";

type BaseComparisonProps = {
    children: ReactNode;
};

type ComparisonStatProps = {
    leftValue: number;
    rightValue: number;
};

type ItemComparisonProps = {
    leftItem: Item;
    rightItem: Item;
};

function EmptyComparisonLine() {
    return <pre className="comparison-neutral"> </pre>;
}

function NeutralComparison({ children }: BaseComparisonProps) {
    return <pre className="comparison-neutral">{children}</pre>;
}

function NegativeComparison({ children }: BaseComparisonProps) {
    return <pre className="comparison-negative">{children}</pre>;
}

function PositiveComparison({ children }: BaseComparisonProps) {
    return <pre className="comparison-positive">{children}</pre>;
}

function NeutralComparisonStat({ leftValue, rightValue }: ComparisonStatProps) {
    if (leftValue === rightValue) {
        return <EmptyComparisonLine />;
    } else if (leftValue < rightValue) {
        return <NeutralComparison>(+{rightValue - leftValue})</NeutralComparison>;
    } else {
        return <NeutralComparison>(-{leftValue - rightValue})</NeutralComparison>;
    }
}
function LowGoodComparisonStat({ leftValue, rightValue }: ComparisonStatProps) {
    if (leftValue === rightValue) {
        return <EmptyComparisonLine />;
    } else if (leftValue < rightValue) {
        return <NegativeComparison>+{rightValue - leftValue}</NegativeComparison>;
    } else {
        return <PositiveComparison>-{leftValue - rightValue}</PositiveComparison>;
    }
}

function HighGoodComparisonStat({ leftValue, rightValue }: ComparisonStatProps) {
    if (leftValue === rightValue) {
        return <EmptyComparisonLine />;
    } else if (leftValue < rightValue) {
        return <PositiveComparison>+{rightValue - leftValue}</PositiveComparison>;
    } else {
        return <NegativeComparison>-{leftValue - rightValue}</NegativeComparison>;
    }
}

function ArcOrWaypointsComparison({ leftWeapon, rightWeapon }: { leftWeapon: WeaponItem; rightWeapon: WeaponItem }) {
    if (rightWeapon.waypoints !== undefined) {
        return (
            <HighGoodComparisonStat
                leftValue={parseIntOrDefault(leftWeapon.waypoints, 0)}
                rightValue={parseIntOrDefault(rightWeapon.waypoints, 0)}
            />
        );
    } else {
        return <LowGoodComparisonStat leftValue={leftWeapon.arc ?? 0} rightValue={rightWeapon.arc ?? 0} />;
    }
}

function BurnoutOrSiegeComparison({
    leftPropulsion,
    rightPropulsion,
}: {
    leftPropulsion: PropulsionItem;
    rightPropulsion: PropulsionItem;
}) {
    if (leftPropulsion.burnout !== undefined || rightPropulsion.burnout !== undefined) {
        return (
            <LowGoodComparisonStat
                leftValue={parseIntOrDefault(leftPropulsion.burnout, 0)}
                rightValue={parseIntOrDefault(rightPropulsion.burnout as string, 0)}
            />
        );
    } else if (leftPropulsion.type === "Treads" && rightPropulsion.type === "Treads") {
        if (leftPropulsion.siege === rightPropulsion.siege) {
            return <EmptyComparisonLine />;
        } else if (leftPropulsion.siege === SiegeMode.High) {
            return <NegativeComparison>High</NegativeComparison>;
        } else if (leftPropulsion.siege === SiegeMode.Standard && rightPropulsion.siege === undefined) {
            return <NegativeComparison>Standard</NegativeComparison>;
        } else if (leftPropulsion.siege === undefined) {
            return <PositiveComparison>N/A</PositiveComparison>;
        } else {
            return <PositiveComparison>Standard</PositiveComparison>;
        }
    }

    return <EmptyComparisonLine />;
}

function CriticalComparison({ leftWeapon, rightWeapon }: { leftWeapon: WeaponItem; rightWeapon: WeaponItem }) {
    if (
        leftWeapon.critical === undefined ||
        rightWeapon.critical === undefined ||
        leftWeapon.criticalType === rightWeapon.criticalType
    ) {
        return <HighGoodComparisonStat leftValue={leftWeapon.critical ?? 0} rightValue={rightWeapon.critical ?? 0} />;
    }

    let leftValue: string;
    switch (leftWeapon.criticalType) {
        case Critical.Blast:
            leftValue = "(Blast)";
            break;
        case Critical.Burn:
            leftValue = "(Burn)";
            break;
        case Critical.Corrupt:
            leftValue = "(Corrup)";
            break;
        case Critical.Destroy:
            leftValue = "(Destro)";
            break;
        case Critical.Detonate:
            leftValue = "(Detona)";
            break;
        case Critical.Impale:
            leftValue = "(Impale)";
            break;
        case Critical.Intensify:
            leftValue = "(Intens)";
            break;
        case Critical.Meltdown:
            leftValue = "(Meltdo)";
            break;
        case Critical.Phase:
            leftValue = "(Phase)";
            break;
        case Critical.Sever:
            leftValue = "(Sever)";
            break;
        case Critical.Smash:
            leftValue = "(Smash)";
            break;
        case Critical.Sunder:
            leftValue = "(Sunder)";
            break;
        default:
            throw "Invalid critical type";
    }

    return <NeutralComparison>{leftValue}</NeutralComparison>;
}

function DamageComparison({
    explosive,
    leftWeapon,
    rightWeapon,
}: {
    explosive: boolean;
    leftWeapon: WeaponItem;
    rightWeapon: WeaponItem;
}) {
    function getDamage(damageString: string | undefined) {
        let damageMin = 0;
        let damageMax = 0;

        if (damageString?.includes("-")) {
            const split = damageString.split("-");
            damageMin = parseInt(split[0]);
            damageMax = parseInt(split[1]);
        } else if (damageString !== undefined) {
            damageMin = parseInt(damageString);
            damageMax = damageMin;
        }

        return { average: (damageMax + damageMin) / 2, min: damageMin, max: damageMax };
    }

    let leftDamageString: string;
    let rightDamageString: string;
    if (explosive) {
        leftDamageString = leftWeapon.explosionDamage as string;
        rightDamageString = rightWeapon.explosionDamage as string;
    } else {
        leftDamageString = leftWeapon.damage as string;
        rightDamageString = rightWeapon.damage as string;
    }
    const leftDamage = getDamage(leftDamageString);
    const rightDamage = getDamage(rightDamageString);

    if (leftDamage.average === rightDamage.average) {
        if (leftDamage.min === rightDamage.min) {
            return <EmptyComparisonLine />;
        } else {
            return (
                <NeutralComparison>
                    {leftDamage.min}-{leftDamage.max}
                </NeutralComparison>
            );
        }
    }

    function getPlusOrMinusString(number: number) {
        if (number > 0) {
            return "+" + number;
        } else {
            return number.toString();
        }
    }

    const minDifference = rightDamage.min - leftDamage.min;
    const maxDifference = rightDamage.max - leftDamage.max;
    if (leftDamage.average < rightDamage.average) {
        return (
            <PositiveComparison>
                {getPlusOrMinusString(minDifference)}/{getPlusOrMinusString(maxDifference)}
            </PositiveComparison>
        );
    } else {
        return (
            <NegativeComparison>
                {getPlusOrMinusString(minDifference)}/{getPlusOrMinusString(maxDifference)}
            </NegativeComparison>
        );
    }
}

function DamageTypeComparison({
    explosive,
    leftWeapon,
    rightWeapon,
}: {
    explosive: boolean;
    leftWeapon: WeaponItem;
    rightWeapon: WeaponItem;
}) {
    if (explosive) {
        if (leftWeapon.explosionType === rightWeapon.explosionType || leftWeapon.explosionType === undefined) {
            return <EmptyComparisonLine />;
        }
    } else {
        if (leftWeapon.damageType === rightWeapon.damageType || leftWeapon.damageType === undefined) {
            return <EmptyComparisonLine />;
        }
    }

    function getTypeString(damageType: DamageType) {
        switch (damageType) {
            case "Electromagnetic":
                return "EM";
            case "Entropic":
                return "EN";
            case "Explosive":
                return "EX";
            case "Impact":
                return "I";
            case "Kinetic":
                return "KI";
            case "Phasic":
                return "PH";
            case "Piercing":
                return "P";
            case "Slashing":
                return "S";
            case "Thermal":
                return "TH";
        }

        return "";
    }

    return (
        <NeutralComparison>
            (
            {getTypeString(
                explosive ? (leftWeapon.explosionType as DamageType) : (leftWeapon.damageType as DamageType),
            )}
            )
        </NeutralComparison>
    );
}

function DragOrModComparison({
    leftPropulsion,
    rightPropulsion,
}: {
    leftPropulsion: PropulsionItem;
    rightPropulsion: PropulsionItem;
}) {
    if (leftPropulsion.modPerExtra !== undefined && rightPropulsion.modPerExtra !== undefined) {
        return (
            <LowGoodComparisonStat leftValue={leftPropulsion.modPerExtra} rightValue={rightPropulsion.modPerExtra} />
        );
    } else if (leftPropulsion.drag !== undefined && rightPropulsion.drag !== undefined) {
        return <HighGoodComparisonStat leftValue={leftPropulsion.drag} rightValue={rightPropulsion.drag} />;
    } else {
        return <EmptyComparisonLine />;
    }
}

function RatingComparison({ leftItem, rightItem }: ItemComparisonProps) {
    const leftRating = Math.ceil(leftItem.rating);
    const rightRating = Math.ceil(rightItem.rating);

    if (leftRating === rightRating) {
        return <EmptyComparisonLine />;
    } else if (leftRating < rightRating) {
        let differenceString: string;
        if (leftItem.ratingString.includes("*") || rightItem.ratingString.includes("*")) {
            differenceString = "* +" + (rightRating - leftRating);
        } else {
            differenceString = "+" + (rightRating - leftRating);
        }

        return <pre className="comparison-positive">{differenceString}</pre>;
    } else {
        let differenceString: string;
        if (leftItem.ratingString.includes("*") || rightItem.ratingString.includes("*")) {
            differenceString = "* -" + (leftRating - rightRating);
        } else {
            differenceString = "-" + (leftRating - rightRating);
        }

        return <pre className="comparison-negative">{differenceString}</pre>;
    }
}

function SpectrumOrHeatTransferComparison({
    explosive,
    leftWeapon,
    rightWeapon,
}: {
    explosive: boolean;
    leftWeapon: WeaponItem;
    rightWeapon: WeaponItem;
}) {
    function getSpectrumValue(spectrum: Spectrum | undefined) {
        if (spectrum === Spectrum.Fine) {
            return 100;
        } else if (spectrum === Spectrum.Narrow) {
            return 50;
        } else if (spectrum === Spectrum.Intermediate) {
            return 30;
        } else if (spectrum === Spectrum.Wide) {
            return 10;
        } else {
            return 0;
        }
    }

    function getHeatTransferValue(heatTransfer: HeatTransfer | undefined) {
        if (heatTransfer === HeatTransfer.Minimal) {
            return 5;
        } else if (heatTransfer === HeatTransfer.Low) {
            return 25;
        } else if (heatTransfer === HeatTransfer.Medium) {
            return 37;
        } else if (heatTransfer === HeatTransfer.High) {
            return 50;
        } else if (heatTransfer === HeatTransfer.Massive) {
            return 80;
        } else {
            return 0;
        }
    }

    const rightHeatTransfer = explosive
        ? getHeatTransferValue(rightWeapon.explosionHeatTransfer)
        : getHeatTransferValue(rightWeapon.heatTransfer);

    // Heat transfer has priority if set on the right weapon
    // Otherwise show spectrum only
    if (rightHeatTransfer != 0) {
        const leftHeatTransfer = explosive
            ? getHeatTransferValue(leftWeapon.explosionHeatTransfer)
            : getHeatTransferValue(leftWeapon.heatTransfer);
        return <NeutralComparisonStat leftValue={leftHeatTransfer} rightValue={rightHeatTransfer} />;
    } else {
        const leftSpectrum = explosive
            ? getSpectrumValue(leftWeapon.explosionSpectrum)
            : getSpectrumValue(leftWeapon.spectrum);
        const rightSpectrum = explosive
            ? getSpectrumValue(rightWeapon.explosionSpectrum)
            : getSpectrumValue(rightWeapon.spectrum);

        return <NeutralComparisonStat leftValue={leftSpectrum} rightValue={rightSpectrum} />;
    }
}

function PenetrationComparison({ leftWeapon, rightWeapon }: { leftWeapon: WeaponItem; rightWeapon: WeaponItem }) {
    if (leftWeapon.penetration === "Unlimited") {
        if (rightWeapon.penetration === "Unlimited") {
            return <EmptyComparisonLine />;
        }

        return <NegativeComparison>-Inf.</NegativeComparison>;
    } else if (rightWeapon.penetration === "Unlimited") {
        return <PositiveComparison>+Inf.</PositiveComparison>;
    }

    function getPenetrationValue(penetrationString: string | undefined) {
        if (penetrationString === undefined) {
            return 0;
        } else {
            return penetrationString.split("/").length;
        }
    }

    const leftPenetration = getPenetrationValue(leftWeapon.penetration);
    const rightPenetration = getPenetrationValue(rightWeapon.penetration);
    return <HighGoodComparisonStat leftValue={leftPenetration} rightValue={rightPenetration} />;
}

function PowerGenerationComparison({ leftItem, rightItem }: ItemComparisonProps) {
    if (leftItem.slot === "Power" && rightItem.slot === "Power") {
        const leftPower = leftItem as PowerItem;
        const rightPower = rightItem as PowerItem;

        return (
            <>
                <EmptyComparisonLine />
                <HighGoodComparisonStat
                    leftValue={leftPower.energyGeneration ?? 0}
                    rightValue={rightPower.energyGeneration ?? 0}
                />
                <HighGoodComparisonStat
                    leftValue={leftPower.energyStorage ?? 0}
                    rightValue={rightPower.energyStorage ?? 0}
                />
                <HighGoodComparisonStat
                    leftValue={leftPower.powerStability ?? 100}
                    rightValue={rightPower.powerStability ?? 100}
                />
            </>
        );
    }
    return undefined;
}

function PropulsionComparison({ leftItem, rightItem }: ItemComparisonProps) {
    if (leftItem.slot === "Propulsion" && rightItem.slot === "Propulsion") {
        const leftPropulsion = leftItem as PropulsionItem;
        const rightPropulsion = rightItem as PropulsionItem;

        return (
            <>
                <EmptyComparisonLine />
                <LowGoodComparisonStat
                    leftValue={leftPropulsion.timePerMove}
                    rightValue={rightPropulsion.timePerMove}
                />
                <DragOrModComparison leftPropulsion={leftPropulsion} rightPropulsion={rightPropulsion} />
                <LowGoodComparisonStat
                    leftValue={leftPropulsion.energyPerMove ?? 0}
                    rightValue={rightPropulsion.energyPerMove ?? 0}
                />
                <LowGoodComparisonStat
                    leftValue={leftPropulsion.heatPerMove ?? 0}
                    rightValue={rightPropulsion.heatPerMove ?? 0}
                />
                <HighGoodComparisonStat leftValue={leftPropulsion.support} rightValue={rightPropulsion.support} />
                <LowGoodComparisonStat leftValue={leftPropulsion.penalty} rightValue={rightPropulsion.penalty} />
                <BurnoutOrSiegeComparison leftPropulsion={leftPropulsion} rightPropulsion={rightPropulsion} />
            </>
        );
    }

    return undefined;
}

function UpkeepComparison({ leftItem, rightItem }: ItemComparisonProps) {
    if (
        (leftItem.slot === "Power" || leftItem.slot === "Propulsion" || leftItem.slot === "Utility") &&
        (rightItem.slot === "Power" || rightItem.slot === "Propulsion" || rightItem.slot === "Utility")
    ) {
        const leftUpkeep = leftItem as ItemWithUpkeep;
        const rightUpkeep = rightItem as ItemWithUpkeep;

        return (
            <>
                <EmptyComparisonLine />
                <LowGoodComparisonStat
                    leftValue={leftUpkeep.energyUpkeep ?? 0}
                    rightValue={rightUpkeep.energyUpkeep ?? 0}
                />
                <LowGoodComparisonStat
                    leftValue={leftUpkeep.matterUpkeep ?? 0}
                    rightValue={rightUpkeep.matterUpkeep ?? 0}
                />
                <LowGoodComparisonStat
                    leftValue={leftUpkeep.heatGeneration ?? 0}
                    rightValue={rightUpkeep.heatGeneration ?? 0}
                />
                <EmptyComparisonLine />
            </>
        );
    }

    return undefined;
}

function WeaponComparison({ leftItem, rightItem }: { leftItem: Item; rightItem: Item }) {
    // Add weapon stats if applicable
    if (leftItem.slot === "Weapon" && rightItem.slot === "Weapon") {
        const leftWeapon = leftItem as WeaponItem;
        const rightWeapon = rightItem as WeaponItem;

        function isMelee(item: WeaponItem) {
            return (
                item.type === "Slashing Weapon" ||
                item.type === "Impact Weapon" ||
                item.type === "Piercing Weapon" ||
                item.type === "Special Melee Weapon"
            );
        }

        function isRangedNonLauncher(item: WeaponItem) {
            return (
                item.type === "Ballistic Gun" ||
                item.type === "Energy Gun" ||
                item.type === "Ballistic Cannon" ||
                item.type === "Energy Cannon" ||
                item.type === "Special Weapon"
            );
        }

        function isRanged(item: WeaponItem) {
            return isRangedNonLauncher(item) || item.type === "Launcher";
        }

        // Add melee stats if applicable
        if (isMelee(leftWeapon) && isMelee(rightWeapon)) {
            let damageNode: ReactNode | undefined;
            // Add melee damage if applicable
            if (leftWeapon.damage !== undefined && rightWeapon.damage !== undefined) {
                damageNode = (
                    <>
                        <EmptyComparisonLine />;
                        <DamageComparison leftWeapon={leftWeapon} rightWeapon={rightWeapon} explosive={false} />
                        <DamageTypeComparison leftWeapon={leftWeapon} rightWeapon={rightWeapon} explosive={false} />
                        <CriticalComparison leftWeapon={leftWeapon} rightWeapon={rightWeapon} />;
                        <HighGoodComparisonStat
                            leftValue={leftWeapon.disruption ?? 0}
                            rightValue={rightWeapon.disruption ?? 0}
                        />
                        <HighGoodComparisonStat
                            leftValue={leftWeapon.salvage ?? 0}
                            rightValue={rightWeapon.salvage ?? 0}
                        />
                        <EmptyComparisonLine />;
                    </>
                );
            }

            return (
                <>
                    <EmptyComparisonLine />
                    <LowGoodComparisonStat
                        leftValue={leftWeapon.shotEnergy ?? 0}
                        rightValue={rightWeapon.shotEnergy ?? 0}
                    />
                    <LowGoodComparisonStat
                        leftValue={leftWeapon.shotMatter ?? 0}
                        rightValue={rightWeapon.shotMatter ?? 0}
                    />
                    <LowGoodComparisonStat
                        leftValue={leftWeapon.shotHeat ?? 0}
                        rightValue={rightWeapon.shotHeat ?? 0}
                    />
                    <HighGoodComparisonStat
                        leftValue={leftWeapon.targeting ?? 0}
                        rightValue={rightWeapon.targeting ?? 0}
                    />
                    <LowGoodComparisonStat leftValue={leftWeapon.delay ?? 0} rightValue={rightWeapon.delay ?? 0} />
                    <EmptyComparisonLine />
                    {damageNode}
                </>
            );
        }

        // Add ranged weapons if applicable
        if (isRanged(leftWeapon) && isRanged(rightWeapon)) {
            // Add non-launcher damage if applicable
            let damageNode: ReactNode | undefined;
            if (
                isRangedNonLauncher(leftWeapon) &&
                isRangedNonLauncher(rightWeapon) &&
                leftWeapon.damage !== undefined &&
                rightWeapon.damage !== undefined
            ) {
                damageNode = (
                    <>
                        <HighGoodComparisonStat
                            leftValue={leftWeapon.projectileCount}
                            rightValue={rightWeapon.projectileCount}
                        />
                        <DamageComparison leftWeapon={leftWeapon} rightWeapon={rightWeapon} explosive={false} />
                        <DamageTypeComparison leftWeapon={leftWeapon} rightWeapon={rightWeapon} explosive={false} />
                        <CriticalComparison leftWeapon={leftWeapon} rightWeapon={rightWeapon} />
                        <PenetrationComparison leftWeapon={leftWeapon} rightWeapon={rightWeapon} />
                        <SpectrumOrHeatTransferComparison
                            leftWeapon={leftWeapon}
                            rightWeapon={rightWeapon}
                            explosive={false}
                        />
                        <HighGoodComparisonStat
                            leftValue={leftWeapon.disruption ?? 0}
                            rightValue={rightWeapon.disruption ?? 0}
                        />
                        <HighGoodComparisonStat
                            leftValue={leftWeapon.salvage ?? 0}
                            rightValue={rightWeapon.salvage ?? 0}
                        />
                        <EmptyComparisonLine />
                    </>
                );
            }
            // Add launcher damage if applicable
            else if (leftWeapon.type === "Launcher" && rightWeapon.type === "Launcher") {
                damageNode = (
                    <>
                        <HighGoodComparisonStat
                            leftValue={leftWeapon.projectileCount}
                            rightValue={rightWeapon.projectileCount}
                        />
                        <HighGoodComparisonStat
                            leftValue={leftWeapon.explosionRadius ?? 0}
                            rightValue={rightWeapon.explosionRadius ?? 0}
                        />
                        <DamageComparison leftWeapon={leftWeapon} rightWeapon={rightWeapon} explosive={true} />
                        <LowGoodComparisonStat
                            leftValue={leftWeapon.falloff ?? 0}
                            rightValue={rightWeapon.falloff ?? 0}
                        />
                        <DamageTypeComparison leftWeapon={leftWeapon} rightWeapon={rightWeapon} explosive={true} />
                        <SpectrumOrHeatTransferComparison
                            leftWeapon={leftWeapon}
                            rightWeapon={rightWeapon}
                            explosive={true}
                        />
                        <HighGoodComparisonStat
                            leftValue={leftWeapon.explosionDisruption ?? 0}
                            rightValue={rightWeapon.explosionDisruption ?? 0}
                        />
                        <HighGoodComparisonStat
                            leftValue={leftWeapon.explosionSalvage ?? 0}
                            rightValue={rightWeapon.explosionSalvage ?? 0}
                        />
                        <EmptyComparisonLine />
                    </>
                );
            }

            return (
                <>
                    <EmptyComparisonLine />
                    <HighGoodComparisonStat leftValue={leftWeapon.range ?? 0} rightValue={rightWeapon.range ?? 0} />
                    <LowGoodComparisonStat
                        leftValue={leftWeapon.shotEnergy ?? 0}
                        rightValue={rightWeapon.shotEnergy ?? 0}
                    />
                    <LowGoodComparisonStat
                        leftValue={leftWeapon.shotMatter ?? 0}
                        rightValue={rightWeapon.shotMatter ?? 0}
                    />
                    <LowGoodComparisonStat
                        leftValue={leftWeapon.shotHeat ?? 0}
                        rightValue={rightWeapon.shotHeat ?? 0}
                    />
                    <LowGoodComparisonStat leftValue={leftWeapon.recoil ?? 0} rightValue={rightWeapon.recoil ?? 0} />
                    <HighGoodComparisonStat
                        leftValue={leftWeapon.targeting ?? 0}
                        rightValue={rightWeapon.targeting ?? 0}
                    />
                    <LowGoodComparisonStat leftValue={leftWeapon.delay ?? 0} rightValue={rightWeapon.delay ?? 0} />
                    <HighGoodComparisonStat
                        leftValue={leftWeapon.overloadStability ?? 100}
                        rightValue={rightWeapon.overloadStability ?? 100}
                    />
                    <ArcOrWaypointsComparison leftWeapon={leftWeapon} rightWeapon={rightWeapon} />
                    <EmptyComparisonLine />
                    {damageNode}
                </>
            );
        }
    }
    return undefined;
}

function ComparisonContent({ leftItem, rightItem }: { leftItem: Item; rightItem: Item }) {
    return (
        <>
            <div className="item-art-image-container part-comparison-image-container" />
            <EmptyComparisonLine />
            <pre className="comparison-neutral details-item-image-title" />
            <pre className="details-summary">Comparison</pre>
            <EmptyComparisonLine />
            <EmptyComparisonLine />
            <EmptyComparisonLine />
            <LowGoodComparisonStat leftValue={leftItem.mass ?? 0} rightValue={rightItem.mass ?? 0} />
            <RatingComparison leftItem={leftItem} rightItem={rightItem} />
            <HighGoodComparisonStat leftValue={leftItem.integrity} rightValue={rightItem.integrity} />
            <HighGoodComparisonStat leftValue={leftItem.coverage ?? 0} rightValue={rightItem.coverage ?? 0} />
            <EmptyComparisonLine />
            <EmptyComparisonLine />
            <EmptyComparisonLine />
            <UpkeepComparison leftItem={leftItem} rightItem={rightItem} />
            <PowerGenerationComparison leftItem={leftItem} rightItem={rightItem} />
            <PropulsionComparison leftItem={leftItem} rightItem={rightItem} />
            <WeaponComparison leftItem={leftItem} rightItem={rightItem} />
        </>
    );
}

export default function PartsComparisonDisplay({
    itemData,
    items,
}: {
    pageState: PartsPageState;
    itemData: ItemData;
    items: Item[];
}) {
    const [leftItem, setLeftItem] = useState("Lgt. Assault Rifle");
    const [rightItem, setRightItem] = useState("Assault Rifle");

    const itemOptions = items.map<SelectOptionType<string>>((item) => {
        return {
            value: item.name,
        };
    });

    function ItemSelect(item: string, setItem: React.Dispatch<React.SetStateAction<string>>) {
        return (
            <SelectWrapper
                value={itemOptions.find((o) => o.value === item) || itemOptions[0]}
                onChange={(val) => {
                    setItem(val!.value);
                }}
                options={itemOptions}
            />
        );
    }

    return (
        <div className="comparison-container">
            <div className="part-comparison-part-column">
                {ItemSelect(leftItem, setLeftItem)}
                <ItemDetails item={itemData.getItem(leftItem)} />
            </div>
            <div className="part-comparison-details-column">
                <Button
                    tooltip="Swaps the left and right items in the comparison"
                    onClick={() => {
                        setLeftItem(rightItem);
                        setRightItem(leftItem);
                    }}
                >
                    ← Swap →
                </Button>
                <div>
                    <ComparisonContent leftItem={itemData.getItem(leftItem)} rightItem={itemData.getItem(rightItem)} />
                </div>
            </div>
            <div className="part-comparison-part-column">
                {ItemSelect(rightItem, setRightItem)}
                <ItemDetails item={itemData.getItem(rightItem)} />
            </div>
        </div>
    );
}
