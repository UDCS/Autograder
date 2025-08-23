import RedButton from "../../components/buttons/RedButton";
import TextArea from "../../components/textarea/TextArea";
import { TextInputOutput } from "../../models/testcases";
import "../css/TextTestCase.css"
import { assignmentStore } from "../subpages/AssignmentsSubpage";

type TextTestCaseProps = {
    input_output?: TextInputOutput;
    index: number;
    onDelete: (index: number) => void; 
}

function TextTestCase({input_output, index, onDelete}: TextTestCaseProps) {
    
    const handleInputsChange = (newInputs: string) => {
        input_output!.inputs = newInputs;
    }
    const handleOutputsChange = (newOutputs: string) => {
        input_output!.outputs = newOutputs;
    }
    const handleVisibilityChange = (newVisibility: boolean) => {
        input_output!.hidden = newVisibility;
        console.log(assignmentStore);
    }
    return (
        <div className="text-test-case">
            <div className="testcase-textareas">
                <div className="textarea-half">
                    <div className="textarea-label">
                        Input:
                    </div>
                    <TextArea className="testcase-textarea" autoResize value={input_output?.inputs} onChange={handleInputsChange} />
                </div>
                <div className="textarea-half">
                    <div className="textarea-label">
                        Output:
                    </div>
                    <TextArea className="testcase-textarea" autoResize value={input_output?.outputs} onChange={handleOutputsChange} />
                </div>
            </div>
            <div className="delete-visibility">
                <div className="testcase-delete-parent">
                    <RedButton className="testcase-delete-button" onClick={() => onDelete(index)}>
                        <img src="/public/svg/DeleteButton.svg" className="delete-icon"/>
                        Delete
                    </RedButton>
                </div>
                <div className="visibility-parent">
                    Hidden:
                    <input className="visibility-checkbox" type="checkbox" defaultChecked={input_output?.hidden} onChange={(event) => handleVisibilityChange(event.target.checked)}/>
                </div>
            </div>
        </div>
    )
}

export default TextTestCase;