import { ChangeEvent } from "react";

import "./Input.less";

export type CustomInputProps = {
    disabled?: boolean;
    onChange: (newValue: string) => void;
    placeholder?: string;
    value?: string;
};

export default function Input({ disabled, onChange, placeholder, value }: CustomInputProps) {
    function onInputChange(event: ChangeEvent<HTMLInputElement>) {
        onChange(event.target.value);
    }

    return (
        <input
            className="input grouped-input"
            disabled={disabled}
            size={5}
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={onInputChange}
        />
    );
}

export function SquareInput({ disabled, onChange, placeholder, value }: CustomInputProps) {
    function onInputChange(event: ChangeEvent<HTMLInputElement>) {
        onChange(event.target.value);
    }

    return (
        <input
            className="input"
            disabled={disabled}
            size={5}
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={onInputChange}
        />
    );
}

export function RoundedInput({ disabled, onChange, placeholder, value }: CustomInputProps) {
    function onInputChange(event: ChangeEvent<HTMLInputElement>) {
        onChange(event.target.value);
    }

    return (
        <input
            className="input rounded-input"
            disabled={disabled}
            size={5}
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={onInputChange}
        />
    );
}
