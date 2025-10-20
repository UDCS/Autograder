// import { Student } from "../../models/classroom";
import "../css/StudentPanel.css";
import SelectDropdown from "../../components/select-dropdown/SelectDropdown";
import RedButton from "../../components/buttons/RedButton.tsx";

// interface StudentsSubpageProps {
//     StudentInfo: Student
// }

function StudentPanel(/*{StudentInfo}: StudentsSubpageProps*/) {
    return (
        <>
            {/* Student Container */}
            <div className="student-container">
                {/* First and Last Name Element */}
                <div className="name">
                    <p id="first-name">First Name</p>
                    <p id="last-name">Last Name</p>
                </div>
                {/* Email Element */}
                <div className="email">
                    <p id="email">test@udallas.edu</p>
                </div>
                {/* Role Element */}
                <div className="role">
                    <SelectDropdown options={["Admin", "Teacher", "Student"]} value={"Role"} id="dropdown"/>
                </div>
                {/* Delete Element */}
                <div className="delete">
                    <RedButton id="remove-button">Remove Student</RedButton>
                </div>
            </div>
        </>
    );
}
export default StudentPanel;
