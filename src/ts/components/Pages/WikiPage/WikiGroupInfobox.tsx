import { Link } from "wouter";

import { WikiEntry } from "../../../types/wikiTypes";

import "./WikiPage.less";

export default function WikiGroupInfobox({ activeEntry, group }: { activeEntry: WikiEntry; group: WikiEntry }) {
    const childEntries = group.extraData as WikiEntry[];

    return (
        <table className="wiki-group-infobox">
            <tbody>
                <tr>
                    <td>
                        {activeEntry === group ? (
                            <span style={{ fontWeight: "bold" }}>{group.name}</span>
                        ) : (
                            <Link href={`/${group.name}`}>{group.name}</Link>
                        )}
                    </td>
                </tr>
                <tr>
                    <td>
                        <ul>
                            {childEntries.map((child, i) =>
                                activeEntry === child ? (
                                    <span key={i} style={{ fontWeight: "bold" }}>
                                        {child.name}
                                    </span>
                                ) : (
                                    <Link key={i} href={`/${child.name}`}>
                                        {child.name}
                                    </Link>
                                ),
                            )}
                        </ul>
                    </td>
                </tr>
            </tbody>
        </table>
    );
}
