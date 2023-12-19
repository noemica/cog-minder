import { useEffect } from "react";

export function useBodyDataAttribute(attributeName: string, attributeValue: string) {
    useEffect(() => {
        document.body.setAttribute(attributeName, attributeValue);

        return () => {
            document.body.removeAttribute(attributeName);
        };
    });
}
