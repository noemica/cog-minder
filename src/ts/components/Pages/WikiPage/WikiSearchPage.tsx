import { Fragment, ReactNode, useEffect } from "react";
import { Link } from "wouter";

import { WikiEntry } from "../../../types/wikiTypes";
import { escapeHtml, getLinkSafeString } from "../../../utilities/common";
import { createPreviewContent } from "../../../utilities/wikiParser";
import { useSpoilers } from "../../Effects/useLocalStorageValue";

// In the given string, bolds all matches of matchText
// Uses lowercase matching but returns modified text with proper capitalization
function boldMatches(text: string, matchText: string): ReactNode {
    let startIndex = 0;
    let searchIndex: number;
    const groups: ReactNode[] = [];

    const lowerMatchText = matchText.toLowerCase();

    while ((searchIndex = text.substring(startIndex).toLowerCase().indexOf(lowerMatchText)) !== -1) {
        if (searchIndex !== 0) {
            groups.push(
                <Fragment key={groups.length}>{text.substring(startIndex, startIndex + searchIndex)}</Fragment>,
            );
        }

        groups.push(
            <b key={groups.length}>
                {text.substring(startIndex + searchIndex, startIndex + searchIndex + matchText.length)}
            </b>,
        );

        startIndex += searchIndex + matchText.length;
    }

    if (startIndex < text.length) {
        groups.push(<Fragment key={groups.length}>{text.substring(startIndex)}</Fragment>);
    }

    return <>{groups}</>;
}

export default function WikiSearchPage({
    allEntries,
    allowedEntries,
    search,
}: {
    allEntries: Map<string, WikiEntry>;
    allowedEntries: string[];
    search: string;
}) {
    useEffect(() => {
        document.title = `Search for "${search}" - Cog-Minder Wiki`;
    });

    const spoilers = useSpoilers();

    const lowerText = search.toLowerCase();

    let anyResults = false;
    const titleMatches = Array.from(allowedEntries).filter((n) => n.toLowerCase().includes(lowerText));
    const previewContents = Array.from(allowedEntries).map((entryName) => {
        return {
            name: entryName,
            previewContent: createPreviewContent(allEntries.get(entryName)!.content, spoilers),
        };
    });
    const contentMatches = previewContents.filter((e) => e.previewContent.toLowerCase().includes(lowerText));

    let titleMatchNode: ReactNode | undefined;
    let contentMatchNode: ReactNode | undefined;

    if (titleMatches.length > 0) {
        anyResults = true;

        const titleMatchNodes = titleMatches.map((titleMatch, i) => {
            // Determine the page preview
            let matchText = previewContents.find((p) => p.name === titleMatch)!.previewContent;
            const fullText = matchText.length <= 250;
            const lastPeriod = matchText.lastIndexOf(". ");

            if (lastPeriod > -1 && lastPeriod <= 250) {
                // Found a period, chop the match off there
                matchText = matchText.substring(0, lastPeriod + 1);
            } else if (matchText.length > 0 && !fullText) {
                matchText = matchText.substring(0, 250) + "...";
            }

            let matchNode: ReactNode;
            if (matchText.length === 0) {
                // Default to no page content if empty page
                matchNode = "No page content";
            } else {
                // Bold matches in the page preview
                matchNode = boldMatches(matchText, lowerText);
            }

            // Bold matches in the title
            const boldedTitleMatch = boldMatches(titleMatch, lowerText);

            return (
                <li key={i}>
                    <Link href={`/${getLinkSafeString(titleMatch)}`}>{boldedTitleMatch}</Link>
                    <p>{matchNode}</p>
                </li>
            );
        });

        titleMatchNode = (
            <>
                <h3 className="wiki-heading-emphasized">Title Matches</h3>
                <ul className="wiki-search-result-list">{titleMatchNodes}</ul>
            </>
        );
    }

    if (contentMatches.length > 0) {
        anyResults = true;

        const contentMatchNodes = contentMatches.map((contentMatch, i) => {
            // Determine the page preview
            let matchIndex = contentMatch.previewContent.toLowerCase().indexOf(lowerText);
            const entryIndex = Math.max(0, matchIndex - 150);
            let matchText = contentMatch.previewContent.substring(entryIndex, matchIndex + 150);
            const fullTextBefore = entryIndex == 0;
            const fullTextAfter = matchIndex + 150 >= contentMatch.previewContent.length;
            matchIndex = matchText.toLowerCase().indexOf(lowerText);
            const firstPeriodIndex = matchText.indexOf(". ");

            if (firstPeriodIndex !== -1 && firstPeriodIndex < matchIndex) {
                // Found a sentence end before the match
                // Start at the first sentence before the match
                matchText = matchText.substring(firstPeriodIndex + 2);
            } else if (matchText.length > 0 && !fullTextBefore) {
                matchText = "..." + matchText;
            }

            matchIndex = matchText.toLowerCase().indexOf(lowerText);
            const lastPeriodIndex = matchText.lastIndexOf(". ");
            if (lastPeriodIndex > -1 && lastPeriodIndex > matchIndex) {
                // Found a period after the search, chop the match off there
                matchText = matchText.substring(0, lastPeriodIndex + 1);
            } else if (matchText.length > 0 && !fullTextAfter) {
                matchText = matchText + "...";
            }

            let matchNode: ReactNode;
            if (matchText.length === 0) {
                // Default to no page content if empty page
                matchNode = "No page content";
            } else {
                // Bold matches in the page preview
                matchNode = boldMatches(matchText, lowerText);
            }

            // Bold matches in the title
            const boldedTitleMatch = boldMatches(contentMatch.name, lowerText);

            return (
                <li key={i}>
                    <Link href={`/${contentMatch.name}`}>{boldedTitleMatch}</Link>
                    <p>{matchNode}</p>
                </li>
            );
        });

        contentMatchNode = (
            <>
                <h3 className="wiki-heading-emphasized">Content Matches</h3>
                <ul className="wiki-search-result-list">{contentMatchNodes}</ul>
            </>
        );
    }

    const headerNodes = (
        <>
            <h1 className="wiki-emphasized-heading">Search Results</h1>
            <h2 className="wiki-heading">Searching for &quot;{search}&quot;</h2>
        </>
    );

    if (!anyResults) {
        return (
            <>
                {headerNodes}
                <span>No results found for &quot;{search}&quot;.</span>
            </>
        );
    }

    return (
        <>
            {headerNodes}
            {titleMatchNode}
            {contentMatchNode}
        </>
    );
}
