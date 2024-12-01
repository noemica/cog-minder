import { Placement } from "@floating-ui/react";
import { createContext } from "react";

export type PopupPositioningContextType = {
    shouldShift: boolean;
    placement: Placement;
};

export const PopupPositioningContext = createContext<PopupPositioningContextType | undefined>(undefined);
