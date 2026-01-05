// import { Classroom } from "../../models/classroom";
import { useState } from "react";
import StudentPanel, { isValidNewUser, UserInClassroom } from "../components/StudentPanel"
import "../css/StudentsSubpage.css";
import DeletePopup from "../../components/popup/DeletePopup";
import BlueButton from "../../components/buttons/BlueButton";
import { Classroom } from "../../models/classroom";
import { isValidEmail } from "../../utils/util";

interface StudentsSubpageProps {
    classroomInfo: Classroom;
}

function StudentsSubpage({classroomInfo}: StudentsSubpageProps) {

    const [deletePopup, setDeletePopup] = useState(false);
    const [studentIndexToDelete, setStudentIndexToDelete] = useState(-1);

    const [allUsers, setAllUsers] = useState<UserInClassroom[]>([{first_name: "Skibidi", last_name: "Toilet", email: "skibidi@toilet.gov", user_role: "student", user_id: crypto.randomUUID(), state: "registered"}, {first_name: "Adrain", last_name: "Panezic", email: "adrian@panezic.com", user_role: "assistant", state: "registered", user_id: crypto.randomUUID()}, {email: "bruh@rizz.gov", user_role: "student", user_id: crypto.randomUUID(), state: "unregistered"}]);

    const [wasChange, setWasChange] = useState<boolean>(false);

    const deleteUser = (index: number) => {
        setAllUsers(allUsers.filter((_, i: number) => index != i));
    }

    const checkWasChange = (newStudentList: UserInClassroom[]) => {
        let totChange = false;
        for (let student of newStudentList) {
            if (student.wasChange) {
                totChange = true;
                break;
            }
        }
        setWasChange(totChange);
    }

    const userToStudentPanels = (userList: UserInClassroom[]) => {
        return userList.map((user: UserInClassroom, index: number) => <StudentPanel user={user} onChange={checkWasChange} key={user.user_id} listIndex={index} setStudentList={setAllUsers} studentList={allUsers}  onDelete={() => {setDeletePopup(true); setStudentIndexToDelete(index);} } {...user}/>)
    } 

    const addNewUser = () => {
        setWasChange(true);
        setAllUsers([...allUsers, {email: "", user_role: "student", user_id: crypto.randomUUID(), wasChange: true, state: "uninvited"}]);
    }

    const inviteUser = (user: UserInClassroom) => {
        console.log(`inviting ${user}`)
    }

    const saveAllChanges = () => {
        setAllUsers(allUsers.map((user: UserInClassroom) => {
            if (user.state === "uninvited") {
                const {state, accountError, wasChange, ...rest} = user;
                if (isValidNewUser(user, allUsers)) {
                    inviteUser(user);
                    return {state: "unregistered", accountError: "", wasChange: false, ...rest};
                } else {
                    if (!isValidEmail(user.email)) {
                        return {state: "uninvited", wasChange: true, accountError: "Invalid email address", ...rest};
                    } else {
                        return {state: "uninvited", wasChange: true, accountError: "Email already in classroom", ...rest};
                    }
                }
            }
            const {wasChange, ...rest} = user;
            return {wasChange: false, ...rest};
        }));
    }

    return (
        <div className="students-list">
            <span style={{display: "none"}}>{JSON.stringify(classroomInfo)}</span>
            {...userToStudentPanels(allUsers)}
            <BlueButton onClick={addNewUser} className="add-student-button">+ Add Student</BlueButton>
            {wasChange && <BlueButton className="save-changes-button" onClick={() => {setWasChange(false); saveAllChanges();}}>Save All Changes</BlueButton>}
            {deletePopup && <DeletePopup 
            onClose={() => {setStudentIndexToDelete(-1); setDeletePopup(false);}} 
            onDelete={() => {deleteUser(studentIndexToDelete); setDeletePopup(false);}} 
            titleToDelete={allUsers[studentIndexToDelete].email}
            preTitle="Are you sure you want to remove "
            postTitle=" from the classroom?"/>}
        </div>
    );
}
export default StudentsSubpage;