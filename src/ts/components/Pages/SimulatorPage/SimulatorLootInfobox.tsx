import { Bot } from "../../../types/botTypes";
import { ItemLootState, LootState } from "../../../types/simulatorTypes";
import { getItemSpriteImageName } from "../../../utilities/common";
import useItemData from "../../Effects/useItemData";

import "./SimulatorPage.less";

function getClassHighGood(value: number) {
    if (value <= 0.25) {
        return "lootbox-color-red";
    } else if (value <= 0.5) {
        return "lootbox-color-orange";
    } else if (value <= 0.75) {
        return "lootbox-color-yellow";
    } else {
        return "lootbox-color-green";
    }
}
function getClassHighBad(value: number) {
    if (value <= 0.25) {
        return "lootbox-color-green";
    } else if (value <= 0.5) {
        return "lootbox-color-yellow";
    } else if (value <= 0.75) {
        return "lootbox-color-orange";
    } else {
        return "lootbox-color-red";
    }
}

export function SimulatorMatterInfobox({ bot, lootState }: { bot: Bot; lootState: LootState }) {
    const itemData = useItemData();

    const matterDropAmount = lootState.matterDrop / lootState.numKills;
    const matterBlastedAmount = lootState.matterBlasted / lootState.numKills;
    const showMatterBlasted = matterBlastedAmount > 0;

    return (
        <div className="loot-box">
            <div className="loot-box-part-name-container">
                <span>Matter [</span>
                <img src={getItemSpriteImageName(itemData.getItem("Matter"))} />
                <span>]</span>
            </div>
            <div className="loot-box-content-grid">
                <span>Avg. Death Drop</span>
                <span className={getClassHighGood(matterDropAmount / bot.salvageHigh)}>
                    {matterDropAmount.toFixed(1)}/{bot.salvagePotential}
                </span>
                {showMatterBlasted && (
                    <>
                        <span>Avg. Blasted Off</span>
                        <span>{matterBlastedAmount.toFixed(1)}</span>
                    </>
                )}
            </div>
        </div>
    );
}

export default function SimulatorLootItemInfobox({
    itemLootState,
    numKills,
    showCorruption,
    showCriticals,
}: {
    itemLootState: ItemLootState;
    numKills: number;
    showCorruption: boolean;
    showCriticals: boolean;
}) {
    const dropRatePercent = (itemLootState.numDrops / numKills) * 100;
    const averageDropIntegrity =
        itemLootState.totalIntegrity > 0 ? itemLootState.totalIntegrity / itemLootState.numDrops : 0;
    const averageCorruptionGain = itemLootState.totalCorruptionPercent / numKills;
    const friedPercent = (itemLootState.totalFried / numKills) * 100;
    const critRatePercent =
        itemLootState.totalCritRemoves > 0 ? (itemLootState.totalCritRemoves / itemLootState.numDrops) * 100 : 0;

    return (
        <div className="loot-box">
            <div className="loot-box-part-name-container">
                <span>{itemLootState.item.name} [</span>
                <img src={getItemSpriteImageName(itemLootState.item)} />
                <span>]</span>
            </div>
            <div className="loot-box-content-grid">
                <span>Drop Rate</span>
                <span className={getClassHighGood(dropRatePercent / 70)}>{dropRatePercent.toFixed(1)}%</span>
                <span>Avg. Integrity</span>
                <span className={getClassHighGood(averageDropIntegrity / itemLootState.item.integrity)}>
                    {averageDropIntegrity.toFixed(1)}/{itemLootState.item.integrity}
                </span>
                {showCorruption && (
                    <>
                        <span>Avg. Corruption</span>
                        <span className={getClassHighBad(averageCorruptionGain / 7.5)}>
                            {averageCorruptionGain.toFixed(1)}%
                        </span>
                        <span>Fried Rate</span>
                        <span className={getClassHighBad(friedPercent / 40)}>{friedPercent.toFixed(1)}%</span>
                    </>
                )}
                {showCriticals && (
                    <>
                        <span>Crit Off Rate</span>
                        <span>{critRatePercent.toFixed(1)}%</span>
                    </>
                )}
            </div>
        </div>
    );
}
