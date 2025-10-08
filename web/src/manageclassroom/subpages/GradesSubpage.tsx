import { Classroom } from "../../models/classroom";
import "../css/GradesSubpage.css"

interface GradesSubpageProps {
    classroomInfo: Classroom;
}

function GradesSubpage({classroomInfo}: GradesSubpageProps) {
    return (
        <>
            <p>Grades</p>
            <input />
            <br />
            {JSON.stringify(classroomInfo)}
        </>
    );
}
export default GradesSubpage;