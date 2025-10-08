import { useState } from "react";
import "../css/ClassroomSidebar.css"

export type ClassroomSidebarSelected = "details" | "students" | "assignments" | "grades";

interface ClassroomSidebarProps {
    onChange?: (newState: ClassroomSidebarSelected) => void;
}

function ClassroomSidebar({onChange = (_: ClassroomSidebarSelected) => {}}: ClassroomSidebarProps) {
    
    const [selected, setSelected] = useState<ClassroomSidebarSelected>("details");

    const onClick = (state: ClassroomSidebarSelected) => () => {if (selected !== state) {setSelected(state); onChange(state);}}
    
    return (
        <div className="sidebar">
            <div className={`sidebarItem${selected=="details" ? " selected" : ""}`} onClick={onClick("details")}>
                Details
            </div>
            <div className={`sidebarItem${selected=="students" ? " selected" : ""}`} onClick={onClick("students")}>
                Students
            </div>
            <div className={`sidebarItem${selected=="assignments" ? " selected" : ""}`} onClick={onClick("assignments")}>
                Assignments
            </div>
            <div className={`sidebarItem${selected=="grades" ? " selected" : ""}`} onClick={onClick("grades")}>
                Grades
            </div>
        </div>
    );
}
export default ClassroomSidebar;