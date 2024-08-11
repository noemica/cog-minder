import { MapLocation } from "../../types/commonTypes";
import { canShowSpoiler, createImagePath } from "../../utilities/common";
import { useSpoilers } from "../Effects/useLocalStorageValue";
import { BotLink, ItemLink, LocationLink } from "../Pages/WikiPage/WikiTooltips";
import { DetailsEmptyLine, DetailsSummaryLine, DetailsTextLine, DetailsTextNode } from "./Details";

import "./Details.less";

export default function LocationDetails({
    location,
    inPopover = false,
}: {
    location: MapLocation;
    inPopover?: boolean;
}) {
    const spoilers = useSpoilers();

    function getDepthString(minDepth: number, maxDepth: number) {
        if (minDepth === maxDepth) {
            return minDepth.toString();
        } else {
            return `${minDepth} to ${maxDepth}`;
        }
    }

    const allowedEntries = location.entries.filter((e) =>
        location.branch ? canShowSpoiler(e.location.spoiler, spoilers) : !e.location.branch,
    );

    // Entry from other maps to this map
    const entries = allowedEntries.length > 0 && (
        <>
            <DetailsEmptyLine />
            <DetailsSummaryLine text="Entry from" />
            {allowedEntries.map((entry, i) => {
                const depthsString = entry.depthsString;

                // Don't bother showing entrances from spoiler-blocked maps
                if (!canShowSpoiler(entry.location.spoiler, spoilers)) {
                    return undefined;
                }

                if (inPopover) {
                    return <DetailsTextLine key={i} category={entry.location.name} content={depthsString} />;
                } else {
                    return (
                        <DetailsTextNode
                            key={i}
                            category={<LocationLink location={entry.location} inPopover={true} />}
                            categoryLength={entry.location.name.length}
                            content={depthsString}
                        />
                    );
                }
            })}
        </>
    );

    // Exits from this map
    const exits = location.exits.length > 0 && (
        <>
            <DetailsEmptyLine />
            <DetailsSummaryLine text="Exits to" />
            {location.exits.map((exit, i) => {
                const depthsString = exit.depthsString;

                if (inPopover) {
                    // In popovers never show spoilered things
                    if (!canShowSpoiler(exit.location.spoiler, spoilers)) {
                        return undefined;
                    }

                    return <DetailsTextLine key={i} category={exit.location.name} content={depthsString} />;
                } else {
                    // Show exits with a spoiler
                    if (canShowSpoiler(exit.location.spoiler, spoilers)) {
                        return (
                            <DetailsTextNode
                                key={i}
                                category={<LocationLink location={exit.location} />}
                                categoryLength={exit.location.name.length}
                                content={depthsString}
                            />
                        );
                    } else {
                        return (
                            <DetailsTextNode
                                key={i}
                                category={
                                    <span className="spoiler-text spoiler-text-margin">
                                        <LocationLink location={exit.location} />
                                    </span>
                                }
                                categoryLength={exit.location.name.length}
                                content={depthsString}
                            />
                        );
                    }
                }
            })}
        </>
    );

    const bots = location.specialBots.length > 0 && (
        <>
            <DetailsEmptyLine />
            <DetailsSummaryLine text="Special bots" />
            {location.specialBots.map((specialBot, i) => {
                if (inPopover) {
                    if (!canShowSpoiler(specialBot.spoiler, spoilers)) {
                        return undefined;
                    }

                    return <DetailsTextLine key={i} category={specialBot.name} />;
                } else {
                    if (canShowSpoiler(specialBot.spoiler, spoilers)) {
                        return (
                            <DetailsTextNode
                                key={i}
                                category={<BotLink bot={specialBot} />}
                                categoryLength={specialBot.name.length}
                            />
                        );
                    } else {
                        return (
                            <DetailsTextNode
                                key={i}
                                category={
                                    <span className="spoiler-text spoiler-text-margin">
                                        <BotLink bot={specialBot} />
                                    </span>
                                }
                                categoryLength={specialBot.name.length}
                            />
                        );
                    }
                }
            })}
        </>
    );

    const specialItems = location.specialItems.length > 0 && (
        <>
            <DetailsEmptyLine />
            <DetailsSummaryLine text="Special items" />
            {location.specialItems.map((specialItem, i) => {
                if (inPopover) {
                    if (!canShowSpoiler(specialItem.spoiler, spoilers)) {
                        return undefined;
                    }

                    return <DetailsTextLine key={i} category={specialItem.name} />;
                } else {
                    if (canShowSpoiler(specialItem.spoiler, spoilers)) {
                        return (
                            <DetailsTextNode
                                key={i}
                                category={<ItemLink item={specialItem} />}
                                categoryLength={specialItem.name.length}
                            />
                        );
                    } else {
                        return (
                            <DetailsTextNode
                                key={i}
                                category={
                                    <span className="spoiler-text spoiler-text-margin">
                                        <ItemLink item={specialItem} />
                                    </span>
                                }
                                categoryLength={specialItem.name.length}
                            />
                        );
                    }
                }
            })}
        </>
    );

    const imagePath = createImagePath(`wiki_images/${location.imageName}`);

    return (
        <div className="location-details">
            <DetailsSummaryLine text={location.name} />
            {location.imageName && (
                <a href={imagePath} target="_blank" rel="noreferrer">
                    <img src={imagePath} className="location-image" />
                </a>
            )}
            <DetailsTextLine
                category="Available depths"
                content={getDepthString(location.minDepth, location.maxDepth)}
            />
            <DetailsTextLine category="Branch" content={location.branch || location.preDepthBranch ? "Yes" : "No"} />
            {entries}
            {exits}
            {bots}
            {specialItems}
        </div>
    );
}
