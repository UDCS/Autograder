import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import FileTabs from "./FileTabs";
import {BashTestCaseBody } from "../../models/testcases";
import { fileName, getLanguageFromSuffix } from "../../utils/editor";
import "../css/EditorWithTabs.css"

type EditorTabsProps = {
  body: BashTestCaseBody;
  fontSize?: number;
  setSelectedFilename: (newFilename: string) => void;
}

export default function EditorWithTabs({body, fontSize: fS, setSelectedFilename}: EditorTabsProps) {
  const files = (body.otherFiles ?? []).concat(body.primaryBashFile).sort((a, b) => a.id > b.id ? -1 : 1);

  const [activeFileId, setActiveFileId] = useState(files[0].id);

  const [fontSize, setFontSize] = useState(fS);

  const activeFile = files.find((f) => f.id === activeFileId) ?? files[0];

  const updateFileValue = (value: string | undefined) => {
    const newFiles = files.map((f) =>
      f.id === activeFileId ? { ...f, body: value ?? "" } : f
    )
    const primaryBashFile = newFiles.find((f) => f.id === body.primaryBashFile.id)!;
    const otherFiles = newFiles.filter((f) => f.id !== primaryBashFile.id);
    body.primaryBashFile = primaryBashFile;
    body.otherFiles = otherFiles;
  };

  const changeActiveFileId = (newFileId: string) => {
    setActiveFileId(newFileId);
    setSelectedFilename(fileName(files.find((f) => f.id === newFileId)!));
  }

  useEffect(() => {
    if (fS !== fontSize) setFontSize(fS);
  }, [fS])

  useEffect(() => {
    if (!activeFileId) changeActiveFileId(files[0].id);
  })

  return (
    <div className="editor-with-tabs">
      <FileTabs
        files={files}
        activeFileId={activeFile.id}
        onSelect={changeActiveFileId}
      />
      <div className="tab-editor-parent">
        {files && 
          <Editor
            language={getLanguageFromSuffix(activeFile.suffix)}
            value={activeFile.body}
            onChange={updateFileValue}
            options={{
              minimap: { enabled: false },
              fontSize: fontSize,
            }}
          />
        }
      </div>
    </div>
  );
}
