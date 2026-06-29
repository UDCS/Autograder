import { useEffect, useState } from "react";
import StudentPanel, { isValidNewUser, UserInClassroom } from "../components/StudentPanel"
import "../css/StudentsSubpage.css";
import DeletePopup from "../../components/popup/DeletePopup";
import BlueButton from "../../components/buttons/BlueButton";
import { Classroom } from "../../models/classroom";
import { isValidEmail } from "../../utils/util";

interface StudentsSubpageProps {
    classroomInfo: Classroom;
}

export const editStudentsInClassroom = (classroomId: string, usersToUpdate: UserInClassroom[], oldStudentList: UserInClassroom[], setStudentList: (newList: UserInClassroom[]) => void) => {
    const requestBody = {students: usersToUpdate};
    (async function () {
        var response = await fetch(`/api/classroom/${classroomId}/students`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });
        if (!response.ok) {
            console.log(response);
        } else {
            var updatedStudents = await response.json();
            const newStudentList = oldStudentList.map((student: UserInClassroom) => {
                for (let updatedStudent of updatedStudents) {
                    if (updatedStudent.email === student.email) return updatedStudent as UserInClassroom;
                }
                return student;
            });
            setStudentList(newStudentList);
        }
    })();
}

function StudentsSubpage({classroomInfo}: StudentsSubpageProps) {
    
    const classroomId = classroomInfo.id!;

    const [loading, setLoading] = useState(true);
    const [deletePopup, setDeletePopup] = useState(false);
    const [studentIndexToDelete, setStudentIndexToDelete] = useState(-1);

    const [allUsers, setAllUsers] = useState<UserInClassroom[]>([]);

    const [wasChange, setWasChange] = useState<boolean>(false);

    const deleteUser = (index: number) => {
        const toDelete = allUsers[index];
        setAllUsers(allUsers.filter((_, i: number) => index != i));
        (async function () {
            const requestBody = {email: toDelete.email!};
            var response = await fetch(`/api/classroom/${classroomId}/student`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestBody)
            });
            if (!response.ok) {
                console.log(response);
            }
        })();
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
        return userList.map((user: UserInClassroom, index: number) => <StudentPanel classroomId={classroomId} user={user} onChange={checkWasChange} key={user.user_id} listIndex={index} setStudentList={setAllUsers} studentList={allUsers}  onDelete={() => {setDeletePopup(true); setStudentIndexToDelete(index);} } {...user}/>)
    } 

    const addNewUser = () => {
        setWasChange(true);
        setAllUsers([...allUsers, {email: "", user_role: "student", user_id: crypto.randomUUID(), wasChange: true, state: "uninvited"}]);
    }

    const saveAllChanges = () => {
        let userChanges: UserInClassroom[] = allUsers.filter((user: UserInClassroom) => user.wasChange && isValidNewUser(user, allUsers) && isValidEmail(user.email));
        let newUsers: UserInClassroom[] = allUsers.map((user: UserInClassroom) => {
            if (user.state === "uninvited") {
                const {state, accountError, wasChange, ...rest} = user;
                if (isValidNewUser(user, allUsers)) {
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
        })
        setAllUsers(newUsers);
        editStudentsInClassroom(classroomId, userChanges, allUsers, setAllUsers);
    }

    useEffect(() => {
        const stopLoading = () => {
            setLoading(false);
        }
        const getAllUsers = async () => {
            var response = await fetch(`/api/classroom/${classroomId}/students`);   
            if (response.ok) {
                var json = await response.json();
                setAllUsers(json);
            }
        }
        (async function () {
            if (loading) {
                await getAllUsers();
                stopLoading()
            }
        })();
    });

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