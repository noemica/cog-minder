import { Link } from "wouter";

import { Spoiler } from "../../../types/commonTypes";
import { WikiEntry } from "../../../types/wikiTypes";
import { canShowSpoiler } from "../../../utilities/common";

import "./WikiPage.less";

function LinkOrBoldedContent({ activeEntry, entry }: { activeEntry: WikiEntry; entry: WikiEntry }) {
    return activeEntry === entry ? (
        <span style={{ fontWeight: "bold" }}>{entry.name}</span>
    ) : (
        <Link href={`/${entry.name}`}>{entry.name}</Link>
    );
}

function InfoboxGroupContent({ activeEntry, childEntries }: { activeEntry: WikiEntry; childEntries: WikiEntry[] }) {
    return childEntries.map((child, i) => <LinkOrBoldedContent key={i} activeEntry={activeEntry} entry={child} />);
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

function InfoboxHeader({ activeEntry, groupEntry }: { activeEntry: WikiEntry; groupEntry: WikiEntry }) {
    return (
        <tr>
            <td colSpan={2}>
                <LinkOrBoldedContent activeEntry={activeEntry} entry={groupEntry} />
            </td>
        </tr>
    );
}

export default function WikiGroupInfobox({
    activeEntry,
    group,
    spoiler,
}: {
    activeEntry: WikiEntry;
    group: WikiEntry;
    spoiler: Spoiler;
}) {
    return (
        <table className="wiki-group-infobox">
            <tbody>
                <InfoboxHeader activeEntry={activeEntry} groupEntry={group} />
                <InfoboxContent activeEntry={activeEntry} groupEntry={group} spoiler={spoiler} />
            </tbody>
        </table>
    );
}
