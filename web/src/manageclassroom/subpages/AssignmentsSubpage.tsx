import { useEffect, useReducer, useState } from "react";
import { Assignment, Classroom } from "../../models/classroom";
import { createBlankAssignment, parseDateString } from "../../utils/classroom";
import AssignmentEditor from "../components/AssignmentEditor";
import "../css/AssignmentsSubpage.css"
import DarkBlueButton from "../../components/buttons/DarkBlueButton";
import DeletePopup from "../../components/popup/DeletePopup";

interface AssignmentsSubpageProps {
    classroomInfo: Classroom;
}
const dummyAssignment: Assignment = {
    id: "59b2d1ba-79db-11f0-98e0-0a002700000e",
    classroom_id: "680eac37-79db-11f0-a571-0a002700000e",
    name: "Dummy Assignment",
    description: "This is a dummy assignment",
    assignment_mode: "view",
    due_at: parseDateString("2025-05-06"),
    created_at: parseDateString("2025-05-06"),
    updated_at: parseDateString("2025-05-06"),
    sort_index: 0,
    questions: [
        {
            id: "13dc07c4-79dc-11f0-bbed-0a002700000e",
            assignment_id: "59b2d1ba-79db-11f0-98e0-0a002700000e",
            header: "Test Question",
            body: "This is a test question",
            points: 15,
            sort_index: 0,
            default_code: "int a = 10;",
            solution_code: "int a = 13;",
            prog_lang: "java",
            test_cases: [
                {
                    id: "fa1374dc-723c-11f0-9cbf-0a0027000010",
                    name: "Test case 1",
                    timeoutSeconds: 10,
                    type: "text",
                    points: 10,
                    body: {
                        inputOutputs: [
                            {
                                id: "2a490af3-82bf-11f0-97bb-50ebf6d4b861",
                                inputs: "123",
                                outputs: "456",
                                hidden: true,
                            },
                            {
                                id: "309ff5f1-82bf-11f0-b8e8-50ebf6d4b861",
                                inputs: "456\n789",
                                outputs: "123\n456",
                                hidden: false,
                            }
                        ]
                    }
                },
                {
                    id: "d95841bd-723d-11f0-b933-0a0027000010",
                    name: "Test case 2",
                    timeoutSeconds: 15,
                    type: "bash",
                    points: 20,
                    body: {
                        primaryBashFile: {
                            id: "4db16122-7d5c-11f0-af3a-0a0027000010",
                            name: "test",
                            suffix: "sh",
                            body: "echo Hello, world!"
                        },
                        otherFiles: [
                            {
                                id: "4db16122-7d5c-11f0-af3a-0a0027000012",
                                name: "test",
                                suffix: "java",
                                body: `System.out.println("Hello, world!");`
                            },
                            {
                                id: "4db16122-7d5c-11f0-af3a-0a0027000040",
                                name: "test2",
                                suffix: "sh",
                                body: "echo Hello, world! (again)"
                            },
                        ]
                    }
                },
            ]
        }
    ]
}
const dummyAssignment2: Assignment = {
    id: "79b2d1ba-79db-11f0-98e0-0a002700000e",
    classroom_id: "680eac37-79db-11f0-a571-0a002700000e",
    name: "Dummy Assignment 2",
    description: "This is a dummy assignment 2",
    assignment_mode: "view",
    due_at: parseDateString("2025-05-06"),
    created_at: parseDateString("2025-05-06"),
    updated_at: parseDateString("2025-05-06"),
    sort_index: 0,
    questions: [
        {
            id: "12dc07c4-79dc-11f0-bbed-0a002700000e",
            assignment_id: "79b2d1ba-79db-11f0-98e0-0a002700000e",
            header: "Test Question 2",
            body: "This is a test question 2",
            points: 15,
            sort_index: 0,
            default_code: "int a = 10;",
            solution_code: "int a = 13;",
            prog_lang: "python",
            test_cases: [
                {
                    id: "fa1374dc-723c-11f0-9cbf-0a0027000010",
                    name: "Test case 1",
                    timeoutSeconds: 10,
                    type: "text",
                    points: 10,
                    body: {
                        inputOutputs: [
                            {
                                id: "93aa3ad7-82be-11f0-9d17-50ebf6d4b861",
                                inputs: "123",
                                outputs: "456",
                                hidden: true,
                            },
                            {
                                id: "b7619ac4-82be-11f0-909f-50ebf6d4b861",
                                inputs: "456\n789",
                                outputs: "123\n456",
                                hidden: false,
                            }
                        ]
                    }
                },
                {
                    id: "d95841bd-723d-11f0-b933-0a0027000010",
                    name: "Test case 2",
                    timeoutSeconds: 15,
                    type: "bash",
                    points: 20,
                    body: {
                        primaryBashFile: {
                            id: "4db16122-7d5c-11f0-af3a-0a0027000010",
                            name: "test",
                            suffix: "sh",
                            body: "echo Hello, world!"
                        },
                        otherFiles: [
                            {
                                id: "4db16122-7d5c-11f0-af3a-0a0027000012",
                                name: "test",
                                suffix: "java",
                                body: `System.out.println("Hello, world!");`
                            },
                            {
                                id: "4db16122-7d5c-11f0-af3a-0a0027000040",
                                name: "test2",
                                suffix: "sh",
                                body: "echo Hello, world! (again)"
                            },
                        ]
                    }
                },
            ]
        }
    ]
}
const dummyAssignmentList = [dummyAssignment, dummyAssignment2];
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
    }

    const getAssignments = async () => {
        const receivedAssignments = dummyAssignmentList;
        for (let assignment of receivedAssignments) {
            if (assignment.id) assignmentStore[assignment.id] = assignment;
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
    } 

    useEffect(() => {
        var isError = false;
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