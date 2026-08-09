import { useLayoutEffect, useState } from "react";

export default function useWindowPosition() {
    const [position, setPosition] = useState({ x: 0, y: 0 });

    useLayoutEffect(() => {
        function updatePosition() {
            setPosition({ x: window.scrollX, y: window.scrollY });
        }

        window.addEventListener("scroll", updatePosition);
        updatePosition();

        return () => window.removeEventListener("scroll", updatePosition);
    }, []);

    return position;
}
