import { useState } from "react";
import "../css/TestCasesTabs.css"
import clsx from "clsx";
import { Editor } from "@monaco-editor/react";
import FontSizeInput from "../../components/font-size-input/FontSizeInput";
import BlueButton from "../../components/buttons/BlueButton";
import TestCasesEditor from "./TestCasesEditor";

function TestCasesTabs() {
    type TabSelection = "default_code" | "solution" | "test_cases";
    const [selected, setSelected] = useState<TabSelection>("default_code");

    const [fontSize, setFontSize] = useState<number>();
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
                        <Editor defaultLanguage="python" options={{fontSize: fontSize}} />
                    </div>
                </div>
                <div className={clsx(selected !== "solution" && "hidden","solution", selected === "solution" && "tab-body")}>                    
                    <div className="tabs-editor">
                        <Editor defaultLanguage="python" options={{fontSize: fontSize}} />
                    </div>
                    <BlueButton className="run-tests-button">Run Tests on Solution</BlueButton>
                </div>
                <div className={clsx(selected !== "test_cases" && "hidden", "test-cases", selected === "test_cases" && "tab-body")}>
                    <TestCasesEditor />
                </div>
            </div>
        </div>
    );
}
export default TestCasesTabs;