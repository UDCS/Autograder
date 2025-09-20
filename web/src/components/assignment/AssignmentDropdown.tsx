import { useState } from "react";
import "./AssignmentDropdown.css"

interface AssignmentDropdownProps {
    name: string;
    children: React.ReactNode;
    id: string;
}

function AssignmentDropdown({name, children, id}: AssignmentDropdownProps) {
    const [selected, setSelected] = useState(false);
    const triangle = () => {
        return selected ? "▲" : "▼"; 
    }
    return (
        <div className="assignmentDropdown">
            <div className="revealButton" onClick={() => setSelected(!selected)}>
                {name} {triangle()}
                <a href={`/assignment?id=${id}`}>
                    <button onClick={(e: React.MouseEvent) => {e.stopPropagation()}} className="openAssignment">Open Assignment</button>
                </a>
            </div>
            {selected? 
                <div className="assignmentBody">
                    
                    {children}
                </div>
            :<></>}
        </div>
    );
}
export default AssignmentDropdown;