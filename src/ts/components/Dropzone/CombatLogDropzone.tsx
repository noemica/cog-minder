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
            <TextTooltipButton tooltipText="Combat logs can be exported by setting &quot;combatLogOutput=1&quot; in the advanced settings and setting &quot;combatLogLimit=0&quot;. The second setting is needed to prevent the combat log truncating at 1000 lines. The standard Cogmind Options menu setting &quot;Log Output&quot; must also be set to &quot;Text&quot;. Advanced settings and combat logs are both located in your standard Cogmind install location. For Steam users, this is typically C:/Program Files (x86)/Steam/steamapps/common/Cogmind/. Combat log scoresheets are in /scores/ and end in _combat.txt.">
                Help
            </TextTooltipButton>
        </div>
    );
}
