import { useState } from "react";
import TrackVisibility from "react-on-screen";

import { Item } from "../../types/itemTypes";
import Button from "../Buttons/Button";
import PartDetails from "../GameDetails/PartDetails";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";

export default function ItemPopover({ item }: { item: Item }) {
    const [isOpen, setIsOpen] = useState(false);

    function ItemButton({ isVisible }: { isVisible: boolean }) {
        const button = (
            <div>
                <Button>{item.name}</Button>
            </div>
        );

        if (isVisible || isOpen) {
            return (
                <Popover
                    initialOpen={isOpen}
                    onOpenChange={(open) => {
                        setIsOpen(open);
                    }}
                >
                    <PopoverTrigger asChild={true}>{button}</PopoverTrigger>
                    <PopoverContent floatingArrowClassName="part-popover-arrow">
                        <div className="button-popover part-popover">
                            <PartDetails item={item} />
                        </div>
                    </PopoverContent>
                </Popover>
            );
        } else {
            return button;
        }
    }

    return (
        <TrackVisibility partialVisibility={true}>
            {({ isVisible }) => <ItemButton isVisible={isVisible} />}
        </TrackVisibility>
    );
}
