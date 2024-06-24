import { Placement } from "@floating-ui/react";
import { useWindowSize } from "usehooks-ts";

export function usePopoverPositioning() {
    const windowSize = useWindowSize();
    let shouldShift: boolean;
    let placement: Placement;

    // Determine popover positioning based on overall window size
    // The detail popovers are fairly large and can wind up taking more space
    // than there is available on smaller screens (phones). Shifting is
    // undesirable in those circumstances, and there isn't room to fit the
    // details to the sides of the screen, so change the popover default
    // to be bottom in those circumstances as well
    if (windowSize.width > 600) {
        placement = "left";
        shouldShift = true;
    } else {
        placement = "bottom";
        shouldShift = false;
    }

    return { placement, shouldShift };
}
