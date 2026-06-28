import "../css/ReorderArrows.css";

type ReorderArrowsProps = {
    onMoveUp: () => void;
    onMoveDown: () => void;
    disableUp?: boolean;
    disableDown?: boolean;
};

// A vertical up/down control rendered at the top-left of a reorderable panel.
function ReorderArrows({ onMoveUp, onMoveDown, disableUp, disableDown }: ReorderArrowsProps) {
    return (
        <div className="reorder-arrows">
            <button className="reorder-arrow" onClick={onMoveUp} disabled={disableUp} aria-label="Move up">▲</button>
            <button className="reorder-arrow" onClick={onMoveDown} disabled={disableDown} aria-label="Move down">▼</button>
        </div>
    );
}

export default ReorderArrows;
