import { Item } from "../../types/itemTypes";
import Button from "../Buttons/Button";
import PartDetails from "../GameDetails/PartDetails";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";

export default function ItemPopover({ item, visible = true }: { item: Item; visible?: boolean }) {
    return (
        <Popover>
            <PopoverTrigger asChild={true}>
                <div>
                    <Button>{item.name}</Button>
                </div>
            </PopoverTrigger>
            <PopoverContent floatingArrowClassName="part-popover-arrow">
                <div className="button-popover part-popover">
                    <PartDetails item={item} />
                </div>
            </PopoverContent>
        </Popover>
    );
}
