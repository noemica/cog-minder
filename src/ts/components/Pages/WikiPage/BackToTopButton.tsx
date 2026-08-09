import { useMediaQuery, useWindowSize } from "usehooks-ts";

import Button from "../../Buttons/Button";
import useWindowYPosition from "../../Effects/useWindowYPosition";

import "./WikiPage.less";

export function BackToTopButton() {
    const windowSize = useWindowSize();
    const windowYPosition = useWindowYPosition();
    const isMobile = useMediaQuery("screen and (max-width: 700px)");

    let hidden = windowSize.height * 2 >= windowYPosition;

    return (
        isMobile && (
            <div className={`back-to-top-button`}>
                <Button
                    className={hidden ? "opaque" : ""}
                    onClick={() => {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                />
            </div>
        )
    );
}
