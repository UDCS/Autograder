import "../css/StudentPanel.css";
import SelectDropdown from "../../components/select-dropdown/SelectDropdown";
import RedButton from "../../components/buttons/RedButton.tsx";
import { Role } from "../../models/users.ts";
import BlueButton from "../../components/buttons/BlueButton.tsx";
import { useEffect, useState } from "react";
import clsx from "clsx";
import TitleInput from "../../components/title-input/TitleInput.tsx";
import { isValidEmail } from "../../utils/util.ts";
import { editStudentsInClassroom } from "../subpages/StudentsSubpage.tsx";

type UserState = "uninvited" | "unregistered" | "registered";

export type UserInClassroom = {
    first_name?: string;
    last_name?: string;
    email: string;
    user_role?: Role;
    state: UserState;
    wasChange?: boolean;
    user_id?: string;
    classroom_id?: string;
    accountError?: string;
}

interface StudentPanelProps {
    user: UserInClassroom;
    classroomId: string;
    listIndex: number;
    setStudentList: (studentList: UserInClassroom[]) => void;
    studentList: UserInClassroom[];
    onDelete: () => void;
    onChange: (newStudentList: UserInClassroom[]) => void;
}

export const isValidNewUser = (user: UserInClassroom, userList: UserInClassroom[]) => {
    const {email} = user;
    if (!isValidEmail(email)) return false;
    let emailCount = 0;
    for (let student of userList) {
        if (student.email === email) emailCount++;
    }
    return emailCount <= 1;
}

function StudentPanel({user, classroomId, onDelete, listIndex, setStudentList, onChange, studentList}: StudentPanelProps) {

    const {first_name, last_name, email, user_role: role, state, accountError, wasChange} = user;

    const uninvited = state === "uninvited";
    const unregistered = state === "unregistered";
    const registered = state === "registered";

    const [initialRole, setInitialRole]= useState(role);

    const [confirmHidden, setConfirmHidden] = useState(true);
    
    const [currentRole, setCurrentRole] = useState(role);

    const [currentEmail, setCurrentEmail] = useState<string>(email ?? "");

    const [error, setError] = useState("");

    const setWasChange = (newOnChange: boolean) => {
        const newStudentList = studentList.map((student, index) => {
            if (index == listIndex) {
                const {wasChange, ...rest} = student;
                return {wasChange: newOnChange, ...rest};
            }
            return student;
        });
        setStudentList(newStudentList);
        onChange(newStudentList);
        return newStudentList;
    }

    const alterEmailInList = (newEmail: string) => {
        setCurrentEmail(newEmail);
        let newStudents = studentList.map((student: UserInClassroom, index: number) => {
            const {email, ...withoutEmail} = student;
            if (index == listIndex) return {email: newEmail, ...withoutEmail};
            return student;
        })
        setStudentList(newStudents);
        onChange(newStudents);
    }

    const confirmChanges = () => {
        setInitialRole(currentRole);
        if (uninvited) {
            if (isValidNewUser(user, studentList)) {
                const newStudent = {...user, email: currentEmail, state: "unregistered", wasChange: false} as UserInClassroom;
                setStudentList(studentList.map((student: UserInClassroom, index: number) => {
                    if (index == listIndex) return newStudent;
                    return student;
                }));
                setConfirmHidden(true);
                editStudentsInClassroom(classroomId, [newStudent], studentList, setStudentList);
            } else {
                if (!isValidEmail(user.email)) {
                    setError("Invalid email address")   
                } else {
                    setError("Email already in classroom")
                }
            }
        } else {
            setConfirmHidden(true);
            setWasChange(false);
            editStudentsInClassroom(classroomId, [user], studentList, setStudentList);
        }
    }

    useEffect(() => {
        if ((uninvited || wasChange) && confirmHidden) {
            setConfirmHidden(false);
        } else if (!wasChange) {
            setConfirmHidden(true);
        }
        if (accountError !== error) {
            setError(accountError!);
        }
    }, [user]);

    return (
        <>
            {/* Student Container */}
            <div className="student-container">
                {/* First and Last Name Element */}
                <div className="name row-cell">
                    {registered && first_name} {registered && last_name} {unregistered && <span style={{fontStyle: "italic"}}>Waiting for student to accept invitation...</span>}
                    {error !== "" && <span style={{color: "red"}}>{error}</span>}
                </div>
                {/* Email Element */}
                <div className="email row-cell">
                    {!uninvited ? email : <TitleInput onChange={alterEmailInList} value={currentEmail} placeholder="Enter Student's Email..." />}
                </div>
                {/* Role Element */}
                <div className="role row-cell">
                    <SelectDropdown options={['student', 'assistant']} value={currentRole} id="dropdown" onChange={(newRole: string) => {
                        const asRole = newRole as Role;
                        let newWasChange = true;
                        setCurrentRole(asRole);
                        if (asRole !== initialRole) {
                            setWasChange(true);
                            setConfirmHidden(false);
                        } else {
                            newWasChange = false;
                            setWasChange(false);    
                            setConfirmHidden(true);                
                        }
                        let newStudentList = studentList.map((student, index) => {
                            if (index == listIndex) {
                                const {user_role: role, wasChange, ...rest} = student;
                                return {user_role: asRole, wasChange: newWasChange, ...rest};
                            }
                            return student;
                        });
                        setStudentList(newStudentList);
                        onChange(newStudentList);
                    }}/>
                    
                </div>
                {/* Confirm/Delete Buttons */}
                <div className="row-cell" id="buttons-parent">
                    <BlueButton className={clsx("panel-button", confirmHidden && "hidden")} onClick={confirmChanges}>Confirm changes</BlueButton>
                    <RedButton className="panel-button" onClick={onDelete}>Remove Student</RedButton>
                </div>
            </div>
        </>
    );
}
export default StudentPanel;
