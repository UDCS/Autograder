import { Classroom } from "../../models/classroom";
import AssignmentEditor from "../components/AssignmentEditor";
import "../css/AssignmentsSubpage.css"

interface AssignmentsSubpageProps {
    classroomInfo: Classroom;
}
function AssignmentsSubpage({classroomInfo}: AssignmentsSubpageProps) {

    return (
        <>
            <div className="assignments-parent">
                <AssignmentEditor  />
                <AssignmentEditor  />
            </div>
            {JSON.stringify(classroomInfo)}
        </>
    );
}
export default AssignmentsSubpage;