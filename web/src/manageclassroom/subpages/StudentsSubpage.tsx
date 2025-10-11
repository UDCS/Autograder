import { Classroom } from "../../models/classroom";
// import StudentRepresentation from "";
// import StudentPanel from "../../"
import "../css/StudentsSubpage.css";

interface StudentsSubpageProps {
    classroomInfo: Classroom
}
function StudentsSubpage({classroomInfo}: StudentsSubpageProps) {
    return (
        <>
            <h3>Students</h3>
            <input />
            <br />
            {JSON.stringify(classroomInfo)}
        </>
    );
}
export default StudentsSubpage;