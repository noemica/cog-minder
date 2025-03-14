import { useState } from "react";
import { useLocation } from "wouter";

import { getLinkSafeString } from "../../../utilities/common";
import SelectWrapper, { SelectOptionType } from "../../Selectpicker/Select";

export default function WikiAutocomplete({
    allowedEntries,
    searchString,
    setSearchString,
}: {
    allowedEntries: string[];
    searchString: string;
    setSearchString: (searchString: string) => void;
}) {
    const [isFocused, setIsFocused] = useState(false);
    const [_, setLocation] = useLocation();

    const searchStringLower = searchString.toLowerCase();

    // Start with options that start with the provided string
    const fullOptions = new Set(
        allowedEntries.filter((entry) => {
            return entry.toLowerCase().startsWith(searchStringLower) && searchString.length > 1;
        }),
    );

    // Add on options that are partial matches
    allowedEntries
        .filter((entry) => {
            return entry.toLowerCase().includes(searchStringLower) && searchString.length > 1;
        })
        .forEach((entry) => fullOptions.add(entry));

    const options = Array.from(fullOptions)
        .splice(0, 20)
        .map<SelectOptionType>((entry) => {
            return { value: entry };
        });

    if (!allowedEntries.find((entry) => entry.toLowerCase() == searchStringLower)) {
        options.unshift({ value: `Search for ${searchString}` });
    }

    return (
        <SelectWrapper
            className="wiki-search"
            options={options}
            onInputChange={(val, action) => {
                if (action.action === "set-value" || action.action === "input-change") {
                    // Ignore the input change from the blur/menu close events
                    // Don't want to clear the value in those cases
                    setSearchString(val);
                }
            }}
            onBlur={() => {
                setIsFocused(false);
            }}
            onFocus={() => {
                setIsFocused(true);
            }}
            onKeyDown={(e) => {
                if (e.key === "Enter" && searchString.length === 1) {
                    setLocation(`/search/${getLinkSafeString(searchString)}`);
                }
            }}
            onChange={(option) => {
                const value = option!.value as string;

                if ((value as string).startsWith("Search for")) {
                    // Search for value
                    setLocation(`/search/${getLinkSafeString(searchString)}`);
                } else {
                    // Direct value
                    setLocation(`/${getLinkSafeString(value)}`);
                }
            }}
            inputValue={searchString}
            menuIsOpen={searchString.length > 1 && isFocused}
            placeholder="Search Wiki"
        />
    );
}
