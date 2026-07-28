import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";

import { getLinkSafeString } from "../../../utilities/common";
import SelectWrapper, { SelectOptionType } from "../../Selectpicker/Select";

const SEARCH_ID = "wiki-search";

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
    const [location, setLocation] = useLocation();

    // Prevent the default middle mouse button scroll behavior so we can open
    // the page in a new tab instead
    const options = useMemo(() => {
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
                return { label: <div>{entry}</div>, value: entry };
            });

        if (!allowedEntries.find((entry) => entry.toLowerCase() == searchStringLower)) {
            options.unshift({
                label: <div>Search for {searchString}</div>,
                value: `search/${getLinkSafeString(searchString)}`,
            });
        }

        return options;
    }, [searchString, allowedEntries]);

    // Disable middle/right clicks taking focus away from the search input
    // This lets the user click on the dropdown items to do things like open
    // links in a new tab
    useEffect(() => {
        const handleMousedown = (e: MouseEvent) => {
            if (e.button === 1 || e.button === 2) {
                let target = e.target as HTMLElement | null;

                while (target !== null && target.id !== SEARCH_ID) {
                    target = target.parentElement;
                }

                if (target !== null) {
                    e.preventDefault();
                }
            }
        };

        window.addEventListener("mousedown", handleMousedown);

        return () => window.removeEventListener("mousedown", handleMousedown);
    });

    return (
        <SelectWrapper
            id={SEARCH_ID}
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
                console.log(location);

                // Removed in favor of links
                const value = option!.value as string;

                const selectedLocation = value.startsWith("search") ? `/${value}` : `/${getLinkSafeString(value)}`;

                if (location !== selectedLocation) {
                    // Direct value
                    setLocation(selectedLocation);
                }
            }}
            useLink={true}
            inputValue={searchString}
            menuIsOpen={searchString.length > 1 && isFocused}
            placeholder="Search Wiki"
        />
    );
}
