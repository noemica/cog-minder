import "./Icons.less";

// Ref: https://yqnn.github.io/svg-path-editor/

export default function LinkIcon({ href }: { href: string }) {
    return (
        <a className="link-icon" href={href}>
            <svg viewBox="0 0 24 24" width="22" xmlns="http://www.w3.org/2000/svg">
                <path d="m 4 12 c 0 -2 1 -3 3.1 -3 h 4 v -2 h -4.1 c -3 0 -5 2.24 -5 5 s 2 5 5 5 h 4 v -2 h -4 c -2 0 -3 -1 -3 -3 z m 4 1 h 8 v -2 h -8 v 2 z m 9 -6 h -4 v 2 h 4 c 2 0 3 1 3 3 s -1 3 -3 3 h -4 v 2 h 4 c 3 0 5 -2 5 -5 s -2 -5 -5 -5 z" />
            </svg>
        </a>
    );
}
