import { useLocation, useSearch } from "wouter";

import lore from "../../../../json/lore.json";
import { JsonLoreEntry, JsonLoreGroup } from "../../../types/loreTypes";
import { canShowSpoiler, getLocationFromState, parseSearchParameters } from "../../../utilities/common";
import Button from "../../Buttons/Button";
import { useSpoilers } from "../../Effects/useLocalStorageValue";
import { LabeledInput } from "../../LabeledItem/LabeledItem";

import "../pages.less";
import "./LorePage.less";

type LorePageState = {
    name?: string;
    content?: string;
    group?: string;
};

function getPageState(): LorePageState {
    const search = useSearch();

    return parseSearchParameters(search, {});
}

function skipLocationMember(key: string, pageState: LorePageState) {
    // const typedKey: keyof LorePageState = key as keyof LorePageState;

    return false;
}

function LoreCell({ value }: { value: string }) {
    if (value === undefined) {
        return <td />;
    } else {
        return <td>{value}%</td>;
    }
}

function LoreRow({ entry }: { entry: JsonLoreEntry }) {
    return (
        <tr className="lore-content-row">
            <td>{entry["Name/Number"]}</td>
            <LoreCell value={entry.Content} />
        </tr>
    );
}

function LoreHeaderRow({ group }: { group: JsonLoreGroup }) {
    return (
        <tr className="lore-group-header-row">
            <td>
                <p>{group.Name}</p>
            </td>
            <td>{group.Content}</td>
        </tr>
    );
}

function LoreTable({ pageState }: { pageState: LorePageState }) {
    const spoilers = useSpoilers();

    const nameFilter = pageState.name?.toLowerCase() || "";
    const filterName = nameFilter.length > 0;

    function GroupRows({ group }: { group: JsonLoreGroup }) {
        const entries = group.Entries.filter((entry) => {
            if (filterName && !entry["Name/Number"].toLowerCase().includes(nameFilter)) {
                return false;
            }

            if (!canShowSpoiler(entry.Spoiler || "None", spoilers)) {
                return false;
            }

            return true;
        });

        if (entries.length === 0 || !canShowSpoiler(group.Spoiler || "None", spoilers)) {
            return undefined;
        }

        return (
            <>
                <LoreHeaderRow group={group} />
                {entries.map((entry) => {
                    return <LoreRow key={entry["Name/Number"]} entry={entry} />;
                })}
            </>
        );
    }

    return (
        <table cellSpacing={0} cellPadding={0} className="lore-table">
            <thead>
                <tr className="lore-header-row">
                    <th>Entry Name</th>
                    <th>Content</th>
                </tr>
            </thead>
            <tbody>
                {lore.map((group) => (
                    <GroupRows key={group.Name} group={group} />
                ))}
            </tbody>
        </table>
    );
}

export default function LorePage() {
    const [_, setLocation] = useLocation();

    const pageState = getPageState();

    function updatePageState(newPageState: LorePageState) {
        const location = getLocationFromState("/lore", newPageState, skipLocationMember);
        setLocation(location, { replace: true });
    }

    return (
        <div className="page-content">
            <div className="page-input-group">
                <LabeledInput
                    label="Name/Number"
                    value={pageState.name}
                    onChange={(val) => updatePageState({ ...pageState, name: val })}
                    placeholder="Any"
                    tooltip="The name or number of a lore entry to search for. Only lore entries with names containing this value will be shown."
                />
                <LabeledInput
                    label="Content"
                    value={pageState.content}
                    onChange={(val) => updatePageState({ ...pageState, content: val })}
                    placeholder="Any"
                    tooltip="The lore entry content to search for. Only lore entries with content containing this value will be shown."
                />
                <LabeledInput
                    label="Group"
                    value={pageState.group}
                    onChange={(val) => updatePageState({ ...pageState, group: val })}
                    placeholder="Any"
                    tooltip='The group of lore to search for. For example, "0b10 Records" will display all 0b10-related records.'
                />
                <Button
                    tooltip="Resets all filters to their default (unfiltered) state"
                    className="flex-grow-0"
                    onClick={() => updatePageState({})}
                >
                    Reset
                </Button>
            </div>
            <LoreTable pageState={pageState} />
        </div>
    );
}
