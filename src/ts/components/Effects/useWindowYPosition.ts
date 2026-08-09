import { useLayoutEffect, useState } from "react";

export default function useWindowYPosition() {
    const [scrollPosition, setPosition] = useState(0);

    useLayoutEffect(() => {
        function updatePosition() {
            setPosition(window.scrollY);
        }

        window.addEventListener("scroll", updatePosition);
        updatePosition();

        return () => window.removeEventListener("scroll", updatePosition);
    }, []);

    return scrollPosition;
}
