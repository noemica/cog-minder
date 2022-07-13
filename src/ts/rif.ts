import * as rifData from "../json/rif.json";
import * as jQuery from "jquery";
import "bootstrap";
import { createHeader, registerDisableAutocomplete } from "./commonJquery";

const jq = jQuery.noConflict();
jq(function ($) {
    $(() => init());

    // Initialize the page state
    function init() {
        createHeader("RIF", $("#headerContainer"));
        registerDisableAutocomplete($(document));

        // Set initial state
        resetInput();

        $("#reset").on("click", () => {
            ($("#reset") as any).tooltip("hide");
            resetInput();
        });
        $("#nameInput").on("input", updateRifTables);
        $("#descriptionInput").on("input", updateRifTables);

        updateRifTables();

        // Enable tooltips
        ($('[data-toggle="tooltip"]') as any).tooltip();
    }

    // Resets all filters
    function resetInput() {
        // Reset text inputs
        $("#nameInput").val("");
        $("#descriptionInput").val("");
    }

    // Updates all RIF tables based on the JSON/user inputs
    function updateRifTables() {
        // Remove old tables
        const tableBody = $("#rifAbilityTableBody");
        tableBody.empty();

        // Get user inputs and determine filters
        const nameValue = ($("#nameInput").val() as string).toLowerCase();
        const filterName = nameValue.length > 0;
        const descriptionValue = ($("#descriptionInput").val() as string).toLowerCase();
        const filterDescription = descriptionValue.length > 0;

        const tableHtml = rifData.Abilities.filter((ability) => {
            // Filter based on inputs
            if (filterName && !ability.Name.toLowerCase().includes(nameValue)) {
                return false;
            } else if (filterDescription && !ability.Description.toLowerCase().includes(descriptionValue)) {
                return false;
            }

            return true;
        })
            // Convert to HTML
            .map((ability) => {
                return `<tr>
                <td>${ability.Name}</td>
                <td>${ability.Levels}</td>
                <td>${ability.Description}</td>
                </tr>`;
            })
            .join("");

        tableBody.append($(tableHtml) as any);
    }
});
