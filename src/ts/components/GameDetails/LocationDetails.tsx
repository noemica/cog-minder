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

    function getMinMaxDepths(startLocation: MapLocation, endLocation: MapLocation) {
        let minDepth: number;
        let maxDepth: number;

        if (endLocation.branch || startLocation.preDepthBranch) {
            minDepth = Math.max(startLocation.minDepth, endLocation.minDepth);
            maxDepth = Math.min(startLocation.maxDepth, endLocation.maxDepth);
        } else {
            minDepth = Math.max(startLocation.minDepth, endLocation.minDepth - 1);
            maxDepth = Math.min(startLocation.maxDepth, endLocation.maxDepth - 1);
        }

        return { minDepth: minDepth, maxDepth: maxDepth };
    }

    const allowedEntries = location.entries.filter((e) =>
        location.branch ? canShowSpoiler(e.spoiler, spoilers) : !e.branch,
    );

    // Entry from other maps to this map
    const entries = allowedEntries.length > 0 && (
        <>
            <DetailsEmptyLine />
            <DetailsSummaryLine text="Entry from" />
            {allowedEntries.map((entry, i) => {
                const depths = getMinMaxDepths(entry, location);
                const depthsString = getDepthString(depths.minDepth, depths.maxDepth);

                // Don't bother showing entrances from spoiler-blocked maps
                if (!canShowSpoiler(entry.spoiler, spoilers)) {
                    return undefined;
                }

                if (inPopover) {
                    return <DetailsTextLine key={i} category={entry.name} content={depthsString} />;
                } else {
                    return (
                        <DetailsTextNode
                            key={i}
                            category={<LocationLink location={entry} inPopover={true} />}
                            categoryLength={entry.name.length}
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
                const depths = getMinMaxDepths(location, exit);
                const depthsString = getDepthString(depths.minDepth, depths.maxDepth);
                if (inPopover) {
                    // In popovers never show spoilered things
                    if (!canShowSpoiler(exit.spoiler, spoilers)) {
                        return undefined;
                    }

                    return <DetailsTextLine key={i} category={exit.name} content={depthsString} />;
                } else {
                    // Show exits with a spoiler
                    if (canShowSpoiler(exit.spoiler, spoilers)) {
                        return (
                            <DetailsTextNode
                                key={i}
                                category={<LocationLink location={exit} />}
                                categoryLength={exit.name.length}
                                content={depthsString}
                            />
                        );
                    } else {
                        return (
                            <DetailsTextNode
                                key={i}
                                category={
                                    <span className="spoiler-text spoiler-text-margin">
                                        <LocationLink location={exit} />
                                    </span>
                                }
                                categoryLength={exit.name.length}
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
                <a href={imagePath} target="_blank">
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
