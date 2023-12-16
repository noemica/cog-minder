import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { CombatLogEntry } from "../../types/combatLogTypes";
import { parseCombatLog } from "../../combatLogParser";
import Button from "../Buttons/Button";

import "./Dropzone.less";
import TextTooltip from "../Tooltip/TextTooltip";

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
            <span>Drag file or browse to upload combat log</span>
            <TextTooltip tooltipText="Combat logs can be exported in Beta 13 by setting the TODO option in the advanced settings. Combat logs are exported in your standard Cogmind install location. For Steam users, it is usually something like TODO C:/Program Files (x86)/Steam/steamapps/common/Cogmind/dumps/">
                <div>
                    <Button onClick={open}>Browse for file</Button>
                </div>
            </TextTooltip>
        </div>
    );
}
