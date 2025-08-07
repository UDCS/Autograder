import RedButton from "../../components/buttons/RedButton";
import TextArea from "../../components/textarea/TextArea";
import "../css/TextTestCase.css"

type TextTestCaseProps = {
    input?: string;
    output?: string;
    hidden?: boolean;
    index: number;
    onDelete: (index: number) => void; 
}

function TextTestCase({input, output, index, onDelete, hidden}: TextTestCaseProps) {
    return (
        <div className="text-test-case">
            <div className="testcase-textareas">
                <div className="textarea-half">
                    <div className="textarea-label">
                        Input:
                    </div>
                    <TextArea className="testcase-textarea" autoResize value={input} />
                </div>
                <div className="textarea-half">
                    <div className="textarea-label">
                        Output:
                    </div>
                    <TextArea className="testcase-textarea" autoResize value={output} />
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
                    <input className="visibility-checkbox" type="checkbox" defaultChecked={hidden}/>
                </div>
            </div>
        </div>
    )
}

export default TextTestCase;