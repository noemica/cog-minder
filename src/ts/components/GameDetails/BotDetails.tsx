import { ReactNode } from "react";
import { Link } from "wouter";

import { Bot, BotImmunity, BotLocation, BotPart } from "../../types/botTypes";
import { Item } from "../../types/itemTypes";
import { getLinkSafeString, valueOrDefault } from "../../utilities/common";
import useItemData from "../Effects/useItemData";
import { useSpoilers } from "../Effects/useLocalStorageValue";
import { ItemTooltip } from "../Pages/WikiPage/WikiTooltips";
import { BotItemPopoverButton } from "../Popover/ItemPopover";
import {
    DetailsBotImages,
    DetailsBotTitleLine,
    DetailsEmptyLine,
    DetailsRangeLine,
    DetailsSummaryLine,
    DetailsTextLine,
    DetailsTextLineDim,
    WikiLink,
} from "./Details";

import "./Details.less";

function getRatingValue(bot: Bot) {
    const ratingString = bot.rating;
    const ratingArray = ratingString
        .split("-")
        .map((s) => s.trim())
        .map((s) => parseInt(s));
    return ratingArray.reduce((sum, val) => sum + val, 0) / ratingArray.length;
}

function getSchematicDepthString(bot: Bot) {
    function capRange(depth: number) {
        return Math.floor(Math.max(Math.min(10, depth), 1));
    }

    if (bot.fabrication !== undefined) {
        let levelOneDepth = 11 - parseInt(bot.tier);
        let levelTwoDepth = levelOneDepth + 1;
        let levelThreeDepth = levelTwoDepth + 1;
        levelOneDepth = capRange(levelOneDepth);
        levelTwoDepth = capRange(levelTwoDepth);
        levelThreeDepth = capRange(levelThreeDepth);
        return `1/-${levelOneDepth}  2/-${levelTwoDepth}  3/-${levelThreeDepth}`;
    }

    return "";
}

function NoneItemLine() {
    return <pre className="details-line"> None{" ".repeat(39)}</pre>;
}

function ItemLine({
    itemString,
    item,
    popoversToLinks,
    showWikiLink,
}: {
    itemString: string;
    item: Item | undefined;
    popoversToLinks: boolean;
    showWikiLink: boolean;
}) {
    let itemNode: ReactNode = itemString.padEnd(44);

    if (popoversToLinks && item !== undefined) {
        itemNode = <Link href={`/${getLinkSafeString(item.name)}`}>{itemNode}</Link>;
    }

    const line = (
        <pre className="details-part">
            <span className="bot-popover-item-bracket">[</span>
            {itemNode}
            <span className="bot-popover-item-bracket">]</span>
        </pre>
    );

    if (item === undefined) {
        return line;
    } else if (popoversToLinks) {
        return <ItemTooltip item={item}>{line}</ItemTooltip>;
    } else {
        return <BotItemPopoverButton triggerContent={line} item={item} showWikiLink={showWikiLink} />;
    }
}

function BotPartLine({
    data,
    hideCoverage,
    popoversToLinks,
    showWikiLink,
}: {
    data: BotPart;
    hideCoverage: boolean;
    popoversToLinks: boolean;
    showWikiLink: boolean;
}) {
    const itemData = useItemData();
    let line = `${data.name}${hideCoverage ? "" : ` (${data.coverage}%)`}`;

    if (data.number > 1) {
        line += " x" + data.number;
    }

    return (
        <ItemLine
            item={itemData.tryGetItem(data.name)}
            itemString={line}
            popoversToLinks={popoversToLinks}
            showWikiLink={showWikiLink}
        />
    );
}

