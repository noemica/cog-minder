import { useState } from "react";
import { Link } from "wouter";

import { Spoiler } from "../../../types/commonTypes";
import { WikiEntry } from "../../../types/wikiTypes";
import { canShowSpoiler, getLinkSafeString } from "../../../utilities/common";
import Button from "../../Buttons/Button";

import "./WikiPage.less";

function LinkOrBoldedContent({
    activeEntry,
    entry,
    parentEntry,
}: {
    activeEntry: WikiEntry;
    entry: WikiEntry;
    parentEntry: WikiEntry | undefined;
}) {
    let entryName = entry.name;

    if (parentEntry !== undefined && entryName.startsWith(parentEntry.name + "/")) {
        entryName = entryName.slice(parentEntry.name.length + 1);
    }

    if (activeEntry === entry) {
        return <span style={{ fontWeight: "bold" }}>{entryName}</span>;
    } else if (entry.fakeGroup) {
        return <span>{entryName}</span>;
    } else {
        return <Link href={`/${getLinkSafeString(entry.name)}`}>{entryName}</Link>;
    }
}

function InfoboxGroupContent({
    activeEntry,
    childEntries,
    parentEntry,
}: {
    activeEntry: WikiEntry;
    childEntries: WikiEntry[];
    parentEntry: WikiEntry | undefined;
}) {
    return childEntries.map((child) => (
        <li key={child.name}>
            <LinkOrBoldedContent activeEntry={activeEntry} entry={child} parentEntry={parentEntry} />
        </li>
    ));
}

function InfoboxSupergroupContent({
    activeEntry,
    groupEntry,
    spoiler,
}: {
    activeEntry: WikiEntry;
    groupEntry: WikiEntry;
    spoiler: Spoiler;
}) {
    return groupEntry.childEntries.map((subgroupEntry) => {
        const childEntries = subgroupEntry.childEntries.filter((entry) => canShowSpoiler(entry.spoiler, spoiler));

        if (childEntries.length === 0) {
            return undefined;
        }

        return (
            <tr key={subgroupEntry.name}>
                <th>
                    <LinkOrBoldedContent activeEntry={activeEntry} entry={subgroupEntry} parentEntry={groupEntry} />
                </th>
                <td>
                    <ul>
                        <InfoboxGroupContent
                            activeEntry={activeEntry}
                            childEntries={childEntries}
                            parentEntry={subgroupEntry.fakeGroup ? groupEntry : subgroupEntry}
                        />
                    </ul>
                </td>
            </tr>
        );
    });
}

function InfoboxContent({
    activeEntry,
    groupEntry,
    parentEntry,
    spoiler,
}: {
    activeEntry: WikiEntry;
    groupEntry: WikiEntry;
    parentEntry: WikiEntry | undefined;
    spoiler: Spoiler;
}) {
    if (groupEntry.getMaxEntryDepth() >= 3) {
        return <InfoboxSupergroupContent activeEntry={activeEntry} groupEntry={groupEntry} spoiler={spoiler} />;
    }

    const childEntries = groupEntry.childEntries.filter((entry) => canShowSpoiler(entry.spoiler, spoiler));

    return (
        <tr>
            <td>
                <ul>
                    <InfoboxGroupContent
                        activeEntry={activeEntry}
                        childEntries={childEntries}
                        parentEntry={groupEntry}
                    />
                </ul>
            </td>
        </tr>
    );
}

function InfoboxHeader({
    activeEntry,
    groupEntry,
    parentEntry,
    setShow,
    show,
}: {
    activeEntry: WikiEntry;
    groupEntry: WikiEntry;
    parentEntry: WikiEntry | undefined;
    setShow: (show: boolean) => void;
    show: boolean;
}) {
    return (
        <tr>
            <td colSpan={2}>
                <div>
                    <div>
                        <LinkOrBoldedContent activeEntry={activeEntry} entry={groupEntry} parentEntry={parentEntry} />
                    </div>
                    <ShowHideButton setShow={setShow} show={show} />
                </div>
            </td>
        </tr>
    );
}

function InfoboxTable({
    activeEntry,
    groupEntry,
    parentEntry,
    spoiler,
}: {
    activeEntry: WikiEntry;
    groupEntry: WikiEntry;
    parentEntry: WikiEntry;
    spoiler: Spoiler;
}) {
    function isDescendent(activeEntry: WikiEntry, entryToCheck: WikiEntry) {
        if (
            entryToCheck.type === "Bot Group" ||
            entryToCheck.type === "Bot Supergroup" ||
            entryToCheck.type === "Part Group" ||
            entryToCheck.type === "Part Supergroup" ||
            entryToCheck.type === "Other"
        ) {
            const childEntries = entryToCheck.childEntries;

            for (const childEntry of childEntries) {
                if (childEntry === activeEntry || isDescendent(activeEntry, childEntry)) {
                    return true;
                }
            }
        }

        return false;
    }

    const [show, setShow] = useState(activeEntry === groupEntry || isDescendent(activeEntry, groupEntry));

    if (!groupEntry.hasVisibleDescendant(spoiler)) {
        return undefined;
    }

    return (
        <table className="wiki-group-infobox">
            <tbody>
                <InfoboxHeader
                    activeEntry={activeEntry}
                    groupEntry={groupEntry}
                    parentEntry={parentEntry}
                    setShow={setShow}
                    show={show}
                />
                {show && (
                    <InfoboxContent
                        activeEntry={activeEntry}
                        groupEntry={groupEntry}
                        parentEntry={parentEntry}
                        spoiler={spoiler}
                    />
                )}
            </tbody>
        </table>
    );
}

function ShowHideButton({ setShow, show }: { setShow: (show: boolean) => void; show: boolean }) {
    return (
        <Button className="wiki-infobox-show-hide-button" onClick={() => setShow(!show)}>
            {show ? "Hide" : "Show"}
        </Button>
    );
}

export default function WikiGroupInfobox({
    activeEntry,
    groupEntry,
    spoiler,
}: {
    activeEntry: WikiEntry;
    groupEntry: WikiEntry;
    spoiler: Spoiler;
}) {
    // Default to expanding any entry that is a parent above the active entry
    const [show, setShow] = useState(activeEntry === groupEntry || activeEntry.hasAncestorEntry(groupEntry));

    if (groupEntry.hasSupergroupChildren) {
        return (
            <>
                <table className="wiki-group-infobox wiki-group-infobox-supergroup">
                    <tbody>
                        <InfoboxHeader
                            activeEntry={activeEntry}
                            groupEntry={groupEntry}
                            parentEntry={undefined}
                            setShow={setShow}
                            show={show}
                        />
                    </tbody>
                </table>
                {show &&
                    groupEntry.childEntries.map((childEntry) => {
                        return (
                            <InfoboxTable
                                key={childEntry.name}
                                activeEntry={activeEntry}
                                groupEntry={childEntry}
                                parentEntry={groupEntry}
                                spoiler={spoiler}
                            />
                        );
                    })}
            </>
        );
    }

    return (
        <table className="wiki-group-infobox">
            <tbody>
                <InfoboxHeader
                    activeEntry={activeEntry}
                    groupEntry={groupEntry}
                    parentEntry={undefined}
                    setShow={setShow}
                    show={show}
                />
                {show && (
                    <InfoboxContent
                        activeEntry={activeEntry}
                        groupEntry={groupEntry}
                        parentEntry={undefined}
                        spoiler={spoiler}
                    />
                )}
            </tbody>
        </table>
    );
}
