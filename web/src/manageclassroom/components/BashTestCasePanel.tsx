import DarkBlueButton from "../../components/buttons/DarkBlueButton";
import TextField, { TextFieldInput } from "../../components/textfield/Textfield";
import TitleInput from "../../components/title-input/TitleInput";
import "../css/TextTestCasePanel.css"
import "../css/BashTestCasePanel.css"
import EditorWithTabs from "./EditorWithTabs";
import { BashTestCaseBody, TestCase } from "../../models/testcases";
import SelectDropdown from "../../components/select-dropdown/SelectDropdown";
import { fileName } from "../../utils/editor";
import { useEffect, useState } from "react";
import NewFilePopup from "../../components/popup/NewFilePopup";
import RenameFilePopup from "../../components/popup/RenameFilePopup";
import DeleteFilePopup from "../../components/popup/DeleteFilePopup";

function BashTestCasePanel({testCaseInfo, fontSize}: {testCaseInfo: TestCase} & {fontSize?: number}) {
    const body = testCaseInfo.body as BashTestCaseBody;

    const files = (body.otherFiles ?? []).concat(body.primaryBashFile).sort((a, b) => a.id > b.id ? -1 : 1);
    
    const [primaryBash, setPrimaryBash] = useState(fileName(body.primaryBashFile));

    const [createFilePopup, setCreateFilePopup] = useState(false);
    const [renameFilePopup, setRenameFilePopup] = useState(false);
    const [deleteFilePopup, setDeleteFilePopup] = useState(false);

    const [selectedTab, setSelectedTab] = useState<string>(fileName(files[0]))

    const getFileNames = () => {
        return (body.otherFiles ?? []).concat(body.primaryBashFile).sort((a, b) => a.id > b.id ? -1 : 1).map((file) => fileName(file));
    }

    const handleTitleChange = (newTitle: string) => {
        testCaseInfo.name = newTitle;
    }
    
    const handlePointsChange = ({value}: TextFieldInput) => {
        testCaseInfo.points = Number(value);
    }

    const handleTimeoutChange = ({value}: TextFieldInput) => {
        testCaseInfo.timeoutSeconds = Number(value);
    }

    const handlePrimaryBashChange = (newPrimaryBash: string) => {
        if (newPrimaryBash !== fileName(body.primaryBashFile)) {
            var allFiles = (body.otherFiles ?? []).concat(body.primaryBashFile).sort((a, b) => a.id > b.id ? -1 : 1);
            body.primaryBashFile = allFiles.find((file) => fileName(file) === newPrimaryBash)!;
            body.otherFiles = allFiles.filter((file) => fileName(file) !== newPrimaryBash);
            setPrimaryBash(fileName(body.primaryBashFile))
        }
    }

    const changeSelectedTab = (tab: string) => {
        setSelectedTab(tab);
    }

    useEffect(() => {
        if (!files.map((f) => fileName(f)).find((fN) => fN === selectedTab)) {
            setSelectedTab(fileName(files[0]));
        }
    })

    return (
        <div className="test-case-panel">
            <div className="title-run-test">
                <div className="test-case-title-parent">
                    <TitleInput className="test-case-title" value={testCaseInfo.name} onChange={handleTitleChange} />
                </div>
                <div className="test-case-run-parent">
                    <DarkBlueButton className="run-test-button">Run Test on Solution</DarkBlueButton>
                </div>
            </div>
            <div className="points-timeout">
                <TextField className="test-case-textfield" value={testCaseInfo.points} type="number" label="Points" initialValue="Points for this test case" onChange={handlePointsChange}/>
                <TextField className="test-case-textfield" value={testCaseInfo.timeoutSeconds} type="number" label="Timeout seconds" initialValue="Timeout seconds" onChange={handleTimeoutChange}/>
            </div>
            <div className="primary-bash">
                <div className="testcase-label">
                    Primary Bash File:
                </div>
                <div className="primary-bash-parent">
                    <SelectDropdown value={primaryBash} options={getFileNames()} onChange={handlePrimaryBashChange}/>
                </div>
            </div>
            <div className="file-buttons">
                <button className="file-icon-button delete-file-button" onClick={() => {if (selectedTab !== fileName(body.primaryBashFile)) setDeleteFilePopup(true)}}></button>
                <button className="file-icon-button edit-file-button" onClick={() => setRenameFilePopup(true)}></button>
                <button className="file-icon-button" onClick={() => setCreateFilePopup(true)}>+</button>
            </div>
            <EditorWithTabs setSelectedFilename={changeSelectedTab} fontSize={fontSize} body={body} />
            {createFilePopup && <NewFilePopup onClose={() => setCreateFilePopup(false)} body={body} />}
            {renameFilePopup && <RenameFilePopup oldFileName={selectedTab} onClose={() => setRenameFilePopup(false)} body={body}/>}
            {deleteFilePopup && <DeleteFilePopup fileToDelete={selectedTab} onClose={() => setDeleteFilePopup(false)} body={body}/>} 
        </div>
        
    );
}
export default BashTestCasePanel;