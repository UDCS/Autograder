import { useEffect, useReducer, useState } from "react";
import { Assignment, Classroom, Question } from "../../models/classroom";
import { createBlankAssignment } from "../../utils/classroom";
import AssignmentEditor from "../components/AssignmentEditor";
import "../css/AssignmentsSubpage.css"
import DarkBlueButton from "../../components/buttons/DarkBlueButton";
import DeletePopup from "../../components/popup/DeletePopup";
import { deleteAssignmentFromDatabase } from "../../utils/db";
import { showToast } from "../../components/toast/toastBus";

interface AssignmentsSubpageProps {
    classroomInfo: Classroom;
    active: boolean;
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

export const assignmentStore: Record<string, Assignment> = {};

function AssignmentsSubpage({classroomInfo, active}: AssignmentsSubpageProps) {
    const [, forceUpdate] = useReducer(x => x + 1, 0);

    const [loading, setLoading] = useState<boolean>(true);

    // Ctrl+S (Cmd+S on Mac) saves every assignment in the classroom while this
    // subpage is the active tab.
    useEffect(() => {
        if (!active) return;
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
                e.preventDefault();
                const all = Object.values(assignmentStore) as Assignment[];
                if (all.length === 0) return;
                saveAssignments(all)
                    .then(() => showToast("Successfully saved", "success"))
                    .catch(err => {
                        console.error("Failed to save assignments:", err);
                        showToast("Something went wrong while saving", "error");
                    });
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [active]);

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

    const sortedAssignments = (): Assignment[] =>
        (Object.values(assignmentStore) as Assignment[])
            .sort((a, b) => (a.sort_index ?? 0) - (b.sort_index ?? 0));

    // Move an assignment up (-1) or down (+1), renumber sort_index contiguously,
    // and persist immediately.
    const moveAssignment = (assignmentId: string, direction: -1 | 1) => {
        const sorted = sortedAssignments();
        const idx = sorted.findIndex(a => a.id === assignmentId);
        const target = idx + direction;
        if (idx < 0 || target < 0 || target >= sorted.length) return;
        [sorted[idx], sorted[target]] = [sorted[target], sorted[idx]];
        sorted.forEach((a, i) => { a.sort_index = i; });
        forceUpdate();
        saveAssignments(sorted)
            .then(() => showToast("Successfully saved", "success"))
            .catch(err => {
                console.error("Failed to save assignment order:", err);
                showToast("Something went wrong while saving", "error");
            });
    }

    const assignmentsToComponents = () => {
        const assignmentList = sortedAssignments();
        if (!assignmentList) return [];
        return assignmentList.map((a, i) => {
            return <AssignmentEditor key={a.id!} onDelete={() => makeDeletePopup(a.id!)} assignmentId={a.id!}
                onMoveUp={() => moveAssignment(a.id!, -1)}
                onMoveDown={() => moveAssignment(a.id!, 1)}
                isFirst={i === 0}
                isLast={i === assignmentList.length - 1} />
        });
    }

    const createNewAssignment = () => {
        const newAssignment = createBlankAssignment(classroomInfo.id!);
        newAssignment.sort_index = Object.values(assignmentStore).length;
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