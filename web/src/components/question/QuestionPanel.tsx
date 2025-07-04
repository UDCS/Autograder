import { Editor } from "@monaco-editor/react";
import "./QuestionPanel.css"
import BlueButton from "../bluebutton/BlueButton";
import QuestionScore from "./QuestionScore";
import ConsoleOutput from "../assignment/ConsoleOutput";

function QuestionPanel() {
    return <div className="questionPanel">
        <div className="questionTitle">Question Title</div>
        <div className="questionDescription">Question description</div>
        <div className="resetStarterCodeParent">
            <button className="resetStarterCode">Reset Starter Code</button>
        </div>
        <div className="editorParent">
            <Editor language="python" />
        </div>
        <div className="submitAndScore">
            <div className="submitParent">
                <BlueButton className="submitButton">
                    Submit
                </BlueButton>
            </div>
            <div className="scoreParent">
                <QuestionScore score={0} points={10}/>
            </div>
        </div>
        <div className="consoleParent">
            <ConsoleOutput output={"Input: 2. Expected output: 3. Your output: 5.\n2 test cases are hidden"}/>
        </div>
    </div>
}
export default QuestionPanel;