import { ChangeEvent } from "react";

import "./Input.less";

export type CustomInputProps = {
    onChange: (newValue: string) => void;
    placeholder?: string;
    value?: string;
};

export default function Input({ onChange, placeholder, value }: CustomInputProps) {
    function onInputChange(event: ChangeEvent<HTMLInputElement>) {
        onChange(event.target.value);
    }

    return <input className="grouped-input" size={5} type="text" placeholder={placeholder} value={value} onChange={onInputChange} />;
}

export function SoloInput({ onChange, placeholder, value }: CustomInputProps) {
    function onInputChange(event: ChangeEvent<HTMLInputElement>) {
        onChange(event.target.value);
    }

    return <input className="input" size={5} type="text" placeholder={placeholder} value={value} onChange={onInputChange} />;
}