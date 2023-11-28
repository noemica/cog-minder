import rifData from "../json/rif.json";
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
        $("#abilityNameInput").on("input", updateRifTables);
        $("#abilityDescriptionInput").on("input", updateRifTables);
        $("#hackNameInput").on("input", updateRifTables);
        $("#hackDescriptionInput").on("input", updateRifTables);
        $("#hackTargetInput").on("input", updateRifTables);

        updateRifTables();

        // Enable tooltips
        ($('[data-toggle="tooltip"]') as any).tooltip();
    }

    // Resets all filters
    function resetInput() {
        // Reset text inputs
        $("#abilityNameInput").val("");
        $("#abilityDescriptionInput").val("");
        $("#hackNameInput").val("");
        $("#hackDescriptionInput").val("");
        $("#hackTargetInput").val("");

        updateRifTables();
    }

    // Updates all RIF tables based on the JSON/user inputs
    function updateRifTables() {
        // Update ability table first
        const abilityTableBody = $("#rifAbilityTableBody");
        abilityTableBody.empty();

        // Get user inputs and determine filters
        const abilityNameValue = ($("#abilityNameInput").val() as string).toLowerCase();
        const filterAbilityName = abilityNameValue.length > 0;
        const abilityDescriptionValue = ($("#abilityDescriptionInput").val() as string).toLowerCase();
        const filterAbilityDescription = abilityDescriptionValue.length > 0;

        const hacksNameValue = ($("#hackNameInput").val() as string).toLowerCase();
        const filterHacksName = hacksNameValue.length > 0;
        const hacksDescriptionValue = ($("#hackDescriptionInput").val() as string).toLowerCase();
        const filterHacksDescription = hacksDescriptionValue.length > 0;
        const hacksTargetValue = ($("#hackTargetInput").val() as string).toLowerCase();
        const filterHacksTarget = hacksTargetValue.length > 0;
        const filterHacks = filterHacksName || filterHacksDescription || filterHacksTarget;

        if (filterHacks) {
            // If we're filtering hacks then hide the abilities for convenience
            $("#abilityTable").addClass("not-visible");
        } else {
            // Otherwise, show and update the table
            $("#abilityTable").removeClass("not-visible");

            const abilityTableHtml = rifData.Abilities.filter((ability) => {
                // Filter based on inputs
                if (filterAbilityName && !ability.Name.toLowerCase().includes(abilityNameValue)) {
                    return false;
                }

                if (filterAbilityDescription && !ability.Description.toLowerCase().includes(abilityDescriptionValue)) {
                    return false;
                }

                return true;
            })
                // Convert to HTML
                .map((ability) => {
                    return `<tr>
                    <td>${ability.Name}</td>
                    <td class="sans-serif-font">${ability.MinAbilities}</td>
                    <td class="sans-serif-font">${ability.Levels}</td>
                    <td class="sans-serif-font">${ability.Description}</td>
                    </tr>`;
                })
                .join("");

            abilityTableBody.append($(abilityTableHtml) as any);
        }

        // Next update hacks table
        const hacksTableBody = $("#rifHacksTableBody");
        hacksTableBody.empty();

        const hacksTableHtml = rifData.Hacks.map((hackCategory) => {
            // Check for overall category filter
            if (
                filterHacksTarget &&
                !hackCategory.CategoryName.toLowerCase().includes(hacksTargetValue) &&
                hackCategory.Targets.find((target) => target.toLowerCase().includes(hacksTargetValue)) === undefined
            ) {
                return "";
            }

            const targetRowsHtml = hackCategory.Hacks.filter((hack) => {
                // Check for name/description filters
                if (filterHacksName && !hack.Name.toLowerCase().includes(hacksNameValue)) {
                    return false;
                }

                if (filterHacksDescription && !hack.Description.toLowerCase().includes(hacksDescriptionValue)) {
                    return false;
                }

                return true;
            })
                // Create hack HTML rows
                .map((hack) => {
                    return `<tr>
                    <td>${hack.Name}</td>
                    <td class="sans-serif-font">${hack.Rif ? "Yes" : "No"}</td>
                    <td class="sans-serif-font">${hack.Charges}</td>
                    <td class="sans-serif-font">${hack.Description}</td>
                    </tr>`;
                })
                .join("");

            if (targetRowsHtml.length === 0) {
                // If no hacks were found by filters then skip whole category
                return "";
            }

            // Create image list HTML
            const imagesHtml = hackCategory.Targets.map((target) => {
                return `<img src="../game_sprites/${target}.png" title="${target}"/>`;
            }).join(" ");

            // Create whole row HTML
            const targetTitleRowsHtml = `<tr>
                <td class="rif-hacks-target-row">
                    <p>${hackCategory.CategoryName}</p>
                </td>
                <td class="rif-hacks-target-row" colspan="3">
                    ${imagesHtml}
                </td>
            </tr>`;

            return targetTitleRowsHtml + targetRowsHtml;
        }).join("");

        hacksTableBody.append($(hacksTableHtml) as any);
    }
});
