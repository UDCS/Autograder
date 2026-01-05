// import { Student } from "../../models/classroom";
import "../css/StudentPanel.css";
import SelectDropdown from "../../components/select-dropdown/SelectDropdown";
import RedButton from "../../components/buttons/RedButton.tsx";
import { Role } from "../../models/users.ts";
import BlueButton from "../../components/buttons/BlueButton.tsx";
import { useEffect, useState } from "react";
import clsx from "clsx";
import TitleInput from "../../components/title-input/TitleInput.tsx";
import { isValidEmail } from "../../utils/util.ts";

type UserState = "uninvited" | "unregistered" | "registered";

export type UserInClassroom = {
    firstName?: string;
    lastName?: string;
    email: string;
    role?: Role;
    state: UserState;
    wasChange?: boolean;
    dummyId?: string;
    accountError?: string;
}

interface StudentPanelProps {
    user: UserInClassroom;
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

function StudentPanel({user, onDelete, listIndex, setStudentList, onChange, studentList}: StudentPanelProps) {

    const {firstName, lastName, email, role, state, accountError, wasChange} = user;

    const uninvited = state === "uninvited";
    const unregistered = state === "unregistered";
    const registered = state === "registered";

    const [initialRole, setInitialRole]= useState(role);

    const [confirmHidden, setConfirmHidden] = useState(true);
    
    const [currentRole, setCurrentRole] = useState(role);

    const [currentEmail, setCurrentEmail] = useState<string>(email ?? "");

    const [error, setError] = useState("");

    const setWasChange = (newOnChange: boolean) => {
        setStudentList(studentList.map((student, index) => {
            if (index == listIndex) {
                const {wasChange, ...rest} = student;
                return {wasChange: newOnChange, ...rest};
            }
            return student;
        }))
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
                setStudentList(studentList.map((student: UserInClassroom, index: number) => {
                    if (index == listIndex) return {...student, email: currentEmail, state: "unregistered", wasChange: false};
                    return student;
                }));
                setConfirmHidden(true);
                // .. update the database
            } else {
                if (!isValidEmail(user.email)) {
                    setError("Invalid email address")   
                } else {
                    setError("Email already in classroom")
                }
            }
        } else {
            setConfirmHidden(true);
            // ... update the database
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
                    {registered && firstName} {registered && lastName} {unregistered && <span style={{fontStyle: "italic"}}>Waiting for student to accept invitation...</span>}
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
                                const {role, wasChange, ...rest} = student;
                                return {role: asRole, wasChange: newWasChange, ...rest};
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
