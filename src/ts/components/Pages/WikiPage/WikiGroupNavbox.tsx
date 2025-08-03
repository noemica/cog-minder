import { useState } from "react";
import { Link } from "wouter";

import { Spoiler } from "../../../types/commonTypes";
import { WikiEntry } from "../../../types/wikiTypes";
import { canShowSpoiler, getLinkSafeString } from "../../../utilities/common";
import Button from "../../Buttons/Button";

import "./WikiPage.less";

function LinkOrBoldedContent({ activeEntry, entry }: { activeEntry: WikiEntry; entry: WikiEntry }) {
    if (activeEntry === entry) {
        return <span style={{ fontWeight: "bold" }}>{entry.name}</span>;
    } else if (entry.fakeGroup) {
        return <span>{entry.name}</span>;
    } else {
        return <Link href={`/${getLinkSafeString(entry.name)}`}>{entry.name}</Link>;
    }
}

function InfoboxGroupContent({ activeEntry, childEntries }: { activeEntry: WikiEntry; childEntries: WikiEntry[] }) {
    return childEntries.map((child) => (
        <li key={child.name}>
            <LinkOrBoldedContent activeEntry={activeEntry} entry={child} />
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
    return (groupEntry.childEntries).map((subgroupEntry) => {
        const childEntries = (subgroupEntry.childEntries).filter((entry) =>
            canShowSpoiler(entry.spoiler, spoiler),
        );

        if (childEntries.length === 0) {
            return undefined;
        }

        return (
            <tr key={subgroupEntry.name}>
                <th>
                    <LinkOrBoldedContent activeEntry={activeEntry} entry={subgroupEntry} />
                </th>
                <td>
                    <ul>
                        <InfoboxGroupContent activeEntry={activeEntry} childEntries={childEntries} />
                    </ul>
                </td>
            </tr>
        );
    });
}

function getMaxEntryDepth(entry: WikiEntry) {
    if (entry.type === "Part" || entry.type === "Bot" || entry.type == "Location") {
        return 1;
    } else if (entry.type === "Part Group" || entry.type === "Bot Group") {
        return 2;
    } else {
        const childEntries = entry.childEntries;

        if (childEntries.length === 0) {
            return 1;
        }

        return 1 + Math.max(...childEntries.map((entry) => getMaxEntryDepth(entry)));
    }
}

function InfoboxContent({
    activeEntry,
    groupEntry,
    spoiler,
}: {
    activeEntry: WikiEntry;
    groupEntry: WikiEntry;
    spoiler: Spoiler;
}) {
    if (getMaxEntryDepth(groupEntry) >= 3) {
        return <InfoboxSupergroupContent activeEntry={activeEntry} groupEntry={groupEntry} spoiler={spoiler} />;
    }

    const childEntries = (groupEntry.childEntries).filter((entry) =>
        canShowSpoiler(entry.spoiler, spoiler),
    );

    return (
        <tr>
            <td>
                <ul>
                    <InfoboxGroupContent activeEntry={activeEntry} childEntries={childEntries} />
                </ul>
            </td>
        </tr>
    );
}

function InfoboxHeader({
    activeEntry,
    groupEntry,
    setShow,
    show,
}: {
    activeEntry: WikiEntry;
    groupEntry: WikiEntry;
    setShow: (show: boolean) => void;
    show: boolean;
}) {
    return (
        <tr>
            <td colSpan={2}>
                <div>
                    <div>
                        <LinkOrBoldedContent activeEntry={activeEntry} entry={groupEntry} />
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
    spoiler,
}: {
    activeEntry: WikiEntry;
    groupEntry: WikiEntry;
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

    function hasVisibleDescendent(entry: WikiEntry) {
        if (
            entry.type === "Bot Group" ||
            entry.type === "Bot Supergroup" ||
            entry.type === "Part Group" ||
            entry.type === "Part Supergroup" ||
            (entry.type === "Other" && (entry.childEntries).length > 0)
        ) {
            for (const childEntry of entry.childEntries) {
                if (hasVisibleDescendent(childEntry)) {
                    return true;
                }
            }
        } else {
            if (canShowSpoiler(entry.spoiler, spoiler)) {
                return true;
            }
        }

        return false;
    }

    if (!hasVisibleDescendent(groupEntry)) {
        return undefined;
    }

    return (
        <table className="wiki-group-infobox">
            <tbody>
                <InfoboxHeader activeEntry={activeEntry} groupEntry={groupEntry} setShow={setShow} show={show} />
                {show && <InfoboxContent activeEntry={activeEntry} groupEntry={groupEntry} spoiler={spoiler} />}
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
    // Default to expanding at the top level group or if we're at the
    // second highest level in a part group/supergroup
    const [show, setShow] = useState(
        activeEntry === groupEntry ||
            (activeEntry.parentEntries.includes(groupEntry) &&
                (groupEntry.type === "Bot Group" ||
                    groupEntry.type === "Bot Supergroup" ||
                    groupEntry.type === "Part Group" ||
                    groupEntry.type === "Part Supergroup" ||
                    groupEntry.type === "Other")),
    );

    if (groupEntry.hasSupergroupChildren) {
        return (
            <>
                <table className="wiki-group-infobox wiki-group-infobox-supergroup">
                    <tbody>
                        <InfoboxHeader
                            activeEntry={activeEntry}
                            groupEntry={groupEntry}
                            setShow={setShow}
                            show={show}
                        />
                    </tbody>
                </table>
                {show &&
                    (groupEntry.childEntries).map((childEntry) => {
                        return (
                            <InfoboxTable
                                key={childEntry.name}
                                activeEntry={activeEntry}
                                groupEntry={childEntry}
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
                <InfoboxHeader activeEntry={activeEntry} groupEntry={groupEntry} setShow={setShow} show={show} />
                {show && <InfoboxContent activeEntry={activeEntry} groupEntry={groupEntry} spoiler={spoiler} />}
            </tbody>
        </table>
    );
}