function ItemLineOption({
    itemName,
    itemString,
    i,
    popoversToLinks = false,
    showWikiLink,
}: {
    itemName: string;
    itemString: string;
    i: number;
    popoversToLinks?: boolean;
    showWikiLink: boolean;
}) {
    const itemData = useItemData();
    let itemNode: ReactNode = itemString.padEnd(42);
    const item = itemData.tryGetItem(itemName);

    if (popoversToLinks) {
        itemNode = <Link href={`/${getLinkSafeString(itemName)}`}>{itemNode}</Link>;
    }

    const line = (
        <pre className="details-part">
            <span className="bot-popover-item-bracket">[</span>
            <span className="details-option">{String.fromCharCode(97 + i)} </span>
            {itemNode}
            <span className="bot-popover-item-bracket">]</span>
        </pre>
    );

    if (item === undefined) {
        return line;
    } else if (popoversToLinks) {
        return <ItemTooltip item={item}>{line}</ItemTooltip>;
    } else {
        return <BotItemPopoverButton triggerContent={line} item={item} showWikiLink={showWikiLink} />;
    }
}

function BotPartOption({
    data,
    hideCoverage,
    popoversToLinks,
    showWikiLink,
}: {
    data: BotPart[];
    hideCoverage: boolean;
    popoversToLinks: boolean;
    showWikiLink: boolean;
}) {
    return (
        <>
            {data.map((botPart, i) => {
                let line: string;
                if (botPart.name === "None") {
                    line = "None";
                } else {
                    line = `${botPart.name}${hideCoverage ? "" : ` (${botPart.coverage}%)`}`;
                }

                if (botPart.number > 1) {
                    line += " x" + botPart.number;
                }

                return (
                    <ItemLineOption
                        key={botPart.name}
                        itemName={botPart.name}
                        itemString={line}
                        i={i}
                        popoversToLinks={popoversToLinks}
                        showWikiLink={showWikiLink}
                    />
                );
            })}
        </>
    );
}

function ItemDetails({
    hideCoverage,
    items,
    itemOptions,
    popoversToLinks,
    showWikiLink,
}: {
    hideCoverage: boolean;
    items: BotPart[];
    itemOptions: BotPart[][];
    popoversToLinks: boolean;
    showWikiLink: boolean;
}) {
    function Option({ addEmptyLine, data }: { addEmptyLine: boolean; data: BotPart[] }) {
        return (
            <>
                {addEmptyLine && <DetailsEmptyLine />}
                <BotPartOption
                    data={data}
                    hideCoverage={hideCoverage}
                    popoversToLinks={popoversToLinks}
                    showWikiLink={showWikiLink}
                />
            </>
        );
    }

    return (
        <>
            {items.map((data) => {
                return (
                    <BotPartLine
                        key={data.name}
                        data={data}
                        hideCoverage={hideCoverage}
                        popoversToLinks={popoversToLinks}
                        showWikiLink={showWikiLink}
                    />
                );
            })}
            {itemOptions.map((data, i) => {
                return <Option key={i} addEmptyLine={items.length > 0 || i > 0} data={data} />;
            })}
        </>
    );
}

function ArmamentDetails({
    bot,
    popoversToLinks,
    showWikiLink,
}: {
    bot: Bot;
    popoversToLinks: boolean;
    showWikiLink: boolean;
}) {
    if (bot.armament.length === 0 && bot.armamentData.length === 0) {
        return <NoneItemLine />;
    }

    return (
        <ItemDetails
            hideCoverage={bot.customBot}
            items={bot.armamentData}
            itemOptions={bot.armamentOptionData}
            popoversToLinks={popoversToLinks}
            showWikiLink={showWikiLink}
        />
    );
}

function ComponentDetails({
    bot,
    popoversToLinks,
    showWikiLink,
}: {
    bot: Bot;
    popoversToLinks: boolean;
    showWikiLink: boolean;
}) {
    if (bot.components.length === 0 && bot.componentData.length === 0) {
        return <NoneItemLine />;
    }

    return (
        <ItemDetails
            hideCoverage={bot.customBot}
            items={bot.componentData}
            itemOptions={bot.componentOptionData}
            popoversToLinks={popoversToLinks}
            showWikiLink={showWikiLink}
        />
    );
}

function DescriptionDetails({ bot }: { bot: Bot }) {
    if (bot.description.length === 0) {
        return undefined;
    }

    return (
        <>
            <DetailsEmptyLine />
            <DetailsSummaryLine text="Description" />
            <span className="details-description">&nbsp;{bot.description}</span>
        </>
    );
}

