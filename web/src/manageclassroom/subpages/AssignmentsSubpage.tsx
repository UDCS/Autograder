import { Classroom } from "../../models/classroom";
import "./css/AssignmentsSubpage.css"

interface AssignmentsSubpageProps {
    classroomInfo: Classroom;
}
function AssignmentsSubpage({classroomInfo}: AssignmentsSubpageProps) {

    return (
        <>
            <p>Assignments</p>
            <input />
            <br />
            {JSON.stringify(classroomInfo)}
        </>
    );
}
export default AssignmentsSubpage;