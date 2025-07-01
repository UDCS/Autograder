import { useEffect, useState } from "react";
import AssignmentDropdown from "../components/assignment/AssignmentDropdown";
import AssignmentQuestion, { CompletionState } from "../components/assignment/AssignmentQuestion";
import HomeworkAssignment from "../components/homework/HomeworkAssignment";
import HomeworkSidebar from "../components/homework/HomeworkSidebar";
import Navbar from "../components/navbar/Navbar";
import TitleBanner from "../components/titlebanner/TitleBanner";

function ClassroomBody() {
    
    const msInTwoWeeks = 2 * 7 * 24 * 60 * 60 * 1000;

    const [loading, setLoading] = useState(true);
    const [classroomName, setClassroomName] = useState("");
    const [assignments, setAssignments] = useState([]);
    const urlParams = new URLSearchParams(window.location.search);
    const classroomId = urlParams.get('id');

    const questionsJSONToReact = (questions: any[]) => {
        if (questions != null) {
            return questions.map((q) => {
                const points = q["points"];
                const score = q["score"];
                const name = q["header"];
                var state: CompletionState = "none";
                if (score >= points) {
                    state = "full";
                } else if (score > 0) {
                    state = "partial";
                }
                return <AssignmentQuestion completionState={state}>
                    {name}
                </AssignmentQuestion>
            });
        }
        return [];
    }

    const assignmentsJSONToReact = () => {
        return assignments.map((a) => {
            return <AssignmentDropdown name={a['name']}>
                {...questionsJSONToReact(a["questions"])}
            </AssignmentDropdown>
        });
    }

    const homeworkFromJSON = () => {
        return assignments.filter((a) => {
            var dueDate = new Date(a["due_at"]);
            var now = new Date();
            var timeDifference = dueDate.getTime() - now.getTime();
            return timeDifference <= msInTwoWeeks; 
        }).map(a => 
            <HomeworkAssignment name={a['name']} dueDate={new Date(a["due_at"])} />
        )
    }

    useEffect(() => {
        const getClassroomName = async () => {
            var response = await fetch(`/api/classroom/${classroomId}`);
            if (response.ok) {
                var json = await response.json();
                setClassroomName(json["name"]);
            } else {
                console.error(response.statusText);
            }
        }
        const getAssignments = async () => {
            var response = await fetch(`/api/classroom/${classroomId}/view_assignments`);
            if (response.ok) {
                var json = await response.json();
                setAssignments(json['assignments']);
            } else {
                console.error(response.statusText);
            }
        };
        const stopLoading = () => {
            setLoading(false);
        }
        if (loading) {
            getClassroomName().then(getAssignments).then(stopLoading);
        } 
    });

    return (<>
        {!loading? 
            <>
                <Navbar />
                <TitleBanner>{classroomName}</TitleBanner>
                <div id='classroomBody'>
                    <div id="assignments">
                        {...assignmentsJSONToReact()}
                    </div>
                    <div id="homework">
                        <HomeworkSidebar>
                            {...homeworkFromJSON()}
                        </HomeworkSidebar>
                    </div>
                </div>
            </>
        : <></>}
    </>);
}

export default ClassroomBody;