function FabricationDetails({ bot }: { bot: Bot }) {
    if (bot.fabrication === undefined) {
        return undefined;
    }

    const number = bot.fabrication.number;

    return (
        <>
            <DetailsEmptyLine />
            <DetailsSummaryLine text={number === "1" ? "Fabrication" : `Fabrication x${number}`} />
            <DetailsTextLine category="Time" content={bot.fabrication.time} />
            <DetailsTextLine category="Components" content="None" />
        </>
    );
}

function LocationDetails({ bot }: { bot: Bot }) {
    const spoilers = useSpoilers();
    // Get filtered list of locations
    const locations = bot.locations.filter((l) => {
        if (l.Spoiler === undefined || spoilers === "Redacted") {
            return true;
        }

        if (l.Spoiler === "Redacted") {
            return false;
        }

        if (l.Spoiler === "Spoiler" && spoilers === "None") {
            return false;
        }

        return true;
    });

    if (locations.length === 0) {
        return undefined;
    }

    function Location({ location }: { location: BotLocation }) {
        if (location.Description !== undefined) {
            return (
                <>
                    <span className="details-location">&nbsp;{location.Location}</span>
                    <span className="details-description">&nbsp;&nbsp;{location.Description}</span>
                </>
            );
        } else {
            return <span className="details-location">&nbsp;{location.Location}</span>;
        }
    }

    return (
        <>
            <DetailsEmptyLine />
            <DetailsSummaryLine text="Locations" />
            {locations.map((location, i) => (
                <Location key={i} location={location} />
            ))}
        </>
    );
}

function ResistanceImmunityDetails({ bot }: { bot: Bot }) {
    const resistances = Object.keys(valueOrDefault(bot.resistances, {} as any));
    const immunities = bot.immunities;

    if (resistances.length === 0 && immunities.length === 0) {
        return undefined;
    }

    return (
        <>
            <DetailsEmptyLine />
            <DetailsSummaryLine text="Resistances" />
            {resistances.map((damageType) => {
                const resistValue = bot.resistances![damageType];

                if (resistValue === undefined) {
                    return;
                }

                if (resistValue > 0) {
                    return (
                        <DetailsRangeLine
                            key={damageType}
                            category={damageType}
                            colorScheme="Green"
                            maxValue={100}
                            minValue={0}
                            value={resistValue}
                            valueString={resistValue}
                            unitString="%"
                            tooltipOverride="Resistance"
                        />
                    );
                } else {
                    return (
                        <DetailsRangeLine
                            key={damageType}
                            category={damageType}
                            colorScheme="Red"
                            maxValue={-100}
                            minValue={0}
                            value={resistValue}
                            valueString={resistValue}
                            unitString="%"
                            tooltipOverride="Resistance"
                        />
                    );
                }
            })}
            {immunities.map((immunity) => (
                <DetailsTextLineDim
                    key={immunity}
                    category={immunity}
                    text="IMMUNE"
                    tooltipOverride={
                        immunity === BotImmunity.Disruption
                            ? "Disruption Immunity"
                            : immunity === BotImmunity.Meltdown
                              ? "Meltdown Immunity"
                              : ""
                    }
                />
            ))}
        </>
    );
}

function TraitDetails({ bot }: { bot: Bot }) {
    if (bot.traits.length === 0) {
        return undefined;
    }

    return (
        <>
            <DetailsEmptyLine />
            <DetailsSummaryLine text="Traits" />
            {bot.traits.map((trait) => (
                <span key={trait} className="details-description">
                    &nbsp;{trait}
                </span>
            ))}
        </>
    );
}

