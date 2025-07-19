import { Classroom } from "../../models/classroom";
import "./DetailsSubpage.css"

interface DetailsSubpageProps {
    classroomInfo: Classroom;
}
function DetailsSubpage({classroomInfo}: DetailsSubpageProps) {
    return (
        <>
            <p>Details</p>
            <input />
            <br />
            {JSON.stringify(classroomInfo)}
        </>
    );
}
export default DetailsSubpage;