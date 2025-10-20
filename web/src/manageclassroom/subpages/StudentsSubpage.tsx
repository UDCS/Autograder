// import { Classroom } from "../../models/classroom";
import StudentPanel from "../components/StudentPanel"
import "../css/StudentsSubpage.css";

// interface StudentsSubpageProps {
//     classroomInfo: Classroom
// }

function StudentsSubpage(/*{classroomInfo}: StudentsSubpageProps*/) {
    return (
        <>
            <div className="info-section">
                {/* First and Last Name Element */}
                <div className="name-title">
                    <p id="first-name-title">First Name</p>
                    <p id="last-name-title">Last Name</p>
                </div>
                {/* Email Element */}
                <div className="email-title">
                    <p id="email-title">Email</p>
                </div>
                {/* Role Element */}
                <div className="role-title">
                    <p id="role-title">Role</p>
                </div>
            </div>
            <StudentPanel/>
        </>
    );
}
export default StudentsSubpage;