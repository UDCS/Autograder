import { useEffect, useState } from "react";
import AssignmentDropdown from "../components/assignment/AssignmentDropdown";
import QuestionBulletPoint, {
  CompletionState,
} from "../components/question/QuestionBulletPoint";
import HomeworkAssignment from "../components/homework/HomeworkAssignment";
import HomeworkSidebar from "../components/homework/HomeworkSidebar";
import Navbar from "../components/navbar/NavBar";
import TitleBanner from "../components/titlebanner/TitleBanner";
import "./Classroom.css";

function Classroom() {
  const msInTwoWeeks = 2 * 7 * 24 * 60 * 60 * 1000;

  const [errorMsg, setErrorMsg] = useState("");

  const [loading, setLoading] = useState(true);
  const [classroomName, setClassroomName] = useState("");
  const [assignments, setAssignments] = useState([]);
  const urlParams = new URLSearchParams(window.location.search);
  const classroomId = urlParams.get("id");

  const questionsJSONToReact = (questions: any[], assignmentId: string) => {
    if (questions) {
      return questions.map((q) => {
        const points = q["points"];
        const score = q["score"];
        const name = q["header"];
        const questionId = q["id"];
        let state: CompletionState = "none";
        if (score >= points) {
          state = "full";
        } else if (score > 0) {
          state = "partial";
        }
        return (
          <QuestionBulletPoint
            completionState={state}
            questionId={questionId}
            assignmentId={assignmentId}
          >
            {name}
          </QuestionBulletPoint>
        );
      });
    }
    return [];
  };

  const assignmentsJSONToReact = () => {
    if (!assignments) return [];
    return assignments.map((a) => {
      return (
        <AssignmentDropdown id={a["id"]} name={a["name"]}>
          {...questionsJSONToReact(a["questions"], a["id"])}
        </AssignmentDropdown>
      );
    });
  };

  const homeworkFromJSON = () => {
    if (!assignments) return [];
    return assignments
      .filter((a) => {
        const dueDate = new Date(a["due_at"]);
        const now = new Date();
        const timeDifference = dueDate.getTime() - now.getTime();
        return timeDifference <= msInTwoWeeks;
      })
      .map((a) => (
        <HomeworkAssignment
          name={a["name"]}
          dueDate={new Date(a["due_at"])}
          assignmentId={a["id"]}
        />
      ));
  };

  useEffect(() => {
    let isError = false;
    const verifyLogin = async () => {
      try {
        const response = await fetch("/api/auth/valid_login");
        if (response.ok) {
          const json = await response.json();
          if (json["message"] != "true") {
            isError = true;
            setErrorMsg("You need to be logged in to view classrooms");
            stopLoading();
          }
        } else {
          isError = true;
          setErrorMsg("You need to be logged in to view classrooms");
          stopLoading();
        }
      } catch (err) {
        console.error("Fetch error: ", err);
      }
    };
    const getClassroomName = async () => {
      const response = await fetch(`/api/classroom/${classroomId}`);
      if (response.ok) {
        const json = await response.json();
        setClassroomName(json["name"]);
      } else {
        isError = true;
        setErrorMsg(
          "Either the classroom does not exist or you are not part of this classroom"
        );
        stopLoading();
      }
    };
    const getAssignments = async () => {
      const response = await fetch(
        `/api/classroom/${classroomId}/view_assignments`
      );
      if (response.ok) {
        const json = await response.json();
        setAssignments(json["assignments"]);
      } else {
        console.error(response.statusText);
      }
    };
    const stopLoading = () => {
      setLoading(false);
    };
    if (loading) {
      verifyLogin().then(() => {
        if (!isError) {
          getClassroomName().then(() => {
            if (!isError) {
              getAssignments().then(stopLoading);
            }
          });
        }
      });
    }
  });
  return (
    <>
      {!loading ? (
        <>
          <Navbar />
          {errorMsg == "" ? (
            <>
              <TitleBanner>{classroomName}</TitleBanner>
              <div id="classroomBody">
                <div id="assignments">{...assignmentsJSONToReact()}</div>
                <div id="homework">
                  <HomeworkSidebar>{...homeworkFromJSON()}</HomeworkSidebar>
                </div>
              </div>
            </>
          ) : (
            <div className="errorMsg">{errorMsg}</div>
          )}
        </>
      ) : (
        <></>
      )}
    </>
  );
}

export default Classroom;
