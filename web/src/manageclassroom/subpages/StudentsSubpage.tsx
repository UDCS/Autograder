import { Classroom } from "../../models/classroom";
import "./StudentsSubpage.css"

interface StudentsSubpageProps {
    classroomInfo: Classroom
}
function StudentsSubpage({classroomInfo}: StudentsSubpageProps) {
    return (
        <>
            <p>Students</p>
            <input />
            <br />
            {JSON.stringify(classroomInfo)}
        </>
    );
}
export default StudentsSubpage;