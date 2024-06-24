import "./TextArea.less";

export default function TextArea({
    cols = 60,
    onChange,
    rows = 10,
    value,
}: {
    cols?: number;
    onChange: (val: string) => void;
    rows?: number;
    value: string;
}) {
    return (
        <textarea
            className="text-area"
            autoComplete="off"
            onChange={(e) => onChange(e.target.value)}
            cols={cols}
            rows={rows}
            value={value}
        />
    );
}
