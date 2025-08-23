import { File } from "../../models/testcases";
import { fileName } from "../../utils/editor";
import "../css/FileTabs.css";

type FileTabsProps = {
  files: File[];
  activeFileId: string;
  onSelect: (id: string) => void;
};

export default function FileTabs({
  files,
  activeFileId,
  onSelect,
}: FileTabsProps) {
  return (
    <div className="file-tabs">
      {files.map((file) => (
        <div
          key={file.id}
          className={`file-tab ${file.id === activeFileId ? "active" : ""}`}
          onClick={() => onSelect(file.id)}
        >
          <span className="tab-name">{fileName(file)}</span>
        </div>
      ))}
    </div>
  );
}
