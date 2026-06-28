import FontSizeInput from "../font-size-input/FontSizeInput";
import "./EditorHeader.css";

type EditorHeaderProps = {
    progLang?: string;
    fontSize: number;
    onFontSizeChange: (newFontSize: number) => void;
};

// The bar above a code editor: the question's programming language on the left,
// a font-size control on the right. Shared by the assignment page and the
// grades subpage.
function EditorHeader({ progLang, fontSize, onFontSizeChange }: EditorHeaderProps) {
    return (
        <div className="editor-header">
            <span className="prog-lang-label">Language: {progLang}</span>
            <FontSizeInput onChange={onFontSizeChange} defaultFontSize={fontSize} />
        </div>
    );
}

export default EditorHeader;
