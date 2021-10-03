import * as jQuery from "jquery";
import { createHeader } from "./commonJquery";

const jq = jQuery.noConflict();
jq(function ($) {
    $(() => init());

    function init() {
        createHeader("About", $("#headerContainer"));
    }
});
