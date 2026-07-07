import "./WikiPage.less";

export type WikiHeadingState = {
    id: string;
    indent: number;
    text: string;
};

type HeadingTree = {
    id: string;
    indent: number;
    text: string;
    children: HeadingTree[];
};

function HeadingTree({ heading }: { heading: HeadingTree }) {
    const children = heading.children.length > 0 && (
        <ul>
            {heading.children.map((child, i) => (
                <HeadingTree key={i} heading={child} />
            ))}
        </ul>
    );

    return (
        <li>
            <a href={`#${heading.id}`}>{heading.text}</a>
            {children}
        </li>
    );
}

export default function WikiTableOfContents({ headings }: { headings: WikiHeadingState[] }) {
    if (headings.length < 3) {
        return undefined;
    }

    const allHeadings: HeadingTree[] = [];
    const topLevelHeadings: HeadingTree[] = [];

    for (const heading of headings) {
        // Find the previous nested heading e.g. heading 2 -> heading 1
        // Can fall back to any parent e.g. heading 3 -> heading 1 but not ideal
        // Eventually would like to enforce this with a warning, but currently just convention
        let headingIndex = allHeadings.findIndex((h) => h.indent > heading.indent);

        const newHeading: HeadingTree = {
            children: [],
            id: heading.id,
            indent: heading.indent,
            text: heading.text,
        };

        if (headingIndex >= 0) {
            allHeadings[headingIndex].children.push(newHeading);
        } else {
            topLevelHeadings.push(newHeading);
        }

        allHeadings.unshift(newHeading);
    }

    return (
        <div className="wiki-table-of-contents">
            <details>
                <summary>Table of Contents</summary>
                <ul>
                    {topLevelHeadings.map((heading, i) => (
                        <HeadingTree key={i} heading={heading} />
                    ))}
                </ul>
            </details>
        </div>
    );
}
