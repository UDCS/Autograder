import { useEffect, useReducer, useState } from "react";
import { Assignment, Classroom, Question } from "../../models/classroom";
import { createBlankAssignment } from "../../utils/classroom";
import AssignmentEditor from "../components/AssignmentEditor";
import "../css/AssignmentsSubpage.css"
import DarkBlueButton from "../../components/buttons/DarkBlueButton";
import DeletePopup from "../../components/popup/DeletePopup";

interface AssignmentsSubpageProps {
    classroomInfo: Classroom;
}

export async function saveAssignments(assignmentList: Assignment[]) {
    if (!assignmentList) return;
    var classroomId = assignmentList[0].classroom_id;
    var response = await fetch(`/api/classroom/${classroomId}/verbose_assignments`, 
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({"assignments": assignmentList})
        }
    )
    if (!response.ok) {
        var errorText = await response.text();
        throw new Error(errorText);
    }
}

export async function saveQuestions(questionList: Question[]) {
    if (!questionList) return;
    var response = await fetch(`/api/classroom/verbose_questions`, 
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({"questions": questionList})
        }
    )
    if (!response.ok) {
        var errorText = await response.text();
        throw new Error(errorText);
    }
}

export async function deleteQuestionFromDatabase(questionId: string) {
    var response = await fetch(`/api/classroom/question/${questionId}`, 
        {
            method: "DELETE",
        }
    )
    if (!response.ok) {
        var errorText = await response.text();
        throw new Error(errorText);
    }
}

export async function deleteAssignmentFromDatabase(assignmentId: string) {
    var response = await fetch(`/api/classroom/assignment/${assignmentId}`, 
        {
            method: "DELETE",
        }
    )
    if (!response.ok) {
        var errorText = await response.text();
        throw new Error(errorText);
    }
}

export const assignmentStore: Record<string, Assignment> = {};

function AssignmentsSubpage({classroomInfo}: AssignmentsSubpageProps) {
    const [, forceUpdate] = useReducer(x => x + 1, 0);

    const [loading, setLoading] = useState<boolean>(true);

    const [deleteAssignmentPopup, setDeleteAssignmentPopup] = useState<boolean>(false);
    const [deleteAssignmentId, setDeleteAssignmentId] = useState<string>("");

    const makeDeletePopup = (assignmentId: string) => {
        if (Object.values(assignmentStore).length > 1) {
            setDeleteAssignmentPopup(true);
            setDeleteAssignmentId(assignmentId);
        }
    }

    const deleteAssignment = () => {
        delete assignmentStore[deleteAssignmentId];            
        setDeleteAssignmentPopup(false);
        setDeleteAssignmentId("");
        try {
            deleteAssignmentFromDatabase(deleteAssignmentId);
        } catch(err) {
            console.error("Failed to delete assignment", err);
        }
    }

    const assignmentsToComponents = () => {
        var assignmentList = Object.values(assignmentStore) as Assignment[];
        if (!assignmentList) return [];
        return assignmentList.map((a) => {
            return <AssignmentEditor key={a.id!} onDelete={() => makeDeletePopup(a.id!)} assignmentId={a.id!} />
        });
    }

    const createNewAssignment = () => {
        const newAssignment = createBlankAssignment(classroomInfo.id!);
        assignmentStore[newAssignment.id!] = newAssignment;
        forceUpdate();
        try {
            saveAssignments([newAssignment]);
        } catch (err) {
            console.error("failed to create new assignment: ", err)
        }
    } 

    useEffect(() => {
        var isError = false;

        const getAssignments = async () => {
            var response = await fetch(`/api/classroom/${classroomInfo.id!}/verbose_assignments`);
            var jsonResponse;
            if (response.ok) {
                jsonResponse = await response.json();
            } else {
                isError = true;
            }
            const receivedAssignments = jsonResponse["assignments"];
            for (let assignment of receivedAssignments) {
                if (assignment.id) assignmentStore[assignment.id] = assignment;
            }
        }
        (async function () {
            if (loading) {
                await getAssignments();
                if (isError) return;
                setLoading(false);
            }
        })();
    })
    
    return (
        <>
            {!loading &&
                <>
                    <div className="assignments-parent">
                        {...assignmentsToComponents()}
                        <DarkBlueButton onClick={createNewAssignment} className="new-assignment-button">+ Create New Assignment</DarkBlueButton>
                    </div>
                    {deleteAssignmentPopup && <DeletePopup onClose={() => setDeleteAssignmentPopup(false)} titleToDelete={assignmentStore[deleteAssignmentId].name!} onDelete={deleteAssignment}/>}
                </>
            }
        </>
    );
}
export default AssignmentsSubpage;