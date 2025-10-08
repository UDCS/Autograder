import TextArea from "../../components/textarea/TextArea";
import { TextTestCaseBody } from "../../models/testcases";
import "../css/TextTestCase.css"

type TextTestCaseProps = {
    body?: TextTestCaseBody;
}

function TextTestCase({body}: TextTestCaseProps) {
    
    const handleInputsChange = (newInputs: string) => {
        body!.inputs = newInputs;
    }
    const handleOutputsChange = (newOutputs: string) => {
        body!.outputs = newOutputs;
    }
    const handleVisibilityChange = (newVisibility: boolean) => {
        body!.hidden = newVisibility;
    }
    return (
        <div className="text-test-case">
            <div className="testcase-textareas">
                <div className="textarea-half">
                    <div className="textarea-label">
                        Input:
                    </div>
                    <TextArea className="testcase-textarea" autoResize value={body?.inputs} onChange={handleInputsChange} />
                </div>
                <div className="textarea-half">
                    <div className="textarea-label">
                        Output:
                    </div>
                    <TextArea className="testcase-textarea" autoResize value={body?.outputs} onChange={handleOutputsChange} />
                </div>
            </div>
            <div className="delete-visibility">
                <div className="visibility-parent">
                    Hidden:
                    <input className="visibility-checkbox" type="checkbox" defaultChecked={body?.hidden} onChange={(event) => handleVisibilityChange(event.target.checked)}/>
                </div>
            </div>
        </div>
    )
}

export default TextTestCase;