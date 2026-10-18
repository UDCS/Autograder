import { useEffect, useState } from "react";
import fetchWithAuth from '../utils/fetcher';
import AssignmentDropdown from "../components/assignment/AssignmentDropdown";
import QuestionBulletPoint, { CompletionState } from "../components/question/QuestionBulletPoint";
import HomeworkAssignment from "../components/homework/HomeworkAssignment";
import HomeworkSidebar from "../components/homework/HomeworkSidebar";
import Navbar from "../components/navbar/Navbar";
import TitleBanner from "../components/titlebanner/TitleBanner";
import BlueButton from "../components/buttons/BlueButton";
import { parseDateString } from "../utils/classroom";

function ClassroomBody() {
    
    const msInTwoWeeks = 2 * 7 * 24 * 60 * 60 * 1000;

    const [errorMsg, setErrorMsg] = useState("");

    const [loading, setLoading] = useState(true);
    const [classroomName, setClassroomName] = useState("");
    const [assignments, setAssignments] = useState([]);
    const [canEditClassroom, setCanEditClassroom] = useState(false);
    const urlParams = new URLSearchParams(window.location.search);
    const classroomId = urlParams.get('id');

    const questionsJSONToReact = (questions: any[], assignmentId: string) => {
        if (questions) {
            return questions.map((q) => {
                const points = q["points"];
                const score = q["score"];
                const name = q["header"];
                const questionId = q["id"];
                var state: CompletionState = "none";
                if (score >= points) {
                    state = "full";
                } else if (score > 0) {
                    state = "partial";
                }
                return <QuestionBulletPoint completionState={state} questionId={questionId} assignmentId={assignmentId}>
                    {name}
                </QuestionBulletPoint>
            });
        }
        return [];
    }

    const assignmentsJSONToReact = () => {
        if (!assignments) return [];
        return assignments.map((a) => {
            return <AssignmentDropdown id={a['id']} name={a['name']}>
                {...questionsJSONToReact(a["questions"], a["id"])}
            </AssignmentDropdown>
        });
    }

    const homeworkFromJSON = () => {
        if (!assignments) return [];
        return assignments.filter((a) => {
            var dueDate = parseDateString(a["due_at"]);
            var now = new Date();
            var timeDifference = dueDate.getTime() - now.getTime();
            return timeDifference <= msInTwoWeeks;
        }).map(a =>
            <HomeworkAssignment name={a['name']} dueDate={parseDateString(a["due_at"])} assignmentId={a['id']} />
        )
    }

    const reRoute = () => {
        window.location.href = `/classroom/manage/?id=${classroomId}`;
    }

    useEffect(() => {
        const controller = new AbortController();

        const loadClassroom = async () => {
            try {
                const requestInit = { signal: controller.signal };
                const loginResponse = await fetchWithAuth('/api/auth/valid_login', requestInit);
                const loginJson = loginResponse.ok ? await loginResponse.json() : null;
                if (!loginResponse.ok || loginJson?.message !== 'true') {
                    setErrorMsg("You need to be logged in to view classrooms");
                    return;
                }

                const [classroomResponse, assignmentsResponse, roleResponse] = await Promise.all([
                    fetchWithAuth(`/api/classroom/${classroomId}`, requestInit),
                    fetchWithAuth(`/api/classroom/${classroomId}/view_assignments`, requestInit),
                    fetchWithAuth(`/api/classroom/role/${classroomId}`, requestInit),
                ]);

                if (!classroomResponse.ok) {
                    setErrorMsg("Either the classroom does not exist or you are not part of this classroom");
                    return;
                }
                if (!assignmentsResponse.ok) {
                    throw new Error(`Failed to load assignments: ${assignmentsResponse.statusText}`);
                }

                const [classroomJson, assignmentsJson, role] = await Promise.all([
                    classroomResponse.json(),
                    assignmentsResponse.json(),
                    roleResponse.ok ? roleResponse.json() : Promise.resolve(null),
                ]);

                setClassroomName(classroomJson["name"]);
                setAssignments(assignmentsJson["assignments"]);
                setCanEditClassroom(role === "instructor" || role === "admin");
            } catch (err) {
                if (err instanceof DOMException && err.name === "AbortError") return;
                console.error("Fetch error: ", err);
                setErrorMsg("Something went wrong while loading the classroom");
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };

        void loadClassroom();
        return () => controller.abort();
    }, [classroomId]);

    return (<>
        {!loading?
            <>
                <Navbar />
                {(errorMsg == "")?
                    <>
                        <TitleBanner>{classroomName}</TitleBanner>
                        <div id='classroomBody'>
                            <div id="assignments">
                                {...assignmentsJSONToReact()}
                            </div>
                            <div id="sidebar">
                                {canEditClassroom &&
                                    <div id="manage_button">
                                        <BlueButton onClick={reRoute}>
                                            Manage Classroom
                                        </BlueButton>
                                    </div>
                                }
                                <div id="homework">
                                    <HomeworkSidebar>
                                        {...homeworkFromJSON()}
                                    </HomeworkSidebar>
                                </div>
                            </div>
                        </div>
                    </>
                :<div className="errorMsg">{errorMsg}</div>}
            </>
        : <></>}
    </>);
}

export default ClassroomBody;
