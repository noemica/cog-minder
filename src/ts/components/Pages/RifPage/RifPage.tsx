import { useLocation, useSearch } from "wouter";

import rifData from "../../../../json/rif.json";
import { JsonRifAbility, JsonRifHackCategory } from "../../../types/rifTypes";
import { createImagePath, getLocationFromState, parseSearchParameters } from "../../../utilities/common";
import Button from "../../Buttons/Button";
import { LabeledInput } from "../../LabeledItem/LabeledItem";
import TextTooltip from "../../Popover/TextTooltip";

import "../Pages.less";
import "./RifPage.less";

type RifPageState = {
    abilityName?: string;
    abilityDescription?: string;
    hackName?: string;
    hackDescription?: string;
    hackTarget?: string;
};

function getPageState(): RifPageState {
    const search = useSearch();

    return parseSearchParameters(search, {});
}

function skipLocationMember(_key: string, _pageState: RifPageState) {
    // const typedKey: keyof RifPageState = key as keyof RifPageState;

    return false;
}

function AbilityRow({ ability }: { ability: JsonRifAbility }) {
    return (
        <tr className="rif-ability-row">
            <td>{ability.Name}</td>
            <td>{ability.MinAbilities}</td>
            <td>{ability.Levels}</td>
            <td>{ability.Description}</td>
        </tr>
    );
}

function AbilityTable({ pageState }: { pageState: RifPageState }) {
    const nameFilter = pageState.abilityName?.toLowerCase() || "";
    const filterName = nameFilter.length > 0;

    const descriptionFilter = pageState.abilityDescription?.toLowerCase() || "";
    const filterDescription = descriptionFilter.length > 0;

    function AbilityRows() {
        return (
            <>
                {rifData.Abilities.map((ability) => {
                    if (filterName && !ability.Name.toLowerCase().includes(nameFilter)) {
                        return undefined;
                    }

                    if (filterDescription && !ability.Description.toLowerCase().includes(descriptionFilter)) {
                        return undefined;
                    }

                    return <AbilityRow key={ability.Name} ability={ability} />;
                })}
            </>
        );
    }

    return (
        <table cellSpacing={0} cellPadding={0} className="rif-table">
            <thead>
                <tr className="rif-ability-header-row">
                    <th>
                        <TextTooltip tooltipText="The name of the RIF ability.">Ability Name</TextTooltip>
                    </th>
                    <th>
                        <TextTooltip tooltipText="The minimum number of prerequisite abilities required in order to get this ability. For example, a min required ability limit of 2 means that this ability is unable to be obtained until the 4th RIF installer.">
                            Min Abilities
                        </TextTooltip>
                    </th>
                    <th>
                        <TextTooltip tooltipText="How many different levels the RIF ability can have. Higher ability levels have greater effect for any effect with > 1 level.">
                            Levels
                        </TextTooltip>
                    </th>
                    <th>
                        <TextTooltip tooltipText="The effect of each RIF ability. If there are multiple levels, each value separated by a / in parentheses depends on the level of the ability.">
                            Description
                        </TextTooltip>
                    </th>
                </tr>
            </thead>
            <tbody>
                <AbilityRows />
            </tbody>
        </table>
    );
}

function HackCategoryRows({ category }: { category: JsonRifHackCategory }) {
    return (
        <>
            <tr className="rif-hack-category-header-row">
                <td>{category.CategoryName}</td>
                <td colSpan={3}>
                    {category.Targets.map((target) => (
                        <img key={target} title={target} src={createImagePath(`game_sprites/${target}.png`)} />
                    ))}
                </td>
            </tr>
            {category.Hacks.map((hack) => (
                <tr key={hack.Name} className="rif-hack-row">
                    <td>{hack.Name}</td>
                    <td>{hack.Rif ? "Yes" : "No"}</td>
                    <td>{hack.Charges}</td>
                    <td>{hack.Description}</td>
                </tr>
            ))}
        </>
    );
}

function HackRows({ categories }: { categories: JsonRifHackCategory[] }) {
    return (
        <>
            {categories.map((category) => {
                return <HackCategoryRows key={category.CategoryName} category={category} />;
            })}
        </>
    );
}

