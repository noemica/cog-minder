import { itemData } from "../../../utilities/common";
import PartDetails from "../../GameDetails/PartDetails";
import ButtonPopover from "../../Tooltip/ButtonPopover";
import { PartsPageState } from "./PartsPage";

import "./PartsPage.less";

export default function PartsSimpleDisplay({ pageState }: { pageState: PartsPageState }) {
    const itemNames = Object.keys(itemData);
    const itemButtons = itemNames.map((itemName) => {
        const item = itemData[itemName];

        return (
            <ButtonPopover floatingArrowClassName="part-popover-arrow" className="part-popover" key={itemName} buttonLabel={itemName}>
                <PartDetails item={item} />
            </ButtonPopover>
        );
    });

    return <div className="part-button-grid">{itemButtons}</div>;
}
