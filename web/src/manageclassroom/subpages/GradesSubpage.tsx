import { useState } from "react";
import { Classroom } from "../../models/classroom";
import GradeSwitcher, { GradeSection } from "../components/GradeSwitcher";
import "../css/GradesSubpage.css"
import AssignmentsGrades from "../components/AssignmentsGrades";
import StudentGrades from "../components/StudentGrades";

interface GradesSubpageProps {
    classroomInfo: Classroom;
}

function GradesSubpage({classroomInfo}: GradesSubpageProps) {
    const [currentSection, setCurrentSection] = useState<GradeSection>('assignments');
    return (
        <div id="grades-subpage">
            <GradeSwitcher onChange={(newSection: GradeSection) => {setCurrentSection(newSection)}}/>
            <div id="show-grades-parent">
                <h2 id="show-grades-title">Show Grades:</h2>
                <input type='checkbox' id="show-grades-checkbox" />
            </div>
            {currentSection === 'assignments' && <AssignmentsGrades />}
            {currentSection === 'students' && <StudentGrades />}
            <br />
            {JSON.stringify(classroomInfo)}
        </div>
    );
}
export default GradesSubpage;