import { ReactNode } from "react";

import TextTooltip from "../Tooltip/TextTooltip";

import "./buttons.less";

export type CommonButtonProps = {
    children?: ReactNode;
    className?: string;
    tooltip?: string;
};
export type ButtonProps = CommonButtonProps & {
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

export type ButtonLinkProps = CommonButtonProps & {
    activeLink?: boolean;
    href?: string;
};

export default function Button({ children, onClick, className, tooltip }: ButtonProps) {
    let classes = "button";

    if (className !== undefined) {
        classes += ` ${className}`;
    }

    const button = (
        <button className={classes} onClick={onClick}>
            {children}
        </button>
    );

    if (tooltip) {
        return <TextTooltip tooltipText={tooltip}>{button}</TextTooltip>;
    } else {
        return button;
    }
}

export function ButtonLink({activeLink, children, href, className, tooltip }: ButtonLinkProps) {
    let classes = "button button-link";

    if (activeLink) {
        classes += " button-link-active";
    }

    if (className !== undefined) {
        classes += ` ${className}`;
    }

    const button = (
        <a className={classes} href={href}>
            {children}
        </a>
    );

    if (tooltip) {
        return <TextTooltip tooltipText={tooltip}>{button}</TextTooltip>;
    } else {
        return button;
    }
}
