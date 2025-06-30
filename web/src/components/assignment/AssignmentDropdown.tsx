import { useState } from "react";
import "./AssignmentDropdown.css"

interface AssignmentDropdownProps {
    name: string;
}

function AssignmentDropdown({name}: AssignmentDropdownProps) {
    const [selected, setSelected] = useState(false);
    const triangle = () => {
        return selected ? "▲" : "▼"; 
    }
    return (
        <div className="assignmentDropdown">
            <div className="revealButton" onClick={() => setSelected(!selected)}>
                {name} {triangle()}
                <button onClick={(e: React.MouseEvent) => {e.stopPropagation()}} className="openAssignment">Open Assignment</button>
            </div>
            {selected? 
                <div className="assignmentBody">
                    This is an assignment
                </div>
            :<></>}
        </div>
    );
}
export default AssignmentDropdown;