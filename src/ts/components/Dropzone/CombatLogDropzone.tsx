import { useDropzone } from "react-dropzone";

import { CombatLogEntry } from "../../types/combatLogTypes";
import { parseCombatLog } from "../../utilities/combatLogParser";
import Button from "../Buttons/Button";
import TextTooltip from "../Popover/TextTooltip";
import TextTooltipButton from "../Popover/TextTooltipButton";

import "./Dropzone.less";

export type CombatLogDropzoneProps = {
    onParse: (entries: CombatLogEntry[]) => void;
};

export default function CombatLogDropzone({ onParse }: CombatLogDropzoneProps) {
    const onDrop = (acceptedFiles: File[]) => {
        let entries: CombatLogEntry[] = [];

        for (const file of acceptedFiles) {
            const reader = new FileReader();

            reader.onload = () => {
                const text = reader.result;
                if (text !== null) {
                    // Can't reuse the same array or else it will be treated as
                    // the same object and won't trigger another state update
                    // Make a new array based off the old one instead
                    entries = [...entries, ...parseCombatLog(text as string)];
                    onParse(entries);
                }
            };

            reader.readAsText(file);
        }
    };
    const { getRootProps, getInputProps, open, isDragActive } = useDropzone({ noClick: true, onDrop: onDrop });

    const containerClasses = `dropzone-container${isDragActive ? " dropzone-container-drag-active" : ""}`;

    return (
        <div className={containerClasses} {...(getRootProps() as any)}>
            <input {...getInputProps()} />
            <span>Drag file or browse to upload combat log</span>
            <TextTooltip tooltipText="Browse for combat log files.">
                <div>
                    <Button onClick={open}>Browse for file</Button>
                </div>
            </TextTooltip>
            <TextTooltipButton tooltipText="Combat logs can be exported in by setting `combatLogOutput=1` in the advanced settings and setting `combatLogLimit=0` for unlimited length, or else the combat log will truncate at 1000 lines. The standard Cogmind Options menu setting `Log Output` must also be set to `Text`. Advanced settings and combat logs are both located in your standard Cogmind install location. For Steam users, this is typically C:/Program Files (x86)/Steam/steamapps/common/Cogmind/">
                Help
            </TextTooltipButton>
        </div>
    );
}
