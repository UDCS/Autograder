import React from "react";
import Editor from "@monaco-editor/react";
import { registerRacket } from "./racketLanguage";

interface CodeEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  language?: string;
  fontSize?: number;
  editable?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language = "python",
  fontSize=18,
  editable=true
}) => {
  return (
    <div style={{ height: "500px" }}>
      <Editor
        height="100%"
        beforeMount={registerRacket}
        defaultLanguage={language}
        value={value}
        onChange={(newValue) => {
          if (onChange && newValue !== undefined) {
            onChange(newValue);
          }
        }}
        options={{
          fontSize: fontSize,
          minimap: { enabled: false },
          automaticLayout: true,
          readOnly: !editable
        }}
      />
    </div>
  );
};

export default CodeEditor;
