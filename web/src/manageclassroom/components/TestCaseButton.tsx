import "../css/TestCaseButton.css"
import ColorButton from "../../components/buttons/ColorButton";
import { TestCase } from "../../models/testcases";

type TestCaseButtonProps = {
    selected?: boolean;
    setSelectedTestCase: (testCaseId: string) => void; 
    testCaseInfo: TestCase;
    onCopy?: () => void;
    onDelete?: () => void;
}

function TestCaseButton({selected, setSelectedTestCase, onCopy, onDelete, testCaseInfo}: TestCaseButtonProps) {
    const processCyan = "var(--color-process-cyan)"
    const NCSBlue = "var(--color-NCS-blue)"
    const testCaseTypes = {
        "text": "Compare Output",
        "bash": "Bash Testcase"
    }
    var mainColor = selected ? processCyan : NCSBlue;
    var hoverColor = selected ? NCSBlue : processCyan;
    var clickedColor = selected ? processCyan : NCSBlue;
    return (
        <div className="testcase-button-parent">
            <ColorButton 
                onClick={() => {setSelectedTestCase(testCaseInfo.id)}} 
                className="testcase-button" 
                mainColor={mainColor} 
                hoverColor={hoverColor} 
                clickedColor={clickedColor}>
                <div className="testcase-button-title">
                    {testCaseInfo.name}
                </div>
                <div className="type-points">
                    <div className="testcase-type">
                        {testCaseTypes[testCaseInfo.type]}
                    </div>
                    <div className="testcase-points">
                        {testCaseInfo.points} points
                    </div>
                </div>
            </ColorButton>
            <div className="copy-delete-buttons">
                <button className="icon-button copy-icon-button" onClick={() => onCopy?.()}>

                </button>
                <button className="icon-button delete-icon-button" onClick={() => onDelete?.()}>

                </button>
            </div>
        </div>
    );
}
export default TestCaseButton;