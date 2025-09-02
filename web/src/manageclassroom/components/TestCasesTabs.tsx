import { useState } from "react";
import "../css/TestCasesTabs.css"
import clsx from "clsx";
import { Editor } from "@monaco-editor/react";
import FontSizeInput from "../../components/font-size-input/FontSizeInput";
import BlueButton from "../../components/buttons/BlueButton";
import TestCasesEditor from "./TestCasesEditor";
import { Question } from "../../models/classroom";

type TabSelection = "default_code" | "solution" | "test_cases";
function TestCasesTabs({question}: {question: Question}) {
    const [selected, setSelected] = useState<TabSelection>("default_code");

    const [fontSize, setFontSize] = useState<number>();
    const handleDefaultCodeChange = (newDef?: string) => {
        question.default_code = newDef;
    } 
    const handleSolutionCodeChange = (newSol?: string) => {
        question.solution_code = newSol;
    }
    return (
        <div className="testcases-tabs">
            <div className="tabs">
                <div className={clsx("tab", selected == "default_code" && "selected")} onClick={() => setSelected("default_code")}>
                    Default Code
                </div>
                <div className={clsx("tab", selected == "solution" && "selected")} onClick={() => setSelected("solution")}>
                    Solution
                </div>
                <div className={clsx("tab", selected == "test_cases" && "selected")} onClick={() => setSelected("test_cases")}>
                    Test Cases
                </div>
                <div className="font-size">
                    <FontSizeInput defaultFontSize={fontSize} onChange={(newFontSize: number) => setFontSize(newFontSize)} />
                </div>
            </div>
            <div className="tabs-body">
                <div className={clsx(selected !== "default_code" && "hidden", "default-code", selected === "default_code" && "tab-body")}>
                    <div className="tabs-editor">
                        <Editor key={question.prog_lang} defaultLanguage={question.prog_lang!} options={{fontSize: fontSize}} value={question.default_code} onChange={handleDefaultCodeChange} />
                    </div>
                </div>
                <div className={clsx(selected !== "solution" && "hidden","solution", selected === "solution" && "tab-body")}>                    
                    <div className="tabs-editor">
                        <Editor key={question.prog_lang} defaultLanguage={question.prog_lang!} options={{fontSize: fontSize}} value={question.solution_code} onChange={handleSolutionCodeChange} />
                    </div>
                    <BlueButton className="run-tests-button">Run Tests on Solution</BlueButton>
                </div>
                <div className={clsx(selected !== "test_cases" && "hidden", "test-cases", selected === "test_cases" && "tab-body")}>
                    <TestCasesEditor question={question} fontSize={fontSize} />
                </div>
            </div>
        </div>
    );
}
export default TestCasesTabs;