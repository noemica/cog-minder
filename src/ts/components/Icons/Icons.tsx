import TextTooltip from "../Popover/TextTooltip";

import "./Icons.less";

// Ref: https://yqnn.github.io/svg-path-editor/

export function LinkIcon({ href }: { href: string }) {
    return (
        <a className="link-icon" href={href}>
            <svg viewBox="0 0 24 24" width="24">
                <path d="m 4 12 c 0 -2 1 -3 3.1 -3 h 4 v -2 h -4.1 c -3 0 -5 2.24 -5 5 s 2 5 5 5 h 4 v -2 h -4 c -2 0 -3 -1 -3 -3 z m 4 1 h 8 v -2 h -8 v 2 z m 9 -6 h -4 v 2 h 4 c 2 0 3 1 3 3 s -1 3 -3 3 h -4 v 2 h 4 c 3 0 5 -2 5 -5 s -2 -5 -5 -5 z" />
            </svg>
        </a>
    );
}

export function RefreshIcon() {
    return (
        <TextTooltip tooltipText="A new Cog-Minder update has been detected. Please click this icon to refresh or refresh manually to get the latest changes and avoid any issues.">
            <button
                className="refresh-icon-button"
                onClick={() => {
                    location.reload();
                }}
            >
                <svg viewBox="0 0 29.211 29.727">
                    <path d="M17.368,10.298c0.136,0.242,0.456,0.435,0.732,0.436l10.348,0.058c0.268,0.002,0.512-0.138,0.652-0.366 c0.141-0.228,0.145-0.517,0.023-0.755l-4.719-9.23c-0.126-0.248-0.409-0.429-0.685-0.438c-0.278-0.012-0.606,0.085-0.752,0.321 l-1.447,2.347c-2.09-1.181-4.488-1.874-7.056-1.874C6.489,0.795,0,7.285,0,15.261c0,7.977,6.489,14.466,14.466,14.466 c7.976,0,14.465-6.489,14.465-14.466c0-0.873-0.09-1.725-0.239-2.556c-0.08,0.007-0.156,0.029-0.237,0.029h-0.021l-4.858-0.014 c0.226,0.81,0.355,1.659,0.355,2.54c0,5.219-4.246,9.466-9.465,9.466C9.246,24.727,5,20.479,5,15.261 c0-5.22,4.246-9.466,9.466-9.466c1.605,0,3.11,0.415,4.435,1.125l-1.58,2.563C17.175,9.719,17.234,10.055,17.368,10.298z" />
                </svg>
            </button>
        </TextTooltip>
    );
}
