import React from "react";
import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  language?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language = "python",
}) => {
  return (
    <div style={{ height: "500px" }}>
      <Editor
        height="100%"
        defaultLanguage={language}
        value={value}
        onChange={(newValue) => {
          if (onChange && newValue !== undefined) {
            onChange(newValue);
          }
        }}
        options={{
          fontSize: 18,
          minimap: { enabled: false },
          automaticLayout: true,
        }}
      />
    </div>
  );
};

export default CodeEditor;
