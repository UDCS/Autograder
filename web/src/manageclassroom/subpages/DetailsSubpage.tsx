import CalendarInput from "../../components/calendar-input/CalendarInput";
import { Classroom } from "../../models/classroom";
import "./css/DetailsSubpage.css"

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
            <br />
            <CalendarInput onChange={(newDate: string) => {console.log(newDate);}} />
        </>
    );
}
export default DetailsSubpage;