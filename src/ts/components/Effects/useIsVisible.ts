import React from "react";

export function useIsVisible(margin: string = "0px") {
    const [isVisible, setIsVisible] = React.useState(false);

    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (ref.current && !isVisible) {
            const observer = new IntersectionObserver(
                ([entry]) => {
                    entry.isIntersecting && setIsVisible(true);
                },
                {
                    rootMargin: margin,
                },
            );
            observer.observe(ref.current);
            return () => {
                observer.disconnect();
            };
        }

        return undefined;
    }, [isVisible]);
    return [isVisible, ref] as const;
}
