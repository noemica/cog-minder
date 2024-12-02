import { useState } from "react";
import { Link } from "wouter";

import { Spoiler } from "../../../types/commonTypes";
import { WikiEntry } from "../../../types/wikiTypes";
import { canShowSpoiler } from "../../../utilities/common";
import Button from "../../Buttons/Button";

import "./WikiPage.less";

function LinkOrBoldedContent({ activeEntry, entry }: { activeEntry: WikiEntry; entry: WikiEntry }) {
    if (activeEntry === entry) {
        return <span style={{ fontWeight: "bold" }}>{entry.name}</span>;
    } else if (entry.fakeGroup) {
        return <span>{entry.name}</span>;
    } else {
        return <Link href={`/${entry.name}`}>{entry.name}</Link>;
    }
}

function InfoboxGroupContent({ activeEntry, childEntries }: { activeEntry: WikiEntry; childEntries: WikiEntry[] }) {
    return childEntries.map((child, i) => (
        <li key={i}>
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
    return (groupEntry.extraData as WikiEntry[]).map((subgroupEntry, i) => {
        const childEntries = (subgroupEntry.extraData as WikiEntry[]).filter((entry) =>
            canShowSpoiler(entry.spoiler, spoiler),
        );

        return (
            <tr key={i}>
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

function InfoboxContent({
    activeEntry,
    groupEntry,
    spoiler,
}: {
    activeEntry: WikiEntry;
    groupEntry: WikiEntry;
    spoiler: Spoiler;
}) {
    if (groupEntry.type === "Part Supergroup") {
        return <InfoboxSupergroupContent activeEntry={activeEntry} groupEntry={groupEntry} spoiler={spoiler} />;
    }

    const childEntries = (groupEntry.extraData as WikiEntry[]).filter((entry) =>
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
            entryToCheck.type === "Part Group" ||
            entryToCheck.type === "Part Supergroup"
        ) {
            const childEntries = entryToCheck.extraData as WikiEntry[];

            for (const childEntry of childEntries) {
                if (childEntry === activeEntry || isDescendent(activeEntry, childEntry)) {
                    return true;
                }
            }
        }

        return false;
    }

    const [show, setShow] = useState(activeEntry === groupEntry || isDescendent(activeEntry, groupEntry));

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
                (groupEntry.type === "Part Group" || groupEntry.type === "Part Supergroup")),
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
                    (groupEntry.extraData as WikiEntry[]).map((childEntry, i) => {
                        return (
                            <InfoboxTable key={i} activeEntry={activeEntry} groupEntry={childEntry} spoiler={spoiler} />
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