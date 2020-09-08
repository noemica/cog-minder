jq = jQuery.noConflict();
jq(function ($) {
    // Slot ID -> Slot string
    const slotMap = {
        "slotPower": "Power",
        "slotPropulsion": "Propulsion",
        "slotUtility": "Utility",
        "slotWeapon": "Weapon",
        "slotOther": "Other",
    };

    // Type ID -> Type string
    const typeMap = {
        "powerTypeEngine": "Engine",
        "powerTypePowerCore": "Power Core",
        "powerTypeReactor": "Reactor",
        "propTypeFlight": "Flight Unit",
        "propTypeHover": "Hover Unit",
        "propTypeLeg": "Leg",
        "propTypeTread": "Treads",
        "propTypeWheel": "Wheel",
        "utilTypeArtifact": "Artifact",
        "utilTypeDevice": "Device",
        "utilTypeHackware": "Hackware",
        "utilTypeProcessor": "Processor",
        "utilTypeProtection": "Protection",
        "utilTypeStorage": "Storage",
        "weaponTypeBallisticCannon": "Ballistic Cannon",
        "weaponTypeBallisticGun": "Ballistic Gun",
        "weaponTypeEnergyCannon": "Energy Cannon",
        "weaponTypeEnergyGun": "Energy Gun",
        "weaponTypeImpactWeapon": "Impact Weapon",
        "weaponTypeLauncher": "Launcher",
        "weaponTypePiercingWeapon": "Piercing Weapon",
        "weaponTypeSlashingWeapon": "Slashing Weapon",
        "weaponTypeSpecialMeleeWeapon": "Special Melee Weapon",
        "weaponTypeSpecialWeapon": "Special Weapon",
    };

    // Slot ID -> Type button container ID
    const slotIdToTypeIdMap = {
        "slotPower": "powerTypeContainer",
        "slotPropulsion": "propTypeContainer",
        "slotUtility": "utilTypeContainer",
        "slotWeapon": "weaponTypeContainer",
    }

    // Load external files
    let items = fetch("./json/items.json")
        .then(response => response.json());
    let locations = fetch("./json/locations.json")
        .then(response => response.json());

    Promise.all([items, locations]).then(data => {
        $(document).ready(() => {
            init(data[0], data[1]);
        });
    })

    // Initialize the page state
    function init(items, locations) {
        itemData = items;
        locationData = locations;

        // Reset page state
        resetFilters();

        // Register handlers
        $("#name").on("input", updateItems);
        $("#depth").on("input", updateItems);
        $("#size").on("input", updateItems);
        $("#mass").on("input", updateItems);
        $("#reset").click(resetFilters);
        $("#slotsContainer > label > input").on("click", () => {
            updateTypeFilters();
            updateItems();
        });
        $("#powerTypeContainer > label > input").on("click", updateItems);
        $("#propTypeContainer > label > input").on("click", updateItems);
        $("#utilTypeContainer > label > input").on("click", updateItems);
        $("#weaponTypeContainer > label > input").on("click", updateItems);

        // Enable tooltips
        $('[data-toggle="tooltip"]').tooltip()
    }

    // Gets a filter function combining all current filters
    function getItemFilter() {
        let filters = [];

        // Name filter
        const nameValue = $("#name").val();
        if (nameValue.length > 0) {
            filters.push(item => item.Name.toLowerCase().includes(nameValue.toLowerCase()));
        }

        // Depth filter TODO
        // const depthValue = $("#depth").val();
        // if (depthValue.length > 0) {
        // }

        // Size filter
        const sizeValue = $("#size").val();
        if (sizeValue.length > 0) {
            filters.push(item => item["Size"] === sizeValue);
        }

        // Mass filter
        const massValue = $("#mass").val();
        if (massValue.length > 0) {
            filters.push(item =>
                item["Mass"] === massValue);
        }

        // Slot filter
        const slotId = $("#slotsContainer > label.active").attr("id");
        if (slotId in slotMap) {
            const filterSlot = slotMap[slotId];
            filters.push(item => item["Slot"] === filterSlot);
        }

        // Type filter
        const typeId = $("#typeFilters > div:not(\".not-visible\") > label.active").attr("id");
        if (typeId in typeMap) {
            const filterType = typeMap[typeId];
            filters.push(item => item["Type"] === filterType);
        }

        // Create a function that checks all filters
        return item => {
            return filters.every(func => func(item));
        }
    }

    // Clears a button group's state and sets the first item to be active
    function resetButtonGroup(group) {
        group.children().removeClass("active");

        group.children("label:first-of-type").addClass("active");
    }

    // Resets all filters
    function resetFilters() {
        // Reset text inputs
        $("#name").val("");
        $("#depth").val("");
        $("#size").val("");
        $("#mass").val("");

        // Reset buttons
        resetButtonGroup($("#slotsContainer"));
        resetButtonGroup($("#powerTypeContainer"));
        resetButtonGroup($("#propTypeContainer"));
        resetButtonGroup($("#utilTypeContainer"));
        resetButtonGroup($("#weaponTypeContainer"));
        resetButtonGroup($("#categoryContainer"));

        // Reset to default items view
        updateTypeFilters();
        updateItems();
    }

    // Clears all existing items and creates new ones based on the filters
    function updateItems() {
        // Get the names of all non-filtered items
        const itemFilter = getItemFilter();
        let items = [];
        Object.keys(itemData).forEach(itemName => {
            if (itemFilter(itemData[itemName])) {
                items.push(itemName);
            }
        });

        // Sort and create items
        items.sort();
        const itemsGrid = $("#itemsGrid");
        itemsGrid.empty();
        items.forEach(item => itemsGrid.append(`<li class="item">${item}</li>`));
    }

    // Updates the type filters visibility based on the selected slot
    function updateTypeFilters() {
        // Hide all type filters
        Object.keys(slotIdToTypeIdMap).forEach(k => $(`#${slotIdToTypeIdMap[k]}`).addClass("not-visible"));

        const activeSlotId = $("#slotsContainer > label.active").attr("id");
        if (activeSlotId in slotIdToTypeIdMap) {
            $(`#${slotIdToTypeIdMap[activeSlotId]}`).removeClass("not-visible");
        }
    }
});