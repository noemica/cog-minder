import {
    FloatingArrow,
    FloatingPortal,
    OpenChangeReason,
    Placement,
    arrow,
    autoUpdate,
    flip,
    offset,
    shift,
    useDismiss,
    useFloating,
    useFocus,
    useHover,
    useInteractions,
    useMergeRefs,
    useRole,
    useTransitionStyles,
} from "@floating-ui/react";
import * as React from "react";
import { ReactNode, useRef } from "react";

import "./Tooltip.less";

// From https://floating-ui.com/docs/tooltip
type TooltipOptions = {
    children?: ReactNode | undefined;
    initialOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean, event?: Event, reason?: OpenChangeReason) => void;
    placement?: Placement;
    shouldShift?: boolean;
    useHover?: boolean;
    useFocus?: boolean;
};

export function useTooltip({
    initialOpen = false,
    placement = "top",
    shouldShift = true,
    open: controlledOpen,
    onOpenChange: setControlledOpen,
    useHover: shouldUseHover = true,
    useFocus: shouldUseFocus = true,
}: TooltipOptions = {}) {
    const arrowRef = useRef(null);
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(initialOpen);

    const open = controlledOpen ?? uncontrolledOpen;
    const setOpen = setControlledOpen ?? setUncontrolledOpen;

    const data = useFloating({
        placement,
        open,
        onOpenChange: setOpen,
        whileElementsMounted: autoUpdate,
        middleware: [
            offset(5),
            flip({
                crossAxis: placement.includes("-"),
                fallbackAxisSideDirection: "start",
                padding: 5,
            }),
            shouldShift && shift({ padding: 5 }),
            arrow({ element: arrowRef }),
        ],
    });

    const context = data.context;
    const { isMounted, styles } = useTransitionStyles(context, {
        duration: 300,
    });

    const hover = useHover(context, {
        move: false,
        enabled: controlledOpen == null || shouldUseHover,
    });
    const focus = useFocus(context, {
        enabled: controlledOpen == null || shouldUseFocus,
    });
    const dismiss = useDismiss(context);
    const role = useRole(context, { role: "tooltip" });

    const interactions = useInteractions([hover, focus, dismiss, role]);

    return React.useMemo(
        () => ({
            open,
            setOpen,
            arrowRef,
            isMounted,
            styles,
            ...interactions,
            ...data,
        }),
        [open, setOpen, arrowRef, isMounted, styles, interactions, data],
    );
}

type ContextType = ReturnType<typeof useTooltip> | null;

const TooltipContext = React.createContext<ContextType>(null);

export const useTooltipContext = () => {
    const context = React.useContext(TooltipContext);

    if (context == null) {
        throw new Error("Tooltip components must be wrapped in <Tooltip />");
    }

    return context;
};

export function Tooltip({ children, ...options }: TooltipOptions) {
    // This can accept any props as options, e.g. `placement`,
    // or other positioning options.
    const tooltip = useTooltip(options);
    return <TooltipContext.Provider value={tooltip}>{children}</TooltipContext.Provider>;
}

export const TooltipTrigger = React.forwardRef<HTMLElement, React.HTMLProps<HTMLElement> & { asChild?: boolean }>(
    function TooltipTrigger({ children, asChild = false, ...props }, propRef) {
        const context = useTooltipContext();
        const childrenRef = (children as any).ref;
        const ref = useMergeRefs([context.refs.setReference, propRef, childrenRef]);

        // `asChild` allows the user to pass any element as the anchor
        if (asChild && React.isValidElement(children)) {
            return React.cloneElement(
                children,
                context.getReferenceProps({
                    ref,
                    ...props,
                    ...children.props,
                    "data-state": context.open ? "open" : "closed",
                }),
            );
        }

        return (
            <div
                ref={ref}
                // The user can style the trigger based on the state
                data-state={context.open ? "open" : "closed"}
                {...context.getReferenceProps(props)}
            >
                {children}
            </div>
        );
    },
);

export const TooltipContent = React.forwardRef<
    HTMLElement,
    React.HTMLProps<HTMLElement> & { style?: React.CSSProperties | undefined; floatingArrowClassName?: string }
>(function TooltipContent({ style, floatingArrowClassName, ...props }, propRef) {
    const context = useTooltipContext();
    const ref = useMergeRefs([context.refs.setFloating, propRef]);

    if (!context.open && !context.isMounted) {
        return null;
    }

    const floatingArrowClasses = (floatingArrowClassName || "") + " tooltip-arrow";

    return (
        context.isMounted && (
            <FloatingPortal>
                <div
                    ref={ref as any}
                    style={{
                        ...context.floatingStyles,
                        ...context.styles,
                        ...style,
                    }}
                    {...context.getFloatingProps(props)}
                >
                    {props.children}
                    <FloatingArrow
                        className={floatingArrowClasses}
                        tipRadius={2}
                        height={8}
                        ref={context.arrowRef}
                        context={context.context}
                    />
                </div>
            </FloatingPortal>
        )
    );
});
