import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { CombatLogEntry } from "../../types/combatLogTypes";
import { parseCombatLog } from "../../combatLogParser";

import "./dropzone.less";
import Button from "../Buttons/Button";

export type CombatLogDropzoneProps = {
    onParse: (entries: CombatLogEntry[]) => void;
};

export default function CombatLogDropzone({ onParse }: CombatLogDropzoneProps) {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        acceptedFiles.forEach((file: File) => {
            const reader = new FileReader();

            reader.onload = () => {
                const text = reader.result;
                if (text === null) {
                    onParse([]);
                } else {
                    onParse(parseCombatLog(text as string));
                }
            };

            reader.readAsText(file);
        });
    }, []);
    const { getRootProps, getInputProps, open, isDragActive } = useDropzone({ noClick: true, onDrop: onDrop });

    const containerClasses = `dropzone-container${isDragActive ? " dropzone-container-drag-active" : ""}`;

    return (
        <div className={containerClasses} {...(getRootProps() as any)}>
            <input {...getInputProps()} />
            <p className="dropzone-text">Drag file to upload combat log</p>
            <Button onClick={open}>Browse for Combat Log file</Button>
        </div>
    );
}