function HacksTable({ pageState }: { pageState: RifPageState }) {
    const nameFilter = pageState.hackName?.toLowerCase() || "";
    const filterName = nameFilter.length > 0;

    const descriptionFilter = pageState.hackDescription?.toLowerCase() || "";
    const filterDescription = descriptionFilter.length > 0;

    const targetFilter = pageState.hackTarget?.toLowerCase() || "";
    const filterTarget = targetFilter.length > 0;

    // Filter out any non-applicable hacks
    let categories = rifData.Hacks.map((category) => {
        let hacks = category.Hacks.filter((hack) => {
            if (filterName && !hack.Name.toLowerCase().includes(nameFilter)) {
                return false;
            }

            if (filterDescription && !hack.Description.toLowerCase().includes(descriptionFilter)) {
                return false;
            }

            return true;
        });

        if (
            filterTarget &&
            category.Targets.find((target) => target.toLowerCase().includes(targetFilter)) === undefined
        ) {
            hacks = [];
        }

        return { CategoryName: category.CategoryName, Hacks: hacks, Targets: category.Targets } as JsonRifHackCategory;
    });

    // After filtering all non-applicable hacks, only keep categories with > 0 hack
    categories = categories.filter((category) => category.Hacks.length > 0);

    return (
        <table cellSpacing={0} cellPadding={0} className="rif-table">
            <thead>
                <tr className="rif-hack-header-row">
                    <th>
                        <TextTooltip tooltipText="The name of the hack.">Hack Name</TextTooltip>
                    </th>
                    <th>
                        <TextTooltip tooltipText="Is RIF required to perform this hack? Some hacks are usable without a RIF install..">
                            RIF Only
                        </TextTooltip>
                    </th>
                    <th>
                        <TextTooltip tooltipText="The number of charges the hack will consume. If 0, no Relay Coupler is required for the hack.">
                            Charges
                        </TextTooltip>
                    </th>
                    <th>
                        <TextTooltip tooltipText="The effect of the hack.">Description</TextTooltip>
                    </th>
                </tr>
            </thead>
            <tbody>
                <HackRows categories={categories} />
            </tbody>
        </table>
    );
}

export default function RifPage() {
    const [_, setLocation] = useLocation();

    const pageState = getPageState();

    function updatePageState(newPageState: RifPageState) {
        const location = getLocationFromState("/rif", newPageState, skipLocationMember);
        setLocation(location, { replace: true });
    }

    const abilityTable =
        pageState.hackDescription || pageState.hackName || pageState.hackTarget ? undefined : (
            <AbilityTable pageState={pageState} />
        );

    return (
        <div className="page-content">
            <div className="page-input-group">
                <LabeledInput
                    label="Ability Name"
                    value={pageState.abilityName || ""}
                    onChange={(val) => updatePageState({ ...pageState, abilityName: val })}
                    placeholder="Any"
                    tooltip="The name of a RIF ability to search for. Only RIF abilities with names containing this value will be shown."
                />
                <LabeledInput
                    label="Ability Description"
                    value={pageState.abilityDescription || ""}
                    onChange={(val) => updatePageState({ ...pageState, abilityDescription: val })}
                    placeholder="Any"
                    tooltip="The RIF ability description to search for. Only RIF abilities with descriptions containing this value will be shown."
                />
                <Button
                    tooltip="Resets all filters to their default (unfiltered) state"
                    className="flex-grow-0"
                    onClick={() => updatePageState({})}
                >
                    Reset
                </Button>
            </div>
            <div className="page-input-group">
                <LabeledInput
                    label="Hack Name"
                    value={pageState.hackName || ""}
                    onChange={(val) => updatePageState({ ...pageState, hackName: val })}
                    placeholder="Any"
                    tooltip="The name of a bot hack to search for. Only hacks with names containing this value will be shown."
                />
                <LabeledInput
                    label="Hack Description"
                    value={pageState.hackDescription || ""}
                    onChange={(val) => updatePageState({ ...pageState, hackDescription: val })}
                    placeholder="Any"
                    tooltip="The bot hack description to search for. Only hacks with descriptions containing this value will be shown."
                />
                <LabeledInput
                    label="Hack Target"
                    value={pageState.hackTarget || ""}
                    onChange={(val) => updatePageState({ ...pageState, hackTarget: val })}
                    placeholder="Any"
                    tooltip='The bot hack target to search for. Only hacks with targets containing this value will be shown. Use "Combat" to search for any combat targeted hacks, or "NC" to search for any generic non-combat targeted hacks.'
                />
            </div>
            {abilityTable}
            <HacksTable pageState={pageState} />
        </div>
    );
}