export default function BotDetails({
    bot,
    popoversToLinks,
    showWikiLink,
}: {
    bot: Bot;
    popoversToLinks?: boolean;
    showWikiLink?: boolean;
}) {
    return (
        <div className="bot-details">
            {showWikiLink && <WikiLink wikiPage={bot.name} />}
            <DetailsBotTitleLine bot={bot} />
            <DetailsEmptyLine />
            <DetailsBotImages bot={bot} />
            <DetailsEmptyLine />
            <DetailsSummaryLine text="Overview" />
            <DetailsTextLine category="Class" content={bot.class} />
            <DetailsTextLine category="Size" content={bot.size} />
            <DetailsTextLine category="Profile" content={bot.profile} />
            <DetailsRangeLine
                category="Rating"
                tooltipOverride="Rating (Bot)"
                colorScheme="LowGood"
                minValue={0}
                maxValue={165}
                value={getRatingValue(bot)}
                valueString={bot.rating}
            />
            <DetailsTextLine category="Tier" content={bot.tier} />
            <DetailsTextLine category="Threat" content={bot.threat} />
            <DetailsTextLine category="Value" content={bot.value} />
            <DetailsTextLine category="Energy Generation" content={bot.energyGeneration} />
            <DetailsTextLine category="Net Energy/Turn" content={bot.netEnergyPerTurn} />
            <DetailsTextLine category="Net Energy/Move" content={bot.netEnergyPerMove} />
            {bot.netEnergyPerVolley !== undefined && (
                <DetailsTextLine category="Net Energy/Volley" content={bot.netEnergyPerVolley} />
            )}
            <DetailsTextLine category="Heat Dissipation" content={bot.heatDissipation} />
            {bot.injectorDissipation > 0 && (
                <DetailsTextLine category=" Injector Dissipation" content={bot.injectorDissipation} />
            )}
            <DetailsTextLine category="Net Heat/Turn" content={bot.netHeatPerTurn} />
            <DetailsTextLine category="Net Heat/Move" content={bot.netHeatPerTurn} />
            {bot.netHeatPerVolley !== undefined && (
                <DetailsTextLine category="Net Heat/Volley" content={bot.netHeatPerVolley} defaultContent="N/A" />
            )}
            <DetailsTextLine category="Visual Range" content={bot.visualRange} />
            <DetailsTextLine category="Memory" content={bot.memory} />
            <DetailsTextLine category="Spot %" content={bot.spotPercent} />
            <DetailsTextLine category="Movement" content={bot.movement} />
            {bot.movementOverloaded && <DetailsTextLine category=" Overloaded" content={bot.movementOverloaded} />}
            <DetailsRangeLine
                category="Core Integrity"
                colorScheme="Green"
                minValue={0}
                maxValue={bot.coreIntegrity}
                value={bot.coreIntegrity}
                valueString={bot.coreIntegrity.toString()}
            />
            <DetailsRangeLine
                category="Core Exposure"
                colorScheme="LowGood"
                maxValue={100}
                value={bot.coreExposure}
                valueString={bot.coreExposure.toString()}
                unitString="%"
            />
            <DetailsTextLine category="Salvage Potential" content={bot.salvagePotential} />
            <DetailsTextLine category="Inventory Size" content={bot.inventorySize} defaultContent="0" />
            <DetailsRangeLine
                category="Damage/Turn"
                colorScheme="Green"
                maxValue={60}
                value={bot.damagePerTurn}
                defaultValueString="0"
                valueString={bot.damagePerTurn?.toFixed(0)}
            />
            <DetailsRangeLine
                category="Damage/Volley"
                colorScheme="Green"
                maxValue={150}
                value={bot.damagePerVolley}
                defaultValueString="0"
                valueString={bot.damagePerVolley?.toFixed(0)}
            />
            <DetailsTextLine category="Volley Time" content={bot.volleyTime} defaultContent="0" />
            <DetailsTextLine
                category="Schematic"
                content={bot.fabrication ? "Hackable" : undefined}
                defaultContent="N/A"
            />
            {bot.fabrication && (
                <DetailsTextLine category=" Min Terminal/Depth" content={getSchematicDepthString(bot)} />
            )}
            <DetailsEmptyLine />
            <DetailsSummaryLine text="Armament" />
            <ArmamentDetails
                bot={bot}
                popoversToLinks={popoversToLinks || false}
                showWikiLink={showWikiLink || false}
            />
            <DetailsEmptyLine />
            <DetailsSummaryLine text="Components" />
            <ComponentDetails
                bot={bot}
                popoversToLinks={popoversToLinks || false}
                showWikiLink={showWikiLink || false}
            />
            <ResistanceImmunityDetails bot={bot} />
            <TraitDetails bot={bot} />
            <FabricationDetails bot={bot} />
            <DescriptionDetails bot={bot} />
            <LocationDetails bot={bot} />
        </div>
    );
}
