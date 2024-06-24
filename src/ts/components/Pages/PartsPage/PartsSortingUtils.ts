// Sorting functions
export function alphabeticalSort(a: string | undefined, b: string | undefined) {
    const aValue = typeof a === "string" ? a : "";
    const bValue = typeof b === "string" ? b : "";

    return aValue.localeCompare(bValue);
}

export function criticalSort(a: string | undefined, b: string | undefined) {
    function reorderName(criticalString: string | undefined) {
        if (typeof criticalString != "string") {
            return "";
        }

        // Try to parse a [crit]% [critType] b11 string
        let result = /(\d+)% (\w*)/.exec(criticalString);
        if (result === null) {
            // Try to parse a simple number string, use destroy crit by default
            result = /(\d+)/.exec(criticalString);
            if (result === null) {
                return "";
            }
            // Format crit % with 3 digits for proper sorting
            return (
                "Destroy" + parseInt(result[1]).toLocaleString("en-us", { minimumIntegerDigits: 3, useGrouping: false })
            );
        }

        // Format crit % with 3 digits for proper sorting
        return result[2] + parseInt(result[1]).toLocaleString("en-US", { minimumIntegerDigits: 3, useGrouping: false });
    }

    const aValue = reorderName(a);
    const bValue = reorderName(b);

    return aValue.localeCompare(bValue);
}

export function damageSort(a: string, b: string) {
    function getAverage(damageString: string) {
        if (typeof damageString != "string" || damageString === "") {
            return 0;
        }

        const damageArray = damageString
            .split("-")
            .map((s) => s.trim())
            .map((s) => parseInt(s));
        return damageArray.reduce((sum, val) => sum + val, 0) / damageArray.length;
    }

    const aValue = getAverage(a);
    const bValue = getAverage(b);

    return aValue - bValue;
}

export function heatSort(a: string, b: string) {
    function getValue(val: string | undefined) {
        if (val === undefined) {
            return 0;
        }
        const lowerVal = val.toLowerCase();
        if (lowerVal.startsWith("minimal")) {
            return 5;
        }
        if (lowerVal.startsWith("low")) {
            return 25;
        }
        if (lowerVal.startsWith("medium")) {
            return 37;
        }
        if (lowerVal.startsWith("high")) {
            return 50;
        }
        if (lowerVal.startsWith("massive")) {
            return 80;
        }
        if (lowerVal.startsWith("deadly")) {
            return 100;
        }

        return 0;
    }

    const aValue = getValue(a);
    const bValue = getValue(b);

    return aValue - bValue;
}

export function integerSort(a: string, b: string) {
    let aValue = parseInt(a);
    let bValue = parseInt(b);

    if (isNaN(aValue)) {
        aValue = 0;
    }
    if (isNaN(bValue)) {
        bValue = 0;
    }

    return aValue - bValue;
}

export function spectrumSort(a: string, b: string) {
    function getValue(val: string | undefined) {
        if (val === undefined) {
            return 0;
        }
        const lowerVal = val.toLowerCase();
        if (lowerVal.startsWith("wide")) {
            return 10;
        }
        if (lowerVal.startsWith("intermediate")) {
            return 30;
        }
        if (lowerVal.startsWith("narrow")) {
            return 50;
        }
        if (lowerVal.startsWith("fine")) {
            return 100;
        }

        return 0;
    }

    const aValue = getValue(a);
    const bValue = getValue(b);

    return aValue - bValue;
}
