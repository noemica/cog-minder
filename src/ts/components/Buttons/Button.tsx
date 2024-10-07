import {  ReactNode, useMemo, useState } from "react";
import { Link } from "wouter";

import TextTooltip from "../Popover/TextTooltip";

import "./buttons.less";

export type CommonButtonProps = {
    children?: ReactNode;
    className?: string;
    tooltip?: string;
};
export type ButtonProps = CommonButtonProps & {
    disabled?: boolean;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    clickOverrideText?: {
        tempChildren: ReactNode;
        tempDuration: number;
    };
};

export type ButtonLinkProps = CommonButtonProps &
    React.HTMLProps<HTMLAnchorElement> & {
        activeLink?: boolean;
        href: string;
    };

export default function Button({
    children,
    disabled,
    onClick: handler,
    clickOverrideText,
    className,
    tooltip,
}: ButtonProps) {
    const [showOverride, setShowOverride] = useState(false);

    let classes = "button";

    if (className !== undefined) {
        classes += ` ${className}`;
    }

    const onClick = useMemo(() => {
        return (e: React.MouseEvent<HTMLButtonElement>) => {
            if (clickOverrideText) {
                setShowOverride(true);

                setTimeout(() => setShowOverride(false), clickOverrideText.tempDuration);
            }

            if (handler) {
                handler(e);
            }
        };
    }, [handler, clickOverrideText]);

    const button = (
        <button className={classes} disabled={disabled} onClick={onClick}>
            {showOverride ? clickOverrideText!.tempChildren : children}
        </button>
    );

    if (tooltip) {
        return <TextTooltip tooltipText={tooltip}>{button}</TextTooltip>;
    } else {
        return button;
    }
}

export function ButtonLink({ activeLink, children, href, className, tooltip, ...props }: ButtonLinkProps) {
    let classes = "button button-link";

    if (activeLink) {
        classes += " button-link-active";
    }

    if (className !== undefined) {
        classes += ` ${className}`;
    }

    const button = (
        <Link asChild={true} href={href}>
            <a className={classes} {...props}>
                {children}
            </a>
        </Link>
    );

    if (tooltip) {
        return (
            <TextTooltip tooltipText={tooltip} useFlexWrapper={true}>
                {button}
            </TextTooltip>
        );
    } else {
        return button;
    }
}
