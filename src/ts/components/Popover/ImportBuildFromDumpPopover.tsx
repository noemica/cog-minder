import { useState } from "react";

import Button from "../Buttons/Button";
import { ExclusiveButtonDefinition } from "../Buttons/ExclusiveButtonGroup";
import { LabeledExclusiveButtonGroup, SoloLabel } from "../LabeledItem/LabeledItem";
import TextArea from "../TextArea/TextArea";
import ButtonPopover from "./ButtonPopover";

type PeakStateType = "No" | "Yes";

const peakStateButtons: ExclusiveButtonDefinition<PeakStateType>[] = [{ value: "No" }, { value: "Yes" }];

export default function ImportBuildFromDumpPopover({
    onSubmit,
}: {
    onSubmit: (text: string, usePeakState: boolean) => void;
}) {
    const [text, setText] = useState<string>("");
    const [usePeakState, setUsePeakState] = useState<PeakStateType>("No");

    return (
        <ButtonPopover
            buttonLabel="Import From Dump"
            buttonTooltip="Popup that allows importing a build from a scoresheet or current run dump."
        >
            <div className="import-from-dump-popover">
                <SoloLabel
                    label="Paste run dump below"
                    tooltip="Past the entire run dump or scoresheet .txt file below."
                />
                <TextArea value={text} onChange={(val) => setText(val)} />
                <div className="submit-dump-row">
                    <LabeledExclusiveButtonGroup
                        buttons={peakStateButtons}
                        label="Peak State"
                        tooltip="Use peak state? If not then current/last state is used instead."
                        selected={usePeakState}
                        onValueChanged={(val) => setUsePeakState(val)}
                    />
                    <Button
                        onClick={() => onSubmit(text, usePeakState === "Yes" ? true : false)}
                        tooltip="Submit the pasted dump."
                    >
                        Submit
                    </Button>
                </div>
            </div>
        </ButtonPopover>
    );
}
